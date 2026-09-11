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
    <div>
      <label htmlFor="chart-type-select">Tipo de Gráfico</label>
      <select
        id="chart-type-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ChartType)}
      >
        {CHART_TYPES.map((chartType) => (
          <option key={chartType.value} value={chartType.value}>
            {chartType.label}
          </option>
        ))}
      </select>
    </div>
  );
};
