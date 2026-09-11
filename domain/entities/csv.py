import os
import pandas as pd
from pandas import DataFrame


class CsvEntidade:
    def __init__(self, caminho_arquivo: str, delimitador: str = ",", encoding: str = "utf-8"):
        self.caminho_arquivo: str = caminho_arquivo
        self.delimitador: str = delimitador
        self.encoding: str = encoding
        self.colunas: list = []
        self.tipo_de_dados: dict = {}
        self.numero_linhas: int = 0
        self.dados: DataFrame = None

    def carregar(self) -> "CsvEntidade":
        """Lê o CSV do disco, valida e popula os atributos derivados."""
        self._validar_arquivo()

        try:
            self.dados = pd.read_csv(
                self.caminho_arquivo,
                delimiter=self.delimitador,
                encoding=self.encoding,
            )
        except UnicodeDecodeError:
            raise ValueError(
                f"Não foi possível ler o arquivo com encoding '{self.encoding}'. "
                f"Tente outro encoding, ex: 'latin-1'."
            )
        except pd.errors.EmptyDataError:
            raise ValueError(f"O arquivo '{self.caminho_arquivo}' está vazio.")
        except pd.errors.ParserError as e:
            raise ValueError(
                f"Erro ao interpretar o CSV. Verifique se o delimitador '{self.delimitador}' "
                f"está correto. Detalhe: {e}"
            )

        self._validar_delimitador()

        self.dados.columns = [str(c).strip() for c in self.dados.columns]
        self.colunas = list(self.dados.columns)
        self.tipo_de_dados = self._mapear_tipos()
        self.numero_linhas = len(self.dados)
        return self

    def _validar_arquivo(self):
        if not os.path.exists(self.caminho_arquivo):
            raise FileNotFoundError(
                f"Arquivo não encontrado: '{self.caminho_arquivo}'")
        if not self.caminho_arquivo.lower().endswith(".csv"):
            raise ValueError(
                f"O arquivo precisa ter extensão .csv: '{self.caminho_arquivo}'")
        if os.path.getsize(self.caminho_arquivo) == 0:
            raise ValueError(f"O arquivo '{self.caminho_arquivo}' está vazio.")

    def _validar_delimitador(self):
        """Se o delimitador estiver errado, o pandas costuma jogar tudo numa única coluna."""
        if len(self.dados.columns) == 1:
            raise ValueError(
                f"Apenas 1 coluna foi detectada com o delimitador '{self.delimitador}'. "
                f"Verifique se o delimitador está correto (ex: ',' ou ';')."
            )

    def _mapear_tipos(self) -> dict:
        """Converte os dtypes do pandas em categorias simples: numero, data, categoria."""
        tipos = {}
        for coluna in self.dados.columns:
            dtype = self.dados[coluna].dtype
            if pd.api.types.is_numeric_dtype(dtype):
                tipos[coluna] = "numero"
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                tipos[coluna] = "data"
            else:
                tipos[coluna] = "categoria"
        return tipos

    def preview(self, n: int = 5) -> DataFrame:
        if self.dados is None:
            raise ValueError(
                "CSV ainda não foi carregado. Chame carregar() primeiro.")
        return self.dados.head(n)

    def __repr__(self):
        return (
            f"CsvEntidade(arquivo='{self.caminho_arquivo}', "
            f"linhas={self.numero_linhas}, colunas={self.colunas})"
        )
