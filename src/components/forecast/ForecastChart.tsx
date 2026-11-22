'use client';
// Purpose: Recharts cash chart: expected line, optimistic-to-pessimistic band, buffer line and bill tags.
import {
   Area,
   ComposedChart,
   Line,
   ReferenceLine,
   ResponsiveContainer,
   XAxis,
   YAxis,
} from 'recharts';
import {
   FORECAST_BAND_OPACITY,
   FORECAST_CHART_COLORS,
   FORECAST_CHART_HEIGHT_PX,
   FORECAST_BILL_LABEL_CLASS,
   FORECAST_COPY,
   FORECAST_SCENARIO_DASH,
   FORECAST_TICK_FONT_SIZE,
} from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import type { BillMarker, ChartRow } from './forecastModel';

export interface ForecastChartProps {
   rows: ChartRow[];
   buffer: number;
   bills: BillMarker[];
}

/** Why: a fixed-height parent is required, or ResponsiveContainer renders at zero height. */
export function ForecastChart({ rows, buffer, bills }: ForecastChartProps) {
   const colors = FORECAST_CHART_COLORS;
   return (
      <div
         role="img"
         aria-label={FORECAST_COPY.chartLabel}
         style={{ height: FORECAST_CHART_HEIGHT_PX }}
         className="w-full"
      >
         <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 24, right: 12, bottom: 0, left: 0 }}>
               <XAxis
                  dataKey="label"
                  interval="preserveStartEnd"
                  tick={{ fill: colors.ink, fontSize: FORECAST_TICK_FONT_SIZE }}
                  stroke={colors.grid}
               />
               <YAxis
                  tickFormatter={(value: number) => formatINR(value)}
                  tick={{ fill: colors.ink, fontSize: FORECAST_TICK_FONT_SIZE }}
                  width={96}
                  stroke={colors.grid}
               />
               <Area
                  type="monotone"
                  dataKey="pessimistic"
                  stackId="band"
                  stroke="none"
                  fill="transparent"
                  isAnimationActive={false}
               />
               <Area
                  type="monotone"
                  dataKey="band"
                  stackId="band"
                  stroke="none"
                  fill={colors.marigold}
                  fillOpacity={FORECAST_BAND_OPACITY}
                  isAnimationActive={false}
               />
               <Line
                  type="monotone"
                  dataKey="expected"
                  stroke={colors.ink}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
               />
               <Line
                  type="monotone"
                  dataKey="scenario"
                  stroke={colors.marginRed}
                  strokeWidth={3}
                  strokeDasharray={FORECAST_SCENARIO_DASH}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
               />
               <ReferenceLine
                  y={buffer}
                  stroke={colors.marginRed}
                  strokeWidth={2}
                  label={{
                     value: `${FORECAST_COPY.bufferLegend} ${formatINR(buffer)}`,
                     position: 'insideTopLeft',
                     fill: colors.marginRed,
                     fontSize: FORECAST_TICK_FONT_SIZE,
                  }}
               />
               {bills.map((bill) => (
                  <ReferenceLine
                     key={`${bill.label}-${bill.name}`}
                     x={bill.label}
                     stroke={colors.ink}
                     strokeDasharray="4 4"
                     label={{
                        value: `${bill.name} ${formatINR(bill.amount)}`,
                        className: FORECAST_BILL_LABEL_CLASS,
                        position: 'insideTop',
                        fill: colors.ink,
                        fontSize: FORECAST_TICK_FONT_SIZE,
                     }}
                  />
               ))}
            </ComposedChart>
         </ResponsiveContainer>
      </div>
   );
}
