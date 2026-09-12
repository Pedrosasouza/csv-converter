import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../components/FileUpload';
import * as datasetService from '../services/datasetService';

describe('FileUpload Component', () => {
  it('renderiza o input de arquivo com atributos adequados para CSV', () => {
    render(<FileUpload onDatasetLoaded={() => {}} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.csv');
  });

  it('chama uploadDataset e aciona onDatasetLoaded quando a API retorna sucesso', async () => {
    const user = userEvent.setup();
    const handleLoaded = vi.fn();

    const mockDataset = {
      id: 'dataset-123',
      name: 'vendas.csv',
      format: 'csv' as const,
      columns: [{ name: 'mes', type: 'string' as const }],
      rows: [{ mes: 'Janeiro' }],
    };
    const uploadSpy = vi.spyOn(datasetService, 'uploadDataset').mockResolvedValueOnce(mockDataset);

    render(<FileUpload onDatasetLoaded={handleLoaded} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['mes\nJaneiro'], 'vendas.csv', { type: 'text/csv' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith(file);
      expect(handleLoaded).toHaveBeenCalledWith(mockDataset);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('exibe alerta e não chama onDatasetLoaded quando a extensão é inválida', async () => {
    const handleLoaded = vi.fn();

    render(<FileUpload onDatasetLoaded={handleLoaded} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['texto'], 'dados.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /formato de arquivo não suportado.*\.csv/i
      );
    });
    expect(handleLoaded).not.toHaveBeenCalled();
  });

  it('exibe alerta e não chama onDatasetLoaded quando o arquivo é vazio', async () => {
    const handleLoaded = vi.fn();

    render(<FileUpload onDatasetLoaded={handleLoaded} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File([], 'vazio.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /o arquivo selecionado está vazio/i
      );
    });
    expect(handleLoaded).not.toHaveBeenCalled();
  });

  it('exibe alerta quando ocorre erro HTTP retornado pelo uploadDataset', async () => {
    const user = userEvent.setup();
    const handleLoaded = vi.fn();
    const handleError = vi.fn();

    vi.spyOn(datasetService, 'uploadDataset').mockRejectedValueOnce(
      new Error('Erro 400: O arquivo CSV deve conter pelo menos uma linha de dados.')
    );

    render(<FileUpload onDatasetLoaded={handleLoaded} onError={handleError} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['cabecalho'], 'invalido.csv', { type: 'text/csv' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /O arquivo CSV deve conter pelo menos uma linha de dados/i
      );
    });
    expect(handleError).toHaveBeenCalledWith(
      'Erro 400: O arquivo CSV deve conter pelo menos uma linha de dados.'
    );
    expect(handleLoaded).not.toHaveBeenCalled();
  });
});
