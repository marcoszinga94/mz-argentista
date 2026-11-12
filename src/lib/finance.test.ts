import { describe, it, expect } from "vitest";
import { accumulateInflation, formatAmount } from "./finance";

const records = [
  { fecha: "2024-01-31", valor: 20 },
  { fecha: "2024-02-29", valor: 10 },
  { fecha: "2024-03-31", valor: 5 },
];

describe("accumulateInflation", () => {
  it("acumula todos los meses del rango, incluido el final", () => {
    const result = accumulateInflation(
      records,
      100,
      { year: "2024", month: "01" },
      { year: "2024", month: "03" },
    );

    expect(result).not.toBeNull();
    expect(result?.months).toBe(3);
    expect(result?.adjustedAmount).toBeCloseTo(138.6, 2);
    expect(result?.totalInflation).toBeCloseTo(38.6, 2);
  });

  it("devuelve null cuando el rango está invertido", () => {
    const result = accumulateInflation(
      records,
      100,
      { year: "2024", month: "03" },
      { year: "2024", month: "01" },
    );

    expect(result).toBeNull();
  });

  it("devuelve null cuando no hay datos en el rango", () => {
    const result = accumulateInflation(
      records,
      100,
      { year: "2025", month: "01" },
      { year: "2025", month: "02" },
    );

    expect(result).toBeNull();
  });

  it("devuelve null con montos inválidos", () => {
    const result = accumulateInflation(
      records,
      -10,
      { year: "2024", month: "01" },
      { year: "2024", month: "03" },
    );

    expect(result).toBeNull();
  });

  it("anualiza la inflación del período", () => {
    const result = accumulateInflation(
      [{ fecha: "2024-01-31", valor: 10 }],
      100,
      { year: "2024", month: "01" },
      { year: "2024", month: "01" },
    );

    expect(result?.months).toBe(1);
    expect(result?.annualizedInflation).toBeCloseTo(213.84, 1);
  });
});

describe("formatAmount", () => {
  it("formatea con separadores argentinos", () => {
    expect(formatAmount(1234567.891)).toBe("1.234.567,89");
  });
});
