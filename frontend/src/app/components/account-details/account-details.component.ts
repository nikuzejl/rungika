import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AccountDeleteDialogComponent } from './account-delete-dialog/account-delete-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent {
    signedIn = false
    user: any
    isDeleting = false
    isChangingPassword = false
    deleteErrorMessage = ''
    deleteSuccessMessage = ''

    constructor(
      private authService: AuthService,
      private storageService: StorageService,
      private router: Router,
      private dialog: MatDialog
    ) { }
  
    ngOnInit(): void {
      this.signedIn = this.authService.credentials.loggedIn
      if (this.signedIn) {
        this.user = this.authService.credentials
      }
    }
  
    logout() {
      this.storageService.clean()
      this.authService.credentials.loggedIn = false
      this.signedIn = false
      this.router.navigate(['/home'], {
        queryParams: {
          toast: 'logout'
        }
      })
    }

    openChangePasswordDialog() {
      const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
        width: '450px',
        disableClose: false,
        panelClass: 'custom-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Password changed successfully, dialog handles the message
        }
      });
    }

    openDeleteAccountDialog() {
      const dialogRef = this.dialog.open(AccountDeleteDialogComponent, {
        width: '450px',
        disableClose: true,
        panelClass: 'custom-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // Account deleted successfully
          this.deleteAccount();
        }
      });
    }

    private deleteAccount() {
      this.isDeleting = true
      this.deleteErrorMessage = ''
      this.deleteSuccessMessage = ''

      this.authService.deleteAccount().subscribe({
        next: (response) => {
          this.isDeleting = false
          this.deleteSuccessMessage = 'Account deleted successfully. Redirecting...'
          
          // Clear storage and redirect after 2 seconds
          setTimeout(() => {
            this.storageService.clean()
            this.authService.credentials.loggedIn = false
            this.router.navigate(['/home'])
          }, 2000)
        },
        error: (err) => {
          this.isDeleting = false
          this.deleteErrorMessage = err?.error?.message || 'Failed to delete account. Please try again.'
        }
      })
    }
}

