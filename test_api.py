from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


def test_upload_dataset_success():
    csv_content = "mes,vendas\nJaneiro,100\nFevereiro,200\n"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("test.csv", csv_content.encode("utf-8"), "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test.csv"
    assert len(data["columns"]) == 2
    assert len(data["rows"]) == 2


def test_upload_dataset_empty():
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("empty.csv", b"", "text/csv")},
    )
    assert response.status_code == 400


def test_generate_chart_bar_success():
    payload = {
        "tipo_grafico": "bar",
        "coluna_x": "mes",
        "colunas_y": ["vendas"],
        "titulo": "Vendas por Mês",
        "rows": [
            {"mes": "Jan", "vendas": 100},
            {"mes": "Fev", "vendas": 150},
        ],
    }
    response = client.post("/api/charts/generate", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert len(response.content) > 1000
    assert response.content[:8] == b"\x89PNG\r\n\x1a\n"


def test_generate_chart_line_success():
    payload = {
        "tipo_grafico": "line",
        "coluna_x": "mes",
        "colunas_y": ["vendas"],
        "titulo": "Linha Vendas",
        "rows": [
            {"mes": "Jan", "vendas": 100},
            {"mes": "Fev", "vendas": 150},
        ],
    }
    response = client.post("/api/charts/generate", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content[:8] == b"\x89PNG\r\n\x1a\n"


def test_generate_chart_pie_success():
    payload = {
        "tipo_grafico": "pie",
        "coluna_x": "categoria",
        "colunas_y": ["valor"],
        "titulo": "Pizza",
        "rows": [
            {"categoria": "A", "valor": 30},
            {"categoria": "B", "valor": 70},
        ],
    }
    response = client.post("/api/charts/generate", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content[:8] == b"\x89PNG\r\n\x1a\n"


def test_generate_chart_scatter_success():
    payload = {
        "tipo_grafico": "scatter",
        "coluna_x": "x",
        "colunas_y": ["y"],
        "titulo": "Dispersão",
        "rows": [
            {"x": 10, "y": 20},
            {"x": 15, "y": 25},
        ],
    }
    response = client.post("/api/charts/generate", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content[:8] == b"\x89PNG\r\n\x1a\n"


def test_generate_chart_empty_rows_error():
    payload = {
        "tipo_grafico": "bar",
        "coluna_x": "mes",
        "colunas_y": ["vendas"],
        "rows": [],
    }
    response = client.post("/api/charts/generate", json=payload)
    assert response.status_code == 400
    assert "linhas" in response.json()["detail"].lower()
