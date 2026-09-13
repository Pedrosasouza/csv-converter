import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChartPreview } from '../components/ChartPreview';
import { mockDataset } from '../mocks/datasetMock';
import { ChartConfig } from '../models/chart';
import * as chartService from '../services/chartService';

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

  it('renderiza o botão de exportar PNG e aciona a exportação ao clicar', async () => {
    const exportSpy = vi.spyOn(chartService, 'exportChartAsPng').mockResolvedValue();

    render(<ChartPreview dataset={mockDataset} config={barConfig} />);

    const exportBtn = screen.getByTestId('export-png-button');
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toHaveTextContent(/exportar png \(matplotlib\)/i);

    fireEvent.click(exportBtn);

    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy).toHaveBeenCalledWith(barConfig, mockDataset);

    await waitFor(() => {
      expect(exportBtn).not.toBeDisabled();
    });

    exportSpy.mockRestore();
  });

  it('exibe mensagem de erro quando a exportação PNG falha', async () => {
    const exportSpy = vi.spyOn(chartService, 'exportChartAsPng').mockRejectedValue(new Error('Erro no servidor backend'));

    render(<ChartPreview dataset={mockDataset} config={barConfig} />);

    const exportBtn = screen.getByTestId('export-png-button');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toHaveTextContent(/erro no servidor backend/i);
    });

    // Permite fechar a mensagem de erro
    const closeBtn = screen.getByLabelText(/fechar erro/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('export-error')).not.toBeInTheDocument();

    exportSpy.mockRestore();
  });

  it('exibe aviso amigável de configuração pendente quando o eixo X não foi selecionado', () => {
    const pendingConfig: ChartConfig = {
      ...barConfig,
      xColumn: '',
    };

    render(<ChartPreview dataset={mockDataset} config={pendingConfig} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/configuração pendente/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/coluna x não selecionada/i);
  });

  it('exibe aviso explicativo quando o dataset não possui nenhuma coluna numérica para o eixo Y', () => {
    const textDataset = {
      ...mockDataset,
      columns: [
        { name: 'nome', type: 'string' as const },
        { name: 'cidade', type: 'string' as const },
      ],
      rows: [
        { nome: 'Ana', cidade: 'SP' },
        { nome: 'Bruno', cidade: 'RJ' },
      ],
    };

    const configSemY: ChartConfig = {
      id: 'c-empty-y',
      datasetId: textDataset.id,
      type: 'bar',
      xColumn: 'nome',
      yColumn: '',
    };

    render(<ChartPreview dataset={textDataset} config={configSemY} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/ausência de colunas numéricas/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/não possui nenhuma coluna numérica/i);
  });

  it('exibe alerta amigável quando todos os valores da coluna Y forem nulos', () => {
    const allNullDataset = {
      ...mockDataset,
      rows: [
        { mes: 'Jan', vendas: null },
        { mes: 'Fev', vendas: null },
      ],
    };

    render(<ChartPreview dataset={allNullDataset} config={barConfig} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/não possui valores numéricos válidos/i);
  });
});
