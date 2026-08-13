import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { HttpService } from 'src/app/services/http.service'
import { PHONE_COUNTRY_CODES } from 'src/app/helpers/phone-country-codes'

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.css'],
    standalone: false
})
export class TransferComponent {
  private readonly exchangeRateUrl = 'https://open.er-api.com/v6/latest/'
  form!: FormGroup
  countryCodes = PHONE_COUNTRY_CODES
  fromCurrency = "USD"
  toCurrency = "BIF"
  cadToBifRate = 0.0
  usdToBifRate = 0.0
  rate = 0.0

  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.createForm()

    this.httpService.getRequest(this.exchangeRateUrl + 'USD').subscribe(data => {
        this.usdToBifRate = data?.rates?.BIF ?? 0.0
        this.rate = this.usdToBifRate

        this.httpService.getRequest(this.exchangeRateUrl + 'CAD').subscribe(data => {
            this.cadToBifRate = data?.rates?.BIF ?? 0.0
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
      'phoneCountryCode': new FormControl('+1'),
      'phone': new FormControl(null)
    })
  }
  onSubmit(formData: FormGroup) { }
}
