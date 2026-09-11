export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface DatasetRow {
  [key: string]: unknown;
}

export interface Dataset {
  id: string;
  name: string;
  format: 'csv' | 'xlsx';
  columns: DatasetColumn[];
  rows: DatasetRow[];
}
