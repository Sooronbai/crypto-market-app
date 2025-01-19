import { CurrencyType, PriceDirection, SortDirection } from "./enums";

interface Pair {
  primary: string;
  secondary: string;
}

interface Price {
  last: string;
  change: {
    percent: string;
    direction: PriceDirection;
  };
}

interface Volume {
  primary: string;
  secondary: string;
}

export interface Market {
  pair: Pair;
  price: Price;
  volume: Volume;
  priceHistory: string[];
}

export interface Currency {
  code: string;
  sort_order: number;
  ticker: string;
  type: CurrencyType;
  decimals_places: number;
  icon: string;
}

export interface SortConfig {
  key: string;
  direction: SortDirection;
}
