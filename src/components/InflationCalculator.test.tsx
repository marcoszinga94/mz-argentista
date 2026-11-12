import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import InflationCalculator from "./InflationCalculator";
import { formatAmount } from "../lib/finance";

const records = Array.from({ length: 12 }, (_, index) => ({
  fecha: `2024-${String(index + 1).padStart(2, "0")}-28`,
  valor: 10,
}));

const factor = 1.1 ** 12;

describe("InflationCalculator", () => {
  it("calcula los últimos doce meses por defecto", () => {
    render(<InflationCalculator initialData={records} />);

    expect(
      screen.getByDisplayValue(formatAmount(1000 * factor)),
    ).toBeInTheDocument();
    expect(screen.getAllByText("213,84%")).toHaveLength(2);
  });

  it("acepta montos con formato argentino", () => {
    render(<InflationCalculator initialData={records} />);

    fireEvent.change(screen.getByLabelText("Monto Inicial"), {
      target: { value: "1.500,50" },
    });

    expect(
      screen.getByDisplayValue(formatAmount(1500.5 * factor)),
    ).toBeInTheDocument();
  });

  it("avisa cuando no hay datos para el rango", () => {
    render(<InflationCalculator initialData={records} />);

    fireEvent.change(screen.getByLabelText("Año Inicio"), {
      target: { value: "2025" },
    });

    expect(
      screen.getByText("No hay datos de inflación para el rango seleccionado."),
    ).toBeInTheDocument();
  });

  it("avisa cuando el monto no es válido", () => {
    render(<InflationCalculator initialData={records} />);

    fireEvent.change(screen.getByLabelText("Monto Inicial"), {
      target: { value: "abc" },
    });

    expect(
      screen.getByText("Ingresá un monto mayor a cero."),
    ).toBeInTheDocument();
  });

  it("muestra el estado vacío sin datos", () => {
    render(<InflationCalculator initialData={[]} />);

    expect(
      screen.getByText("No pudimos cargar los datos de inflación."),
    ).toBeInTheDocument();
  });
});
