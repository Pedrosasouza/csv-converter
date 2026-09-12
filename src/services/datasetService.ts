import { Dataset } from '../models/dataset';
import { mockDataset } from '../mocks/datasetMock';

/**
 * Envia o arquivo CSV para o backend FastAPI processar e retornar o Dataset estruturado.
 */
export const uploadDataset = async (
  file: File,
  delimitador?: string
): Promise<Dataset> => {
  const formData = new FormData();
  formData.append('file', file);
  if (delimitador) {
    formData.append('delimitador', delimitador);
  }

  const response = await fetch('/api/datasets/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao processar o arquivo no servidor.';
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const dataset: Dataset = await response.json();
  return dataset;
};

/**
 * Retorna o mock para fins de fallback e testes de contrato.
 */
export const getDataset = async (): Promise<Dataset> => {
  return mockDataset;
};
