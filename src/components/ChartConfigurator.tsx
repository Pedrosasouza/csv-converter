import React from 'react';
import { Dataset } from '../models/dataset';
import { ChartConfig, ChartType } from '../models/chart';
import { ChartTypeSelector } from './ChartTypeSelector';
import { XAxisSelector } from './XAxisSelector';
import { YAxisSelector } from './YAxisSelector';

export interface ChartConfiguratorProps {
  dataset: Dataset;
  config: ChartConfig;
  onChange: (newConfig: ChartConfig) => void;
}

export const ChartConfigurator: React.FC<ChartConfiguratorProps> = ({
  dataset,
  config,
  onChange,
}) => {
  const handleTypeChange = (type: ChartType) => {
    onChange({ ...config, type });
  };

  const handleXColumnChange = (xColumn: string) => {
    onChange({ ...config, xColumn });
  };

  const handleYColumnChange = (yColumn: string) => {
    onChange({ ...config, yColumn });
  };

  return (
    <section
      aria-label="Configuração do Gráfico"
      className="bg-white rounded-xl border border-[#d8dae7] shadow-2xs p-5 space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-[#ebecf2]">
        <svg
          className="w-4 h-4 text-[#495084]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <h2 className="text-sm font-bold text-[#1c1e2c] tracking-tight">
          Configuração do Gráfico
        </h2>
      </div>

      <div className="space-y-4">
        <ChartTypeSelector value={config.type} onChange={handleTypeChange} />
        <XAxisSelector
          columns={dataset.columns}
          value={config.xColumn}
          onChange={handleXColumnChange}
        />
        <YAxisSelector
          columns={dataset.columns}
          value={config.yColumn}
          onChange={handleYColumnChange}
        />
      </div>
    </section>
  );
};
