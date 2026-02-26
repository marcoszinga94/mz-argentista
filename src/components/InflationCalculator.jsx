import { useState, useEffect, useCallback } from "react";

const InflationCalculator = () => {
  const [inflationData, setInflationData] = useState([]);
  const [amount, setAmount] = useState("1000");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInflationData = async () => {
      try {
        const response = await fetch(
          "https://api.argentinadatos.com/v1/finanzas/indices/inflacion",
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener la información de inflación");
        }
        const data = await response.json();
        setInflationData(
          data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
        );
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchInflationData();
  }, []);

  useEffect(() => {
    if (inflationData.length > 0) {
      const latestDate = new Date(
        inflationData[inflationData.length - 1].fecha,
      );
      setEndMonth((latestDate.getMonth() + 1).toString().padStart(2, "0"));
      setEndYear(latestDate.getFullYear().toString());

      const oneYearBefore = new Date(latestDate);
      oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);

      setStartMonth((oneYearBefore.getMonth() + 1).toString().padStart(2, "0"));
      setStartYear(oneYearBefore.getFullYear().toString());
    }
  }, [inflationData]);

  const calculateInflation = useCallback(() => {
    if (!amount || !startMonth || !startYear || !endMonth || !endYear) {
      return;
    }

    const startDate = `${startYear}-${startMonth}-01`;
    const endDate = `${endYear}-${endMonth}-01`;

    const startIndex = inflationData.findIndex(
      (item) => item.fecha >= startDate,
    );
    const endIndex = inflationData.findIndex((item) => item.fecha > endDate);

    if (startIndex === -1 || endIndex === -1) {
      return;
    }

    const relevantData = inflationData.slice(startIndex, endIndex);
    const inflationFactor = relevantData.reduce(
      (acc, item) => acc * (1 + item.valor / 100),
      1,
    );
    const adjustedAmount = Number.parseFloat(amount) * inflationFactor;

    const totalInflation =
      (adjustedAmount / Number.parseFloat(amount) - 1) * 100;
    const monthsDiff = endIndex - startIndex;
    const annualizedInflation =
      (1 + totalInflation / 100) ** (12 / monthsDiff) - 1;
    const averageMonthlyInflation =
      ((1 + annualizedInflation) ** (1 / 12) - 1) * 100;

    setResult({
      adjustedAmount: adjustedAmount.toFixed(2),
      totalInflation: totalInflation.toFixed(2),
      averageMonthlyInflation: averageMonthlyInflation.toFixed(2),
      annualizedInflation: (annualizedInflation * 100).toFixed(2),
    });
  }, [amount, startMonth, startYear, endMonth, endYear, inflationData]);

  useEffect(() => {
    if (amount && startMonth && startYear && endMonth && endYear) {
      calculateInflation();
    }
  }, [calculateInflation]);

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

  const years = Array.from({ length: 30 }, (_, i) =>
    (new Date().getFullYear() - 29 + i).toString(),
  ).reverse();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center">
        <span className="font-medium">Error: {error}</span>
      </div>
    );
  }

  const inputStyles =
    "w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 text-right text-sm sm:text-lg";
  const selectStyles =
    "w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 text-xs sm:text-base";
  const labelStyles =
    "text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 block";

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

        {/* Result Section */}
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
                  value={result ? result.adjustedAmount : ""}
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

          {result && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200/50">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="bg-white/60 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {result.totalInflation}%
                  </p>
                </div>
                <div className="bg-white/60 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Promedio</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {result.averageMonthlyInflation}%
                  </p>
                </div>
                <div className="bg-white/60 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Anual</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {result.annualizedInflation}%
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
