import { Dataset } from './dataset';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  datasetId: string;
  type: ChartType;
  xColumn: string;
  yColumn: string;
}

export function validateChartConfig(
  config: ChartConfig,
  dataset: Dataset
): { isValid: boolean; error?: string } {
  const xCol = dataset.columns.find((column) => column.name === config.xColumn);
  const yCol = dataset.columns.find((column) => column.name === config.yColumn);

  if (!xCol) {
    return { isValid: false, error: 'Coluna X não encontrada.' };
  }

  if (!['string', 'date', 'number'].includes(xCol.type)) {
    return {
      isValid: false,
      error: 'O eixo X deve ser do tipo string, data ou número.',
    };
  }

  if (!yCol) {
    return { isValid: false, error: 'Coluna Y não encontrada.' };
  }

  if (yCol.type !== 'number') {
    return {
      isValid: false,
      error: 'O eixo Y exige uma coluna numérica.',
    };
  }

  return { isValid: true };
}
