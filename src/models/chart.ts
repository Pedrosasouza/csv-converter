import { Dataset } from './dataset';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  datasetId: string;
  type: ChartType;
  xColumn: string;
  yColumn: string;
}

export type ChartValidationReason =
  | 'missing_x'
  | 'missing_y'
  | 'invalid_x_type'
  | 'invalid_y_type'
  | 'no_numeric_columns'
  | 'empty_column_data';

export interface ChartValidationResult {
  isValid: boolean;
  error?: string;
  reason?: ChartValidationReason;
}

export function validateChartConfig(
  config: ChartConfig,
  dataset: Dataset
): ChartValidationResult {
  // 1. Validação da Coluna X
  if (!config.xColumn || config.xColumn.trim() === '') {
    return {
      isValid: false,
      error: 'Coluna X não selecionada. Selecione uma coluna para o eixo X no painel lateral.',
      reason: 'missing_x',
    };
  }

  const xCol = dataset.columns.find((column) => column.name === config.xColumn);
  if (!xCol) {
    return {
      isValid: false,
      error: 'Coluna X não encontrada no dataset.',
      reason: 'missing_x',
    };
  }

  if (!['string', 'date', 'number'].includes(xCol.type)) {
    return {
      isValid: false,
      error: 'O eixo X deve ser do tipo string, data ou número.',
      reason: 'invalid_x_type',
    };
  }

  // 2. Validação da Coluna Y
  if (!config.yColumn || config.yColumn.trim() === '') {
    const hasNumericCols = dataset.columns.some((c) => c.type === 'number');
    if (!hasNumericCols) {
      return {
        isValid: false,
        error:
          'O dataset não possui nenhuma coluna numérica. O eixo Y exige uma coluna numérica para gerar o gráfico.',
        reason: 'no_numeric_columns',
      };
    }
    return {
      isValid: false,
      error: 'Coluna Y não selecionada. Selecione uma coluna numérica para o eixo Y no painel lateral.',
      reason: 'missing_y',
    };
  }

  const yCol = dataset.columns.find((column) => column.name === config.yColumn);
  if (!yCol) {
    return {
      isValid: false,
      error: 'Coluna Y não encontrada no dataset.',
      reason: 'missing_y',
    };
  }

  if (yCol.type !== 'number') {
    return {
      isValid: false,
      error: 'O eixo Y exige uma coluna numérica.',
      reason: 'invalid_y_type',
    };
  }

  // 3. Validação de Dados Válidos na Coluna Y
  if (dataset.rows && dataset.rows.length > 0) {
    const rowsWithColumn = dataset.rows.filter((row) => config.yColumn in row);
    if (rowsWithColumn.length > 0) {
      const hasValidValue = rowsWithColumn.some(
        (row) =>
          row[config.yColumn] !== null &&
          row[config.yColumn] !== undefined &&
          row[config.yColumn] !== ''
      );
      if (!hasValidValue) {
        return {
          isValid: false,
          error:
            'A coluna selecionada para o eixo Y não possui valores numéricos válidos (todos os valores são nulos ou vazios).',
          reason: 'empty_column_data',
        };
      }
    }
  }

  return { isValid: true };
}
