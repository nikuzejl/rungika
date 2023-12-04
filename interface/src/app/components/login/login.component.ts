import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  errorMessage = ''
  isLoggedIn = false
  loginForm!: FormGroup

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = new FormGroup({
      'email': new FormControl(null),
      'password': new FormControl(null)
    })
  }

  onSubmit(formData: FormGroup, loginDirective: FormGroupDirective) {
    const email = formData.value.email;
    const password = formData.value.password;

    this.authService.login(email, password)
      .subscribe({
        next: data => {
          this.isLoggedIn = true
          this.authService.updateCredentials(
            data.firstName,
            data.lastName,
            data.email
          )
        },
        error: err => {
          this.errorMessage = err.error.error
          this.isLoggedIn = false
        }
      })
  }
}
