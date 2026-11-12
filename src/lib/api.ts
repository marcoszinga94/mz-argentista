export interface InflationRecord {
  fecha: string;
  valor: number;
}

export interface DollarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  fechaActualizacion: string;
}

export interface DollarSeriesPoint {
  date: string;
  venta: number | null;
}

export type DollarSeries = Record<string, DollarSeriesPoint[]>;

export const DOLLAR_CASAS = [
  "oficial",
  "blue",
  "bolsa",
  "contadoconliqui",
  "mayorista",
  "cripto",
  "tarjeta",
] as const;

export type DollarCasa = (typeof DOLLAR_CASAS)[number];

const INFLATION_URL =
  "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";
const DOLLAR_RATES_URL = "https://dolarapi.com/v1/dolares";
const DOLLAR_SERIES_URL =
  "https://api.argentinadatos.com/v1/cotizaciones/dolares";
const COUNTRY_RISK_URL =
  "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais";
const UVA_URL = "https://api.argentinadatos.com/v1/finanzas/indices/uva";

const INFLATION_TTL_MS = 60 * 60 * 1000;
const DOLLAR_TTL_MS = 5 * 60 * 1000;
const INDICATOR_TTL_MS = 30 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5_000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

async function fetchJson<T>(url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}: ${url}`);
  }
  return (await response.json()) as T;
}

async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T | null> {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.value as T;
  }

  try {
    const value = await load();
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  } catch (error) {
    console.error(`[api] ${key}:`, error);
    return entry ? (entry.value as T) : null;
  }
}

export async function getInflation(): Promise<InflationRecord[]> {
  const data = await cached<InflationRecord[]>(
    "inflation",
    INFLATION_TTL_MS,
    async () => {
      const records = await fetchJson<InflationRecord[]>(INFLATION_URL, 8_000);
      return [...records].sort((a, b) => a.fecha.localeCompare(b.fecha));
    },
  );

  return data ?? [];
}

export async function getDollarRates(): Promise<DollarRate[]> {
  const data = await cached<DollarRate[]>(
    "dollar-rates",
    DOLLAR_TTL_MS,
    async () => {
      const rates = await fetchJson<DollarRate[]>(DOLLAR_RATES_URL);
      return rates.filter((rate) => typeof rate.venta === "number");
    },
  );

  return data ?? [];
}

export async function getDollarSeries(casa: string): Promise<DollarSeriesPoint[]> {
  const data = await cached<DollarSeriesPoint[]>(
    `dollar-series:${casa}`,
    DOLLAR_TTL_MS,
    async () => {
      const records = await fetchJson<
        Array<{ fecha: string; venta: number | string | null }>
      >(`${DOLLAR_SERIES_URL}/${casa}`, 8_000);

      return records
        .map((entry) => ({
          date: entry.fecha,
          venta: entry.venta === null ? null : Number(entry.venta),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  );

  return data ?? [];
}

export function isDollarCasa(casa: string): casa is DollarCasa {
  return (DOLLAR_CASAS as readonly string[]).includes(casa);
}

export function daysAgoKey(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function getDollarSeriesWindow(
  casas: readonly string[] = DOLLAR_CASAS,
  days = 7,
): Promise<DollarSeries> {
  const since = daysAgoKey(days);
  const entries = await Promise.all(
    casas.map(async (casa) => [casa, await getDollarSeries(casa)] as const),
  );

  return Object.fromEntries(
    entries.map(([casa, points]) => [
      casa,
      points.filter((point) => point.date >= since),
    ]),
  );
}

export interface IndicatorSnapshot {
  value: number;
  date: string;
  previousValue: number | null;
}

async function getIndicator(
  url: string,
  cacheKey: string,
  ttlMs: number,
): Promise<IndicatorSnapshot | null> {
  const data = await cached<InflationRecord[]>(cacheKey, ttlMs, async () => {
    const records = await fetchJson<InflationRecord[]>(url, 8_000);
    return [...records].sort((a, b) => a.fecha.localeCompare(b.fecha));
  });

  if (!data || data.length === 0) {
    return null;
  }

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;

  return {
    value: latest.valor,
    date: latest.fecha,
    previousValue: previous?.valor ?? null,
  };
}

export function getCountryRisk(): Promise<IndicatorSnapshot | null> {
  return getIndicator(COUNTRY_RISK_URL, "country-risk", INDICATOR_TTL_MS);
}

export function getUva(): Promise<IndicatorSnapshot | null> {
  return getIndicator(UVA_URL, "uva", INDICATOR_TTL_MS);
}
