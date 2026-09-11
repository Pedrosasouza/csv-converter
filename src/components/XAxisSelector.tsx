import React from 'react';
import { DatasetColumn } from '../models/dataset';

interface XAxisSelectorProps {
  columns: DatasetColumn[];
  value: string;
  onChange: (column: string) => void;
}

export const XAxisSelector: React.FC<XAxisSelectorProps> = ({
  columns,
  value,
  onChange,
}) => {
  return (
    <div>
      <label htmlFor="x-axis-select">Eixo X</label>
      <select
        id="x-axis-select"
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
