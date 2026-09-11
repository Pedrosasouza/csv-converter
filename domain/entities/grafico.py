import matplotlib.pyplot as plt
from domain.entities.csv import CsvEntidade

TIPOS_SUPORTADOS = {"line", "bar", "scatter", "hist", "pie"}


class Grafico:
    def __init__(
        self,
        tipo_grafico: str,
        coluna_x: str,
        colunas_y: list,
        titulo: str = "Gráfico",
        cores: list = None,
        legenda: bool = True,
        rotulo_x: str = "",
        rotulo_y: str = "",
        caminho_saida: str = "grafico.png",
    ):
        self.tipo_grafico: str = tipo_grafico
        self.titulo: str = titulo
        self.coluna_x: str = coluna_x
        self.colunas_y: list = colunas_y
        self.cores: list = cores or []
        self.legenda: bool = legenda
        self.rotulo_x: str = rotulo_x
        self.rotulo_y: str = rotulo_y
        self.caminho_saida: str = caminho_saida

    def validar(self, csv: CsvEntidade):
        """Confere se essa configuração de gráfico faz sentido para o CSV informado."""
        if csv.dados is None:
            raise ValueError(
                "O CsvEntidade precisa estar carregado (carregar()) antes de validar.")

        if self.tipo_grafico not in TIPOS_SUPORTADOS:
            raise ValueError(
                f"Tipo de gráfico '{self.tipo_grafico}' não suportado. "
                f"Use um de: {', '.join(TIPOS_SUPORTADOS)}"
            )

        if self.tipo_grafico == "pie" and len(self.colunas_y) > 1:
            raise ValueError(
                "Gráfico do tipo 'pie' aceita apenas uma coluna em colunas_y.")

        if not self.colunas_y:
            raise ValueError("Informe ao menos uma coluna em colunas_y.")

        colunas_referenciadas = [self.coluna_x] + self.colunas_y
        for coluna in colunas_referenciadas:
            if coluna not in csv.colunas:
                raise ValueError(
                    f"Coluna '{coluna}' não existe no CSV. Colunas disponíveis: {csv.colunas}"
                )

        for coluna in self.colunas_y:
            if csv.tipo_de_dados[coluna] != "numero":
                raise ValueError(
                    f"Coluna '{coluna}' não é numérica (tipo detectado: "
                    f"'{csv.tipo_de_dados[coluna]}'). colunas_y precisa ser numérica."
                )

        if self.cores and len(self.cores) != len(self.colunas_y):
            raise ValueError(
                f"Quantidade de cores ({len(self.cores)}) diferente da quantidade "
                f"de colunas_y ({len(self.colunas_y)})."
            )

    def renderizar(self, csv: CsvEntidade) -> plt.Figure:
        """Gera a figura do gráfico a partir dos dados do CsvEntidade."""
        self.validar(csv)
        df = csv.dados

        fig, ax = plt.subplots(figsize=(8, 5))
        cores = self.cores or plt.rcParams["axes.prop_cycle"].by_key()["color"]

        if self.tipo_grafico == "pie":
            ax.pie(df[self.colunas_y[0]],
                   labels=df[self.coluna_x], autopct="%1.1f%%")
        else:
            for i, coluna_y in enumerate(self.colunas_y):
                cor = cores[i % len(cores)]
                if self.tipo_grafico == "line":
                    ax.plot(df[self.coluna_x], df[coluna_y],
                            label=coluna_y, color=cor, marker="o")
                elif self.tipo_grafico == "bar":
                    largura = 0.8 / len(self.colunas_y)
                    posicoes = range(len(df[self.coluna_x]))
                    deslocamento = [p + i * largura for p in posicoes]
                    ax.bar(deslocamento, df[coluna_y],
                           width=largura, label=coluna_y, color=cor)
                    ax.set_xticks(
                        [p + largura * (len(self.colunas_y) - 1) / 2 for p in posicoes])
                    ax.set_xticklabels(df[self.coluna_x])
                elif self.tipo_grafico == "scatter":
                    ax.scatter(df[self.coluna_x], df[coluna_y],
                               label=coluna_y, color=cor)
                elif self.tipo_grafico == "hist":
                    ax.hist(df[coluna_y], label=coluna_y,
                            color=cor, alpha=0.7, bins=20)

            ax.set_xlabel(self.rotulo_x or self.coluna_x)
            ax.set_ylabel(self.rotulo_y or ", ".join(self.colunas_y))
            if self.legenda:
                ax.legend()

        ax.set_title(self.titulo)
        fig.tight_layout()
        return fig

    def salvar(self, fig: plt.Figure) -> str:
        fig.savefig(self.caminho_saida, dpi=150)
        return self.caminho_saida

    def __repr__(self):
        return (
            f"Grafico(tipo='{self.tipo_grafico}', x='{self.coluna_x}', "
            f"y={self.colunas_y}, saida='{self.caminho_saida}')"
        )
