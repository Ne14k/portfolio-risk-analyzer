// Plaid TypeScript types for portfolio data

export interface PlaidAccount {
  account_id: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string;
  };
  mask: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
  institution_id?: string;
}

export interface PlaidSecurity {
  security_id: string;
  isin: string | null;
  cusip: string | null;
  sedol: string | null;
  institution_security_id: string | null;
  institution_id: string | null;
  proxy_security_id: string | null;
  name: string;
  ticker_symbol: string | null;
  is_cash_equivalent: boolean;
  type: string;
  close_price: number | null;
  close_price_as_of: string | null;
  iso_currency_code: string;
  unofficial_currency_code: string | null;
}

export interface PlaidHolding {
  account_id: string;
  security_id: string;
  institution_price: number;
  institution_price_as_of: string | null;
  institution_value: number;
  cost_basis: number | null;
  quantity: number;
  iso_currency_code: string;
  unofficial_currency_code: string | null;
}

export interface PlaidInstitution {
  institution_id: string;
  name: string;
  logo: string | null;
  primary_color: string | null;
  url: string | null;
}

export interface PlaidLinkSuccess {
  public_token: string;
  metadata: {
    institution: PlaidInstitution;
    accounts: PlaidAccount[];
    link_session_id: string;
  };
}

export interface PlaidLinkExit {
  error: any;
  metadata: {
    institution: PlaidInstitution | null;
    link_session_id: string;
    request_id: string;
  };
}

export interface PlaidLinkEvent {
  event_name: string;
  metadata: {
    error_code?: string;
    error_message?: string;
    error_type?: string;
    exit_status?: string;
    institution_id?: string;
    institution_name?: string;
    institution_search_query?: string;
    link_session_id: string;
    mfa_type?: string;
    request_id: string;
    timestamp: string;
  };
}

export interface ConnectedAccount {
  id: string;
  account_id: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
  mask: string;
  institution: PlaidInstitution;
  balance: number;
  currency: string;
  last_updated: string;
}

export interface PortfolioHolding {
  id: string;
  account_id: string;
  security: PlaidSecurity;
  quantity: number;
  market_value: number;
  cost_basis: number | null;
  gain_loss: number | null;
  gain_loss_percentage: number | null;
  allocation_percentage: number;
  last_updated: string;
}

export interface PortfolioSummary {
  total_value: number;
  total_gain_loss: number;
  total_gain_loss_percentage: number;
  accounts_count: number;
  holdings_count: number;
  asset_allocation: {
    stocks: number;
    bonds: number;
    cash: number;
    alternatives: number;
  };
  last_updated: string;
}

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidAccessTokenResponse {
  access_token: string;
  item_id: string;
  request_id: string;
}