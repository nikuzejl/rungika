import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { loadStripe } from '@stripe/stripe-js'
import { AuthService } from 'src/app/services/auth.service'
import { TransactionService } from 'src/app/services/transaction.service'
import { environment } from 'src/environments/environment.prod'
import { Router } from '@angular/router'
import { CURRENCY_PHONE_CODE_MAP, PHONE_COUNTRY_CODES, SUPPORTED_PHONE_CODES } from 'src/app/helpers/phone-country-codes'

@Component({
  selector: 'app-recipient-details',
  templateUrl: './recipient-details.component.html',
  styleUrls: ['./recipient-details.component.css']
})
export class RecipientDetailsComponent implements OnInit {
  currentStep: 'sender' | 'receiver' = 'sender'
  isSummaryVisible = false
  loggedIn = false
  countryCodes = PHONE_COUNTRY_CODES
  receiverCodeLocked = false
  senderForm!: FormGroup
  receiverForm!: FormGroup
  errorMessage = ''
  stripePromise = loadStripe(environment.STRIPE_PUBLIC_KEY)
  transactionDetails!: FormGroup

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router) {
      this.transactionDetails = this.transactionService.getTransactionDetails()
    }

  ngOnInit() {
    if (this.transactionService.getTransactionDetails() == null) {
      this.router.navigate(['/home'])
      return
    }

    this.createForms()
    this.applyReceiverPhoneCodeRestriction()
    this.applyReceiverBankValidators()
    this.loggedIn = this.authService.credentials.loggedIn

    if (this.loggedIn) {
      const phoneParts = this.splitPhoneNumber(this.authService.credentials.phone)
      this.senderForm.get('lastName')!.setValue(this.authService.credentials.lastName)
      this.senderForm.get('firstName')!.setValue(this.authService.credentials.firstName)
      this.senderForm.get('email')!.setValue(this.authService.credentials.email)
      this.senderForm.get('senderPhoneCountryCode')!.setValue(phoneParts.countryCode)
      this.senderForm.get('phone')!.setValue(phoneParts.localPhone)
      this.currentStep = 'receiver'
    }
  }

  private applyReceiverPhoneCodeRestriction() {
    const destinationCurrency = this.transactionDetails?.value?.toCurrency
    const mappedCode = CURRENCY_PHONE_CODE_MAP[destinationCurrency]
    const receiverCodeControl = this.receiverForm.get('receiverPhoneCountryCode')

    if (!receiverCodeControl) {
      return
    }

    if (mappedCode) {
      receiverCodeControl.setValue(mappedCode)
      receiverCodeControl.disable({ emitEvent: false })
      this.receiverCodeLocked = true
      return
    }

    receiverCodeControl.enable({ emitEvent: false })
    this.receiverCodeLocked = false
  }

  createForms() {
    this.senderForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      senderPhoneCountryCode: new FormControl('+1', Validators.required),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    })

    this.receiverForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      receiverPhoneCountryCode: new FormControl('+1', Validators.required),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      recipientBankName: new FormControl(''),
      recipientAccountNumber: new FormControl('')
    })
  }

  continue() {
    if (this.currentStep === 'sender' && this.senderForm.valid) {
      this.senderForm.get('phone')!.setValue(
        this.composePhoneNumber(
          this.senderForm.get('senderPhoneCountryCode')!.value,
          this.senderForm.get('phone')!.value
        )
      )
      this.currentStep = 'receiver'
    } else if (this.currentStep === 'receiver' && this.receiverForm.valid) {
      if (this.loggedIn) {
        this.senderForm.get('phone')!.setValue(
          this.composePhoneNumber(
            this.senderForm.get('senderPhoneCountryCode')!.value,
            this.senderForm.get('phone')!.value
          )
        )
      }
      this.receiverForm.get('phone')!.setValue(
        this.composePhoneNumber(
          this.receiverForm.get('receiverPhoneCountryCode')!.value,
          this.receiverForm.get('phone')!.value
        )
      )
      this.isSummaryVisible = true
    }
  }

  private composePhoneNumber(countryCode: string, localPhone: string): string {
    return `${countryCode}${localPhone}`
  }

  private splitPhoneNumber(phone: string): { countryCode: string; localPhone: string } {
    const value = (phone || '').trim()
    if (!value) {
      return { countryCode: '+1', localPhone: '' }
    }

    const matchedCode = SUPPORTED_PHONE_CODES.find(code => value.startsWith(code))

    if (matchedCode) {
      return {
        countryCode: matchedCode,
        localPhone: value.substring(matchedCode.length)
      }
    }

    return { countryCode: '+1', localPhone: value.replace(/^\+/, '') }
  }

  private applyReceiverBankValidators() {
    const bankNameControl = this.receiverForm.get('recipientBankName')
    const accountNumberControl = this.receiverForm.get('recipientAccountNumber')

    if (!bankNameControl || !accountNumberControl) {
      return
    }

    if (this.isBankTransfer()) {
      bankNameControl.setValidators([Validators.required, Validators.minLength(2)])
      accountNumberControl.setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.pattern(/^[A-Za-z0-9]+$/)
      ])
    } else {
      bankNameControl.clearValidators()
      accountNumberControl.clearValidators()
      bankNameControl.setValue('')
      accountNumberControl.setValue('')
    }

    bankNameControl.updateValueAndValidity({ emitEvent: false })
    accountNumberControl.updateValueAndValidity({ emitEvent: false })
  }

  isBankTransfer(): boolean {
    return this.transactionDetails?.value?.receiveMethod === 'Bank Transfer'
  }

  formValid() {
    if (this.currentStep === 'sender') {
      return this.senderForm.valid
    }

    if (this.currentStep === 'receiver') {
      return this.receiverForm.valid
    }

    return false
  }
}
