# CSV Converter

Como executar o projeto localmente:

## 1. Backend (Python)

Em um terminal, instale as dependências e inicie o servidor:

```bash
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

O backend estará ativo em `http://localhost:8000`.

---

## 2. Frontend (React)

Em outro terminal, instale os pacotes e inicie a aplicação:

```bash
npm install
npm run dev
```

Acesse a interface no navegador em `http://localhost:5173`.

---

## Testes

Para rodar os testes automatizados do frontend e backend:

```bash
# Frontend (Vitest)
npm test

# Backend (Pytest)
python -m pytest test_api.py
```
