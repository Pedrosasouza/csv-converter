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
    <section aria-label="Upload de Arquivo" style={{ marginBottom: '1.5rem' }}>
      <h2>Importar Arquivo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
        <label htmlFor="file-upload-input" style={{ fontWeight: 'bold' }}>
          Carregar arquivo CSV (.csv)
        </label>
        <input
          id="file-upload-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading && <p>Processando arquivo...</p>}
        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>
    </section>
  );
};
