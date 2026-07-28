import { HttpClient } from '@angular/common/http'
import { Component, Input } from '@angular/core'
import { loadStripe } from '@stripe/stripe-js'
import { environment } from 'src/environments/environment'
import { Router } from '@angular/router'

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './transaction-summary.component.html',
  styleUrls: ['./transaction-summary.component.css']
})

export class TransactionSummaryComponent {
  @Input() senderDetails: any
  @Input() receiverDetails: any
  @Input() transactionDetails: any
  showSpinner = false
  paymentError: string | null = null
  stripePromise = loadStripe(environment.STRIPE_PUBLIC_KEY)

  constructor(private http: HttpClient, private router: Router) { }

  async pay(): Promise<void> {
    this.showSpinner = true
    this.paymentError = null

    const convertedAmountControl = this.transactionDetails.get('convertedAmount')
    const amount = this.transactionDetails.get('amount')

    if (!convertedAmountControl || !amount) {
      this.showSpinner = false
      this.paymentError = 'Missing transaction details.'
      return
    }

    const payment = { transferDetails: this.transactionDetails.value }
    const stripe = await this.stripePromise
    if (!stripe) {
      this.showSpinner = false
      this.paymentError = 'Payment service is unavailable. Please try again.'
      console.error('Stripe is not initialized.')
      return
    }

    // 5s maximum wait for submission/redirect
    const timeout = setTimeout(() => {
      this.showSpinner = false
      this.paymentError = 'Payment submission timed out. Please try again.'
    }, 5000)

    this.http.post<{ id?: string, url?: string }>(environment.serverUrl + '/api/v1/payment/submit-details', payment)
      .subscribe({
        next: async (data) => {
          clearTimeout(timeout)

          if (!data || (!data.url && !data.id)) {
            this.showSpinner = false
            this.paymentError = 'Payment session could not be created. Please try again.'
            console.error('Invalid checkout session response:', data)
            return
          }

          // Preferred: redirect straight to the Checkout Session URL returned by
          // the server. This is Stripe's current recommended approach and avoids
          // relying on the client-side redirectToCheckout(sessionId) API.
          if (data.url) {
            // Store transfer details in sessionStorage for retrieval on success page
            const transferData = {
              senderName: this.senderDetails.value.firstName + ' ' + this.senderDetails.value.lastName,
              senderFirstName: this.senderDetails.value.firstName,
              senderLastName: this.senderDetails.value.lastName,
              senderEmail: this.senderDetails.value.email,
              senderPhone: this.senderDetails.value.phone,
              recipientName: this.receiverDetails.value.firstName + ' ' + this.receiverDetails.value.lastName,
              recipientFirstName: this.receiverDetails.value.firstName,
              recipientLastName: this.receiverDetails.value.lastName,
              recipientEmail: this.receiverDetails.value.email,
              recipientPhone: this.receiverDetails.value.phone,
              amount: this.transactionDetails.value.amount,
              fromCurrency: this.transactionDetails.value.fromCurrency,
              convertedAmount: this.transactionDetails.value.convertedAmount,
              toCurrency: this.transactionDetails.value.toCurrency,
              receiveMethod: this.transactionDetails.value.receiveMethod,
              recipientBankName: this.receiverDetails.value.recipientBankName,
              recipientAccountNumber: this.receiverDetails.value.recipientAccountNumber,
              deliveryChannel: this.transactionDetails.value.receiveMethod === 'Bank Transfer' ? 'BANK_TRANSFER' : 'MOBILE_MONEY'
            }
            sessionStorage.setItem('transferData', JSON.stringify(transferData))
            window.location.href = data.url
            return
          }

          // Fallback for older responses that only include a session id.
          try {
            const result = await stripe.redirectToCheckout({ sessionId: data.id as string })
            if (result && result.error) {
              this.showSpinner = false
              this.paymentError = result.error.message || 'Stripe redirect failed.'
            }
          } catch (err) {
            console.error('Stripe redirect error:', err)
            this.showSpinner = false
            this.paymentError = 'Stripe redirect failed. Please try again.'
          }
        },
        error: (err) => {
          clearTimeout(timeout)
          this.showSpinner = false
          this.paymentError = 'Payment submission failed. Please try again.'
          console.error('Payment error:', err)
        }
      })
  }

  edit() {
    this.router.navigate(['/home'])
  }
}
