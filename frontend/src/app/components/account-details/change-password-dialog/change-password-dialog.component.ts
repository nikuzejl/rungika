import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { TimeoutError, timeout } from 'rxjs';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private authService: AuthService
  ) {
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  getPasswordError(): string | null {
    const control = this.passwordForm.get('newPassword');
    
    if (!control || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'New password is required';
    }

    if (control.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }

    if (control.hasError('pattern')) {
      return 'Password must contain uppercase and lowercase letters';
    }

    return 'Invalid password';
  }

  getConfirmPasswordError(): string | null {
    const control = this.passwordForm.get('confirmPassword');
    
    if (!control || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Confirm password is required';
    }

    if (this.passwordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return 'Invalid confirmation';
  }

  togglePasswordVisibility(field: string) {
    if (field === 'current') {
      this.hideCurrentPassword = !this.hideCurrentPassword;
    } else if (field === 'new') {
      this.hideNewPassword = !this.hideNewPassword;
    } else if (field === 'confirm') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.isSubmitting || !this.passwordForm.valid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword)
      .pipe(timeout(5000))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = 'Password changed successfully!';
          
          setTimeout(() => {
            this.dialogRef.close(true);
          }, 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          if (err instanceof TimeoutError) {
            this.errorMessage = 'Request timed out. Please try again.';
          } else {
            this.errorMessage = err?.error?.message || 'Failed to change password. Please try again.';
          }
        }
      });
  }
}
