import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportChartAsPng } from '../services/chartService';
import { ChartConfig } from '../models/chart';
import { Dataset } from '../models/dataset';

describe('chartService', () => {
  const mockConfig: ChartConfig = {
    id: 'c-1',
    datasetId: 'd-1',
    type: 'bar',
    xColumn: 'Mes',
    yColumn: 'Vendas',
  };

  const mockDataset: Dataset = {
    id: 'd-1',
    name: 'dados.csv',
    format: 'csv',
    columns: [
      { name: 'Mes', type: 'string' },
      { name: 'Vendas', type: 'number' },
    ],
    rows: [
      { Mes: 'Jan', Vendas: 100 },
      { Mes: 'Fev', Vendas: 150 },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exportChartAsPng envia payload correto para /api/charts/generate e dispara download do arquivo', async () => {
    const fakeBlob = new Blob(['fake png content'], { type: 'image/png' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => fakeBlob,
    });
    vi.stubGlobal('fetch', fetchMock);

    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/fake-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        el.click = clickMock;
      }
      return el;
    });

    await exportChartAsPng(mockConfig, mockDataset, { title: 'Meu Gráfico' });

    expect(fetchMock).toHaveBeenCalledWith('/api/charts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_grafico: 'bar',
        coluna_x: 'Mes',
        colunas_y: ['Vendas'],
        titulo: 'Meu Gráfico',
        rows: mockDataset.rows,
      }),
    });

    expect(createObjectURLMock).toHaveBeenCalledWith(fakeBlob);
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/fake-url');
  });

  it('exportChartAsPng lança erro com mensagem do backend quando a API responde com erro HTTP', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ detail: 'Coluna não é numérica.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(exportChartAsPng(mockConfig, mockDataset)).rejects.toThrow(
      'Coluna não é numérica.'
    );
  });

  it('exportChartAsPng lida com erros quando o JSON não possui o campo detail', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(exportChartAsPng(mockConfig, mockDataset)).rejects.toThrow(
      'Erro ao gerar a imagem do gráfico no servidor.'
    );
  });
});
