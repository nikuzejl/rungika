export class Restaurant {
  name: string
  address: string
  phone: string
  email: string
  description: string
  personOfContact: string
  creditCardInfo: CreditCardInfo

  constructor() {
    this.name = ''
    this.address = ''
    this.phone = ''
    this.email = ''
    this.description = ''
    this.personOfContact = ''
    this.creditCardInfo = new CreditCardInfo()
  }
}

export class CreditCardInfo {
  cardNumber: string
  cardHolderName: string
  expirationDate: string
  cvv: string

  constructor() {
    this.cardNumber = ''
    this.cardHolderName = ''
    this.expirationDate = ''
    this.cvv = ''
  }
}
