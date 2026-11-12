import { useMemo, useState } from "react";
import { accumulateInflation, formatAmount, formatPercent } from "../lib/finance";

const months = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function monthFromDate(date) {
  return String(date.getUTCMonth() + 1).padStart(2, "0");
}

function shiftMonths(year, month, offset) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1 + offset, 1));
  return {
    year: date.getUTCFullYear().toString(),
    month: monthFromDate(date),
  };
}

const InflationCalculator = ({ initialData = [] }) => {
  const latest = initialData[initialData.length - 1];
  const defaultEnd = latest
    ? { year: latest.fecha.slice(0, 4), month: latest.fecha.slice(5, 7) }
    : { year: "", month: "" };
  const defaultStart = latest
    ? shiftMonths(defaultEnd.year, defaultEnd.month, -11)
    : { year: "", month: "" };

  const [amount, setAmount] = useState("1000");
  const [startMonth, setStartMonth] = useState(defaultStart.month);
  const [startYear, setStartYear] = useState(defaultStart.year);
  const [endMonth, setEndMonth] = useState(defaultEnd.month);
  const [endYear, setEndYear] = useState(defaultEnd.year);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const firstYear = initialData.length
      ? Number(initialData[0].fecha.slice(0, 4))
      : currentYear - 29;

    return Array.from(
      { length: currentYear - firstYear + 1 },
      (_, i) => (currentYear - i).toString(),
    );
  }, [initialData]);

  const isComplete = Boolean(
    amount && startMonth && startYear && endMonth && endYear,
  );

  const result = useMemo(() => {
    if (!isComplete) {
      return null;
    }

    return accumulateInflation(
      initialData,
      Number.parseFloat(amount),
      { year: startYear, month: startMonth },
      { year: endYear, month: endMonth },
    );
  }, [amount, isComplete, initialData, startMonth, startYear, endMonth, endYear]);

  const inputStyles =
    "w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 text-right text-sm sm:text-lg";
  const selectStyles =
    "w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 text-xs sm:text-base";
  const labelStyles =
    "text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 block";

  if (initialData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full text-center">
        <p className="text-sm font-medium text-gray-600">
          No pudimos cargar los datos de inflación.
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
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full m-auto h-full overflow-hidden">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 text-center text-blue-600 tracking-tight">
        Calculadora de Inflación
      </h2>

      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="bg-gray-50/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
          <div className="flex flex-col gap-3 items-start text-center">
            <div className="w-full">
              <label className={labelStyles}>Monto Inicial</label>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs sm:text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputStyles} pl-6 sm:pl-7`}
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-row w-full gap-1.5 sm:gap-3">
              <div className="flex-1">
                <label className={labelStyles}>Mes Inicio</label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Mes</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className={labelStyles}>Año Inicio</label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Año</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center -my-6 sm:-my-10">
          <div className="bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-400 relative z-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 sm:w-6 sm:h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </div>
        </div>

        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100">
          <div className="flex flex-col gap-3 items-start text-center">
            <div className="w-full">
              <label className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 sm:mb-2 block">
                Monto Final
              </label>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-blue-400 font-semibold text-xs sm:text-sm">
                  $
                </span>
                <input
                  type="text"
                  value={result ? formatAmount(result.adjustedAmount) : ""}
                  readOnly
                  className={`${inputStyles} pl-6 sm:pl-7 bg-white border-blue-200 text-blue-900 font-bold`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-row w-full gap-1.5 sm:gap-3">
              <div className="flex-1">
                <label className={labelStyles}>Mes Final</label>
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className={selectStyles}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className={labelStyles}>Año Final</label>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className={selectStyles}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isComplete && !result && (
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-red-600 text-center font-medium">
              No hay datos de inflación para el rango seleccionado.
            </p>
          )}

          {result && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200/50">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="bg-white/60 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {formatPercent(result.totalInflation)}%
                  </p>
                </div>
                <div className="bg-white/60 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Promedio</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {formatPercent(result.averageMonthlyInflation)}%
                  </p>
                </div>
                <div className="bg-white/60 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Anual</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {formatPercent(result.annualizedInflation)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InflationCalculator;
