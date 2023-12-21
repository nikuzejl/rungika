import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent {
  orderNumber: any

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderNumber = params.get('orderId')
    })
    this.sendCancelEmail(this.orderNumber)
  }

  async sendCancelEmail(orderNumber: number) {
    const query = {
      orderId: orderNumber
    }
    try {
      const response = await this.http.post(environment.serverUrl + '/send-cancel-order-email', query).toPromise()
      console.log('Response:', response)
    } catch (error) {
      console.error('Error:', error)
    }

  }
}