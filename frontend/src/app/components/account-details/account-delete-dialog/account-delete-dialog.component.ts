import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-account-delete-dialog',
    templateUrl: './account-delete-dialog.component.html',
    styleUrls: ['./account-delete-dialog.component.css'],
    standalone: false
})
export class AccountDeleteDialogComponent {
  confirmationText = '';
  isConfirmed = false;

  constructor(public dialogRef: MatDialogRef<AccountDeleteDialogComponent>) { }

  onTextChange() {
    this.isConfirmed = this.confirmationText === 'delete my account';
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirmDelete() {
    if (this.isConfirmed) {
      this.dialogRef.close(true);
    }
  }
}
