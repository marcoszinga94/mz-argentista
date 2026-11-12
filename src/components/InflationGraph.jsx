import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatPercent } from "../lib/finance";
import {
  axisTicks,
  axisTitle,
  baseChartOptions,
  baseGrid,
  baseLegend,
  baseTooltip,
} from "../lib/chartTheme";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const InflationGraph = ({ initialData = [] }) => {
  const lastDate = initialData[initialData.length - 1]?.fecha ?? "";

  const [startDate, setStartDate] = useState(() => {
    if (!lastDate) {
      return "";
    }
    const date = new Date(`${lastDate.slice(0, 7)}-01T00:00:00Z`);
    date.setUTCFullYear(date.getUTCFullYear() - 10);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(lastDate);

  const chartData = useMemo(() => {
    const filteredData = initialData.filter(
      (item) => item.fecha >= startDate && item.fecha <= endDate,
    );

    if (filteredData.length === 0) {
      return null;
    }

    return {
      labels: filteredData.map((item) =>
        format(new Date(`${item.fecha}T00:00:00`), "MMM-yy", { locale: es }),
      ),
      datasets: [
        {
          label: "Inflación Mensual (%)",
          data: filteredData.map((item) => item.valor),
          borderColor: "rgb(37, 99, 235)",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [endDate, initialData, startDate]);

  const chartOptions = {
  ...baseChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: baseGrid,
      title: axisTitle("Inflación (%)"),
      ticks: axisTicks({
        callback: (value) => `${formatPercent(Number(value), 1)}%`,
      }),
    },
    x: {
      grid: { display: false },
      title: axisTitle("Fecha"),
      ticks: axisTicks({
        maxTicksLimit: 12,
        autoSkip: true,
        maxRotation: 45,
        minRotation: 45,
      }),
    },
  },
  plugins: {
    legend: baseLegend,
    tooltip: {
      ...baseTooltip,
      callbacks: {
        label: (context) =>
          `${context.dataset.label}: ${formatPercent(context.parsed.y, 1)}%`,
      },
    },
  },
};

const inputStyles =
    "w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 text-sm sm:text-base";

  return (
    <section className="card p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl w-full mb-auto md:sticky md:top-32 flex-1">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 text-center text-blue-600 tracking-tight">
        Evolución de la Inflación
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="flex flex-col gap-1 sm:gap-2">
          <label htmlFor="startDate" className="text-[10px] sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Desde
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputStyles}
          />
        </div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <label htmlFor="endDate" className="text-[10px] sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Hasta
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputStyles}
          />
        </div>
      </div>
      <div className="h-72 sm:h-80 md:h-[28rem] lg:h-[32rem] relative w-full">
        {initialData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-medium text-gray-600">
              No pudimos cargar la evolución de la inflación.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {chartData && <Line data={chartData} options={chartOptions} />}
            {!chartData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-medium text-gray-600">
                  No hay datos en el rango seleccionado.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default InflationGraph;
