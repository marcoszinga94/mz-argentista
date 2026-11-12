import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DollarPrices from "./DollarPrices";
import type { DollarRate } from "../lib/api";

const rates: DollarRate[] = [
  {
    moneda: "ARS",
    casa: "oficial",
    nombre: "Oficial",
    compra: 1520,
    venta: 1570,
    fechaActualizacion: "2026-11-12T11:00:00.000Z",
  },
  {
    moneda: "ARS",
    casa: "blue",
    nombre: "Blue",
    compra: 1545,
    venta: 1565,
    fechaActualizacion: "2026-11-12T11:57:00.000Z",
  },
];

describe("DollarPrices", () => {
  it("muestra compra y venta con formato argentino", () => {
    render(<DollarPrices initialRates={rates} />);

    expect(screen.getByText("$1.520,00")).toBeInTheDocument();
    expect(screen.getByText("$1.570,00")).toBeInTheDocument();
    expect(screen.getByText("$1.545,00")).toBeInTheDocument();
    expect(screen.getByText("$1.565,00")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("muestra el estado vacío sin cotizaciones", () => {
    render(<DollarPrices initialRates={[]} />);

    expect(
      screen.getByText("No pudimos cargar las cotizaciones del dólar."),
    ).toBeInTheDocument();
  });
});
