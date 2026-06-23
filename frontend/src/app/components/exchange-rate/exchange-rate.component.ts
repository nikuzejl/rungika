import { Component } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { CurrencyService } from 'src/app/services/currency.service'
import { Router } from '@angular/router'
import { TransactionService } from 'src/app/services/transaction.service'

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.css']
})
export class ExchangeRateComponent {
  receiveMethodOptions: Map<string, string[]> = new Map([
    ['BIF', ['Ecocash', 'Lumicash']],
    ['RWF', ['MTM MoMo', 'Airtel']]
  ])
  maxSendAmount = 10000.00
  form!: FormGroup
  fromCurrency:string = "USD"
  toCurrency:string = "BIF"
  receiveMethod = ""
  rate = 0.0
  programmaticUpdate = false
  orderId = ""
  exchangeRateError: any[] = []

  constructor(
    private router: Router,
    private currencyService: CurrencyService,
    private transactionService: TransactionService) { }

  ngOnInit() {
    this.exchangeRateError[0] = false
    this.currencyService.initializeRates()
      .then(() => {
        this.createForm()
        this.currencyService.initializeRates()
        this.rate = this.currencyService.getRate("USD", "BIF") || 0.0
      })
      .catch(error => {
        this.exchangeRateError[0] = true
        console.error('Failed to initialize currencies', error)
      })
  }

  onCurrencyChange() {
    try {
      this.rate = this.currencyService.getRate(this.fromCurrency, this.toCurrency) || this.rate
      this.updateForm('amount', 0.0)
      this.updateForm('convertedAmount', 0.0)
    } catch (error) {
      this.exchangeRateError[0] = true
      console.error('Error fetching exchange rate:', error)
    }
  }

  createForm() {
    this.form = new FormGroup({
      'fromCurrency': new FormControl(null),
      'toCurrency': new FormControl(null),
      'amount': new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
        Validators.max(this.maxSendAmount),
        Validators.min(10.00)
      ]),
      'convertedAmount': new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
      'receiveMethod': new FormControl(null, [Validators.required])
    })

    this.updateFormAmounts('amount')
    this.updateFormAmounts('convertedAmount')
  }

  updateFormAmounts(changedField: string) {
    this.form.get(changedField)!.valueChanges.subscribe(updatedValue => {
      if (!this.programmaticUpdate) {
        this.programmaticUpdate = true
        if (changedField == 'amount') {
          this.updateForm('convertedAmount', (updatedValue * this.rate).toFixed(2))
        }
        else if (changedField == 'convertedAmount') {
          this.updateForm('amount', (updatedValue / this.rate).toFixed(2))
        }
        this.programmaticUpdate = false
      }
    })
  }

  updateForm(fieldName: string, value: any) {
    this.form.get(fieldName)!.setValue(value)
  }

  goToRecipientDetails() {
    if (this.form.valid) {
      this.transactionService.setTransactionDetails(this.form)
      this.router.navigate(['/recipient-details'])
    } else {
      console.log('Invalid form')
    }
  }
}
