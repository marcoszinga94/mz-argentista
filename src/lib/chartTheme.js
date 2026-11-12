export const CHART_FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const GRID_COLOR = "rgba(0, 0, 0, 0.05)";
const TICK_COLOR = "#6B7280";
const LEGEND_COLOR = "#374151";

function font(size, weight) {
  return { family: CHART_FONT, size, weight };
}

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
};

export const baseLegend = {
  position: "bottom",
  labels: {
    usePointStyle: true,
    padding: 20,
    color: LEGEND_COLOR,
    font: font(12, "500"),
  },
};

export const baseTooltip = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  titleColor: "#111827",
  bodyColor: "#374151",
  borderColor: "#E5E7EB",
  borderWidth: 1,
  padding: 12,
  boxPadding: 6,
  usePointStyle: true,
  titleFont: font(14, "bold"),
  bodyFont: font(13),
};

export function axisTitle(text) {
  return {
    display: true,
    text,
    color: TICK_COLOR,
    font: font(12, "500"),
  };
}

export function axisTicks(extra = {}) {
  return {
    color: TICK_COLOR,
    font: { family: CHART_FONT },
    ...extra,
  };
}

export const baseGrid = { color: GRID_COLOR };
