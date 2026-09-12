import React, { useState } from 'react';
import { Dataset } from '../models/dataset';
import { uploadDataset } from '../services/datasetService';

export interface FileUploadProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  onError?: (errorMessage: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onDatasetLoaded,
  onError,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validação síncrona de extensão (restrita a .csv)
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.csv') {
      const msg =
        'Formato de arquivo não suportado. Por favor, selecione um arquivo .csv.';
      setErrorMessage(msg);
      if (onError) onError(msg);
      e.target.value = '';
      return;
    }

    if (file.size === 0) {
      const msg = 'O arquivo selecionado está vazio.';
      setErrorMessage(msg);
      if (onError) onError(msg);
      e.target.value = '';
      return;
    }

    setIsLoading(true);

    try {
      const dataset = await uploadDataset(file);
      onDatasetLoaded(dataset);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro desconhecido ao processar o arquivo.';
      setErrorMessage(msg);
      if (onError) {
        onError(msg);
      }
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return (
    <section
      aria-label="Upload de Arquivo"
      className="bg-white rounded-xl border border-[#d8dae7] shadow-2xs p-5 space-y-3"
    >
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#ebecf2]">
        <svg
          className="w-4 h-4 text-[#495084]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h2 className="text-sm font-bold text-[#1c1e2c] tracking-tight">
          Importar Arquivo
        </h2>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="file-upload-input"
          className="block text-xs font-semibold text-[#323a5a] uppercase tracking-wider cursor-pointer"
        >
          Carregar arquivo CSV (.csv)
        </label>

        <div className="relative group border-2 border-dashed border-[#d8dae7] hover:border-[#5862a5] rounded-lg p-4 text-center transition-all bg-[#f6f8fa] hover:bg-[#ebecf2]/50">
          <input
            id="file-upload-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <svg
              className="w-6 h-6 text-[#7881bb] group-hover:text-[#5862a5] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-xs font-medium text-[#323a5a] group-hover:text-[#1c1e2c]">
              Arraste ou <span className="text-[#5862a5] font-bold">clique para selecionar</span>
            </p>
            <p className="text-[11px] text-[#414873]">Somente arquivos .csv</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 p-2.5 bg-[#ebecf2] border border-[#d8dae7] rounded-lg text-xs font-medium text-[#323a5a]">
            <svg
              className="animate-spin h-3.5 w-3.5 text-[#5862a5]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p>Processando arquivo...</p>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-200/80 rounded-lg text-xs text-red-700 leading-relaxed font-medium"
          >
            <svg
              className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
};
