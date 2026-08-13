import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TimeoutError, timeout } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog/forgot-password-dialog.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})

export class LoginComponent implements OnInit {
  errorMessage = ''
  infoMessage = ''
  isLoggingIn = false
  isSendingReset = false
  form!: FormGroup

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

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
    this.infoMessage = ''
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
            data.phone,
            data.roles || []
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
            this.errorMessage = 'Login failed... The server is taking too long to respond. Please try again.'
          } else if (err.status === 0) {
            // Network error or CORS issue
            this.errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
          } else if (err.status === 401) {
            // Unauthorized - invalid credentials
            this.errorMessage = 'Invalid email or password. Please check and try again.'
          } else if (err.status === 403) {
            // Forbidden
            const errorMsg = err?.error?.message || 'Your account has been disabled. Please contact support.'
            this.errorMessage = errorMsg
          } else if (err.status >= 500) {
            // Server error
            this.errorMessage = 'Server error. Please try again later.'
          } else if (err.status >= 400) {
            // Other client errors
            const errorMsg = err?.error?.message || err?.error?.error || 'Login failed. Please try again.'
            this.errorMessage = errorMsg
          } else {
            // Fallback for any other error
            this.errorMessage = 'Login failed. Please try again.'
          }
        }
      })
  }

  requestPasswordReset() {
    if (this.isSendingReset) {
      return
    }

    const emailFromForm = this.form?.value?.email || ''
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '480px',
      maxWidth: '92vw',
      disableClose: false,
      panelClass: 'custom-dialog',
      data: {
        email: emailFromForm
      }
    })

    dialogRef.afterClosed().subscribe((email: string | undefined) => {
      const trimmedEmail = email?.trim()
      if (!trimmedEmail) {
        return
      }

      this.errorMessage = ''
      this.infoMessage = ''
      this.isSendingReset = true

      this.authService.forgotPassword(trimmedEmail)
        .pipe(timeout(7000))
        .subscribe({
          next: data => {
            this.isSendingReset = false
            this.infoMessage = data?.message || 'A password reset link has been sent.'
          },
          error: () => {
            this.isSendingReset = false
            this.errorMessage = 'Could not send reset link right now. Please try again.'
          }
        })
    })
  }
}
