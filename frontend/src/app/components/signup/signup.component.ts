import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms'
import { TimeoutError, timeout } from 'rxjs'
import { PHONE_COUNTRY_CODES } from 'src/app/helpers/phone-country-codes'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm!: FormGroup;
  signupSuccessfull = false
  errorMessage = ''
  isSubmitting = false
  countryCodes = PHONE_COUNTRY_CODES

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.createForm();
  }

  passwordMatchValidator(control: FormControl): { [s: string]: boolean } {
    const password = control.root.get('password');
    const confirmPassword = control.value;

    if (password && confirmPassword
      && password.value === confirmPassword
      && password.value.length > 0
      && confirmPassword.length > 0
    ) {
      return { 'passwordMismatch': false }
    }

    else {
      return { 'passwordMismatch': true }
    }
  }

  createForm() {
    this.signupForm = new FormGroup(
      {
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phoneCountryCode: new FormControl('+1', Validators.required),
        phone: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
        ]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6),
                                              this.validateAreEqual.bind(this)])
      }
    )
  }

  validateAreEqual(control: AbstractControl): { [key: string]: any } | null {
    const password = this.signupForm?.value.password;
    const confirmPassword = control.value;

    if (password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  formValid() {
    return this.signupForm.valid
  }

  getFieldError(controlName: string): string | null {
    const control = this.signupForm.get(controlName)

    if (!control || !control.errors) {
      return null
    }

    if (control.hasError('required')) {
      switch (controlName) {
        case 'firstName':
          return 'First name is required'
        case 'lastName':
          return 'Last name is required'
        case 'email':
          return 'Email is required'
        case 'phone':
          return 'Phone number is required'
        case 'password':
          return 'Password is required'
        case 'confirmPassword':
          return 'Confirm password is required'
      }
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Invalid email format'
    }

    if (controlName === 'phone' && control.hasError('pattern')) {
      return 'Phone number is formed by digits only'
    }

    if (controlName === 'password' && control.hasError('minlength')
      || controlName === 'password' && control.hasError('pattern')) {
        return 'Needs 6 or more chars, an uppercase and a lowercase letter'
    }

    if (controlName === 'confirmPassword' && control.hasError('passwordMismatch')) {
      return 'Passwords do not match'
    }

    return 'Invalid value'
  }

  continue() {
    if (this.isSubmitting) {
      return
    }

    this.errorMessage = ''
    this.isSubmitting = true

    if (this.signupForm.valid) {
      const fullPhoneNumber = `${this.signupForm.value.phoneCountryCode}${this.signupForm.value.phone}`

      this.authService.signup(
        this.signupForm.value.firstName,
        this.signupForm.value.lastName,
        this.signupForm.value.email,
        fullPhoneNumber,
        this.signupForm.value.password)
        .pipe(timeout(5000))
        .subscribe({
          next: data => {
            this.isSubmitting = false
            this.signupSuccessfull = true
          },
          error: err => {
            this.isSubmitting = false
            this.signupSuccessfull = false
            if (err instanceof TimeoutError) {
              this.errorMessage = 'Sign up failed after 5 seconds. Please try again.'
            } else {
              this.errorMessage = err?.error?.message || 'Sign up failed. Please try again.'
            }
          }
        })
    }
  }

  goToLogIn() {
    this.router.navigate(['/login'])
  }

  goToHome() {
    this.router.navigate(['/home'])
  }
}