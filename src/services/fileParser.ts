import Papa from 'papaparse';
import { Dataset, DatasetColumn, DatasetRow, DatasetCellValue } from '../models/dataset';

export const deduplicateHeaders = (headers: string[]): string[] => {
  const used = new Set<string>();
  return headers.map((h) => {
    const clean = h.trim() || 'coluna';
    let candidate = clean;
    let counter = 1;
    while (used.has(candidate)) {
      candidate = `${clean}_${counter}`;
      counter++;
    }
    used.add(candidate);
    return candidate;
  });
};

const isValidCivilDate = (year: number, month: number, day: number): boolean => {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
};

export const isDateString = (val: string): boolean => {
  const s = val.trim();
  // 1. Formato ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss...
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?.*)?$/.exec(s);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    return isValidCivilDate(year, month, day);
  }

  // 2. Formato civil: DD/MM/YYYY
  const civilMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (civilMatch) {
    const day = parseInt(civilMatch[1], 10);
    const month = parseInt(civilMatch[2], 10);
    const year = parseInt(civilMatch[3], 10);
    return isValidCivilDate(year, month, day);
  }

  return false;
};

const isNumberVal = (v: unknown): boolean => {
  if (typeof v === 'number') return Number.isFinite(v);
  if (typeof v === 'string') {
    const s = v.trim().replace(',', '.');
    return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s) && Number.isFinite(Number(s));
  }
  return false;
};

const isBooleanVal = (v: unknown): boolean => {
  if (typeof v === 'boolean') return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === 'false';
  }
  return false;
};

const isDateVal = (v: unknown): boolean => {
  if (v instanceof Date) return !isNaN(v.getTime());
  if (typeof v === 'string') return isDateString(v);
  return false;
};

/**
 * Contrato de Inferência de Tipos de Coluna:
 * - Regra de Predominância Estrita (> 50%): Um tipo específico ('boolean', 'date', 'number')
 *   só é inferido para a coluna se representar estritamente mais de 50% dos valores não-vazios.
 * - Regra de Empate e Conflito (<= 50%): Em caso de empate (ex.: 50% número e 50% texto,
 *   ou 50% booleano e 50% número) ou ausência de maioria estrita, a coluna é inferida como 'string'.
 * - Valores nulos, vazios ou apenas com espaços em branco são desconsiderados no cômputo da porcentagem.
 * - Se todos os valores da coluna forem vazios/nulos, a coluna é classificada como 'string'.
 */
export const inferColumnType = (
  values: unknown[]
): 'string' | 'number' | 'date' | 'boolean' => {
  const nonEmpty = values.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  );
  if (nonEmpty.length === 0) {
    return 'string';
  }

  const boolCount = nonEmpty.filter(isBooleanVal).length;
  if (boolCount / nonEmpty.length > 0.5) return 'boolean';

  const dateCount = nonEmpty.filter(isDateVal).length;
  if (dateCount / nonEmpty.length > 0.5) return 'date';

  const numCount = nonEmpty.filter(isNumberVal).length;
  if (numCount / nonEmpty.length > 0.5) return 'number';

  return 'string';
};

export const normalizeCellValue = (
  v: unknown,
  type: DatasetColumn['type']
): DatasetCellValue => {
  if (v === null || v === undefined) {
    return null;
  }

  const rawStr = String(v).trim();
  if (rawStr === '') {
    return null;
  }

  if (type === 'number') {
    if (typeof v === 'number') {
      return Number.isFinite(v) ? v : null;
    }
    const s = rawStr.replace(',', '.');
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) {
      const num = Number(s);
      return Number.isFinite(num) ? num : null;
    }
    return null;
  }

  if (type === 'boolean') {
    if (typeof v === 'boolean') return v;
    const lower = rawStr.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    return null;
  }

  if (type === 'date') {
    if (v instanceof Date && !isNaN(v.getTime())) {
      return v.toISOString().split('T')[0];
    }
    if (isDateString(rawStr)) {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawStr)) {
        return rawStr.split('/').reverse().join('-');
      }
      return rawStr.split('T')[0];
    }
    return null;
  }

  return rawStr;
};

export const parseFile = async (file: File): Promise<Dataset> => {
  const fileName = file.name;
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  if (ext !== '.csv') {
    throw new Error(
      'Formato de arquivo não suportado. Por favor, selecione um arquivo .csv.'
    );
  }

  if (file.size === 0) {
    throw new Error('O arquivo selecionado está vazio.');
  }

  const rawRows = await new Promise<unknown[][]>((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: false,
      complete: (results) => {
        const fatalErrors = (results.errors || []).filter(
          (err) => err.code !== 'UndetectableDelimiter'
        );
        if (fatalErrors.length > 0) {
          reject(
            new Error(
              'Não foi possível ler o arquivo CSV. O arquivo parece estar corrompido ou mal formatado.'
            )
          );
          return;
        }
        resolve(results.data as unknown[][]);
      },
      error: () => {
        reject(
          new Error(
            'Não foi possível ler o arquivo CSV. O arquivo parece estar corrompido ou mal formatado.'
          )
        );
      },
    });
  });

  // Remove linhas em branco residuais no final do arquivo (típicas de quebras de linha finais)
  while (
    rawRows.length > 0 &&
    rawRows[rawRows.length - 1].every(
      (cell) => cell === null || cell === undefined || String(cell).trim() === ''
    )
  ) {
    rawRows.pop();
  }

  if (!rawRows || rawRows.length === 0) {
    throw new Error('O arquivo selecionado está vazio.');
  }

  const rawHeaders = rawRows[0].map((cell) => String(cell ?? ''));
  const deduplicatedHeaders = deduplicateHeaders(rawHeaders);
  const dataRows = rawRows.slice(1);

  if (dataRows.length === 0) {
    throw new Error('O arquivo CSV deve conter pelo menos uma linha de dados.');
  }

  const columns: DatasetColumn[] = deduplicatedHeaders.map((name, colIndex) => {
    const colValues = dataRows.map((row) => row[colIndex]);
    const type = inferColumnType(colValues);
    return { name, type };
  });

  const rows: DatasetRow[] = dataRows.map((row) => {
    const rowObj: DatasetRow = {};
    columns.forEach((col, colIndex) => {
      rowObj[col.name] = normalizeCellValue(row[colIndex], col.type);
    });
    return rowObj;
  });

  return {
    id: `dataset-${Date.now()}`,
    name: fileName,
    format: 'csv',
    columns,
    rows,
  };
};
