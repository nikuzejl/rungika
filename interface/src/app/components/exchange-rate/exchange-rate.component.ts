import { Component } from '@angular/core'
import { FormGroup, FormControl, FormGroupDirective } from '@angular/forms'
import { environment } from 'src/environments/environment'
import { HttpService } from '../../services/http.service'
import { CurrencyService } from 'src/app/currency.service'

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.css']
})
export class ExchangeRateComponent {
  loginForm!: FormGroup
  fromCurrency = "USD"
  toCurrency = "BIF"
  rate = 0.0
  constructor(
    private currencyService: CurrencyService,
    private httpService: HttpService
  ) { }
  ngOnInit() {
    this.currencyService.initializeRates()
      .then(() => {
        console.log('Initialization finished.')
        this.createForm()
        this.currencyService.initializeRates()
        this.rate = this.currencyService.getRate("USD", "BIF") || 0.0
      })
      .catch(error => {
        console.error('Failed to initialize currencies', error)
      })
  }

  onCurrencyChange(currency: any) {
    this.rate = this.currencyService.getRate(this.fromCurrency, this.toCurrency) || this.rate
  }

  createForm() {
    this.loginForm = new FormGroup({
      'fromCurrency': new FormControl(null),
      'toCurrency': new FormControl(null),
      'amount': new FormControl(0.00),
      'convertedAmount': new FormControl(0.00),
      'firstName': new FormControl(null),
      'lastName': new FormControl(null),
      'email': new FormControl(null),
      'phone': new FormControl(null)
    })

    this.loginForm.get('amount')!.valueChanges.subscribe((amount) => {
      const newValue = amount * this.rate
      this.loginForm.get('convertedAmount')!.setValue(newValue)
    })

    this.loginForm.get('convertedAmount')!.valueChanges.subscribe((amount) => {
      const newValue = amount / this.rate
      this.loginForm.get('amount')!.setValue(newValue)
    })

  }
  onSubmit(formData: FormGroup, loginDirective: FormGroupDirective) {
    const email = formData.value.email
    const password = formData.value.password
    //this.authService.signinUser(email, password)
  }
}
