import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CurrencyConverter from "./CurrencyConverter";
import type { DollarRate } from "../lib/api";

const rates: DollarRate[] = [
  {
    moneda: "ARS",
    casa: "oficial",
    nombre: "Oficial",
    compra: 1000,
    venta: 1050,
    fechaActualizacion: "2026-11-12T11:00:00.000Z",
  },
  {
    moneda: "ARS",
    casa: "blue",
    nombre: "Blue",
    compra: 1100,
    venta: 1150,
    fechaActualizacion: "2026-11-12T11:00:00.000Z",
  },
];

describe("CurrencyConverter", () => {
  it("preselecciona el dólar blue", () => {
    render(<CurrencyConverter initialRates={rates} />);

    expect(screen.getByLabelText("Tipo de Cambio")).toHaveValue("blue");
    expect(screen.getByText("Venta: $1.150,00")).toBeInTheDocument();
  });

  it("convierte pesos a dólares con la cotización de venta", () => {
    render(<CurrencyConverter initialRates={rates} />);

    fireEvent.change(screen.getByLabelText("Pesos Argentinos (ARS)"), {
      target: { value: "2300" },
    });

    expect(screen.getByText("2,00")).toBeInTheDocument();
  });

  it("convierte dólares a pesos con la cotización de compra", () => {
    render(<CurrencyConverter initialRates={rates} />);

    fireEvent.click(screen.getByTitle("Invertir conversión"));
    fireEvent.change(screen.getByLabelText("Dólares (USD)"), {
      target: { value: "10" },
    });

    expect(screen.getByText("11.000,00")).toBeInTheDocument();
    expect(screen.getByText("Compra: $1.100,00")).toBeInTheDocument();
  });

  it("muestra el estado vacío sin cotizaciones", () => {
    render(<CurrencyConverter initialRates={[]} />);

    expect(
      screen.getByText("No pudimos cargar las cotizaciones del dólar."),
    ).toBeInTheDocument();
  });
});
