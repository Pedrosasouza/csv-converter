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
    <section aria-label="Configuração do Gráfico">
      <h2>Configuração do Gráfico</h2>
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
    </section>
  );
};
