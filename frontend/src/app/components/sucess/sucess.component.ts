import { HttpClient } from '@angular/common/http'
import { Component, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { HttpService } from 'src/app/services/http.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-sucess',
  templateUrl: './sucess.component.html',
  styleUrls: ['./sucess.component.css']
})
export class SucessComponent {
  orderNumber: any

  constructor(private http: HttpClient, private route: ActivatedRoute, private httpService: HttpService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderNumber = params.get('orderId')
    })

    const query = {
      orderId: this.orderNumber,
      email: "test@test.com"
    }
    this.httpService.sendSuccessEmail(query)
      .subscribe(
        data => {
          console.log("done " + data)
        },
        err => {
          console.log("failed " + err.message)
        }
      )

    this.sendSuccessEmail(this.orderNumber)
  }

  sendSuccessEmail(orderNumber: number) {
    const query = {
      orderId: orderNumber,
      email: "test@test.com"
    }
    this.http.post(environment.serverUrl + '/send-success-order-email', query)
  }
}
