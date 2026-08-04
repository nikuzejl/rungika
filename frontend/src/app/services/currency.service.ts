import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  currencies: Map<string, number> = new Map();
  fromCurrencies = ["USD", "CAD"];
  toCurrencies = ["BIF", "RWF"];
  failedToFindExchangeRate = false;
  private readonly exchangeRateUrl = 'https://open.er-api.com/v6/latest/';

  async initializeRates() {
    try {
      const exchangeRates = await this.getExchangeRates(this.fromCurrencies, this.toCurrencies);
      console.log('Exchange rates fetched successfully:', exchangeRates);

      this.currencies.clear();
      for (const [currencyPair, rate] of exchangeRates.entries()) {
        console.log(`Exchange rate for ${currencyPair}:`, rate);
        this.currencies.set(currencyPair, rate);
      }
    } catch (error) {
      this.failedToFindExchangeRate = true;
      console.error('Error in initializeRates:', error);
      throw error; // Propagate the error to the caller
    }
  }

  async getExchangeRates(fromCurrencies: string[], toCurrencies: string[]): Promise<Map<string, number>> {
    const requests = fromCurrencies.flatMap((fromCurrency) =>
      toCurrencies.map(async (toCurrency) => {
        const currencyPair = this.getCurrencyPairKey(fromCurrency, toCurrency);
        const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);

        if (exchangeRate === undefined) {
          const errorMessage = `Exchange rate from ${fromCurrency} to ${toCurrency} not available in API response.`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        return [currencyPair, exchangeRate] as const;
      })
    );

    return new Map(await Promise.all(requests));
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | undefined> {
    try {
      const requestUrl = `${this.exchangeRateUrl}${fromCurrency}`;
      console.log('Fetching exchange rate', { fromCurrency, toCurrency, requestUrl });

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          accept: '*/*'
        }
      });

      console.log('Exchange rate response received', {
        fromCurrency,
        toCurrency,
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        this.failedToFindExchangeRate = true;
        const errorMessage = `HTTP error! Status: ${response.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Exchange rate payload', { fromCurrency, toCurrency, data });

      const exchangeRate = this.extractExchangeRate(data, toCurrency);
      console.log('Extracted exchange rate', { fromCurrency, toCurrency, exchangeRate });

      if (exchangeRate === undefined) {
        this.failedToFindExchangeRate = true;
        console.warn('Exchange rate missing from payload', { fromCurrency, toCurrency, data });
      }

      return exchangeRate;
    } catch (error) {
      this.failedToFindExchangeRate = true;
      console.error('Error fetching exchange rate data', { fromCurrency, toCurrency, error });
      throw error;
    }
  }

  private extractExchangeRate(data: any, toCurrency: string): number | undefined {
    if (typeof data === 'number') {
      return data;
    }

    return [
      data?.rate,
      data?.conversionRate,
      data?.rates?.[toCurrency],
      data?.conversion_rates?.[toCurrency]
    ].find((rate): rate is number => typeof rate === 'number');
  }

  private getCurrencyPairKey(from: string, to: string) {
    return `${from}:${to}`;
  }

  getRate(from: string, to: string) {
    const rate = this.currencies.get(this.getCurrencyPairKey(from, to));
    return rate;
  }
}
