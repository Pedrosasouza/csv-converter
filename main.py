import argparse
from domain.casos_de_uso.gerar_grafico_usecase import GerarGraficoUseCase


def parse_args():
    parser = argparse.ArgumentParser(
        description="Gera um gráfico a partir de um arquivo CSV."
    )
    parser.add_argument("--csv", required=True, help="Caminho do arquivo CSV")
    parser.add_argument("--delimitador", default=",",
                        help="Delimitador do CSV (padrão: ',')")
    parser.add_argument("--encoding", default="utf-8",
                        help="Encoding do arquivo (padrão: utf-8)")
    parser.add_argument(
        "--tipo", default="bar", choices=["line", "bar", "scatter", "hist", "pie"],
        help="Tipo de gráfico"
    )
    parser.add_argument("--x", required=True, help="Nome da coluna do eixo X")
    parser.add_argument(
        "--y", required=True, nargs="+", help="Nome(s) da(s) coluna(s) do eixo Y (uma ou mais)"
    )
    parser.add_argument("--titulo", default="Gráfico",
                        help="Título do gráfico")
    parser.add_argument("--saida", default="grafico.png",
                        help="Caminho do arquivo de saída")
    return parser.parse_args()


def main():
    args = parse_args()

    caso_de_uso = GerarGraficoUseCase.a_partir_de_arquivo(
        caminho_csv=args.csv,
        delimitador=args.delimitador,
        encoding=args.encoding,
        tipo_grafico=args.tipo,
        coluna_x=args.x,
        colunas_y=args.y,
        titulo=args.titulo,
        caminho_saida=args.saida,
    )

    try:
        caminho_gerado = caso_de_uso.executar()
        print(f"Gráfico gerado com sucesso em: {caminho_gerado}")
    except (ValueError, FileNotFoundError) as e:
        print(f"Erro ao gerar o gráfico: {e}")


if __name__ == "__main__":
    main()
