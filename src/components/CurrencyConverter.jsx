import { useState } from "react";
import { formatAmount, parseAmount } from "../lib/finance";

const CurrencyConverter = ({ initialRates = [] }) => {
  const [amount, setAmount] = useState("");
  const [selectedCasa, setSelectedCasa] = useState(() => {
    const preferred = ["blue", "oficial"];
    const found = preferred.find((casa) =>
      initialRates.some((rate) => rate.casa === casa),
    );
    return found ?? initialRates[0]?.casa ?? "";
  });
  const [isReverse, setIsReverse] = useState(false);

  const selectedRate = initialRates.find(
    (rate) => rate.casa === selectedCasa,
  );
  const appliedRate = selectedRate
    ? isReverse
      ? (selectedRate.compra ?? selectedRate.venta)
      : selectedRate.venta
    : 0;

  const numericAmount = parseAmount(amount);
  const convertedAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 && appliedRate > 0
      ? isReverse
        ? numericAmount * appliedRate
        : numericAmount / appliedRate
      : null;

  const inputStyles =
    "w-full p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 placeholder-gray-400 text-base sm:text-lg";
  const selectStyles =
    "w-full p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 text-sm sm:text-base";
  const labelStyles =
    "text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block";

  if (initialRates.length === 0) {
    return (
      <div className="card p-6 rounded-2xl sm:rounded-3xl w-full text-center">
        <p className="text-sm font-medium text-gray-600">
          No pudimos cargar las cotizaciones del dólar.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="card card-hover p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl w-full">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 sm:mb-8 text-center text-blue-600 tracking-tight">
        Conversor de Moneda
      </h2>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gray-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
          <label className={labelStyles}>
            {isReverse ? "Dólares (USD)" : "Pesos Argentinos (ARS)"}
          </label>
          <div className="relative">
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm sm:text-base">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputStyles} pl-7 sm:pl-8`}
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex justify-center -my-2 sm:my-0">
          <button
            onClick={() => {
              setIsReverse(!isReverse);
              setAmount("");
            }}
            className="p-2 sm:p-2.5 bg-white border border-gray-200 rounded-full shadow-lg hover:scale-110 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 group"
            title="Invertir conversión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-blue-600 transition-transform duration-300 ${isReverse ? "rotate-180" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
          <label className={labelStyles}>Tipo de Cambio</label>
          <select
            value={selectedCasa}
            onChange={(e) => setSelectedCasa(e.target.value)}
            className={selectStyles}
          >
            {initialRates.map((type) => (
              <option key={type.casa} value={type.casa}>
                {`Dólar ${type.nombre}`}
              </option>
            ))}
          </select>
          {selectedRate && appliedRate > 0 && (
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              {isReverse ? "Compra" : "Venta"}: ${formatAmount(appliedRate)}
            </p>
          )}
        </div>

        <div className="bg-blue-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1 uppercase tracking-wider">
              Resultado Estimado
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-light opacity-80">
                {isReverse ? "ARS" : "USD"}
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                {convertedAmount === null ? "0,00" : formatAmount(convertedAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
