import { Component } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.css']
})
export class ExchangeRateComponent {
  loginForm!: FormGroup
  fromCurrency = "USD"
  toCurrency = "BIF"
  cadToBifRate = 0.0
  usdToBifRate = 0.0
  rate = 0.0
  constructor(
    private router: Router,
    private httpService: HttpService
  ) { }
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
    this.loginForm = new FormGroup({
      'fromCurrency': new FormControl(null),
      'toCurrency': new FormControl(null),
      'amount': new FormControl(0.00),
      'firstName': new FormControl(null),
      'lastName': new FormControl(null),
      'email': new FormControl(null),
      'phone': new FormControl(null)
    })
  }
  onSubmit(formData: FormGroup, loginDirective: FormGroupDirective) {
    const email = formData.value.email
    const password = formData.value.password
    //this.authService.signinUser(email, password)
  }
}
