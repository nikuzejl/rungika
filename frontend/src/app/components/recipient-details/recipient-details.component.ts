import { Component } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { loadStripe } from '@stripe/stripe-js'
import { AuthService } from 'src/app/services/auth.service'
import { TransactionService } from 'src/app/services/transaction.service'
import { environment } from 'src/environments/environment'
import { Router } from '@angular/router'

@Component({
  selector: 'app-recipient-details',
  templateUrl: './recipient-details.component.html',
  styleUrls: ['./recipient-details.component.css']
})
export class RecipientDetailsComponent {
  sendFormValid = false
  currentStep = 'sender'
  senderAndReceiverFormsCompleted = false
  loggedIn = false
  senderForm!: FormGroup
  receiverForm!: FormGroup
  errorMessage = ''
  stripePromise = loadStripe(environment.STRIPE_PUBLIC_KEY)
  transactionDetails!: FormControl

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router) {
      this.transactionDetails = this.transactionService.getTransactionDetails()
    }

  ngOnInit() {
    this.loggedIn = this.authService.credentials.loggedIn
    this.createForms()

    if (this.loggedIn) {
      this.senderForm.get('lastName')!.setValue(this.authService.credentials.lastName)
      this.senderForm.get('firstName')!.setValue(this.authService.credentials.firstName)
      this.senderForm.get('email')!.setValue(this.authService.credentials.email)
      this.senderForm.get('phone')!.setValue(this.authService.credentials.phone)
    }

    if (this.transactionService.getTransactionDetails() == null) {
      this.router.navigate(['/home'])
    }
  }

  createForms() {
    this.senderForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    })

    this.receiverForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    })
  }

  continue() {
    if (this.currentStep == 'sender' && this.senderForm.valid) {
      this.currentStep = 'receiver'
    } else if (this.currentStep == 'receiver' && this.receiverForm.valid) {
      this.senderAndReceiverFormsCompleted = true
    }
  }

  formValid() {
    if (this.currentStep == 'sender') {
      return this.senderForm.valid
    }

    if (this.currentStep == 'receiver') {
      return this.receiverForm.valid
    }

    return false
  }
}
