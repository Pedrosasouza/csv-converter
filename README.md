# CSV Chart Generator

Ferramenta web para transformar arquivos CSV em gráficos interativos — sem configuração, sem instalação para o usuário final.

Você arrasta um CSV, escolhe os eixos e o tipo de gráfico, e exporta a imagem gerada pelo backend em Python.

---

## O que foi construído

- **Upload e parsing inteligente de CSV** com detecção automática de delimitador (`,`, `;`, `\t`) e inferência de tipo de coluna (número, data, categoria, booleano)
- **Dashboard de configuração de gráficos** com seleção de eixos X/Y e tipo de gráfico (barra, linha, dispersão), construído em React + Recharts
- **Geração e exportação de gráficos em PNG** renderizados no servidor via Matplotlib, retornados como arquivo para download direto
- **API REST com FastAPI** que expõe os endpoints `/api/datasets/upload` e `/api/charts/generate`, com validação de entrada e tratamento de erros
- **Domínio separado do transporte** — `CsvEntidade` e `GerarGraficoUseCase` encapsulam a lógica de negócio independente do FastAPI
- **Suíte de testes** com Vitest (frontend) e Pytest (backend), cobrindo componentes React, serviços TypeScript e a API Python

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Recharts |
| Backend | Python + FastAPI + Pandas + Matplotlib |
| Testes | Vitest + Testing Library · Pytest |

---

## Como rodar localmente

### Pré-requisitos

- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

API disponível em `http://localhost:8000`.

### 2. Frontend

```bash
npm install
npm run dev
```

Interface disponível em `http://localhost:5173`.

> O frontend usa proxy do Vite para redirecionar `/api/*` ao backend na porta 8000.

---

## Testes

```bash
# Frontend
npm test

# Backend
python -m pytest test_api.py
```

---

## Estrutura do projeto

```
├── api.py                  # Endpoints FastAPI
├── domain/
│   ├── entities/
│   │   ├── csv.py          # Entidade CsvEntidade (parse e tipagem)
│   │   └── grafico.py      # Entidade de gráfico
│   └── casos_de_uso/
│       └── gerar_grafico_usecase.py  # Geração de PNG via Matplotlib
├── src/
│   ├── components/         # FileUpload, ChartConfigurator, ChartPreview, etc.
│   ├── services/           # chartService.ts, datasetService.ts
│   ├── models/             # Tipos TypeScript (Dataset, ChartConfig)
│   └── tests/              # Testes de componentes e serviços
└── samples/                # CSVs de exemplo para testar
```
