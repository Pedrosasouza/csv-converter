import { ChartConfig, validateChartConfig } from '../models/chart';
import { Dataset } from '../models/dataset';

export interface ExportChartOptions {
  title?: string;
}

export const exportChartAsPng = async (
  config: ChartConfig,
  dataset: Dataset,
  options?: ExportChartOptions
): Promise<void> => {
  const validation = validateChartConfig(config, dataset);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Configuração do gráfico inválida.');
  }

  const payload = {
    tipo_grafico: config.type,
    coluna_x: config.xColumn,
    colunas_y: [config.yColumn],
    titulo: options?.title || `Gráfico de ${config.yColumn} por ${config.xColumn}`,
    rows: dataset.rows,
  };

  const response = await fetch('/api/charts/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMsg = 'Erro ao gerar a imagem do gráfico no servidor.';
    try {
      const data = await response.json();
      if (data?.detail) {
        errorMsg = data.detail;
      }
    } catch {
      errorMsg = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.type}_grafico.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};
