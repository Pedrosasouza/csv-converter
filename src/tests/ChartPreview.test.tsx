import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartPreview } from '../components/ChartPreview';
import { mockDataset } from '../mocks/datasetMock';
import { ChartConfig } from '../models/chart';

describe('ChartPreview', () => {
  const barConfig: ChartConfig = {
    id: 'chart-1',
    datasetId: mockDataset.id,
    type: 'bar',
    xColumn: 'mes',
    yColumn: 'vendas',
  };

  it('renderiza o gráfico de barras quando a configuração é válida', () => {
    render(<ChartPreview dataset={mockDataset} config={barConfig} />);

    expect(screen.getByTestId('chart-preview')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/visualização: gráfico do tipo bar/i)
    ).toBeInTheDocument();
  });

  it('renderiza o gráfico de linhas quando a configuração é do tipo "line"', () => {
    const lineConfig: ChartConfig = {
      ...barConfig,
      type: 'line',
    };

    render(<ChartPreview dataset={mockDataset} config={lineConfig} />);

    expect(screen.getByTestId('chart-preview')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/visualização: gráfico do tipo line/i)
    ).toBeInTheDocument();
  });

  it('renderiza o gráfico de pizza quando a configuração é do tipo "pie"', () => {
    const pieConfig: ChartConfig = {
      ...barConfig,
      type: 'pie',
    };

    render(<ChartPreview dataset={mockDataset} config={pieConfig} />);

    expect(screen.getByTestId('chart-preview')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/visualização: gráfico do tipo pie/i)
    ).toBeInTheDocument();
  });

  it('renderiza o gráfico de dispersão quando a configuração é do tipo "scatter"', () => {
    const scatterConfig: ChartConfig = {
      ...barConfig,
      type: 'scatter',
    };

    render(<ChartPreview dataset={mockDataset} config={scatterConfig} />);

    expect(screen.getByTestId('chart-preview')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/visualização: gráfico do tipo scatter/i)
    ).toBeInTheDocument();
  });

  it('exibe alerta quando a configuração é semanticamente inválida (ex: coluna Y não numérica)', () => {
    const invalidConfig: ChartConfig = {
      ...barConfig,
      yColumn: 'mes',
    };

    render(<ChartPreview dataset={mockDataset} config={invalidConfig} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      /o eixo y exige uma coluna numérica/i
    );
  });

  it('renderiza mensagem informativa se o dataset não possuir linhas', () => {
    const emptyDataset = {
      ...mockDataset,
      rows: [],
    };

    render(<ChartPreview dataset={emptyDataset} config={barConfig} />);

    expect(
      screen.getByText(/nenhum dado disponível para visualização/i)
    ).toBeInTheDocument();
  });

  it('renderiza com segurança sem exceções quando há linhas contendo valores nulos no eixo Y', () => {
    const datasetComNull = {
      ...mockDataset,
      rows: [
        { mes: 'Janeiro', vendas: 100 },
        { mes: 'Fevereiro', vendas: null },
        { mes: 'Março', vendas: 150 },
      ],
    };

    expect(() => {
      render(<ChartPreview dataset={datasetComNull} config={barConfig} />);
    }).not.toThrow();

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
