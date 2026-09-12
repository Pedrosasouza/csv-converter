import { describe, it, expect } from 'vitest';
import {
  parseFile,
  inferColumnType,
  deduplicateHeaders,
  normalizeCellValue,
} from '../services/fileParser';

describe('fileParser helper functions', () => {
  describe('deduplicateHeaders', () => {
    it('mantém cabeçalhos únicos inalterados após trim', () => {
      const headers = ['mes ', ' vendas', 'categoria'];
      expect(deduplicateHeaders(headers)).toEqual(['mes', 'vendas', 'categoria']);
    });

    it('atribui sufixo numérico incremental para cabeçalhos duplicados', () => {
      const headers = ['vendas', 'vendas', 'vendas'];
      expect(deduplicateHeaders(headers)).toEqual(['vendas', 'vendas_1', 'vendas_2']);
    });

    it('atribui nome padrão "coluna" se o cabeçalho for vazio', () => {
      const headers = ['', '  ', 'vendas'];
      expect(deduplicateHeaders(headers)).toEqual(['coluna', 'coluna_1', 'vendas']);
    });

    it('garante nomes únicos mesmo em colisões como valor, valor, valor_1', () => {
      const headers = ['valor', 'valor', 'valor_1'];
      const result = deduplicateHeaders(headers);

      expect(new Set(result).size).toBe(3);
      expect(result).not.toContain('');
      expect(result[0]).not.toBe(result[1]);
      expect(result[1]).not.toBe(result[2]);
      expect(result[0]).not.toBe(result[2]);
    });
  });

  describe('inferColumnType', () => {
    it('infere "number" quando todos os valores não-vazios são numéricos', () => {
      expect(inferColumnType(['10', '20.5', '-5', '  '])).toBe('number');
      expect(inferColumnType([10, 20, 30])).toBe('number');
    });

    it('infere "boolean" quando todos os valores não-vazios são booleanos', () => {
      expect(inferColumnType(['true', 'false', 'TRUE', ''])).toBe('boolean');
      expect(inferColumnType([true, false, true])).toBe('boolean');
    });

    it('infere "date" quando todos os valores não-vazios são datas civis válidas', () => {
      expect(inferColumnType(['2025-01-01', '2025-02-15T10:00:00Z', ''])).toBe('date');
      expect(inferColumnType(['01/05/2024', '15/12/2023'])).toBe('date');
      expect(inferColumnType(['29/02/2024'])).toBe('date');
    });

    it('NÃO infere "date" para datas civis inválidas como 31/02 ou anos não-bissextos', () => {
      expect(inferColumnType(['31/02/2026'])).toBe('string');
      expect(inferColumnType(['29/02/2023'])).toBe('string');
      expect(inferColumnType(['2026-02-31'])).toBe('string');
      expect(inferColumnType(['31/04/2026'])).toBe('string');
    });

    it('infere "number" quando há predominância estrita (> 50%) de valores numéricos, tolerando valores inválidos', () => {
      // 2 números de 3 não-vazios = 66.7% (> 50%)
      expect(inferColumnType(['20', '', 'abc', '35'])).toBe('number');
      // 3 números de 4 não-vazios = 75% (> 50%)
      expect(inferColumnType(['10', '20', '30', 'invalido'])).toBe('number');
    });

    it('infere "string" em caso de empate (exatamente 50% numérico) ou predominância não atingida (<= 50%)', () => {
      // Empate 50% número / 50% texto (1 vs 1) -> 'string'
      expect(inferColumnType(['10', 'texto'])).toBe('string');
      // Empate 50% número / 50% texto (2 vs 2) -> 'string'
      expect(inferColumnType(['10', '20', 'texto1', 'texto2'])).toBe('string');
      // Empate 50% número / 50% booleano (1 vs 1) -> 'string'
      expect(inferColumnType(['true', '123'])).toBe('string');
    });

    it('infere "string" quando textos são predominantes (< 50% números)', () => {
      expect(inferColumnType(['10', 'texto', 'outro_texto'])).toBe('string');
    });

    it('infere "string" quando todos os valores são vazios', () => {
      expect(inferColumnType(['', '   ', null, undefined])).toBe('string');
    });
  });

  describe('normalizeCellValue', () => {
    describe('colunas do tipo number', () => {
      it('converte strings numéricas válidas para number', () => {
        expect(normalizeCellValue('150', 'number')).toBe(150);
        expect(normalizeCellValue(' 20.5 ', 'number')).toBe(20.5);
        expect(normalizeCellValue('30,5', 'number')).toBe(30.5);
        expect(normalizeCellValue(-42, 'number')).toBe(-42);
      });

      it('converte strings não numéricas, vazios, NaN ou Infinity para null', () => {
        expect(normalizeCellValue('abc', 'number')).toBeNull();
        expect(normalizeCellValue('', 'number')).toBeNull();
        expect(normalizeCellValue('   ', 'number')).toBeNull();
        expect(normalizeCellValue(null, 'number')).toBeNull();
        expect(normalizeCellValue(undefined, 'number')).toBeNull();
        expect(normalizeCellValue(NaN, 'number')).toBeNull();
        expect(normalizeCellValue(Infinity, 'number')).toBeNull();
      });
    });

    describe('colunas do tipo boolean', () => {
      it('converte strings booleanas para booleano nativo', () => {
        expect(normalizeCellValue('true', 'boolean')).toBe(true);
        expect(normalizeCellValue('TRUE', 'boolean')).toBe(true);
        expect(normalizeCellValue('false', 'boolean')).toBe(false);
        expect(normalizeCellValue('FALSE', 'boolean')).toBe(false);
        expect(normalizeCellValue(true, 'boolean')).toBe(true);
      });

      it('converte valores inválidos ou vazios para null', () => {
        expect(normalizeCellValue('abc', 'boolean')).toBeNull();
        expect(normalizeCellValue('', 'boolean')).toBeNull();
        expect(normalizeCellValue('   ', 'boolean')).toBeNull();
      });
    });

    describe('colunas do tipo date', () => {
      it('normaliza datas válidas para formato ISO (YYYY-MM-DD)', () => {
        expect(normalizeCellValue('2025-01-15', 'date')).toBe('2025-01-15');
        expect(normalizeCellValue('2025-01-15T14:30:00Z', 'date')).toBe('2025-01-15');
        expect(normalizeCellValue('15/01/2025', 'date')).toBe('2025-01-15');
      });

      it('converte datas impossíveis ou inválidas para null', () => {
        expect(normalizeCellValue('31/02/2026', 'date')).toBeNull();
        expect(normalizeCellValue('2026-99-99', 'date')).toBeNull();
        expect(normalizeCellValue('data_invalida', 'date')).toBeNull();
        expect(normalizeCellValue('', 'date')).toBeNull();
      });
    });

    describe('colunas do tipo string', () => {
      it('aplica trim() em strings válidas', () => {
        expect(normalizeCellValue('Pedro', 'string')).toBe('Pedro');
        expect(normalizeCellValue('  Pedro  ', 'string')).toBe('Pedro');
      });

      it('converte strings vazias ou com apenas espaços para null', () => {
        expect(normalizeCellValue('', 'string')).toBeNull();
        expect(normalizeCellValue('   ', 'string')).toBeNull();
        expect(normalizeCellValue(null, 'string')).toBeNull();
      });
    });
  });

  describe('parseFile (CSV)', () => {
    it('rejeita arquivo com extensão diferente de .csv', async () => {
      const file = new File(['conteudo'], 'dados.txt', { type: 'text/plain' });
      await expect(parseFile(file)).rejects.toThrow(
        /Formato de arquivo não suportado/i
      );
    });

    it('rejeita arquivo com tamanho zero (vazio)', async () => {
      const file = new File([], 'dados.csv', { type: 'text/csv' });
      await expect(parseFile(file)).rejects.toThrow(/O arquivo selecionado está vazio/i);
    });

    it('rejeita CSV que contém apenas cabeçalho e nenhuma linha de dados', async () => {
      const file = new File(['mes,vendas\n'], 'somente_cabecalho.csv', { type: 'text/csv' });
      await expect(parseFile(file)).rejects.toThrow(
        /O arquivo CSV deve conter pelo menos uma linha de dados/i
      );
    });

    it('rejeita CSV com erro estrutural de parsing (ex: aspas não fechadas)', async () => {
      const malformedContent = 'mes,vendas\n"Janeiro,100\nFevereiro,200';
      const file = new File([malformedContent], 'malformado.csv', { type: 'text/csv' });

      await expect(parseFile(file)).rejects.toThrow(
        /Não foi possível ler o arquivo CSV/i
      );
    });

    it('faz parse com sucesso de um arquivo CSV válido e normaliza células', async () => {
      const csvContent = 'mes,vendas,ativo\n Janeiro ,100,true\nFevereiro,,false';
      const file = new File([csvContent], 'relatorio.csv', { type: 'text/csv' });

      const dataset = await parseFile(file);

      expect(dataset.name).toBe('relatorio.csv');
      expect(dataset.format).toBe('csv');
      expect(dataset.columns).toEqual([
        { name: 'mes', type: 'string' },
        { name: 'vendas', type: 'number' },
        { name: 'ativo', type: 'boolean' },
      ]);
      expect(dataset.rows).toEqual([
        { mes: 'Janeiro', vendas: 100, ativo: true },
        { mes: 'Fevereiro', vendas: null, ativo: false },
      ]);
    });

    it('faz parse com sucesso de um CSV com uma única coluna (sem coluna numérica para Y)', async () => {
      const csvContent = 'mes\nJaneiro\nFevereiro\nMarço';
      const file = new File([csvContent], 'unica_coluna.csv', { type: 'text/csv' });

      const dataset = await parseFile(file);

      expect(dataset.columns).toEqual([{ name: 'mes', type: 'string' }]);
      expect(dataset.rows).toEqual([
        { mes: 'Janeiro' },
        { mes: 'Fevereiro' },
        { mes: 'Março' },
      ]);
    });

    it('mantém o tipo "number" e normaliza valores ausentes para null em coluna numérica (null intercalado)', async () => {
      const csvContent = 'valor\n100\n\n150';
      const file = new File([csvContent], 'null_intercalado.csv', { type: 'text/csv' });

      const dataset = await parseFile(file);

      expect(dataset.columns).toEqual([{ name: 'valor', type: 'number' }]);
      expect(dataset.rows).toEqual([
        { valor: 100 },
        { valor: null },
        { valor: 150 },
      ]);
    });

    it('infere "number" e normaliza valores ausentes e inválidos para null em coluna com sujeira/inválidos', async () => {
      const csvContent = 'idade\n20\n\nabc\n35';
      const file = new File([csvContent], 'idade_invalida.csv', { type: 'text/csv' });

      const dataset = await parseFile(file);

      expect(dataset.columns).toEqual([{ name: 'idade', type: 'number' }]);
      expect(dataset.rows).toEqual([
        { idade: 20 },
        { idade: null },
        { idade: null },
        { idade: 35 },
      ]);
    });

    it('classifica coluna como "string" em caso de empate (50% número, 50% texto) no CSV completo', async () => {
      const csvContent = 'codigo\n100\nABC\n200\nXYZ';
      const file = new File([csvContent], 'empate.csv', { type: 'text/csv' });

      const dataset = await parseFile(file);

      expect(dataset.columns).toEqual([{ name: 'codigo', type: 'string' }]);
      expect(dataset.rows).toEqual([
        { codigo: '100' },
        { codigo: 'ABC' },
        { codigo: '200' },
        { codigo: 'XYZ' },
      ]);
    });

    it('processa carga de 5.000 linhas com integridade estrutural e normalização correta', async () => {
      const lines = ['id,valor,status'];
      for (let i = 1; i <= 5000; i++) {
        lines.push(`${i},${i * 1.5},true`);
      }
      const file = new File([lines.join('\n')], 'carga_5000.csv', { type: 'text/csv' });

      const dataset = await parseFile(file);

      expect(dataset.rows.length).toBe(5000);
      expect(dataset.columns).toEqual([
        { name: 'id', type: 'number' },
        { name: 'valor', type: 'number' },
        { name: 'status', type: 'boolean' },
      ]);
      expect(dataset.rows[0]).toEqual({ id: 1, valor: 1.5, status: true });
      expect(dataset.rows[4999]).toEqual({ id: 5000, valor: 7500, status: true });
    });
  });
});
