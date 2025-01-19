import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Currency } from "../types";

interface CurrencyDropdownProps {
  currencies: Currency[];
  selectedCurrency: string;
  onSelectedCurrencyChange: (currency: string) => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  currencies,
  selectedCurrency,
  onSelectedCurrencyChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownTogle = () => setDropdownOpen((prev) => !prev);

  const handleCurrencySelect = (currencyCode: string) => {
    onSelectedCurrencyChange(currencyCode);
    setDropdownOpen(false);
  };

  const selectedCurrencyDetails = useMemo(
    () => currencies.find((currency) => currency.code === selectedCurrency),
    [currencies, selectedCurrency]
  );

  return (
    <div className="relative">
      <label
        htmlFor="currency-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select Currency
      </label>
      <div className="relative inline-block border border-gray-300 rounded-md">
        <button
          onClick={handleDropdownTogle}
          className="flex items-center justify-between w-full px-3 py-2 text-left bg-white rounded-md focus:outline-none"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center">
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
          </div>
          <span className="ml-2">{dropdownOpen ? "▲" : "▼"}</span>
        </button>
        {dropdownOpen && (
          <ul
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
            role="listbox"
          >
            {currencies
              .filter((currency) => currency.type === "Secondary")
              .map((currency) => (
                <li
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                  role="option"
                  aria-selected={currency.code === selectedCurrency}
                >
                  <Image
                    src={`data:image/svg+xml;base64,${currency.icon}`}
                    alt={currency.code}
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  {currency.code.toUpperCase()}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CurrencyDropdown;
