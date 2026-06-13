<script lang="ts">
  import type { GrowthCurvePoint } from '$lib/application/child/ComputeGrowthCurve'

  let {
    points,
  }: {
    points: GrowthCurvePoint[]
  } = $props()

  // Clothing size to numeric value for Y axis
  const sizeMap: Record<string, number> = {
    'P': 1,
    'M': 2,
    'G': 3,
    'GG': 4,
    'RN': 0,
    '1': 5,
    '2': 6,
    '3': 7,
    '4': 8,
    '6': 9,
    '8': 10,
    '10': 11,
  }

  const chartWidth = 300
  const chartHeight = 200
  const padding = 40

  const chartPoints = $derived(
    points.map((p, i) => {
      const x = padding + (i / Math.max(points.length - 1, 1)) * (chartWidth - 2 * padding)
      const yValue = sizeMap[p.clothingSize] ?? 0
      const y = chartHeight - padding - (yValue / 11) * (chartHeight - 2 * padding)
      return { x, y, label: p.clothingSize, date: p.date }
    }),
  )

  const pathD = $derived(
    chartPoints.length > 1
      ? `M ${chartPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
      : '',
  )
</script>

<div class="growth-chart">
  <svg viewBox="0 0 {chartWidth} {chartHeight}" class="growth-chart__svg">
    <!-- Grid lines -->
    {#each [0, 1, 2, 3] as i (i)}
      <line
        x1={padding}
        y1={padding + (i / 3) * (chartHeight - 2 * padding)}
        x2={chartWidth - padding}
        y2={padding + (i / 3) * (chartHeight - 2 * padding)}
        stroke="var(--color-bg-2)"
        stroke-width="1"
      />
    {/each}

    <!-- Data line -->
    {#if pathD}
      <path
        d={pathD}
        fill="none"
        stroke="var(--color-pink)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/if}

    <!-- Data points -->
    {#each chartPoints as point, i (i)}
      <circle
        cx={point.x}
        cy={point.y}
        r="4"
        fill="var(--color-pink)"
      />
      <text
        x={point.x}
        y={point.y - 10}
        text-anchor="middle"
        font-size="10"
        fill="var(--color-black)"
      >
        {point.label}
      </text>
    {/each}
  </svg>
</div>

<style>
  .growth-chart {
    width: 100%;
    max-width: 400px;
  }

  .growth-chart__svg {
    width: 100%;
    height: auto;
  }
</style>
