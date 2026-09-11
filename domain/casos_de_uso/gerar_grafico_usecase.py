import matplotlib.pyplot as plt
from domain.entities.csv import CsvEntidade
from domain.entities.grafico import Grafico


class GerarGraficoUseCase:
    """
    Caso de uso: gerar um gráfico a partir de um arquivo CSV.

    Orquestra as entidades CsvEntidade e Grafico, mas não é,
    em si, um conceito do domínio — representa uma AÇÃO do sistema.
    """

    def __init__(self, csv: CsvEntidade, grafico: Grafico):
        self.csv = csv
        self.grafico = grafico
        self.figura: plt.Figure = None

    @classmethod
    def a_partir_de_arquivo(
        cls,
        caminho_csv: str,
        tipo_grafico: str,
        coluna_x: str,
        colunas_y: list,
        delimitador: str = ",",
        encoding: str = "utf-8",
        titulo: str = "Gráfico",
        cores: list = None,
        legenda: bool = True,
        rotulo_x: str = "",
        rotulo_y: str = "",
        caminho_saida: str = "grafico.png",
    ) -> "GerarGraficoUseCase":
        """Atalho para montar CsvEntidade + Grafico e devolver o caso de uso pronto."""
        csv = CsvEntidade(
            caminho_csv, delimitador=delimitador, encoding=encoding)
        grafico = Grafico(
            tipo_grafico=tipo_grafico,
            coluna_x=coluna_x,
            colunas_y=colunas_y,
            titulo=titulo,
            cores=cores,
            legenda=legenda,
            rotulo_x=rotulo_x,
            rotulo_y=rotulo_y,
            caminho_saida=caminho_saida,
        )
        return cls(csv, grafico)

    def executar(self) -> str:
        """Roda o fluxo completo: carregar CSV -> validar -> renderizar -> salvar."""
        if self.csv.dados is None:
            self.csv.carregar()

        self.figura = self.grafico.renderizar(self.csv)
        caminho = self.grafico.salvar(self.figura)
        plt.close(self.figura)
        return caminho

    def __repr__(self):
        return f"GerarGraficoUseCase(csv={self.csv!r}, grafico={self.grafico!r})"
