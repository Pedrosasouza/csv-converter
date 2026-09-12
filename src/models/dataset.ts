export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export type DatasetCellValue = string | number | boolean | null;

export interface DatasetRow {
  [key: string]: DatasetCellValue;
}

export interface Dataset {
  id: string;
  name: string;
  format: 'csv' | 'xlsx';
  columns: DatasetColumn[];
  rows: DatasetRow[];
}
