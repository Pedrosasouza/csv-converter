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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="x-axis-select"
          className="block text-xs font-semibold text-[#323a5a] uppercase tracking-wider"
        >
          Eixo X
        </label>
        <span className="text-[11px] text-[#414873] font-medium">
          Dimensão
        </span>
      </div>
      <div className="relative">
        <select
          id="x-axis-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-[#d8dae7] hover:border-[#b7bcda] rounded-lg text-[#1c1e2c] shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#5862a5]/20 focus:border-[#5862a5] cursor-pointer font-medium pr-10"
        >
          {validColumns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
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
