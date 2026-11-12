import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DollarHistoryChart from "./DollarHistoryChart";
import type { DollarSeries } from "../lib/api";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="line-chart" />,
}));

const series: DollarSeries = {
  oficial: [
    { date: "2026-11-10", venta: 1000 },
    { date: "2026-11-11", venta: 1010 },
  ],
};

describe("DollarHistoryChart", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no pide datos al montar si recibe la serie inicial", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<DollarHistoryChart initialSeries={series} />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("pide el rango al servidor al cambiar el período", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => series,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DollarHistoryChart initialSeries={series} />);

    fireEvent.change(screen.getByLabelText("Rango:"), {
      target: { value: "1" },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/dolar-series.json?desde=",
    );
  });

  it("muestra el error cuando la petición falla", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<DollarHistoryChart initialSeries={series} />);

    fireEvent.change(screen.getByLabelText("Rango:"), {
      target: { value: "3" },
    });

    expect(
      await screen.findByText("No pudimos cargar el histórico del dólar."),
    ).toBeInTheDocument();
  });
});
