import type { InflationRecord } from "./api";

export interface MonthRef {
  year: string;
  month: string;
}

export interface InflationResult {
  adjustedAmount: number;
  totalInflation: number;
  averageMonthlyInflation: number;
  annualizedInflation: number;
  months: number;
}

function monthKey({ year, month }: MonthRef): string {
  return `${year}-${month}`;
}

export function accumulateInflation(
  records: InflationRecord[],
  amount: number,
  start: MonthRef,
  end: MonthRef,
): InflationResult | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const startKey = monthKey(start);
  const endKey = monthKey(end);
  if (startKey > endKey) {
    return null;
  }

  const relevant = records.filter((record) => {
    const key = record.fecha.slice(0, 7);
    return key >= startKey && key <= endKey;
  });

  if (relevant.length === 0) {
    return null;
  }

  const factor = relevant.reduce(
    (acc, record) => acc * (1 + record.valor / 100),
    1,
  );
  const months = relevant.length;

  return {
    adjustedAmount: amount * factor,
    totalInflation: (factor - 1) * 100,
    averageMonthlyInflation: (factor ** (1 / months) - 1) * 100,
    annualizedInflation: (factor ** (12 / months) - 1) * 100,
    months,
  };
}

export function formatAmount(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function parseAmount(input: string): number {
  const value = input.trim().replace(/\s/g, "");
  if (!value) {
    return Number.NaN;
  }

  let normalized = value;
  if (value.includes(",")) {
    normalized = value.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    normalized = value.replace(/\./g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
