import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
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
import { format, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { formatAmount, formatInteger } from "../lib/finance";
import {
  axisTicks,
  axisTitle,
  baseChartOptions,
  baseGrid,
  baseLegend,
  baseTooltip,
} from "../lib/chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const CASAS = [
  "oficial",
  "blue",
  "bolsa",
  "contadoconliqui",
  "mayorista",
  "cripto",
  "tarjeta",
];

const CASA_LABELS = {
  oficial: "Oficial",
  blue: "Blue",
  bolsa: "Bolsa",
  contadoconliqui: "Contado con liqui",
  mayorista: "Mayorista",
  cripto: "Cripto",
  tarjeta: "Tarjeta",
};

const CASA_COLORS = [
  "rgba(14, 165, 233, 1)",
  "rgba(239, 68, 68, 1)",
  "rgba(249, 115, 22, 1)",
  "rgba(168, 85, 247, 1)",
  "rgba(59, 130, 246, 1)",
  "rgba(234, 179, 8, 1)",
  "rgba(16, 185, 129, 1)",
];

const MAX_POINTS = {
  "0.25": 14,
  1: 31,
  3: 92,
  6: 183,
  12: 366,
  all: 1000,
};

const rangeCache = new Map();

function rangeStart(range) {
  const end = new Date();
  if (range === "all") {
    return null;
  }
  if (range >= 1) {
    return subMonths(end, range);
  }
  return subWeeks(end, Math.max(1, Math.round(range * 4)));
}

function getPointConfig(range) {
  if (range === "all") return { radius: 0, hitRadius: 10 };
  if (range >= 12) return { radius: 1, hitRadius: 10 };
  if (range >= 6) return { radius: 2, hitRadius: 8 };
  if (range >= 3) return { radius: 3, hitRadius: 6 };
  if (range >= 1) return { radius: 4, hitRadius: 6 };
  return { radius: 5, hitRadius: 6 };
}

function getTicksConfig(range) {
  if (range === "all") return { maxTicksLimit: 12 };
  if (range >= 12) return { maxTicksLimit: 12 };
  if (range >= 6) return { maxTicksLimit: 12 };
  if (range >= 3) return { maxTicksLimit: 6 };
  if (range >= 1) return { maxTicksLimit: 30 };
  return { maxTicksLimit: 7 };
}

function formatLabel(date, range) {
  const parsed = new Date(`${date}T00:00:00`);
  if (range === "all") {
    return format(parsed, "MMM-yyyy", { locale: es });
  }
  if (range >= 12) {
    return format(parsed, "MMM-yy", { locale: es });
  }
  return format(parsed, "d-M-yy", { locale: es });
}

function prepareChartData(series, range) {
  const dateSet = new Set();
  CASAS.forEach((casa) => {
    (series[casa] ?? []).forEach((point) => dateSet.add(point.date));
  });

  const allDates = [...dateSet].sort((a, b) => a.localeCompare(b));
  if (allDates.length === 0) {
    return { labels: [], datasets: [] };
  }

  const maxPoints = MAX_POINTS[String(range)] ?? 366;
  const step = Math.max(1, Math.ceil(allDates.length / maxPoints));
  const dates = allDates.filter((_, index) => index % step === 0);
  const maps = CASAS.map(
    (casa) => new Map((series[casa] ?? []).map((point) => [point.date, point.venta])),
  );
  const pointConfig = getPointConfig(range);

  const datasets = CASAS.map((casa, index) => {
    let lastValue = null;
    const data = dates.map((date) => {
      const value = maps[index].get(date);
      if (typeof value === "number") {
        lastValue = value;
      }
      return lastValue;
    });

    return {
      label: `Dólar ${CASA_LABELS[casa]}`,
      data,
      borderColor: CASA_COLORS[index],
      backgroundColor: CASA_COLORS[index],
      tension: 0.3,
      borderWidth: 2,
      spanGaps: true,
      pointRadius: pointConfig.radius,
      pointHitRadius: pointConfig.hitRadius,
      pointHoverRadius: pointConfig.radius + 3,
      pointBackgroundColor: "#fff",
      pointBorderWidth: 2,
    };
  });

  return {
    labels: dates.map((date) => formatLabel(date, range)),
    datasets,
  };
}

