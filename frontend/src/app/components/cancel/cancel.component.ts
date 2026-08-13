import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
    selector: 'app-cancel',
    templateUrl: './cancel.component.html',
    styleUrls: ['./cancel.component.css'],
    standalone: false
})
export class CancelComponent {
  reason: string | null = null
  statusMessage = 'Your payment was canceled or failed before completion.'

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.reason = params.get('reason')

      if (this.reason === 'verification_error') {
        this.statusMessage = 'We could not verify your payment status. Please try again.'
      } else if (this.reason === 'missing_session') {
        this.statusMessage = 'Missing payment session. Please retry checkout from transaction summary.'
      } else if (this.reason && this.reason !== 'null') {
        this.statusMessage = `Payment was not completed (${this.reason}). Please try again.`
      }
    })
  }
}