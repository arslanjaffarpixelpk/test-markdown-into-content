import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { RichRendererProps } from './registry';
import type { ChartPayload } from './schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Theme-aware categorical palette (driven by CSS vars in index.css).
const PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];
const colorAt = (i: number, override?: string) => override ?? PALETTE[i % PALETTE.length];

const gridStroke = 'hsl(var(--rich-grid))';
const axisStroke = 'hsl(var(--rich-axis))';
const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  color: 'hsl(var(--popover-foreground))',
  fontSize: 12,
};

export function ChartRenderer({ data }: RichRendererProps) {
  const spec = data as ChartPayload;
  const height = spec.height ?? 300;

  return (
    <Card className="my-4">
      {spec.title && (
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart(spec)}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function renderChart(spec: ChartPayload) {
  const grid = <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />;
  const axes = (
    <>
      <XAxis dataKey={spec.xKey} stroke={axisStroke} tick={{ fontSize: 12, fill: axisStroke }} />
      <YAxis stroke={axisStroke} tick={{ fontSize: 12, fill: axisStroke }} />
    </>
  );
  const tooltip = <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />;
  const legend = <Legend wrapperStyle={{ fontSize: 12 }} />;

  switch (spec.type) {
    case 'bar':
      return (
        <BarChart data={spec.data}>
          {grid}
          {axes}
          {tooltip}
          {legend}
          {spec.series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label ?? s.key} fill={colorAt(i, s.color)} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      );

    case 'pie': {
      const valueKey = spec.series[0]?.key ?? 'value';
      return (
        <PieChart>
          {tooltip}
          {legend}
          <Pie data={spec.data} dataKey={valueKey} nameKey={spec.xKey} cx="50%" cy="50%" outerRadius={100} label>
            {spec.data.map((_, i) => (
              <Cell key={i} fill={colorAt(i)} />
            ))}
          </Pie>
        </PieChart>
      );
    }

    case 'line':
    default:
      return (
        <LineChart data={spec.data}>
          {grid}
          {axes}
          {tooltip}
          {legend}
          {spec.series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={colorAt(i, s.color)}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      );
  }
}
