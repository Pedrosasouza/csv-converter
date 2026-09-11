import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renderiza as opções de tipo de gráfico e as colunas do dataset', () => {
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

    // Colunas disponíveis no dataset
    expect(screen.getAllByRole('option', { name: /mes/i })).toHaveLength(2); // presente em X e Y
    expect(screen.getAllByRole('option', { name: /vendas/i })).toHaveLength(2); // presente em X e Y
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

  it('permite que o usuário selecione o eixo Y', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ChartConfigurator
        dataset={mockDataset}
        config={initialConfig}
        onChange={handleChange}
      />
    );

    const ySelect = screen.getByLabelText(/eixo y/i);
    await user.selectOptions(ySelect, 'mes');

    expect(handleChange).toHaveBeenCalledWith({
      ...initialConfig,
      yColumn: 'mes',
    });
  });
});
