import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TimeoutError, timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  errorMessage = ''
  isLoggingIn = false
  form!: FormGroup

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = new FormGroup({
      'email': new FormControl(null),
      'password': new FormControl(null)
    })
  }

  onSubmit(formData: FormGroup) {
    if (this.isLoggingIn) {
      return
    }

    const email = formData.value.email;
    const password = formData.value.password;
    this.errorMessage = ''
    this.isLoggingIn = true

    this.authService.login(email, password)
      .pipe(timeout(5000))
      .subscribe({
        next: data => {
          this.isLoggingIn = false
          this.authService.updateCredentials(
            data.firstName,
            data.lastName,
            data.email,
            data.phone
          )
          this.router.navigate(['/home'], {
            queryParams: {
              toast: 'login',
              name: data.firstName
            }
          })
        },
        error: err => {
          this.isLoggingIn = false
          if (err instanceof TimeoutError) {
            this.errorMessage = 'Login failed... Please try again.'
          } else {
            this.errorMessage = err?.error?.error || 'Login failed. Please check your credentials and try again.'
          }
        }
      })
  }
}
