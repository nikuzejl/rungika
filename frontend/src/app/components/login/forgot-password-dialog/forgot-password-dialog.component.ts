import { Component, Inject } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-forgot-password-dialog',
    templateUrl: './forgot-password-dialog.component.html',
    styleUrls: ['./forgot-password-dialog.component.css'],
    standalone: false
})
export class ForgotPasswordDialogComponent {
  form: FormGroup

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email?: string }
  ) {
    this.form = new FormGroup({
      email: new FormControl(this.data?.email || '', [Validators.required, Validators.email])
    })
  }

  get emailControl() {
    return this.form.get('email')
  }

  onCancel() {
    this.dialogRef.close()
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    this.dialogRef.close(this.emailControl?.value || '')
  }
}