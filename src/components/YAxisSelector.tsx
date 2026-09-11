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
  return (
    <div>
      <label htmlFor="y-axis-select">Eixo Y</label>
      <select
        id="y-axis-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {columns.map((col) => (
          <option key={col.name} value={col.name}>
            {col.name}
          </option>
        ))}
      </select>
    </div>
  );
};
