import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Dataset } from '../models/dataset';
import { ChartConfig } from '../models/chart';

export interface ChartPreviewProps {
  dataset: Dataset;
  config: ChartConfig;
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({ dataset, config }) => {
  if (!dataset.rows || dataset.rows.length === 0) {
    return (
      <div data-testid="chart-preview">
        <p>Nenhum dado disponível para visualização.</p>
      </div>
    );
  }

  return (
    <div data-testid="chart-preview" style={{ marginTop: '1.5rem' }}>
      <h3>Visualização do Gráfico ({config.type})</h3>

      {config.type === 'bar' && (
        <div
          data-testid="bar-chart"
          aria-label={`Visualização: gráfico do tipo ${config.type}`}
          style={{ width: '100%', height: 350 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dataset.rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xColumn} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={config.yColumn} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {config.type === 'line' && (
        <div
          data-testid="line-chart"
          aria-label={`Visualização: gráfico do tipo ${config.type}`}
          style={{ width: '100%', height: 350 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dataset.rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xColumn} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={config.yColumn} stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {config.type === 'pie' && (
        <div
          data-testid="pie-chart"
          aria-label={`Visualização: gráfico do tipo ${config.type}`}
          style={{ width: '100%', height: 350 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={dataset.rows}
                nameKey={config.xColumn}
                dataKey={config.yColumn}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {config.type === 'scatter' && (
        <div
          data-testid="scatter-chart"
          aria-label={`Visualização: gráfico do tipo ${config.type}`}
          style={{ width: '100%', height: 350 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xColumn} name={config.xColumn} />
              <YAxis dataKey={config.yColumn} name={config.yColumn} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter data={dataset.rows} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
