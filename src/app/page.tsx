"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Currency, Market, SortConfig } from "./types";
import CurrencyDropdown from "./components/CurrencyDropdown";
import SearchBox from "./components/SearchBox";
import { PriceDirection, SortDirection } from "./enums";
import MarketTable from "./components/MarketTable";
import Image from "next/image";

const sortMarkets = (markets: Market[], { direction, key }: SortConfig) => {
  return [...markets].sort((a, b) => {
    const compare = (valA: number | string, valB: number | string) => {
      if (valA < valB) return direction === SortDirection.asc ? -1 : 1;
      if (valA > valB) return direction === SortDirection.asc ? 1 : -1;
      return 0;
    };

    switch (key) {
      case "coin":
        return compare(a.pair.primary, b.pair.primary);
      case "price":
        return compare(parseFloat(a.price.last), parseFloat(b.price.last));
      case "priceChange24h":
        const aChange =
          a.price.change.direction === PriceDirection.down
            ? -parseFloat(a.price.change.percent)
            : parseFloat(a.price.change.percent);
        const bChange =
          b.price.change.direction === PriceDirection.down
            ? -parseFloat(b.price.change.percent)
            : parseFloat(b.price.change.percent);
        return direction === SortDirection.asc
          ? aChange - bChange
          : bChange - aChange;
      case "volumeChange24h":
        return compare(
          parseFloat(a.volume.secondary),
          parseFloat(b.volume.secondary)
        );
      default:
        return 0;
    }
  });
};

const FETCH_INTERVAL = 30000;
const API_BASE_URL = "https://requestly.tech/api/mockv2/test/api";
const USERNAME = "user26614";

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("Aud");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "volumeChange24h",
    direction: SortDirection.desc,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/currency?username=${USERNAME}`
      );
      const data = await response.json();
      setCurrencies(data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  }, []);

  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/market?username=${USERNAME}&secondary=${selectedCurrency}`
      );
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCurrency]);

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) =>
      market.pair.primary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markets, searchQuery]);

  const preparedMarkets = useMemo(() => {
    if (!sortConfig) return filteredMarkets;
    return sortMarkets(filteredMarkets, sortConfig);
  }, [filteredMarkets, sortConfig]);

  const handleSort = (key: string) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === SortDirection.asc
        ? SortDirection.desc
        : SortDirection.asc;
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4  items-end">
        <h1 className="text-2xl font-bold">Cryptocurrency Market Summary</h1>
        {isLoading && (
          <Image
            src="./loading.svg"
            width={4}
            height={4}
            alt="loading"
            className="animate-spin h-6 w-6 text-gray-500"
          />
        )}
      </div>
      <div className="mb-4 flex items-center gap-4">
        <CurrencyDropdown
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectedCurrencyChange={setSelectedCurrency}
        />
        <SearchBox
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
      <MarketTable
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        markets={preparedMarkets}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
}
