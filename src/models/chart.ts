export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  datasetId: string;
  type: ChartType;
  xColumn: string;
  yColumn: string;
}
