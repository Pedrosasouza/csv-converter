# CSV Chart Generator

Ferramenta web para transformar arquivos CSV em gráficos e visualizações. O usuário importa um arquivo, escolhe os eixos e o tipo de gráfico e pode exportar o resultado em PNG.

## Funcionalidades

* **Importação de CSV** com detecção automática de delimitador (`,`, `;`, `\t`)
* **Inferência de tipos de coluna**, identificando números, datas, categorias e valores booleanos
* **Configuração de gráficos** com seleção dos eixos X e Y
* **Visualização interativa** no frontend usando Recharts
* **Geração de PNG** no backend usando Matplotlib
* **API REST** desenvolvida com FastAPI
* **Validação de dados e tratamento de erros**
* **Testes automatizados** no frontend e backend

## Como funciona

O processamento é dividido entre frontend e backend.

1. O usuário importa um arquivo CSV pelo frontend.
2. O CSV é analisado e suas colunas são identificadas e tipadas.
3. O usuário escolhe os eixos e o tipo de gráfico.
4. O gráfico é exibido de forma interativa usando **Recharts**.
5. Ao exportar, a configuração é enviada para a API.
6. O backend processa os dados com **Pandas** e gera o PNG com **Matplotlib**.
7. O arquivo gerado é retornado para download.

## Arquitetura

A lógica de negócio fica separada da camada HTTP. As entidades e casos de uso não dependem diretamente do FastAPI.

```text
CSV
 │
 ▼
Frontend — React + TypeScript
 │
 ├── Parsing e tipagem
 ├── Configuração do gráfico
 └── Preview interativo — Recharts
 │
 ▼
FastAPI
 │
 ▼
Domínio
 │
 ├── CsvEntidade
 └── GerarGraficoUseCase
 │
 ▼
Pandas + Matplotlib
 │
 ▼
PNG
```

## API

A aplicação possui dois endpoints principais:

| Endpoint               | Método | Função                  |
| ---------------------- | ------ | ----------------------- |
| `/api/datasets/upload` | POST   | Recebe e processa o CSV |
| `/api/charts/generate` | POST   | Gera o gráfico em PNG   |

A API também realiza validação das entradas e retorna erros quando os dados ou configurações fornecidos são inválidos.

## Stack

| Camada   | Tecnologias                                            |
| -------- | ------------------------------------------------------ |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · Recharts |
| Backend  | Python · FastAPI · Pandas · Matplotlib                 |
| Testes   | Vitest · Testing Library · Pytest                      |

## Como rodar localmente

### Pré-requisitos

* Python 3.10+
* Node.js 18+

### Backend

Instale as dependências:

```bash
pip install -r requirements.txt
```

Inicie a API:

```bash
uvicorn api:app --reload --port 8000
```

O backend ficará disponível em:

```text
http://localhost:8000
```

### Frontend

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A interface ficará disponível em:

```text
http://localhost:5173
```

O Vite utiliza um proxy para encaminhar as requisições `/api/*` para o backend na porta 8000.

## Testes

### Frontend

```bash
npm test
```

### Backend

```bash
python -m pytest test_api.py
```

## Estrutura do projeto

```text
├── api.py
├── domain/
│   ├── entities/
│   │   ├── csv.py
│   │   └── grafico.py
│   └── casos_de_uso/
│       └── gerar_grafico_usecase.py
├── src/
│   ├── components/
│   │   ├── FileUpload
│   │   ├── ChartConfigurator
│   │   └── ChartPreview
│   ├── services/
│   │   ├── chartService.ts
│   │   └── datasetService.ts
│   ├── models/
│   │   ├── Dataset
│   │   └── ChartConfig
│   └── tests/
└── samples/
```

## Tecnologias

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Python
* FastAPI
* Pandas
* Matplotlib
* Vitest
* Testing Library
* Pytest
