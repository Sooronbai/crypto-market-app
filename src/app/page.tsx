'use client';

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

interface Pair {
  primary: string;
  secondary: string;
}

interface Price {
  last: string;
  change: {
    percent: string;
    direction: "Up" | "Down";
  };
}

interface Volume {
  primary: string;
  secondary: string;
}

interface Market {
  pair: Pair;
  price: Price;
  volume: Volume;
  priceHistory: string[];
}

interface Currency {
  code: string;
  sort_order: number;
  ticker: string;
  type: "Secondary" | "Primary";
  decimals_places: number;
  icon: string;
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("Aud");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>({ key: "volumeChange24h", direction: "desc" });

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("https://requestly.tech/api/mockv2/test/api/currency?username=user26614&");
      const data = await response.json();
      setCurrencies(data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const fetchMarkets = async () => {
    try {
      const response = await fetch(`https://requestly.tech/api/mockv2/test/api/market?username=user26614&secondary=${selectedCurrency}`);
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const sortMarkets = (markets: Market[], key: string, direction: "asc" | "desc") => {
    return [...markets].sort((a, b) => {
      const compare = (valA: number | string, valB: number | string) => {
        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      };

      switch (key) {
        case "coin":
          return compare(a.pair.primary, b.pair.primary);
        case "price":
          return compare(parseFloat(a.price.last), parseFloat(b.price.last));
        case "priceChange24h":
          const aChange = a.price.change.direction === "Down" ? -parseFloat(a.price.change.percent) : parseFloat(a.price.change.percent);
          const bChange = b.price.change.direction === "Down" ? -parseFloat(b.price.change.percent) : parseFloat(b.price.change.percent);
          return direction === "asc" ? aChange - bChange : bChange - aChange;
        case "volumeChange24h":
          return compare(parseFloat(a.volume.secondary), parseFloat(b.volume.secondary));
        default:
          return 0;
      }
    });
  };

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) =>
      market.pair.primary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markets, searchQuery]);

  const preparedMarkets = useMemo(() => {
    if (!sortConfig) return filteredMarkets;
    return sortMarkets(filteredMarkets, sortConfig.key, sortConfig.direction);
  }, [filteredMarkets, sortConfig]);

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setDropdownOpen(false);
  };

  const getCurrencyDetails = (code: string) =>
    currencies.find((currency) => currency.code.toUpperCase() === code.toUpperCase());

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, [selectedCurrency]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cryptocurrency Table</h1>

      <div className="mb-4 flex items-center gap-4">
        {/* Currency Dropdown */}
        <div className="relative">
          <label htmlFor="currency-selector" className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
          <div className="relative inline-block border border-gray-300 rounded-md">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between w-full px-3 py-2 text-left bg-white rounded-md focus:outline-none"
            >
              {(() => {
                const selectedCurrencyDetails = currencies.find(
                  (currency) => currency.code === selectedCurrency
                );
                return (
                  <>
                    {selectedCurrencyDetails && (
                      <Image
                        src={`data:image/svg+xml;base64,${selectedCurrencyDetails.icon}`}
                        alt={selectedCurrencyDetails.code}
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                    )}
                    {selectedCurrency.toUpperCase()}
                  </>
                );
              })()}
              <span className="ml-2">{dropdownOpen ? "▲" : "▼"}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {currencies
                  .filter((currency) => currency.type === "Secondary")
                  .map((currency) => (
                    <div
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      <Image
                        src={`data:image/svg+xml;base64,${currency.icon}`}
                        alt={currency.code}
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      {currency.code.toUpperCase()}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Box */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Token</label>
          <input
            type="text"
            id="search"
            placeholder="Search by token name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              {[
                { key: "coin", label: "Coin" },
                { key: "price", label: `${selectedCurrency} Price` },
                { key: "priceChange24h", label: "24h Change" },
                { key: "volumeChange24h", label: "24h Volume" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="py-2 px-4 text-left cursor-pointer"
                >
                  {label} {sortConfig?.key === key && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
              ))}
              <th className="py-2 px-4 text-right">Price Graph (7D)</th>
            </tr>
          </thead>
          <tbody>
            {preparedMarkets.map((item, index) => {
              const currencyDetails = getCurrencyDetails(item.pair.primary);
              return (
                <tr
                  key={index}
                  className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="py-2 px-4 flex items-center space-x-4">
                    {currencyDetails && (
                      <Image
                        src={`data:image/svg+xml;base64,${currencyDetails.icon}`}
                        width={24}
                        height={24}
                        alt={`${item.pair.primary} icon`}
                      />
                    )}
                    <span className="font-bold">{item.pair.primary.toUpperCase()}</span>
                  </td>
                  <td className="py-2 px-4 text-right">${item.price.last}</td>
                  <td
                    className={`py-2 px-4 text-right ${item.price.change.direction === "Down" ? "text-red-500" : "text-green-500"}`}
                  >
                    {item.price.change.direction === "Down" ? "-" : "+"}
                    {item.price.change.percent}%
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${parseFloat(item.volume.secondary).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="w-24 h-8">
                      <Sparklines data={item.priceHistory.map(Number)} limit={10}>
                        <SparklinesLine color="orange" />
                      </Sparklines>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
