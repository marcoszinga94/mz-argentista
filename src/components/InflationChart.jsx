import { useMemo, useState } from "react";
import { formatPercent } from "../lib/finance";

function groupDataByDecadeAndYear(data) {
  return data.reduce((acc, item) => {
    const [year, month] = item.fecha.split("-");
    const decade = `${Math.floor(year / 10) * 10}s`;

    if (!acc[decade]) {
      acc[decade] = {};
    }
    if (!acc[decade][year]) {
      acc[decade][year] = {
        months: {},
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        total: 0,
        count: 0,
      };
    }
    acc[decade][year].months[month] = item.valor;
    acc[decade][year].min = Math.min(acc[decade][year].min, item.valor);
    acc[decade][year].max = Math.max(acc[decade][year].max, item.valor);
    acc[decade][year].total += item.valor;
    acc[decade][year].count += 1;
    return acc;
  }, {});
}

function getInitialOpenItems(groupedData) {
  const decades = Object.keys(groupedData);
  if (decades.length === 0) {
    return {};
  }

  const lastDecade = decades.sort().pop();
  const years = Object.keys(groupedData[lastDecade]);

  return {
    [lastDecade]: true,
    [`${lastDecade}-${years.sort().pop()}`]: true,
  };
}

const formatDate = (year, month) => {
  const date = new Date(year, Number.parseInt(month) - 1);
  return date.toLocaleString("es-AR", { month: "long", year: "numeric" });
};

const InflationChart = ({ initialData = [] }) => {
  const inflationData = useMemo(
    () => groupDataByDecadeAndYear(initialData),
    [initialData],
  );
  const [openItems, setOpenItems] = useState(() =>
    getInitialOpenItems(inflationData),
  );

  const toggleItem = (itemKey) => {
    setOpenItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  if (initialData.length === 0) {
    return (
      <section className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full flex-1 text-center">
        <p className="text-sm font-medium text-gray-600">
          No pudimos cargar los índices de inflación.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <section className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full mb-0 flex-1 overflow-hidden">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 text-center text-blue-600 tracking-tight">
        Índices de Inflación
      </h2>
      {Object.entries(inflationData)
        .sort(([decadeA], [decadeB]) => decadeB.localeCompare(decadeA))
        .map(([decade, years]) => (
          <div key={decade} className="mb-3 last:mb-0">
            <button
              onClick={() => toggleItem(decade)}
              className={`w-full text-left text-base sm:text-lg font-bold p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 flex justify-between items-center ${
                openItems[decade]
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-sm sm:text-base">{decade}</span>
              {openItems[decade] ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>

            {openItems[decade] && (
              <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3 pl-2 sm:pl-4 border-l-2 border-blue-100 ml-2 sm:ml-4">
                {Object.entries(years)
                  .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                  .map(([year, data]) => (
                    <div
                      key={year}
                      className="bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(`${decade}-${year}`)}
                        className="w-full text-left p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="font-bold text-gray-800 text-sm sm:text-base">{year}</span>
                        <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-gray-500 flex-wrap">
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-50 text-green-700 rounded text-[10px] sm:text-xs font-medium">
                            {formatPercent(data.min, 1)}%
                          </span>
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-50 text-red-700 rounded text-[10px] sm:text-xs font-medium">
                            {formatPercent(data.max, 1)}%
                          </span>
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded text-[10px] sm:text-xs font-medium">
                            {formatPercent(data.total / data.count, 1)}%
                          </span>
                          {openItems[`${decade}-${year}`] ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          )}
                        </div>
                      </button>

                      {openItems[`${decade}-${year}`] && (
                        <div className="overflow-x-auto border-t border-gray-100">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-gray-50/50">
                                <th className="p-2 sm:p-3 font-semibold text-gray-600">Mes</th>
                                <th className="p-2 sm:p-3 font-semibold text-gray-600 text-right">%</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {Object.entries(data.months)
                                .sort(([monthA], [monthB]) =>
                                  monthB.localeCompare(monthA)
                                )
                                .map(([month, value]) => (
                                  <tr
                                    key={`${year}-${month}`}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="p-2 sm:p-3 text-gray-700 capitalize text-xs sm:text-sm">
                                      {formatDate(year, month).split(" ")[0]}
                                    </td>
                                    <td className="p-2 sm:p-3 font-medium text-right">
                                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm ${value > 10 ? 'bg-red-50 text-red-700' : value > 5 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                                        {formatPercent(value, 1)}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
    </section>
  );
};

export default InflationChart;
