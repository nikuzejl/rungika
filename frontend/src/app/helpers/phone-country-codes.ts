export interface PhoneCountryCodeOption {
  code: string
  label: string
}

export const PHONE_COUNTRY_CODES: PhoneCountryCodeOption[] = [
  { code: '+1', label: 'US (+1)' },
  { code: '+1', label: 'CA (+1)' },
  { code: '+257', label: 'BI (+257)' },
  { code: '+250', label: 'RW (+250)' }
]

export const SUPPORTED_PHONE_CODES = [...new Set(PHONE_COUNTRY_CODES.map(item => item.code))]

export const CURRENCY_PHONE_CODE_MAP: Record<string, string> = {
  BIF: '+257',
  RWF: '+250'
}
