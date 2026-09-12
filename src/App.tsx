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
    <div className="min-h-screen bg-[#f6f8fa] text-[#1c1e2c] flex flex-col font-sans">
      {/* Top Navbar Horizontal Escura (Dark Navy #1c1e2c da Paleta Gray Blue) */}
      <header className="sticky top-0 z-30 bg-[#1c1e2c] text-white border-b border-[#323a5a] px-4 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5862a5] text-white flex items-center justify-center shadow-sm font-bold">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              CSV/Excel Chart Generator
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Painel lateral de configuração (Esquerda com fundo suave em #ebecf2 da paleta) */}
          <aside className="lg:col-span-4 bg-[#ebecf2] border border-[#d8dae7] rounded-2xl p-4 sm:p-5 space-y-4">
            {/* Cabeçalho do Painel Lateral */}
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#323a5a]">
                Painel de Configuração
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[#d8dae7] text-[#323a5a] border border-[#b7bcda]/40">
                Painel
              </span>
            </div>

            {/* Card de Status do Dataset com box padronizada retangular arredondada */}
            <div className="bg-white rounded-xl border border-[#d8dae7] shadow-2xs p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-[#ebecf2] text-[#495084] border border-[#d8dae7] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#414873]">
                    Dataset atual
                  </p>
                  <p className="text-sm font-bold text-[#1c1e2c] truncate">
                    {dataset.name}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#495084] text-white shadow-2xs shrink-0">
                {dataset.rows.length} linhas
              </span>
            </div>

            {/* Componente de Upload de Arquivo */}
            <FileUpload onDatasetLoaded={handleDatasetLoaded} />

            {/* Painel de Configuração dos Eixos e Gráfico */}
            <ChartConfigurator
              dataset={dataset}
              config={chartConfig}
              onChange={setChartConfig}
            />

            {/* Elementos de teste mantidos para acessibilidade e testes, sem redundância visual */}
            <div className="sr-only">
              <p data-testid="config-type">Tipo: {chartConfig.type}</p>
              <p data-testid="config-x">Eixo X: {chartConfig.xColumn}</p>
              <p data-testid="config-y">Eixo Y: {chartConfig.yColumn}</p>
            </div>
          </aside>

          {/* Área principal de visualização (Direita com Card Branco Proeminente) */}
          <section className="lg:col-span-8 w-full">
            <ChartPreview dataset={dataset} config={chartConfig} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
