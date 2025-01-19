import Image from "next/image";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { Currency, Market, SortConfig } from "../types";
import { PriceDirection, SortDirection } from "../enums";

interface MarketTableProps {
  selectedCurrency: string;
  onSort: (key: string) => void;
  sortConfig: SortConfig;
  markets: Market[];
  currencies: Currency[];
}

const MarketTable: React.FC<MarketTableProps> = ({
  onSort,
  sortConfig,
  selectedCurrency,
  markets,
  currencies,
}) => {
  const getCurrencyDetails = (code: string) =>
    currencies.find(
      (currency) => currency.code.toUpperCase() === code.toUpperCase()
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th
              onClick={() => onSort("coin")}
              className="py-2 px-4 cursor-pointer text-left"
            >
              Coin{" "}
              {sortConfig?.key === "coin" &&
                (sortConfig.direction === SortDirection.asc ? "↑" : "↓")}
            </th>
            {[
              { key: "price", label: `${selectedCurrency} Price` },
              { key: "priceChange24h", label: "24h Change" },
              { key: "volumeChange24h", label: "24h Volume" },
            ].map(({ key, label }) => (
              <th
                key={key}
                onClick={() => onSort(key)}
                className="py-2 px-4 cursor-pointer text-right"
              >
                {label}{" "}
                {sortConfig?.key === key &&
                  (sortConfig.direction === SortDirection.asc ? "↑" : "↓")}
              </th>
            ))}
            <th className="py-2 px-4 text-right">Price Graph (7D)</th>
          </tr>
        </thead>
        <tbody>
          {markets.length > 0 ? (
            markets.map((item, index) => {
              const currencyDetails = getCurrencyDetails(item.pair.primary);
              return (
                <tr
                  key={index}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
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
                    <span className="font-bold">
                      {item.pair.primary.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">${item.price.last}</td>
                  <td
                    className={`py-2 px-4 text-right ${
                      item.price.change.direction === PriceDirection.down
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.price.change.direction === PriceDirection.down
                      ? "-"
                      : "+"}
                    {item.price.change.percent}%
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${parseFloat(item.volume.secondary).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 flex justify-end items-center">
                    <Sparklines data={item.priceHistory.map(Number)} limit={10}>
                      <SparklinesLine color="orange" />
                    </Sparklines>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;
