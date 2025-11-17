
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ExchangeRateData } from '../types';

interface ExchangeRateChartProps {
  data: ExchangeRateData[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-3 rounded-lg border border-gray-600 shadow-lg">
        <p className="label text-cyan-400 font-semibold">{`날짜: ${label}`}</p>
        <p className="intro text-white">{`${payload[0].name}: ${payload[0].value.toLocaleString()} 원`}</p>
      </div>
    );
  }
  return null;
};

const ExchangeRateChart: React.FC<ExchangeRateChartProps> = ({ data }) => {
  const minRate = Math.min(...data.map(d => d.rate));
  const maxRate = Math.max(...data.map(d => d.rate));
  const SUNDAY_COLOR = '#F87171'; // red-400
  const DEFAULT_COLOR = '#2DD4BF'; // teal-400

  const legendPayload = [
    { value: '평일/토요일', type: 'square', id: 'ID01', color: DEFAULT_COLOR },
    { value: '일요일', type: 'square', id: 'ID02', color: SUNDAY_COLOR }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis 
            dataKey="date" 
            stroke="#A0AEC0" 
            tick={{ fontSize: 10 }} 
            interval="preserveStartEnd" 
            tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
        />
        <YAxis 
            stroke="#A0AEC0" 
            tick={{ fontSize: 10 }}
            domain={[Math.floor(minRate / 10) * 10 - 10, Math.ceil(maxRate / 10) * 10 + 10]}
            tickFormatter={(value) => `${value.toLocaleString()}`}
            label={{ value: '원 (KRW)', angle: -90, position: 'insideLeft', fill: '#A0AEC0', dx: -15, fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(248, 113, 113, 0.1)' }}/>
        <Legend payload={legendPayload} wrapperStyle={{ color: '#A0AEC0', fontSize: '12px' }} />
        <Bar dataKey="rate" name="환율(원)" radius={[4, 4, 0, 0]}>
           {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.day === 0 ? SUNDAY_COLOR : DEFAULT_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExchangeRateChart;
