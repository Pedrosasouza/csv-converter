import os
import tempfile
import time
from typing import Optional

import matplotlib
matplotlib.use("Agg")

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from pydantic import BaseModel

from domain.entities.csv import CsvEntidade
from domain.casos_de_uso.gerar_grafico_usecase import GerarGraficoUseCase

app = FastAPI(title="CSV Converter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TYPE_MAP = {
    "numero": "number",
    "data": "date",
    "booleano": "boolean",
    "categoria": "string",
}


def detect_delimiter(sample_text: str, default_delimiter: str = ",") -> str:
    """Tenta detectar automaticamente o delimitador entre vírgula e ponto-e-vírgula."""
    if not sample_text:
        return default_delimiter
    first_line = sample_text.splitlines()[0] if sample_text.splitlines() else sample_text
    comma_count = first_line.count(",")
    semicolon_count = first_line.count(";")
    tab_count = first_line.count("\t")

    if semicolon_count > comma_count and semicolon_count > tab_count:
        return ";"
    if tab_count > comma_count and tab_count > semicolon_count:
        return "\t"
    return default_delimiter


@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    delimitador: Optional[str] = Form(None),
    encoding: Optional[str] = Form("utf-8"),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Formato de arquivo não suportado. Por favor, selecione um arquivo .csv.",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="O arquivo selecionado está vazio.",
        )

    enc = encoding or "utf-8"
    chosen_delimiter = delimitador
    if not chosen_delimiter:
        try:
            sample_str = content[:4096].decode(enc, errors="ignore")
            chosen_delimiter = detect_delimiter(sample_str)
        except Exception:
            chosen_delimiter = ","

    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"upload_{time.time()}_{file.filename}")
    try:
        with open(temp_path, "wb") as f:
            f.write(content)

        try:
            csv_entity = CsvEntidade(
                caminho_arquivo=temp_path,
                delimitador=chosen_delimiter,
                encoding=enc,
                permitir_coluna_unica=True,
            )
            csv_entity.carregar()
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Não foi possível processar o arquivo CSV: {str(e)}",
            )

        if csv_entity.numero_linhas == 0:
            raise HTTPException(
                status_code=400,
                detail="O arquivo CSV deve conter pelo menos uma linha de dados.",
            )

        columns = [
            {
                "name": col,
                "type": TYPE_MAP.get(csv_entity.tipo_de_dados.get(col), "string"),
            }
            for col in csv_entity.colunas
        ]

        df_clean = csv_entity.dados.replace(
            {np.nan: None, np.inf: None, -np.inf: None}
        )
        df_clean = df_clean.where(pd.notnull(df_clean), None)
        rows = df_clean.to_dict(orient="records")

        # Assegura que nenhum valor float('nan') escape
        for row in rows:
            for k, v in row.items():
                if pd.isna(v) or v is np.nan:
                    row[k] = None

        return {
            "id": f"dataset-{int(time.time() * 1000)}",
            "name": file.filename,
            "format": "csv",
            "columns": columns,
            "rows": rows,
        }
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


class GenerateChartRequest(BaseModel):
    tipo_grafico: str
    coluna_x: str
    colunas_y: list[str]
    titulo: Optional[str] = "Gráfico"
    rows: list[dict]


@app.post("/api/charts/generate")
async def generate_chart(req: GenerateChartRequest):
    if not req.rows:
        raise HTTPException(
            status_code=400,
            detail="O dataset não possui linhas para gerar o gráfico.",
        )
    if not req.coluna_x:
        raise HTTPException(
            status_code=400,
            detail="Coluna do eixo X não informada.",
        )
    if not req.colunas_y:
        raise HTTPException(
            status_code=400,
            detail="Coluna(s) do eixo Y não informada(s).",
        )

    temp_dir = tempfile.gettempdir()
    unique_id = f"{time.time()}_{os.getpid()}"
    temp_csv = os.path.join(temp_dir, f"chart_input_{unique_id}.csv")
    temp_png = os.path.join(temp_dir, f"chart_output_{unique_id}.png")

    try:
        df = pd.DataFrame(req.rows)
        df.to_csv(temp_csv, index=False)

        usecase = GerarGraficoUseCase.a_partir_de_arquivo(
            caminho_csv=temp_csv,
            tipo_grafico=req.tipo_grafico,
            coluna_x=req.coluna_x,
            colunas_y=req.colunas_y,
            titulo=req.titulo or "Gráfico",
            caminho_saida=temp_png,
        )
        usecase.executar()

        if not os.path.exists(temp_png):
            raise HTTPException(
                status_code=500,
                detail="Erro ao gerar a imagem do gráfico.",
            )

        with open(temp_png, "rb") as f:
            png_bytes = f.read()

        return Response(
            content=png_bytes,
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="{req.tipo_grafico}_grafico.png"'
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao renderizar gráfico: {str(e)}",
        )
    finally:
        for path in [temp_csv, temp_png]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass

