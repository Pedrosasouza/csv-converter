import { describe, it, expect } from 'vitest';
import { mockDataset } from '../mocks/datasetMock';
import { ChartConfig } from '../models/chart';
import { getDataset } from '../services/datasetService';

describe('Dataset Models and Mock', () => {
  it('o Dataset mock possui colunas válidas', () => {
    expect(mockDataset.columns).toBeDefined();
    expect(mockDataset.columns.length).toBeGreaterThan(0);

    mockDataset.columns.forEach((column) => {
      expect(column.name).toBeTruthy();
      expect(['string', 'number', 'date', 'boolean']).toContain(column.type);
    });
  });

  it('o Dataset mock possui linhas com dados correspondentes às colunas', () => {
    expect(mockDataset.rows).toBeDefined();
    expect(mockDataset.rows.length).toBeGreaterThan(0);

    const columnNames = mockDataset.columns.map((col) => col.name);
    mockDataset.rows.forEach((row) => {
      columnNames.forEach((colName) => {
        expect(row).toHaveProperty(colName);
      });
    });
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
});
