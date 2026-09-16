import os
import pandas as pd
from pandas import DataFrame


class CsvEntidade:
    def __init__(
        self,
        caminho_arquivo: str,
        delimitador: str = ",",
        encoding: str = "utf-8",
        permitir_coluna_unica: bool = False,
    ):
        self.caminho_arquivo: str = caminho_arquivo
        self.delimitador: str = delimitador
        self.encoding: str = encoding
        self.permitir_coluna_unica: bool = permitir_coluna_unica
        self.colunas: list = []
        self.tipo_de_dados: dict = {}
        self.numero_linhas: int = 0
        self.dados: DataFrame = None

    @classmethod
    def a_partir_de_dataframe(
        cls, df: DataFrame, permitir_coluna_unica: bool = True
    ) -> "CsvEntidade":
        """Cria e popula uma CsvEntidade diretamente a partir de um DataFrame em memória."""
        if df is None or df.empty:
            raise ValueError("O DataFrame informado está vazio ou é inválido.")

        instancia = cls(caminho_arquivo="", permitir_coluna_unica=permitir_coluna_unica)
        instancia.dados = df.copy()
        instancia.dados.columns = [str(c).strip() for c in instancia.dados.columns]
        instancia.colunas = list(instancia.dados.columns)
        instancia.tipo_de_dados = instancia._mapear_tipos()
        instancia.numero_linhas = len(instancia.dados)
        return instancia

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
        if not self.permitir_coluna_unica and len(self.dados.columns) == 1:
            raise ValueError(
                f"Apenas 1 coluna foi detectada com o delimitador '{self.delimitador}'. "
                f"Verifique se o delimitador está correto (ex: ',' ou ';')."
            )

    def _mapear_tipos(self) -> dict:
        """Converte os dtypes do pandas em categorias simples: numero, data, booleano, categoria."""
        tipos = {}
        for coluna in self.dados.columns:
            dtype = self.dados[coluna].dtype
            if pd.api.types.is_numeric_dtype(dtype):
                tipos[coluna] = "numero"
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                tipos[coluna] = "data"
            elif pd.api.types.is_bool_dtype(dtype):
                tipos[coluna] = "booleano"
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
