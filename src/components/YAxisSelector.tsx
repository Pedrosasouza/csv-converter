import React from 'react';
import { DatasetColumn } from '../models/dataset';

interface YAxisSelectorProps {
  columns: DatasetColumn[];
  value: string;
  onChange: (column: string) => void;
}

export const YAxisSelector: React.FC<YAxisSelectorProps> = ({
  columns,
  value,
  onChange,
}) => {
  const numericColumns = columns.filter((col) => col.type === 'number');

  if (numericColumns.length === 0) {
    return (
      <div>
        <label htmlFor="y-axis-select">Eixo Y</label>
        <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>
          Este dataset não possui colunas numéricas para o eixo Y.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="y-axis-select">Eixo Y</label>
      <select
        id="y-axis-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {numericColumns.map((col) => (
          <option key={col.name} value={col.name}>
            {col.name}
          </option>
        ))}
      </select>
    </div>
  );
};
