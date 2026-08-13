import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AccountDeleteDialogComponent } from './account-delete-dialog/account-delete-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
    selector: 'app-account-details',
    templateUrl: './account-details.component.html',
    styleUrls: ['./account-details.component.css'],
    standalone: false
})
export class AccountDetailsComponent {
    signedIn = false
  isAdminUser = false
    user: any
    isDeleting = false
    isChangingPassword = false
    deleteErrorMessage = ''
    deleteSuccessMessage = ''
    orders: any[] = []
    ordersLoading = false
    ordersErrorMessage = ''

    constructor(
      private authService: AuthService,
      private router: Router,
      private dialog: MatDialog
    ) { }
  
    ngOnInit(): void {
      this.signedIn = this.authService.credentials.loggedIn
      if (this.signedIn) {
        this.user = this.authService.credentials
        this.isAdminUser = this.authService.isAdmin()
        this.loadOrders()
      }
    }

    openAdminOrders() {
      this.router.navigate(['/admin/orders-special'])
    }

    private loadOrders() {
      this.ordersLoading = true
      this.ordersErrorMessage = ''

      this.authService.getUserOrders().subscribe({
        next: (data) => {
          this.ordersLoading = false
          this.orders = Array.isArray(data) ? data : []
        },
        error: (err) => {
          this.ordersLoading = false
          this.orders = []
          this.ordersErrorMessage = err?.error?.message || 'Failed to load your orders.'
        }
      })
    }

    getRecipientDisplayName(order: any): string {
      const firstName = (order?.recipientFirstName || '').trim()
      const lastName = (order?.recipientLastName || '').trim()
      const fullName = `${firstName} ${lastName}`.trim()

      if (fullName.length > 0) {
        return fullName
      }

      return order?.recipientName || order?.recipientEmail || 'N/A'
    }

    getTransferDisplay(order: any): string {
      const hasAmounts = order?.amount != null && order?.convertedAmount != null
      const fromCurrency = order?.fromCurrency || ''
      const toCurrency = order?.toCurrency || ''

      if (!hasAmounts) {
        return 'N/A'
      }

      return `${order.amount} ${fromCurrency} -> ${order.convertedAmount} ${toCurrency}`.trim()
    }

    getTransactionTimeDisplay(order: any): string {
      return order?.transactionTime || ''
    }
  
    logout() {
      this.authService.clearCredentials()
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
            this.authService.clearCredentials()
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

