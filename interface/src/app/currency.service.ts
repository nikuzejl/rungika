import { Injectable } from '@angular/core'
import { HttpService } from './services/http.service'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  currencies: Map<string, number> = new Map()
  fromCurrencies = ["USD", "CAD"]
  toCurrencies = ["BIF", "RWF"]

  constructor() { 
    // this.initializeRates()
    // .then(() => {
    //   console.log('Initialization finished.')
    // })
    // .catch(error => {
    //   console.error('Failed to initialize currencies', error)
    // })
  }

 async initializeRates(){
    await this.getExchangeRates(this.fromCurrencies, this.toCurrencies)
    .then(() => {
      console.log('Exchange rate requests finished.')
    })
    .catch(error => {
      console.error('Error in exchange rate requests:', error)
    })

    await this.getExchangeRates(this.toCurrencies, this.fromCurrencies)
    .then(() => {
      console.log('Exchange rate requests finished.')
    })
    .catch(error => {
      console.error('Error in exchange rate requests:', error)
    })
  }

  async getExchangeRates(from:string[], to:string[]): Promise<void> {
    const baseApiUrl = environment.serverUrl + '/api/v1/rate/latest'
    const requests: Promise<void>[] = []
    for (const fromCurrency of from) {
      for (const toCurrency of to) {
        const apiUrl = `${baseApiUrl}?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`
        requests.push(
          fetch(apiUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
              }
              return response.json()
            })
            .then(data => {
              console.log(`Exchange rate from ${fromCurrency} to ${toCurrency}: ${data}`)
              this.currencies.set(this.getCurrencyConversionString(fromCurrency, toCurrency), data)
            })
            .catch(error => {
              console.error('Error fetching data:', error)
            })
        )
      }
    }
    await Promise.all(requests)
  }
  
  getCurrencyConversionString(from:string, to:string){
    return from + '_TO_' + to
  }

  getRate(from:string, to:string){
    const rate = this.currencies.get(this.getCurrencyConversionString(from, to))
    console.log("The rate is "+ rate)
    return rate
  }
}
