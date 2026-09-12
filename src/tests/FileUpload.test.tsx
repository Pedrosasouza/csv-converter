import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../components/FileUpload';
import * as fileParser from '../services/fileParser';

describe('FileUpload Component', () => {
  it('renderiza o input de arquivo com atributos adequados para CSV', () => {
    render(<FileUpload onDatasetLoaded={() => {}} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.csv');
  });

  it('chama onDatasetLoaded quando um arquivo CSV válido é carregado', async () => {
    const user = userEvent.setup();
    const handleLoaded = vi.fn();

    const mockDataset = {
      id: 'dataset-123',
      name: 'vendas.csv',
      format: 'csv' as const,
      columns: [{ name: 'mes', type: 'string' as const }],
      rows: [{ mes: 'Janeiro' }],
    };
    vi.spyOn(fileParser, 'parseFile').mockResolvedValueOnce(mockDataset);

    render(<FileUpload onDatasetLoaded={handleLoaded} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['mes\nJaneiro'], 'vendas.csv', { type: 'text/csv' });

    await user.upload(input, file);

    await waitFor(() => {
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

  it('exibe alerta quando ocorre falha no processamento (arquivo corrompido)', async () => {
    const user = userEvent.setup();
    const handleLoaded = vi.fn();

    vi.spyOn(fileParser, 'parseFile').mockRejectedValueOnce(
      new Error('Não foi possível ler o arquivo CSV. O arquivo parece estar corrompido.')
    );

    render(<FileUpload onDatasetLoaded={handleLoaded} />);

    const input = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['corrompido'], 'corrompido.csv', { type: 'text/csv' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /não foi possível ler o arquivo/i
      );
    });
    expect(handleLoaded).not.toHaveBeenCalled();
  });
});
