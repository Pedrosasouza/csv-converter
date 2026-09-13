import { describe, it, expect } from 'vitest';
import { mockDataset } from '../mocks/datasetMock';
import { ChartConfig, validateChartConfig } from '../models/chart';
import { DatasetRow } from '../models/dataset';
import { getDataset } from '../services/datasetService';
import { isDateString } from '../utils/date';

describe('Dataset Models and Mock - Validação de Contrato Estrutural', () => {
  it('as colunas do Dataset possuem nomes únicos e tipos válidos', () => {
    const columnNames = mockDataset.columns.map((c) => c.name);
    const uniqueNames = new Set(columnNames);

    expect(uniqueNames.size).toBe(mockDataset.columns.length);

    mockDataset.columns.forEach((column) => {
      expect(column.name.trim()).toBeTruthy();
      expect(['string', 'number', 'date', 'boolean']).toContain(column.type);
    });
  });

  it('cada row possui as mesmas chaves das colunas e valores compatíveis com column.type', () => {
    const columnMap = new Map(mockDataset.columns.map((c) => [c.name, c.type]));

    expect(mockDataset.rows.length).toBeGreaterThan(0);

    mockDataset.rows.forEach((row) => {
      // 1. Todas as colunas devem estar presentes na row
      columnMap.forEach((expectedType, colName) => {
        expect(row).toHaveProperty(colName);
        const value = row[colName];

        // 2. Sem undefined, NaN, Infinity ou objetos
        expect(value).not.toBeUndefined();
        expect(Number.isNaN(value)).toBe(false);
        expect(value).not.toBe(Infinity);
        expect(value).not.toBe(-Infinity);
        if (value !== null) {
          expect(typeof value).not.toBe('object');
        }

        // 3. Compatibilidade semântica com o tipo declarado
        if (expectedType === 'number') {
          const isNumberOrNull =
            value === null || (typeof value === 'number' && Number.isFinite(value));
          expect(isNumberOrNull).toBe(true);
        } else if (expectedType === 'string') {
          const isStringOrNull = value === null || typeof value === 'string';
          expect(isStringOrNull).toBe(true);
        } else if (expectedType === 'boolean') {
          const isBooleanOrNull = value === null || typeof value === 'boolean';
          expect(isBooleanOrNull).toBe(true);
        } else if (expectedType === 'date') {
          const isDateOrNull =
            value === null || (typeof value === 'string' && isDateString(value));
          expect(isDateOrNull).toBe(true);
        }
      });
    });
  });

  it('o DatasetRow aceita exclusivamente valores do tipo DatasetCellValue (string, number, boolean, null)', () => {
    const row: DatasetRow = {
      texto: 'valor',
      numero: 100,
      booleano: true,
      nulo: null,
    };
    expect(row.texto).toBe('valor');
    expect(row.numero).toBe(100);
    expect(row.booleano).toBe(true);
    expect(row.nulo).toBeNull();
  });

  it('permite criar uma configuração de gráfico associada ao dataset via datasetId', () => {
    const config: ChartConfig = {
      id: 'chart-001',
      datasetId: mockDataset.id,
      type: 'bar',
      xColumn: 'mes',
      yColumn: 'vendas',
    };

    expect(config.datasetId).toBe(mockDataset.id);
    expect(config.type).toBe('bar');
    expect(mockDataset.columns.map((c) => c.name)).toContain(config.xColumn);
    expect(mockDataset.columns.map((c) => c.name)).toContain(config.yColumn);
  });

  it('o serviço getDataset retorna o dataset mock de forma assíncrona', async () => {
    const data = await getDataset();
    expect(data).toEqual(mockDataset);
    expect(data.id).toBe('dataset-001');
  });

  describe('validateChartConfig', () => {
    const validConfig: ChartConfig = {
      id: 'c-1',
      datasetId: mockDataset.id,
      type: 'bar',
      xColumn: 'mes',
      yColumn: 'vendas',
    };

    it('aceita coluna numérica no eixo Y', () => {
      const result = validateChartConfig(validConfig, mockDataset);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejeita coluna string no eixo Y', () => {
      const invalidConfig: ChartConfig = {
        ...validConfig,
        yColumn: 'mes',
      };
      const result = validateChartConfig(invalidConfig, mockDataset);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/o eixo y exige uma coluna numérica/i);
    });

    it('rejeita coluna Y inexistente', () => {
      const invalidConfig: ChartConfig = {
        ...validConfig,
        yColumn: 'coluna_inexistente',
      };
      const result = validateChartConfig(invalidConfig, mockDataset);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/coluna y não encontrada/i);
    });

    it('rejeita coluna X inexistente', () => {
      const invalidConfig: ChartConfig = {
        ...validConfig,
        xColumn: 'coluna_inexistente',
      };
      const result = validateChartConfig(invalidConfig, mockDataset);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/coluna x não encontrada/i);
    });

    it('aceita string, date ou number no eixo X', () => {
      const datasetComTipos = {
        ...mockDataset,
        columns: [
          { name: 'col_str', type: 'string' as const },
          { name: 'col_date', type: 'date' as const },
          { name: 'col_num', type: 'number' as const },
          { name: 'col_y', type: 'number' as const },
        ],
      };

      expect(
        validateChartConfig({ ...validConfig, xColumn: 'col_str', yColumn: 'col_y' }, datasetComTipos).isValid
      ).toBe(true);
      expect(
        validateChartConfig({ ...validConfig, xColumn: 'col_date', yColumn: 'col_y' }, datasetComTipos).isValid
      ).toBe(true);
      expect(
        validateChartConfig({ ...validConfig, xColumn: 'col_num', yColumn: 'col_y' }, datasetComTipos).isValid
      ).toBe(true);
    });
  });
});