async function fetchSeries(range) {
  const start = rangeStart(range);
  const since = start ? start.toISOString().slice(0, 10) : "";
  const cacheKey = since || "all";

  if (rangeCache.has(cacheKey)) {
    return rangeCache.get(cacheKey);
  }

  const params = new URLSearchParams();
  if (since) {
    params.set("desde", since);
  }

  const response = await fetch(`/api/dolar-series.json?${params.toString()}`);
  if (!response.ok) {
    throw new Error("No se pudo cargar el histórico del dólar");
  }

  const data = await response.json();
  rangeCache.set(cacheKey, data);
  return data;
}

const timeRangeOptions = [
  { value: 0.25, label: "1 semana" },
  { value: 1, label: "1 mes" },
  { value: 3, label: "3 meses" },
  { value: 6, label: "6 meses" },
  { value: 12, label: "1 año" },
  { value: "all", label: "Todo el historial" },
];

const chartOptions = {
  ...baseChartOptions,
  scales: {
    y: {
      beginAtZero: false,
      grid: baseGrid,
      title: axisTitle("Precio en ARS"),
      ticks: axisTicks({
        callback: (value) => formatInteger(Number(value)),
      }),
    },
    x: {
      grid: { display: false },
      title: axisTitle("Fecha"),
      ticks: axisTicks({
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
          typeof context.parsed.y === "number"
            ? `${context.dataset.label}: $${formatAmount(context.parsed.y)}`
            : context.dataset.label,
      },
    },
  },
};

const selectStyles =
  "w-full sm:w-auto p-2 sm:p-2.5 pr-8 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 text-xs sm:text-base";

const DollarHistoryChart = ({ initialSeries = null, initialRange = 0.25 }) => {
  const [timeRange, setTimeRange] = useState(initialRange);
  const [series, setSeries] = useState(initialSeries);
  const [isLoading, setIsLoading] = useState(!initialSeries);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const firstRun = useRef(true);

  const chartData = useMemo(
    () => prepareChartData(series ?? {}, timeRange),
    [series, timeRange],
  );

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (initialSeries) {
        return;
      }
    }

    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSeries(timeRange);
        if (active) {
          setSeries(data);
        }
      } catch (loadError) {
        if (active) {
          setError("No pudimos cargar el histórico del dólar.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [attempt, timeRange]);

  const hasData = chartData.datasets.some((dataset) =>
    dataset.data.some((value) => value !== null),
  );

  const options = useMemo(
    () => ({
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        x: {
          ...chartOptions.scales.x,
          ticks: {
            ...chartOptions.scales.x.ticks,
            ...getTicksConfig(timeRange),
          },
        },
      },
    }),
    [timeRange],
  );

  return (
    <div className="card card-hover p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-blue-600 tracking-tight">
          Histórico del Dólar
        </h2>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label
            htmlFor="time-range-select"
            className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
          >
            Rango:
          </label>
          <select
            id="time-range-select"
            value={timeRange}
            onChange={(e) =>
              setTimeRange(
                e.target.value === "all"
                  ? "all"
                  : Number.parseFloat(e.target.value),
              )
            }
            className={selectStyles}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-64 sm:h-80 md:h-96 lg:h-[28rem] relative w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-xl sm:rounded-2xl">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Cargando...
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-xl sm:rounded-2xl">
            <div className="p-3 sm:p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm">
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={() => {
                  rangeCache.clear();
                  setAttempt((value) => value + 1);
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
        {!isLoading && !error && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-medium text-gray-600">
              No hay datos para el rango seleccionado.
            </p>
          </div>
        )}
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DollarHistoryChart;
