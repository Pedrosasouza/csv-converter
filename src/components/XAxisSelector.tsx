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
  const validColumns = columns.filter((col) =>
    ['string', 'date', 'number'].includes(col.type)
  );

  return (
    <div>
      <label htmlFor="x-axis-select">Eixo X</label>
      <select
        id="x-axis-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {validColumns.map((col) => (
          <option key={col.name} value={col.name}>
            {col.name}
          </option>
        ))}
      </select>
    </div>
  );
};
