import type { APIRoute } from "astro";
import { DOLLAR_CASAS, getDollarSeries, isDollarCasa } from "../../lib/api";

export const GET: APIRoute = async ({ url }) => {
  const since = url.searchParams.get("desde") ?? "";
  const requested = url.searchParams.get("casas");
  const casas = requested
    ? requested.split(",").filter(isDollarCasa)
    : [...DOLLAR_CASAS];

  if (casas.length === 0) {
    return new Response(JSON.stringify({ error: "Invalid casas" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  const entries = await Promise.all(
    casas.map(async (casa) => [casa, await getDollarSeries(casa)] as const),
  );

  if (entries.every(([, points]) => points.length === 0)) {
    return new Response(JSON.stringify({ error: "Upstream unavailable" }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  const data = Object.fromEntries(
    entries.map(([casa, points]) => [
      casa,
      since ? points.filter((point) => point.date >= since) : points,
    ]),
  );

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
};
