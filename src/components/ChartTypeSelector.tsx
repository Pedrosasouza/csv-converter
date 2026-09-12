import React from 'react';
import { ChartType } from '../models/chart';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Barras' },
  { value: 'line', label: 'Linhas' },
  { value: 'pie', label: 'Pizza' },
  { value: 'scatter', label: 'Dispersão' },
];

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="chart-type-select"
        className="block text-xs font-semibold text-[#323a5a] uppercase tracking-wider"
      >
        Tipo de Gráfico
      </label>
      <div className="relative">
        <select
          id="chart-type-select"
          value={value}
          onChange={(e) => onChange(e.target.value as ChartType)}
          className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-[#d8dae7] hover:border-[#b7bcda] rounded-lg text-[#1c1e2c] shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#5862a5]/20 focus:border-[#5862a5] cursor-pointer font-medium pr-10"
        >
          {CHART_TYPES.map((chartType) => (
            <option key={chartType.value} value={chartType.value}>
              {chartType.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#495084]">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
