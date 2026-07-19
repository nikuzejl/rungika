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
  private readonly exchangeRateUrl = `${environment.serverUrl}/api/v1/rate`;

  constructor() {}

  async initializeRates() {
    try {
      const exchangeRates = await this.getExchangeRates(this.fromCurrencies, this.toCurrencies);
      console.log('Exchange rates fetched successfully:', exchangeRates);

      for (const fromCurrency of this.fromCurrencies) {
        for (const toCurrency of this.toCurrencies) {
          const conversionString = this.getCurrencyConversionString(fromCurrency, toCurrency);
          const rate = exchangeRates.get(conversionString);

          if (rate !== undefined) {
            this.currencies.set(conversionString, rate);
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
    const result: Map<string, number> = new Map();
    const requests: Promise<void>[] = [];

    for (const fromCurrency of fromCurrencies) {
      for (const toCurrency of toCurrencies) {
        const conversionString = this.getCurrencyConversionString(fromCurrency, toCurrency);

        requests.push(
          this.getExchangeRate(fromCurrency, toCurrency)
            .then((exchangeRate) => {
              if (exchangeRate !== undefined) {
                result.set(conversionString, exchangeRate);
                return;
              }

              const errorMessage = `Exchange rate from ${fromCurrency} to ${toCurrency} not available in API response.`;
              console.error(errorMessage);
              throw new Error(errorMessage);
            })
            .catch((error) => {
              console.error('Error fetching data:', error);
              throw error;
            })
        );
      }
    }

    await Promise.all(requests);
    return result;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | undefined> {
    try {
      const params = new URLSearchParams({ fromCurrency, toCurrency });
      const response = await fetch(`${this.exchangeRateUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          accept: '*/*'
        }
      });

      if (!response.ok) {
        this.failedToFindExchangeRate = true;
        const errorMessage = `HTTP error! Status: ${response.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const exchangeRate = this.extractExchangeRate(data, toCurrency);
      if (exchangeRate === undefined) {
        this.failedToFindExchangeRate = true;
      }

      return exchangeRate;
    } catch (error) {
      this.failedToFindExchangeRate = true;
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  private extractExchangeRate(data: any, toCurrency: string): number | undefined {
    if (typeof data === 'number') {
      return data;
    }

    if (data?.rate !== undefined && typeof data.rate === 'number') {
      return data.rate;
    }

    if (data?.conversionRate !== undefined && typeof data.conversionRate === 'number') {
      return data.conversionRate;
    }

    if (data?.conversion_rates && data.conversion_rates[toCurrency] !== undefined) {
      return data.conversion_rates[toCurrency];
    }

    return undefined;
  }

  getCurrencyConversionString(from: string, to: string) {
    return from + '_TO_' + to;
  }

  getRate(from: string, to: string) {
    const rate = this.currencies.get(this.getCurrencyConversionString(from, to));
    return rate;
  }
}
