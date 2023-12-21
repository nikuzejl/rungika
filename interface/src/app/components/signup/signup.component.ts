import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm!: FormGroup;
  signupSuccessfull = false
  errorMessage = ''

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.signupForm = new FormGroup({
      'email': new FormControl(null),
      'firstName': new FormControl(null),
      'lastName': new FormControl(null),
      'phone': new FormControl(null),
      'password': new FormControl(null),
      'confirmPassword': new FormControl(null)
    })
  }
  onSubmit(formData: FormGroup) {
    this.authService.signup(
      formData.value.firstName, 
      formData.value.lastName,
      formData.value.email,
      formData.value.phone,
      formData.value.password)
      .subscribe({
      next: data => {
        this.signupSuccessfull = true
      },
      error: err => {
        this.errorMessage = err.error.error
        this.signupSuccessfull = false
      }
    })
  }

  goToLogIn() {
    this.router.navigate(['/login'])
  }

  goToHome() {
    this.router.navigate(['/home'])
  }
}