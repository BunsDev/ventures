import BigNumber from 'bignumber.js'

export const ERROR = 'ERROR'
export const RESET_PROFILE = 'RESET_PROFILE'

// #Accounts
export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED'
export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED'

export const GET_BALANCES = 'GET_BALANCES'
export const BALANCES_RETURNED = 'BALANCES_RETURNED'

export const GET_BALANCES_LIGHT = 'GET_BALANCES_LIGHT'
export const BALANCES_LIGHT_RETURNED = 'BALANCES_LIGHT_RETURNED'

// #Dashboard
export const GET_DASHBOARD_SNAPSHOT = 'GET_DASHBOARD_SNAPSHOT'
export const DASHBOARD_SNAPSHOT_RETURNED = 'DASHBOARD_SNAPSHOT_RETURNED'

export const GET_USD_PRICE = 'GET_USD_PRICE'
export const USD_PRICE_RETURNED = 'USD_PRICE_RETURNED'


// #Governate
export const ZAP = 'ZAP'
export const ZAP_RETURNED = 'ZAP_RETURNED'

export const SWAP = 'SWAP'
export const SWAP_RETURNED = 'SWAP_RETURNED'

export const TRADE = 'TRADE'
export const TRADE_RETURNED = 'TRADE_RETURNED'

export const GET_BEST_PRICE = 'GET_BEST_PRICE'
export const GET_BEST_PRICE_RETURNED = 'GET_BEST_PRICE_RETURNED'


// #GENERAL
export const MAX_UINT256 = new BigNumber(2)
  .pow(256)
  .minus(1)
  .toFixed(0);
