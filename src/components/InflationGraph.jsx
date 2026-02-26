import { useState, useEffect, useCallback } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InflationGraph = () => {
  const [inflationData, setInflationData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInflationData = async () => {
      try {
        const response = await fetch(
          "https://api.argentinadatos.com/v1/finanzas/indices/inflacion"
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener la información de inflación");
        }
        const data = await response.json();
        setInflationData(
          data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
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
      setStartDate(inflationData[0].fecha);
      setEndDate(inflationData[inflationData.length - 1].fecha);
    }
  }, [inflationData]);

  const updateChart = useCallback(() => {
    const filteredData = inflationData.filter(
      (item) => item.fecha >= startDate && item.fecha <= endDate
    );

    const labels = filteredData.map((item) => item.fecha);
    const values = filteredData.map((item) => item.valor);

    setChartData({
      labels,
      datasets: [
        {
          label: "Inflación Mensual (%)",
          data: values,
          borderColor: "rgb(37, 99, 235)", // blue-600
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    });
  }, [inflationData, startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      updateChart();
    }
  }, [startDate, endDate, updateChart]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: "Inflación (%)",
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          }
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Fecha",
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          }
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
          },
          maxTicksLimit: 12,
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: "#374151",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
      }
    },
  };

  const inputStyles =
    "w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 text-sm sm:text-base";

  return (
    <section className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full mb-auto md:sticky md:top-32 flex-1">
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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-xl sm:rounded-2xl">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-500">Cargando...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-xl sm:rounded-2xl">
            <div className="p-3 sm:p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm">
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}
        {chartData && <Line data={chartData} options={chartOptions} />}
      </div>
    </section>
  );
};

export default InflationGraph;
