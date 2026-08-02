package com.rungika.config;

import com.rungika.entity.ERole;
import com.rungika.entity.AdminPrivilege;
import com.rungika.entity.Role;
import com.rungika.entity.User;
import com.rungika.repository.AdminPrivilegeRepository;
import com.rungika.repository.RoleRepository;
import com.rungika.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;

@Component
public class AdminSeedRunner implements ApplicationRunner {
    private final AdminPrivilegeRepository adminPrivilegeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${admin.seed.emails:}")
    private String seedAdminEmails;

    @Value("${admin.seed.sync-user-roles:true}")
    private boolean syncUserRoles;

    public AdminSeedRunner(
            AdminPrivilegeRepository adminPrivilegeRepository,
            UserRepository userRepository,
            RoleRepository roleRepository
    ) {
        this.adminPrivilegeRepository = adminPrivilegeRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (seedAdminEmails == null || seedAdminEmails.isBlank()) {
            return;
        }

        Arrays.stream(seedAdminEmails.split(","))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .map(email -> email.toLowerCase(Locale.ROOT))
                .distinct()
                .forEach(email -> {
                    upsertAdminEmail(email);
                    if (syncUserRoles) {
                        syncUserAdminRole(email);
                    }
                });
    }

    private void upsertAdminEmail(String email) {
        if (adminPrivilegeRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        AdminPrivilege adminPrivilege = new AdminPrivilege();
        adminPrivilege.setEmail(email);

        try {
            adminPrivilegeRepository.save(adminPrivilege);
        } catch (DuplicateKeyException ignored) {
            // Another startup process may have inserted the same email concurrently.
        }
    }

    private void syncUserAdminRole(String email) {
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return;
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(ERole.ROLE_ADMIN);
                    return roleRepository.save(role);
                });

        boolean alreadyAdmin = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(role -> role != null && role.getName() == ERole.ROLE_ADMIN);

        if (alreadyAdmin) {
            return;
        }

        if (user.getRoles() == null) {
            user.setRoles(new java.util.HashSet<>());
        }
        user.getRoles().add(adminRole);
        userRepository.save(user);
    }
}
