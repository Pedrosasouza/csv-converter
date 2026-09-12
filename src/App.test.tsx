import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as datasetService from './services/datasetService';

describe('App', () => {
  it('renderiza o título principal e as seções iniciais', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: /CSV\/Excel Chart Generator/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/vendas\.csv/i)).toBeInTheDocument();
    expect(screen.getByTestId('chart-preview')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('o usuário consegue selecionar o tipo de gráfico e alternar para line chart', async () => {
    const user = userEvent.setup();
    render(<App />);

    const select = screen.getByLabelText(/tipo de gráfico/i);
    await user.selectOptions(select, 'line');

    expect(screen.getByTestId('config-type')).toHaveTextContent('Tipo: line');
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('o usuário consegue selecionar o tipo de gráfico e alternar para pie chart', async () => {
    const user = userEvent.setup();
    render(<App />);

    const select = screen.getByLabelText(/tipo de gráfico/i);
    await user.selectOptions(select, 'pie');

    expect(screen.getByTestId('config-type')).toHaveTextContent('Tipo: pie');
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('o usuário consegue selecionar o tipo de gráfico e alternar para scatter chart', async () => {
    const user = userEvent.setup();
    render(<App />);

    const select = screen.getByLabelText(/tipo de gráfico/i);
    await user.selectOptions(select, 'scatter');

    expect(screen.getByTestId('config-type')).toHaveTextContent('Tipo: scatter');
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('o usuário consegue selecionar o eixo X e atualiza o estado', async () => {
    const user = userEvent.setup();
    render(<App />);

    const xSelect = screen.getByLabelText(/eixo x/i);
    await user.selectOptions(xSelect, 'vendas');

    expect(screen.getByTestId('config-x')).toHaveTextContent('Eixo X: vendas');
  });

  it('o usuário consegue selecionar uma coluna numérica no eixo Y e atualiza o estado', async () => {
    const user = userEvent.setup();
    const datasetComMetricas = {
      id: 'dataset-metricas',
      name: 'metricas.csv',
      format: 'csv' as const,
      columns: [
        { name: 'mes', type: 'string' as const },
        { name: 'vendas', type: 'number' as const },
        { name: 'lucro', type: 'number' as const },
      ],
      rows: [
        { mes: 'Jan', vendas: 100, lucro: 20 },
      ],
    };
    vi.spyOn(datasetService, 'uploadDataset').mockResolvedValueOnce(datasetComMetricas);

    render(<App />);

    const uploadInput = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['dados'], 'metricas.csv', { type: 'text/csv' });
    await user.upload(uploadInput, file);

    await waitFor(() => {
      expect(screen.getByText(/metricas\.csv/i)).toBeInTheDocument();
    });

    const ySelect = screen.getByLabelText(/eixo y/i);
    await user.selectOptions(ySelect, 'lucro');

    expect(screen.getByTestId('config-y')).toHaveTextContent('Eixo Y: lucro');
  });

  it('ao carregar novo Dataset com colunas diferentes, preserva o tipo de gráfico e remapeia X e Y para as novas colunas', async () => {
    const user = userEvent.setup();

    const novoDataset = {
      id: 'dataset-novo',
      name: 'financeiro.csv',
      format: 'csv' as const,
      columns: [
        { name: 'ano', type: 'string' as const },
        { name: 'lucro', type: 'number' as const },
      ],
      rows: [
        { ano: '2023', lucro: 5000 },
        { ano: '2024', lucro: 7000 },
      ],
    };
    vi.spyOn(datasetService, 'uploadDataset').mockResolvedValueOnce(novoDataset);

    render(<App />);

    // 1. Usuário seleciona previamente o gráfico de linhas
    const typeSelect = screen.getByLabelText(/tipo de gráfico/i);
    await user.selectOptions(typeSelect, 'line');
    expect(screen.getByTestId('config-type')).toHaveTextContent('Tipo: line');

    // 2. Upload de novo arquivo com colunas 'ano' e 'lucro'
    const uploadInput = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['ano,lucro\n2023,5000'], 'financeiro.csv', { type: 'text/csv' });
    await user.upload(uploadInput, file);

    // 3. Verifica que o dataset ativo atualizou
    await waitFor(() => {
      expect(screen.getByText(/financeiro\.csv/i)).toBeInTheDocument();
    });

    // 4. Verifica que o tipo de gráfico foi preservado ('line')
    expect(screen.getByTestId('config-type')).toHaveTextContent('Tipo: line');

    // 5. Verifica que os eixos foram remapeados para as novas colunas válidas
    expect(screen.getByTestId('config-x')).toHaveTextContent('Eixo X: ano');
    expect(screen.getByTestId('config-y')).toHaveTextContent('Eixo Y: lucro');

    // 6. Verifica que os seletores agora mostram as novas colunas e não as antigas
    expect(screen.getByRole('option', { name: 'ano' })).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'lucro' })).toHaveLength(2); // em X e Y
    expect(screen.queryByRole('option', { name: 'mes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'vendas' })).not.toBeInTheDocument();
  });

  it('quando o upload falha, preserva o Dataset anterior inalterado', async () => {
    render(<App />);

    // Confirma dataset inicial
    expect(screen.getByText(/vendas\.csv/i)).toBeInTheDocument();

    const uploadInput = screen.getByLabelText(/carregar arquivo csv/i);
    const file = new File(['conteudo-invalido'], 'arquivo.pdf', { type: 'application/pdf' });
    fireEvent.change(uploadInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /formato de arquivo não suportado.*\.csv/i
      );
    });

    // Dataset anterior continua ativo
    expect(screen.getByText(/vendas\.csv/i)).toBeInTheDocument();
    expect(screen.getByTestId('config-x')).toHaveTextContent('Eixo X: mes');
  });
});
