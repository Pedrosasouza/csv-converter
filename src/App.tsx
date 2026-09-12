import React, { useState } from 'react';
import { mockDataset } from './mocks/datasetMock';
import { ChartConfig } from './models/chart';
import { Dataset } from './models/dataset';
import { ChartConfigurator } from './components/ChartConfigurator';
import { ChartPreview } from './components/ChartPreview';
import { FileUpload } from './components/FileUpload';

export const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset>(mockDataset);

  const initialX =
    mockDataset.columns.find((c) => ['string', 'date', 'number'].includes(c.type))?.name ?? '';
  const initialY =
    mockDataset.columns.find((c) => c.type === 'number')?.name ?? '';

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    id: 'chart-1',
    datasetId: mockDataset.id,
    type: 'bar',
    xColumn: initialX,
    yColumn: initialY,
  });

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    // Preserva o tipo de gráfico previamente escolhido pelo usuário,
    // mas redefine os eixos garantindo que Y seja numérico e X seja string/date/number
    const newX =
      newDataset.columns.find((c) => ['string', 'date', 'number'].includes(c.type))?.name ?? '';
    const newY =
      newDataset.columns.find((c) => c.type === 'number')?.name ?? '';

    setChartConfig((prev) => ({
      id: `chart-${Date.now()}`,
      datasetId: newDataset.id,
      type: prev.type,
      xColumn: newX,
      yColumn: newY,
    }));
  };

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>CSV/Excel Chart Generator</h1>
      <FileUpload onDatasetLoaded={handleDatasetLoaded} />

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
