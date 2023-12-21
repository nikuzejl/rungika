import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  currencies: Map<string, number> = new Map();
  fromCurrencies = ["USD", "CAD"];
  toCurrencies = ["BIF", "RWF"];
  failedToFindExchangeRate = false;
  baseApiUrl = environment.exchangeUrl;

  constructor() {}

  async initializeRates() {
    try {
      const exchangeRates = await this.getExchangeRates(this.fromCurrencies, this.toCurrencies);

      for (const fromCurrency of this.fromCurrencies) {
        for (const toCurrency of this.toCurrencies) {
          const rate = exchangeRates.get(`${fromCurrency}_${toCurrency}`);
          if (rate !== undefined) {
            this.currencies.set(this.getCurrencyConversionString(fromCurrency, toCurrency), rate);
          } else {
            const errorMessage = `Exchange rate from ${fromCurrency} to ${toCurrency} not available.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
    } catch (error) {
      this.failedToFindExchangeRate = true;
      console.error('Error in initializeRates:', error);
      throw error; // Propagate the error to the caller
    }
  }

  async getExchangeRates(fromCurrencies: string[], toCurrencies: string[]): Promise<Map<string, number>> {
    const requests: Promise<void>[] = [];
    const result: Map<string, number> = new Map();

    for (const fromCurrency of fromCurrencies) {
      for (const toCurrency of toCurrencies) {
        const apiUrl = `${this.baseApiUrl}/${fromCurrency}`;

        requests.push(
          fetch(apiUrl)
            .then(response => {
              if (!response.ok) {
                const errorMessage = `HTTP error! Status: ${response.status}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
              }
              return response.json();
            })
            .then(data => {
              const exchangeRate = data.conversion_rates[toCurrency];
              if (exchangeRate !== undefined) {
                result.set(`${fromCurrency}_${toCurrency}`, exchangeRate);
              } else {
                const errorMessage = `Exchange rate from ${fromCurrency} to ${toCurrency} not available in API response.`;
                console.error(errorMessage);
                throw new Error(errorMessage);
              }
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              throw error; // Propagate the error to the caller
            })
        );
      }
    }

    await Promise.all(requests);
    return result;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | undefined> {
    try {
      const response = await fetch(`${this.baseApiUrl}/${fromCurrency}`);

      if (!response.ok) {
        this.failedToFindExchangeRate = true;
        const errorMessage = `HTTP error! Status: ${response.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.conversion_rates[toCurrency];
    } catch (error) {
      this.failedToFindExchangeRate = true;
      console.error('Error fetching data:', error);
      throw error; // Propagate the error to the caller
    }
  }

  getCurrencyConversionString(from: string, to: string) {
    return from + '_TO_' + to;
  }

  getRate(from: string, to: string) {
    const rate = this.currencies.get(this.getCurrencyConversionString(from, to));
    return rate;
  }
}
