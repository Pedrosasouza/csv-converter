import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadDataset, getDataset } from '../services/datasetService';
import { mockDataset } from '../mocks/datasetMock';

describe('datasetService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getDataset retorna mockDataset', async () => {
    const data = await getDataset();
    expect(data).toEqual(mockDataset);
  });

  it('uploadDataset envia FormData para /api/datasets/upload e retorna o Dataset em caso de sucesso', async () => {
    const fakeDataset = {
      id: 'dataset-123',
      name: 'teste.csv',
      format: 'csv' as const,
      columns: [{ name: 'col1', type: 'string' as const }],
      rows: [{ col1: 'val1' }],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeDataset,
    });
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['col1\nval1'], 'teste.csv', { type: 'text/csv' });
    const result = await uploadDataset(file, ';');

    expect(fetchMock).toHaveBeenCalledWith('/api/datasets/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }));
    expect(result).toEqual(fakeDataset);
  });

  it('uploadDataset lança erro com mensagem amigável extraída do detail do backend em caso de falha', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ detail: 'O arquivo selecionado está vazio.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const file = new File([''], 'vazio.csv', { type: 'text/csv' });

    await expect(uploadDataset(file)).rejects.toThrow('O arquivo selecionado está vazio.');
  });

  it('uploadDataset lida com respostas de erro onde o JSON não possui detail', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['dados'], 'teste.csv', { type: 'text/csv' });

    await expect(uploadDataset(file)).rejects.toThrow('Erro ao processar o arquivo no servidor.');
  });
});
