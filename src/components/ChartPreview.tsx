import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Dataset } from '../models/dataset';
import { ChartConfig, validateChartConfig } from '../models/chart';
import { exportChartAsPng } from '../services/chartService';

export interface ChartPreviewProps {
  dataset: Dataset;
  config: ChartConfig;
}

const PIE_COLORS = [
  '#5862a5', // Gray Blue principal
  '#495084', // Gray Blue ardósia
  '#7881bb', // Periwinkle vivo
  '#323a5a', // Navy escuro
  '#b7bcda', // Lavanda acinzentado
  '#414873', // Chumbo azulado
  '#06b6d4', // Ciano complementar
  '#10b981', // Esmeralda complementar
];

const CHART_TYPE_LABELS: Record<string, string> = {
  bar: 'Barras',
  line: 'Linhas',
  pie: 'Pizza',
  scatter: 'Dispersão',
};

export const ChartPreview: React.FC<ChartPreviewProps> = ({ dataset, config }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      await exportChartAsPng(config, dataset);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Falha ao exportar gráfico');
    } finally {
      setIsExporting(false);
    }
  };

  if (!dataset.rows || dataset.rows.length === 0) {
    return (
      <div
        data-testid="chart-preview"
        className="bg-white rounded-2xl border border-[#d8dae7] shadow-sm p-12 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#ebecf2] flex items-center justify-center text-[#495084]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#414873]">
          Nenhum dado disponível para visualização.
        </p>
      </div>
    );
  }

  const validation = validateChartConfig(config, dataset);
  if (!validation.isValid) {
    return (
      <div
        data-testid="chart-preview"
        role="alert"
        className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-red-700 bg-red-50/40 space-y-2"
      >
        <div className="flex items-center gap-2 font-semibold text-red-800 text-sm">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Erro na Configuração</span>
        </div>
        <p className="text-xs text-red-600 font-medium pl-7">{validation.error}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="chart-preview"
      className="bg-white rounded-2xl border border-[#d8dae7] shadow-sm p-6 lg:p-8 flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#ebecf2] gap-3">
        <div>
          <span className="text-xs font-bold text-[#5862a5] uppercase tracking-wider">
            Visualização
          </span>
          <h3 className="text-lg font-bold text-[#1c1e2c] tracking-tight">
            Visualização do Gráfico ({CHART_TYPE_LABELS[config.type] || config.type})
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#495084] text-white shadow-2xs">
            <span className="w-2 h-2 rounded-xs bg-white/90"></span>
            {(CHART_TYPE_LABELS[config.type] || config.type).toUpperCase()}
          </span>
          <span className="text-xs text-[#414873] font-medium">
            X: <strong className="text-[#1c1e2c]">{config.xColumn}</strong> · Y:{' '}
            <strong className="text-[#1c1e2c]">{config.yColumn}</strong>
          </span>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            data-testid="export-png-button"
            aria-label="Exportar gráfico em PNG de alta resolução via Matplotlib"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5862a5] hover:bg-[#495084] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer ml-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Exportar PNG (Matplotlib)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div
          data-testid="export-error"
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between"
        >
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm cursor-pointer"
            aria-label="Fechar erro"
          >
            ×
          </button>
        </div>
      )}

      <div className="w-full min-h-[380px] flex items-center justify-center py-2">
        {config.type === 'bar' && (
          <div
            data-testid="bar-chart"
            aria-label={`Visualização: gráfico do tipo ${config.type}`}
            style={{ width: '100%', height: 380 }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={dataset.rows} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebecf2" vertical={false} />
                <XAxis
                  dataKey={config.xColumn}
                  stroke="#7881bb"
                  fontSize={12}
                  tickLine={false}
                  dy={6}
                />
                <YAxis stroke="#7881bb" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d8dae7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    fontSize: '12px',
                    color: '#1c1e2c',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Bar
                  dataKey={config.yColumn}
                  fill="#5862a5"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {config.type === 'line' && (
          <div
            data-testid="line-chart"
            aria-label={`Visualização: gráfico do tipo ${config.type}`}
            style={{ width: '100%', height: 380 }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={dataset.rows} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebecf2" vertical={false} />
                <XAxis
                  dataKey={config.xColumn}
                  stroke="#7881bb"
                  fontSize={12}
                  tickLine={false}
                  dy={6}
                />
                <YAxis stroke="#7881bb" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d8dae7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    fontSize: '12px',
                    color: '#1c1e2c',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Line
                  type="monotone"
                  dataKey={config.yColumn}
                  stroke="#5862a5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#5862a5', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {config.type === 'pie' && (
          <div
            data-testid="pie-chart"
            aria-label={`Visualização: gráfico do tipo ${config.type}`}
            style={{ width: '100%', height: 380 }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d8dae7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    fontSize: '12px',
                    color: '#1c1e2c',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Pie
                  data={dataset.rows}
                  nameKey={config.xColumn}
                  dataKey={config.yColumn}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={3}
                >
                  {dataset.rows.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {config.type === 'scatter' && (
          <div
            data-testid="scatter-chart"
            aria-label={`Visualização: gráfico do tipo ${config.type}`}
            style={{ width: '100%', height: 380 }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebecf2" />
                <XAxis
                  dataKey={config.xColumn}
                  name={config.xColumn}
                  stroke="#7881bb"
                  fontSize={12}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  dataKey={config.yColumn}
                  name={config.yColumn}
                  stroke="#7881bb"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d8dae7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    fontSize: '12px',
                    color: '#1c1e2c',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Scatter data={dataset.rows} fill="#5862a5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-[#ebecf2] flex items-center justify-between text-xs text-[#414873] font-medium">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#495084]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {dataset.rows.length} linhas · {dataset.columns.length} colunas
        </span>
        <span className="text-[11px] text-[#7881bb]">
          Atualização reativa instantânea
        </span>
      </div>
    </div>
  );
};
