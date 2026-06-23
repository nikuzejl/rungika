import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  sendAmount = 0.0
  receiveAmount = 0.0
  receiveMethod = ""
  transactionDetails:any

  constructor() { }

  setTransactionDetails(transactionDetails:any) {
    this.transactionDetails = transactionDetails
  }

  getTransactionDetails() {
    return this.transactionDetails
  }
}
