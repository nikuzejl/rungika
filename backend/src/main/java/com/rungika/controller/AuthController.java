package com.rungika.controller;

import com.rungika.config.security.jwt.JwtUtils;
import com.rungika.config.security.services.UserDetailsImpl;
import com.rungika.entity.ERole;
import com.rungika.entity.Role;
import com.rungika.entity.User;
import com.rungika.Utils.EmailUtility;
import com.rungika.payload.request.ForgotPasswordRequest;
import com.rungika.payload.request.LoginRequest;
import com.rungika.payload.request.ResetPasswordRequest;
import com.rungika.payload.request.SignupRequest;
import com.rungika.payload.response.MessageResponse;
import com.rungika.payload.response.UserInfoResponse;
import com.rungika.repository.AdminPrivilegeRepository;
import com.rungika.repository.RoleRepository;
import com.rungika.repository.UserRepository;
import com.rungika.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z]).{6,}$");

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AdminPrivilegeRepository adminPrivilegeRepository;

    @Autowired
    EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private boolean isResetTokenExpired(User user) {
        Long expiresAt = user.getPasswordResetTokenExpiresAt();
        return expiresAt == null || expiresAt < System.currentTimeMillis();
    }

    private String renderResetPasswordHtml(String token, String message, boolean isError) {
        String cardColor = isError ? "#fff6f6" : "#ffffff";
        String bodyColor = isError ? "#7a1d1d" : "#16324f";
        String textColor = isError ? "#8d4a4a" : "#4b5d71";

        return "<!doctype html>"
                + "<html lang='en'>"
                + "<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>"
                + "<title>Reset password</title>"
                + "<style>"
                + "body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(135deg,#f6f9ff,#eef5ff);min-height:100vh;display:flex;align-items:center;justify-content:center;color:" + bodyColor + ";}"
                + ".card{max-width:520px;width:100%;margin:24px;padding:32px 28px;background:" + cardColor + ";border-radius:20px;box-shadow:0 18px 50px rgba(22,50,79,.12);}"
                + "h1{margin:0 0 12px;font-size:28px;text-align:center;}"
                + "p{margin:0 0 18px;line-height:1.6;color:" + textColor + ";text-align:center;}"
                + "label{display:block;font-weight:700;margin:10px 0 6px;}"
                + "input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d4dcea;border-radius:10px;font-size:16px;}"
                + "button{margin-top:16px;width:100%;padding:12px;border:none;border-radius:999px;background:#0f5bd7;color:#fff;font-weight:700;cursor:pointer;}"
                + "button:hover{background:#0b49ad;}"
                + "a{display:inline-block;margin-top:14px;color:#0f5bd7;font-weight:700;text-decoration:none;}"
                + "</style></head><body><main class='card'>"
                + "<h1>Reset your password</h1>"
                + (message == null ? ""
                    : "<p>" + message + "</p>")
                + "<form method='post' action='/api/v1/auth/reset-password'>"
                + "<input type='hidden' name='token' value='" + token + "'/>"
                + "<label for='newPassword'>New password</label>"
                + "<input id='newPassword' name='newPassword' type='password' required minlength='6'/>"
                + "<label for='confirmPassword'>Confirm password</label>"
                + "<input id='confirmPassword' name='confirmPassword' type='password' required minlength='6'/>"
                + "<button type='submit'>Update password</button>"
                + "</form>"
                + "<div style='text-align:center'><a href='" + frontendUrl + "/#/login'>Back to sign in</a></div>"
                + "</main></body></html>";
    }

    private String renderResetResultHtml(String title, String message, boolean success) {
        String background = success ? "#f6f9ff" : "#fff6f6";
        String accent = success ? "#16804d" : "#7a1d1d";

        return "<!doctype html>"
                + "<html lang='en'>"
                + "<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>"
                + "<title>" + title + "</title>"
                + "<style>"
                + "body{margin:0;font-family:Arial,sans-serif;background:" + background + ";min-height:100vh;display:flex;align-items:center;justify-content:center;color:#16324f;}"
                + ".card{max-width:520px;margin:24px;padding:32px 28px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(22,50,79,.12);text-align:center;}"
                + "h1{margin:0 0 12px;font-size:28px;color:" + accent + ";}"
                + "p{margin:0 0 18px;line-height:1.6;color:#4b5d71;}"
                + "a{display:inline-block;padding:12px 22px;border-radius:999px;background:#0f5bd7;color:#fff;text-decoration:none;font-weight:700;}"
                + "</style></head><body><main class='card'>"
                + "<h1>" + title + "</h1>"
                + "<p>" + message + "</p>"
                + "<a href='" + frontendUrl + "/#/login'>Go to sign in</a>"
                + "</main></body></html>";
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        System.out.printf("Attempting to authenticate user with email: %s%n", loginRequest.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            if (adminPrivilegeRepository.existsByEmailIgnoreCase(userDetails.getEmail())
                    && !roles.contains("ROLE_ADMIN")) {
                roles.add("ROLE_ADMIN");
            }

            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body(new UserInfoResponse(
                            userDetails.getId(),
                            userDetails.getFirstName(),
                            userDetails.getLastName(),
                            userDetails.getEmail(),
                            userDetails.getPhone(),
                            roles));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Invalid email or password"));
        } catch (DisabledException e) {
            return ResponseEntity.status(403)
                    .body(new MessageResponse("Please confirm your email before logging in"));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User(
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getEmail(),
                signUpRequest.getPhone(),
                encoder.encode(signUpRequest.getPassword()));

        user.setEmailVerified(false);
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;

                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        String confirmationLink = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/v1/auth/confirm-email")
            .queryParam("token", verificationToken)
            .toUriString();

        try {
            boolean emailSent = emailService.sendEmail(EmailUtility.createEmail(
                user.getEmail(),
                "Confirm your Rungika account",
                "Thanks for signing up for Rungika. Please confirm your email to activate your account:\n\n" + confirmationLink
            )).get(10, java.util.concurrent.TimeUnit.SECONDS);

            if (!emailSent) {
                userRepository.delete(user);
                return ResponseEntity.status(503)
                    .body(new MessageResponse("We could not send the confirmation email. Your account was not created."));
            }

            return ResponseEntity.ok(new MessageResponse("Check your email to complete your account registration."));
        } catch (Exception ex) {
            userRepository.delete(user);
            return ResponseEntity.status(503)
                .body(new MessageResponse("We could not send the confirmation email. Your account was not created."));
        }
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<String> confirmEmail(@RequestParam String token) {
        try {
            User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Error: Invalid confirmation token."));

            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            userRepository.save(user);

            String loginLink = frontendUrl + "/#/login";
            String html = "<!doctype html>"
                + "<html lang='en'>"
                + "<head>"
                + "<meta charset='utf-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1'>"
                + "<title>Email confirmed</title>"
                + "<style>"
                + "body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(135deg,#f6f9ff,#eef5ff);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#16324f;}"
                + ".card{max-width:520px;margin:24px;padding:32px 28px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(22,50,79,.12);text-align:center;}"
                + ".badge{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:#e7f7ee;color:#16804d;font-size:32px;font-weight:700;margin-bottom:16px;}"
                + "h1{margin:0 0 12px;font-size:28px;}"
                + "p{margin:0 0 18px;line-height:1.6;color:#4b5d71;}"
                + ".button{display:inline-block;padding:12px 22px;border-radius:999px;background:#0f5bd7;color:#fff;text-decoration:none;font-weight:700;}"
                + ".button:hover{background:#0b49ad;}"
                + ".footer{margin-top:16px;font-size:14px;color:#6a7b8f;}"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<main class='card'>"
                + "<div class='badge'>✓</div>"
                + "<h1>Email confirmed</h1>"
                + "<p>Your email has been confirmed successfully. You can now sign in to your Rungika account.</p>"
                + "<a class='button' href='" + loginLink + "'>Go to sign in</a>"
                + "</main>"
                + "</body>"
                + "</html>";

            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        } catch (RuntimeException ex) {
            String html = "<!doctype html>"
                + "<html lang='en'>"
                + "<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>"
                + "<title>Confirmation failed</title>"
                + "<style>body{margin:0;font-family:Arial,sans-serif;background:#fff6f6;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#7a1d1d;}"
                + ".card{max-width:520px;margin:24px;padding:32px 28px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(122,29,29,.12);text-align:center;}"
                + "h1{margin:0 0 12px;font-size:28px;}p{margin:0 0 18px;line-height:1.6;color:#8d4a4a;}a{color:#0f5bd7;text-decoration:none;font-weight:700;}</style></head>"
                + "<body><main class='card'><h1>Confirmation link is invalid</h1>"
                + "<p>The email confirmation link is no longer valid or has already been used.</p>"
                + "<a href='" + frontendUrl + "/#/login'>Go to sign in</a></main></body></html>";

            return ResponseEntity.status(400)
                .contentType(MediaType.TEXT_HTML)
                .body(html);
        }
    }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        final boolean[] emailAttempted = {false};
        final boolean[] emailSent = {true};

        userRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(user -> {
            emailAttempted[0] = true;
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiresAt(System.currentTimeMillis() + (30 * 60 * 1000));
            userRepository.save(user);

            String resetLink = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/auth/reset-password")
                .queryParam("token", resetToken)
                .toUriString();

            try {
                emailSent[0] = emailService.sendEmail(EmailUtility.createPasswordResetEmail(user.getEmail(), resetLink)).get(10, java.util.concurrent.TimeUnit.SECONDS);
                if (!emailSent[0]) {
                    user.setPasswordResetToken(null);
                    user.setPasswordResetTokenExpiresAt(null);
                    userRepository.save(user);
                }
            } catch (Exception ex) {
                emailSent[0] = false;
                user.setPasswordResetToken(null);
                user.setPasswordResetTokenExpiresAt(null);
                userRepository.save(user);
            }
        });

        if (emailAttempted[0] && !emailSent[0]) {
            return ResponseEntity.status(503)
                .body(new MessageResponse("We could not send the password reset email. Please try again later."));
        }

        return ResponseEntity.ok(new MessageResponse("A password reset link has been sent."));
        }

        @GetMapping("/reset-password")
        public ResponseEntity<String> resetPasswordPage(@RequestParam String token) {
        User user = userRepository.findByPasswordResetToken(token).orElse(null);
        if (user == null || isResetTokenExpired(user)) {
            return ResponseEntity.status(400)
                .contentType(MediaType.TEXT_HTML)
                .body(renderResetResultHtml(
                    "Reset link is invalid",
                    "This reset link is invalid or expired. Please request a new one from the sign-in page.",
                    false
                ));
        }

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(renderResetPasswordHtml(token, "Enter your new password below.", false));
        }

        @PostMapping(value = "/reset-password", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
        public ResponseEntity<String> resetPasswordSubmit(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken()).orElse(null);
        if (user == null || isResetTokenExpired(user)) {
            return ResponseEntity.status(400)
                .contentType(MediaType.TEXT_HTML)
                .body(renderResetResultHtml(
                    "Reset link is invalid",
                    "This reset link is invalid or expired. Please request a new one from the sign-in page.",
                    false
                ));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_HTML)
                .body(renderResetPasswordHtml(request.getToken(), "Passwords do not match.", true));
        }

        if (!PASSWORD_PATTERN.matcher(request.getNewPassword()).matches()) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_HTML)
                .body(renderResetPasswordHtml(request.getToken(), "Password must have at least 6 characters, one uppercase and one lowercase letter.", true));
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        userRepository.save(user);

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(renderResetResultHtml(
                "Password updated",
                "Your password has been reset successfully. You can now sign in with your new password.",
                true
            ));
        }
}
