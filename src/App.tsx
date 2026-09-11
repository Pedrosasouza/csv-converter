import React, { useState } from 'react';
import { mockDataset } from './mocks/datasetMock';
import { ChartConfig } from './models/chart';
import { Dataset } from './models/dataset';
import { ChartConfigurator } from './components/ChartConfigurator';
import { ChartPreview } from './components/ChartPreview';

export const App: React.FC = () => {
  const [dataset] = useState<Dataset>(mockDataset);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    id: 'chart-1',
    datasetId: mockDataset.id,
    type: 'bar',
    xColumn: mockDataset.columns[0]?.name ?? '',
    yColumn: mockDataset.columns[1]?.name ?? '',
  });

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>CSV/Excel Chart Generator</h1>
      <p>Dataset ativo: <strong>{dataset.name}</strong> ({dataset.rows.length} linhas)</p>

      <ChartConfigurator
        dataset={dataset}
        config={chartConfig}
        onChange={setChartConfig}
      />

      <section aria-label="Resumo da Configuração" style={{ marginTop: '1.5rem' }}>
        <h3>Resumo da Configuração</h3>
        <p data-testid="config-type">Tipo: {chartConfig.type}</p>
        <p data-testid="config-x">Eixo X: {chartConfig.xColumn}</p>
        <p data-testid="config-y">Eixo Y: {chartConfig.yColumn}</p>
      </section>

      <ChartPreview dataset={dataset} config={chartConfig} />
    </main>
  );
};

export default App;
