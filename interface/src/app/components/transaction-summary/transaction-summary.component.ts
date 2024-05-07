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
  stripePromise = loadStripe(environment.STRIPE_PUBLIC_KEY)

  constructor(private http: HttpClient, private router: Router) { }

  async pay(): Promise<void> {
    this.showSpinner = true
    const convertedAmountControl = this.transactionDetails.get('convertedAmount')
    const amount = this.transactionDetails.get('amount')

    if (convertedAmountControl && amount) {
      const payment = { transferDetails: this.transactionDetails.value}
      const stripe = await this.stripePromise
      if (stripe) {
        this.http
          .post(environment.serverUrl + '/api/v1/payment/submit-details', payment)
          .subscribe((data: any) => {
            this.showSpinner = false
            stripe.redirectToCheckout({
              sessionId: data.id,
            })
          })
      } else {
        console.error('Stripe is not initialized.')
      }
    } else {

    }
  }

  edit() {
    this.router.navigate(['/home'])
  }
}
