import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { HttpService } from 'src/app/services/http.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent {
  form!: FormGroup
  fromCurrency = "USD"
  toCurrency = "BIF"
  cadToBifRate = 0.0
  usdToBifRate = 0.0
  rate = 0.0

  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.createForm()

    this.httpService.getRequest(environment.serverUrl + '/api/v1/rate/latest?fromCurrency=' + 'USD' +
      '&toCurrency=' + 'BIF').subscribe(data => {
        this.usdToBifRate = data
        this.rate = this.usdToBifRate

        this.httpService.getRequest(environment.serverUrl + '/api/v1/rate/latest?fromCurrency=' + 'CAD' +
          '&toCurrency=' + 'BIF').subscribe(data => {
            this.cadToBifRate = data
          })
      })
  }

  onFromCurrencyChange(currency: any) {
    if (currency.value === "USD")
      this.rate = this.usdToBifRate

    else if (currency.value === "CAD")
      this.rate = this.cadToBifRate
  }

  createForm() {
    this.form = new FormGroup({
      'fromCurrency': new FormControl(null),
      'toCurrency': new FormControl(null),
      'amount': new FormControl(0.00),
      'firstName': new FormControl(null),
      'lastName': new FormControl(null),
      'email': new FormControl(null),
      'phone': new FormControl(null)
    })
  }
  onSubmit(formData: FormGroup) {
    const email = formData.value.email
    const password = formData.value.password
    //this.authService.signinUser(email, password)
  }
}
