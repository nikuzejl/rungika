import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Router } from '@angular/router'
import { environment } from 'src/environments/environment.prod'

@Component({
  selector: 'app-sucess',
  templateUrl: './sucess.component.html',
  styleUrls: ['./sucess.component.css']
})
export class SucessComponent {
  showSpinner = true
  paymentSuccess = false
  statusMessage = 'Verifying your payment...'
  sessionId: string | null = null
  orderId: string | null = null
  transferData: any = null

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(async params => {
      this.sessionId = params.get('session_id')

      if (!this.sessionId) {
        this.showSpinner = false
        this.statusMessage = 'Missing payment session. Please try your transfer again.'
        this.router.navigate(['/payment-failed'], {
          queryParams: { reason: 'missing_session' }
        })
        return
      }

      // Retrieve stored transfer data from session storage
      const stored = sessionStorage.getItem('transferData')
      if (stored) {
        this.transferData = JSON.parse(stored)
      }

      await this.verifySession(this.sessionId)
    })
  }

  private async verifySession(sessionId: string): Promise<void> {
    try {
      const response = await this.http
        .get<{ paymentStatus?: string; status?: string }>(`${environment.serverUrl}/api/v1/payment/session-status?sessionId=${encodeURIComponent(sessionId)}`)
        .toPromise()

      const paymentStatus = response?.paymentStatus
      const status = response?.status

      if (paymentStatus === 'paid') {
        // Confirm payment and create order
        await this.confirmPayment(sessionId)
      } else {
        this.router.navigate(['/payment-failed'], {
          queryParams: {
            reason: paymentStatus || status || 'payment_not_completed',
            session_id: sessionId
          }
        })
      }
    } catch (error) {
      console.error('Error verifying Stripe session:', error)
      this.router.navigate(['/payment-failed'], {
        queryParams: { reason: 'verification_error', session_id: sessionId }
      })
    } finally {
      this.showSpinner = false
    }
  }

  private async confirmPayment(sessionId: string): Promise<void> {
    try {
      if (!this.transferData) {
        this.paymentSuccess = false
        this.statusMessage = 'Error: Transfer details not found. Please contact support.'
        return
      }

      const confirmationPayload = {
        sessionId: sessionId,
        senderName: this.transferData.senderName,
        senderFirstName: this.transferData.senderFirstName,
        senderLastName: this.transferData.senderLastName,
        senderEmail: this.transferData.senderEmail,
        senderPhone: this.transferData.senderPhone,
        recipientName: this.transferData.recipientName,
        recipientFirstName: this.transferData.recipientFirstName,
        recipientLastName: this.transferData.recipientLastName,
        recipientEmail: this.transferData.recipientEmail,
        recipientPhone: this.transferData.recipientPhone,
        amount: this.transferData.amount,
        fromCurrency: this.transferData.fromCurrency,
        convertedAmount: this.transferData.convertedAmount,
        toCurrency: this.transferData.toCurrency,
        receiveMethod: this.transferData.receiveMethod,
        recipientBankName: this.transferData.recipientBankName,
        recipientAccountNumber: this.transferData.recipientAccountNumber,
        deliveryChannel: this.transferData.deliveryChannel
      }

      const response = await this.http
        .post<{ success: boolean; orderId?: number; message?: string }>(
          `${environment.serverUrl}/api/v1/payment/confirm-payment`,
          confirmationPayload
        )
        .toPromise()

      if (response?.success) {
        this.paymentSuccess = true
        this.orderId = response.orderId?.toString() || null
        this.statusMessage = 'Your transfer has been confirmed and emails have been sent.'
        // Clear session storage
        sessionStorage.removeItem('transferData')
      } else {
        this.paymentSuccess = false
        this.statusMessage = response?.message || 'Payment confirmation failed. Please contact support.'
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      this.paymentSuccess = false
      this.statusMessage = 'Error processing your payment confirmation. Please contact support.'
    }
  }
}
