import { Dataset } from '../models/dataset';

export const mockDataset: Dataset = {
  id: 'dataset-001',
  name: 'vendas.csv',
  format: 'csv',
  columns: [
    {
      name: 'mes',
      type: 'string',
    },
    {
      name: 'vendas',
      type: 'number',
    },
  ],
  rows: [
    {
      mes: 'Janeiro',
      vendas: 120,
    },
    {
      mes: 'Fevereiro',
      vendas: 180,
    },
    {
      mes: 'Março',
      vendas: 150,
    },
  ],
};
