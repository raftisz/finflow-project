export default function LineChart({ points, color = '#22d3a0', height = 80 }) {
  if (!points || points.length < 2) return null
  const w = 100, h = height, pad = 4
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const rng = max - min || 1
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - 2 * pad))
  const ys = points.map(p  => pad + (1 - (p - min) / rng) * (h - 2 * pad))
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const area = `${path} L${xs[xs.length-1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)" />
      <path d={path} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
