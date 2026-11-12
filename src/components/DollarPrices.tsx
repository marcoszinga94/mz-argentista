import type { DollarRate } from "../lib/api";
import { formatAmount } from "../lib/finance";

export interface DollarPricesProps {
  initialRates?: DollarRate[];
}

const DollarPrices = ({ initialRates = [] }: DollarPricesProps) => {
  const renderPriceCard = (price: DollarRate) => {
    const isOficial = price.casa === "oficial";

    return (
      <div
        key={price.casa}
        className={`group p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ${
          isOficial ? "col-span-2 sm:col-span-2 lg:col-span-3 border-blue-200 bg-gradient-to-br from-blue-50 to-white" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm sm:text-base text-center font-bold mb-1.5 sm:mb-2 transition-colors z-10 capitalize ${isOficial ? "text-blue-700" : "text-gray-800 group-hover:text-blue-600"}`}>
          {price.nombre || "Cargando..."}
        </h3>

        <div className={`z-10 ${isOficial ? "flex justify-center gap-6 sm:gap-10" : "space-y-1.5 sm:space-y-2"}`}>
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">Compra</span>
            <span className={`text-base sm:text-lg font-bold ${isOficial ? "text-blue-800" : "text-gray-900"}`}>
              {typeof price.compra === "number" ? `$${formatAmount(price.compra)}` : "N/A"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">Venta</span>
            <span className={`text-base sm:text-lg font-bold ${isOficial ? "text-blue-600" : "text-blue-600"}`}>
              {typeof price.venta === "number" ? `$${formatAmount(price.venta)}` : "N/A"}
            </span>
          </div>
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-[10px] sm:text-xs font-medium text-gray-400">
            {price.fechaActualizacion
              ? new Date(price.fechaActualizacion).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
              : "..."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="card p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl w-full max-w-5xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-1 text-center text-blue-600 tracking-tight">
        Precios del Dólar
      </h2>
      <p className="text-[11px] sm:text-xs text-gray-500 text-center mb-4 sm:mb-6">
        Compra y venta en pesos argentinos (ARS)
      </p>
      {initialRates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6">
          <p className="text-sm font-medium text-gray-600">
            No pudimos cargar las cotizaciones del dólar.
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {initialRates.map(renderPriceCard)}
        </div>
      )}
    </div>
  );
};

export default DollarPrices;
