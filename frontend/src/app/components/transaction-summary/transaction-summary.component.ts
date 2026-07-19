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

    if (convertedAmountControl && amount) {
      const payment = { transferDetails: this.transactionDetails.value}
      const stripe = await this.stripePromise
      if (stripe) {
        const timeout = setTimeout(() => {
          this.showSpinner = false
          this.paymentError = 'Payment submission timed out. Please try again.'
        }, 5000)

        this.http
          .post(environment.serverUrl + '/api/v1/payment/submit-details', payment)
          .subscribe({
            next: (data: any) => {
              clearTimeout(timeout)
              this.showSpinner = false
              stripe.redirectToCheckout({ sessionId: data.id })
            },
            error: (err) => {
              clearTimeout(timeout)
              this.showSpinner = false
              this.paymentError = 'Payment submission failed. Please try again.'
              console.error('Payment error:', err)
            }
          })
      } else {
        this.showSpinner = false
        this.paymentError = 'Payment service is unavailable. Please try again.'
        console.error('Stripe is not initialized.')
      }
    }
  }

  edit() {
    this.router.navigate(['/home'])
  }
}
