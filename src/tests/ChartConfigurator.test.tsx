import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartConfigurator } from '../components/ChartConfigurator';
import { mockDataset } from '../mocks/datasetMock';
import { ChartConfig } from '../models/chart';

describe('ChartConfigurator', () => {
  const initialConfig: ChartConfig = {
    id: 'config-1',
    datasetId: mockDataset.id,
    type: 'bar',
    xColumn: 'mes',
    yColumn: 'vendas',
  };

  it('renderiza as opções de tipo de gráfico e filtra colunas por tipo para X e Y', () => {
    render(
      <ChartConfigurator
        dataset={mockDataset}
        config={initialConfig}
        onChange={() => {}}
      />
    );

    // Seletores de Tipo, Eixo X e Eixo Y
    expect(screen.getByLabelText(/tipo de gráfico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/eixo x/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/eixo y/i)).toBeInTheDocument();

    // Eixo X aceita string/date/number (mes e vendas)
    const xSelect = screen.getByLabelText(/eixo x/i);
    expect(within(xSelect).getByRole('option', { name: 'mes' })).toBeInTheDocument();
    expect(within(xSelect).getByRole('option', { name: 'vendas' })).toBeInTheDocument();

    // Eixo Y filtra exclusivamente colunas numéricas ('vendas')
    const ySelect = screen.getByLabelText(/eixo y/i);
    expect(within(ySelect).getByRole('option', { name: 'vendas' })).toBeInTheDocument();
    expect(within(ySelect).queryByRole('option', { name: 'mes' })).not.toBeInTheDocument();
  });

  it('informa caso o dataset não possua colunas numéricas para o eixo Y', () => {
    const datasetSemNumeros = {
      ...mockDataset,
      columns: [{ name: 'descricao', type: 'string' as const }],
    };

    render(
      <ChartConfigurator
        dataset={datasetSemNumeros}
        config={{ ...initialConfig, xColumn: 'descricao', yColumn: '' }}
        onChange={() => {}}
      />
    );

    expect(
      screen.getByText(/este dataset não possui colunas numéricas para o eixo y/i)
    ).toBeInTheDocument();
  });

  it('permite que o usuário selecione o tipo de gráfico', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ChartConfigurator
        dataset={mockDataset}
        config={initialConfig}
        onChange={handleChange}
      />
    );

    const typeSelect = screen.getByLabelText(/tipo de gráfico/i);
    await user.selectOptions(typeSelect, 'line');

    expect(handleChange).toHaveBeenCalledWith({
      ...initialConfig,
      type: 'line',
    });
  });

  it('permite que o usuário selecione o eixo X', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ChartConfigurator
        dataset={mockDataset}
        config={initialConfig}
        onChange={handleChange}
      />
    );

    const xSelect = screen.getByLabelText(/eixo x/i);
    await user.selectOptions(xSelect, 'vendas');

    expect(handleChange).toHaveBeenCalledWith({
      ...initialConfig,
      xColumn: 'vendas',
    });
  });

  it('permite que o usuário selecione uma coluna numérica para o eixo Y', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const datasetComDoisNumeros = {
      ...mockDataset,
      columns: [
        { name: 'mes', type: 'string' as const },
        { name: 'vendas', type: 'number' as const },
        { name: 'lucro', type: 'number' as const },
      ],
    };

    render(
      <ChartConfigurator
        dataset={datasetComDoisNumeros}
        config={initialConfig}
        onChange={handleChange}
      />
    );

    const ySelect = screen.getByLabelText(/eixo y/i);
    await user.selectOptions(ySelect, 'lucro');

    expect(handleChange).toHaveBeenCalledWith({
      ...initialConfig,
      yColumn: 'lucro',
    });
  });
});
