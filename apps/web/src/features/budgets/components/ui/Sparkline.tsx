export function Sparkline({
  points,
  height = 32,
}: {
  points: number[];
  height?: number;
}) {
  const w = 120;
  const h = height;

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 1);

  const norm = (v: number) => {
    if (max === min) return h / 2;
    return h - ((v - min) / (max - min)) * h;
  };

  const d = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = norm(p);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
