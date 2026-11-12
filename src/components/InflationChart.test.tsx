import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import InflationChart from "./InflationChart";

const records = [
  { fecha: "2024-01-31", valor: 20 },
  { fecha: "2024-02-29", valor: 10 },
  { fecha: "2024-03-31", valor: 5 },
];

describe("InflationChart", () => {
  it("agrupa por década y abre el último año", () => {
    render(<InflationChart initialData={records} />);

    expect(screen.getByText("2020s")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("enero")).toBeInTheDocument();
    expect(screen.getAllByText("5,0%").length).toBeGreaterThan(0);
  });

  it("colapsa la década al hacer clic", () => {
    render(<InflationChart initialData={records} />);

    fireEvent.click(screen.getByText("2020s"));

    expect(screen.queryByText("enero")).not.toBeInTheDocument();
  });

  it("muestra el estado vacío sin datos", () => {
    render(<InflationChart initialData={[]} />);

    expect(
      screen.getByText("No pudimos cargar los índices de inflación."),
    ).toBeInTheDocument();
  });
});
