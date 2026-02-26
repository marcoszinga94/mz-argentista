import { useState, useEffect } from "react";

const DollarPrices = () => {
  const [dollarPrices, setDollarPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDollarPrices = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares");
        if (!response.ok) {
          throw new Error("No se pudo obtener la información del dólar");
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          setError("No hay datos disponibles");
        } else {
          setDollarPrices(data);
        }
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDollarPrices();
  }, []);

  const renderPriceCard = (price) => {
    const isOficial = price.casa === "oficial";
    
    return (
      <div
        key={price.casa}
        className={`group p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ${
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
              ${price.compra?.toFixed(2) ?? "N/A"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">Venta</span>
            <span className={`text-base sm:text-lg font-bold ${isOficial ? "text-blue-600" : "text-blue-600"}`}>
              ${price.venta?.toFixed(2) ?? "N/A"}
            </span>
          </div>
        </div>
        
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-[10px] sm:text-xs font-medium text-gray-400">
            {price.fechaActualizacion
              ? new Date(price.fechaActualizacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "..."}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return Array(6)
        .fill(null)
        .map((_, index) => (
          <div key={`loading-${index}`} className="animate-pulse p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm">
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2 sm:mb-3"></div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ));
    }

    if (error) {
      return (
        <div className="col-span-full flex items-center justify-center p-4 sm:p-6 bg-red-50 rounded-lg sm:rounded-xl border border-red-100">
          <span className="text-red-600 font-medium text-xs sm:text-sm">Error: {error}</span>
        </div>
      );
    }

    return dollarPrices.map(renderPriceCard);
  };

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-5xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 text-center text-blue-600 tracking-tight">
        Precios del Dólar
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default DollarPrices;
