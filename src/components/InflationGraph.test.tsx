import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import InflationGraph from "./InflationGraph";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="line-chart" />,
}));

const records = [
  { fecha: "2020-01-31", valor: 2 },
  { fecha: "2024-12-31", valor: 3 },
];

describe("InflationGraph", () => {
  it("abre en los últimos diez años", () => {
    render(<InflationGraph initialData={records} />);

    expect(screen.getByLabelText("Desde")).toHaveValue("2014-12-01");
    expect(screen.getByLabelText("Hasta")).toHaveValue("2024-12-31");
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("avisa cuando el rango no tiene datos", () => {
    render(<InflationGraph initialData={records} />);

    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2030-01-01" },
    });

    expect(
      screen.getByText("No hay datos en el rango seleccionado."),
    ).toBeInTheDocument();
  });

  it("muestra el estado vacío sin datos", () => {
    render(<InflationGraph initialData={[]} />);

    expect(
      screen.getByText("No pudimos cargar la evolución de la inflación."),
    ).toBeInTheDocument();
  });
});
