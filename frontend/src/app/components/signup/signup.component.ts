import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm!: FormGroup;
  signupSuccessfull = false
  errorMessage = ''
  showSpinner = false

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
        phone: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
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

  continue() {
    this.showSpinner = true
    if (this.signupForm.valid) {
      this.authService.signup(
        this.signupForm.value.firstName,
        this.signupForm.value.lastName,
        this.signupForm.value.email,
        this.signupForm.value.phone,
        this.signupForm.value.password)
        .subscribe({
          next: data => {
            this.showSpinner = false
            this.signupSuccessfull = true
          },
          error: err => {
            this.errorMessage = err.error.error
            this.signupSuccessfull = false
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