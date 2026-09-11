import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

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

  it('o usuário consegue selecionar o eixo Y e atualiza o estado', async () => {
    const user = userEvent.setup();
    render(<App />);

    const ySelect = screen.getByLabelText(/eixo y/i);
    await user.selectOptions(ySelect, 'mes');

    expect(screen.getByTestId('config-y')).toHaveTextContent('Eixo Y: mes');
  });
});
