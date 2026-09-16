# AGENTS.md

## Objetivo e prioridade

Este documento define as regras para agentes de IA que trabalham neste repositório.

O objetivo é produzir alterações **corretas, pequenas, compreensíveis, sustentáveis e compatíveis com o projeto existente**, evitando alterações desnecessárias, suposições e scope creep.

### Ordem de prioridade

Quando houver conflito entre regras, siga esta ordem:

1. **Correção funcional**
2. **Segurança**
3. **Arquitetura e compatibilidade**
4. **Legibilidade e manutenção**
5. **Testabilidade**
6. **Custo e eficiência**

Não sacrifique correção ou segurança para reduzir tempo, contexto ou quantidade de alterações.

### Precedência do usuário

A hierarquia acima define o comportamento padrão na ausência de instrução explícita.

Se o usuário solicitar explicitamente uma alteração que conflite com uma prioridade inferior (ex.: legibilidade, arquitetura, custo), o agente pode segui-la, desde que:

- informe brevemente o trade-off envolvido;
- não comprometa correção funcional ou segurança sem autorização explícita e informada para o risco específico.

Correção funcional e segurança nunca são sacrificadas silenciosamente, mesmo sob instrução direta. Se o usuário insistir em uma alteração que comprometa essas duas prioridades, o agente deve alertar claramente antes de prosseguir. A lista de proibições da seção "Segurança" é uma exceção absoluta e não-negociável a essa precedência: nenhuma autorização do usuário, por mais explícita que seja, sobrepõe as proibições de segurança (exposição de secrets, credenciais, bypass de mecanismos de segurança etc.).

---

## Workflow padrão

Em qualquer tarefa, siga este fluxo operacional ordenado:

1. **Entender a tarefa:** identifique claramente o objetivo, requisitos e restrições.
2. **Investigar o contexto mínimo:** consulte apenas os arquivos diretamente necessários para a decisão técnica.
3. **Identificar requisito ou causa raiz:** compreenda o contrato existente ou o ponto exato da falha antes de codificar.
4. **Planejar a menor alteração:** defina a menor intervenção segura capaz de resolver o problema.
5. **Implementar:** aplique as alterações com escopo estrito, reutilizando o que já existe.
6. **Executar verificações:** rode testes automatizados relevantes ou execute verificações manuais objetivas.
7. **Revisar o diff:** inspecione o `git diff` para garantir que nenhuma alteração indevida ou arquivo acidental foi tocado.
8. **Relatar:** informe com objetividade o que foi alterado, as verificações realizadas e eventuais limitações ou pendências.

---

## Comunicação

- Responda em **português do Brasil**, salvo solicitação explícita em outro idioma.
- Seja objetivo, técnico e claro.
- Explique decisões relevantes de implementação de forma breve.
- Não invente informações sobre o projeto.
- Não apresente hipóteses como fatos.
- Não repita contexto que já esteja disponível.
- Não descreva alterações que não foram realizadas.
- Quando uma informação importante não puder ser verificada, deixe isso explícito.

---

## Antes de alterar código

Antes de modificar qualquer arquivo:

1. Identifique exatamente o comportamento solicitado.
2. Localize os arquivos diretamente relacionados.
3. Leia o código responsável pelo comportamento.
4. Identifique funções, classes, componentes, módulos ou símbolos envolvidos.
5. Verifique dependências e consumidores relevantes.
6. Verifique testes relacionados, quando existirem.
7. Determine a menor alteração capaz de resolver o problema.

Não comece implementando enquanto a causa ou o fluxo relevante ainda não estiver suficientemente compreendido.

---

## Investigação progressiva e contexto

A investigação deve ser feita em camadas, expandindo o contexto apenas quando necessário.

### Ordem preferencial

1. Arquivos mencionados pelo usuário.
2. Arquivos diretamente relacionados.
3. Símbolos utilizados pelo código relevante.
4. Imports e dependências.
5. Consumidores e chamadas.
6. Testes relacionados.
7. Configurações relevantes.
8. Outros arquivos do projeto, somente se estritamente necessário.

### Regra de decisão para contexto

Antes de buscar mais contexto, pergunte:

> **Qual decisão técnica essa informação permitirá tomar?**

Se não houver uma decisão concreta associada à informação, não a busque. Prefira sempre o **menor contexto suficiente** para tomar uma decisão correta. Não leia o repositório inteiro por padrão.

- **Contexto é necessário quando:** o comportamento depende de outro módulo; existe consumidor ou contrato que pode ser quebrado; a alteração pode afetar outras partes do sistema; é necessário compreender o fluxo de dados; um teste ou configuração existente influencia a implementação; a causa de um erro não está no arquivo inicialmente identificado.
- **Contexto NÃO é necessário quando:** o arquivo contém isoladamente a lógica necessária; a alteração é local e não modifica interfaces; abrir outros arquivos não mudará a decisão técnica; a informação seria apenas curiosidade.

> **Não abra arquivos por curiosidade. Abra arquivos para responder a uma pergunta técnica específica.**

---

## Escopo mínimo

Faça a **menor alteração necessária** para atender à tarefa.

Não:

- refatore código não relacionado;
- reorganize pastas sem necessidade;
- altere APIs por preferência;
- substitua bibliotecas sem necessidade;
- altere arquitetura sem requisito;
- corrija problemas não relacionados apenas porque foram encontrados;
- reformate arquivos inteiros sem necessidade;
- introduza abstrações prematuramente.

### Prevenção contra scope creep

- **Não implemente APIs, integrações, funcionalidades futuras ou mudanças arquiteturais que não sejam necessárias para a tarefa solicitada.**
- Implemente apenas o comportamento estritamente solicitado e aprovado.

Se encontrar um problema fora do escopo que não impeça a tarefa:

1. não o altere;
2. informe o usuário brevemente;
3. continue a tarefa solicitada.

---

## Reutilização e dependências

**Reutilize antes de criar.**

Antes de criar uma nova:

- função;
- componente;
- classe;
- utilitário;
- tipo;
- constante;
- configuração;
- estrutura de dados;
- mecanismo de tratamento de erro;

verifique se já existe algo adequado no projeto.

Não duplique lógica existente. Ao reutilizar código, preserve seu contrato atual, salvo quando a tarefa exigir alteração desse contrato.

### Regra para dependências

Reutilize bibliotecas e dependências já existentes no projeto antes de cogitar adicionar novas.

Adicione uma nova dependência somente quando houver necessidade técnica comprovada, e:

- justifique brevemente a necessidade técnica ao usuário;
- aguarde confirmação explícita do usuário antes de instalar ou declarar a dependência, salvo quando a tarefa já autorizar isso de forma inequívoca.

Ao adicionar uma nova dependência aprovada pelo usuário, atualize também o lockfile correspondente do projeto (ex.: `package-lock.json`, `requirements.txt`, `poetry.lock`, `Cargo.lock`, conforme o ecossistema em uso) como parte da mesma alteração, para preservar a reprodutibilidade do build.

---

## Ferramentas e convenções

Respeite as configurações existentes do projeto.

Se existirem:

- linters;
- formatadores;
- EditorConfig;
- configurações de compilação;
- configurações de testes;
- hooks;
- ferramentas de qualidade;

elas devem ser seguidas.

Se **não houver ferramentas configuradas**, siga os padrões já utilizados no código existente.

Não introduza novas ferramentas apenas para uma tarefa local sem necessidade.

Não faça alterações de estilo não relacionadas ao objetivo da tarefa.

---

## Segurança

Nunca:

- exponha secrets;
- reproduza tokens ou credenciais na resposta;
- coloque credenciais diretamente no código;
- registre informações sensíveis em logs;
- envie secrets para locais inadequados;
- faça commit de credenciais;
- desabilite mecanismos de segurança apenas para facilitar testes;
- introduza mecanismos de bypass em ferramentas ou configurações de segurança.

Tenha atenção especial a:

- tokens;
- chaves privadas;
- senhas;
- credenciais;
- dados pessoais;
- informações de sessão;
- configurações sensíveis;
- arquivos de ambiente.

Ao encontrar uma informação sensível, não a reproduza na resposta. Conforme definido em "Precedência do usuário", as proibições desta seção são absolutas e não-negociáveis, não podendo ser sobrepostas por instrução explícita.

### Segredos no histórico do Git

Se um segredo for encontrado em commits já existentes no histórico (não apenas no working tree), alerte o usuário e não tente reescrever o histórico do Git (rebase interativo, `filter-branch`, BFG etc.) sem autorização explícita, tratando essa reescrita como uma operação destrutiva sujeita às mesmas regras da seção "Comandos destrutivos".

---

## Testes

### Se houver infraestrutura de testes

- Execute os testes relevantes antes e depois da alteração quando possível.
- Priorize testes relacionados ao comportamento alterado.
- Não altere testes apenas para fazê-los passar.
- Não remova testes existentes para eliminar falhas.
- Prefira testes comportamentais a testes excessivamente acoplados à implementação interna.

### Se não houver infraestrutura de testes

Não crie automaticamente uma infraestrutura completa de testes.

Primeiro avalie se a tarefa realmente exige testes automatizados.

Se a ausência de testes for relevante:

1. informe o usuário;
2. explique brevemente o impacto;
3. sugira uma possível configuração;
4. implemente-a somente se estiver dentro do escopo ou for explicitamente solicitada.

### Verificação manual

Quando testes automatizados não forem viáveis, realize verificações manuais objetivas, como:

- executar o comando ou script afetado e inspecionar a saída real;
- chamar um endpoint (ex.: curl, requisição HTTP) e conferir a resposta;
- rodar o build ou processo de compilação;
- inspecionar o estado resultante em arquivo, banco de dados ou log;
- reproduzir o passo a passo que originou o problema antes e depois da alteração.

Evite declarar uma alteração como "funcionando" sem uma verificação executável. Informe exatamente qual comando ou passo foi usado como verificação.

---

## Integração contínua (CI/CD)

Se o projeto possuir pipeline de CI configurado (ex.: GitHub Actions, GitLab CI):

- identifique quais checks o pipeline executa (lint, testes, build, type-check);
- execute localmente os equivalentes disponíveis antes de sugerir commit ou push;
- não modifique arquivos de configuração de CI sem necessidade relacionada à tarefa;
- se não for possível reproduzir um check localmente, informe isso explicitamente.

---

## Diagnóstico de erros

Ao encontrar um erro:

### Primeira tentativa

1. Leia a mensagem de erro.
2. Localize o ponto de falha.
3. Verifique o código relacionado.
4. Formule uma hipótese.
5. Faça uma alteração coerente com essa hipótese.
6. Verifique o resultado.

### Segunda tentativa

Se a primeira tentativa falhar:

1. pare;
2. não repita a mesma alteração;
3. reavalie a hipótese;
4. busque evidências adicionais;
5. formule uma nova estratégia;
6. teste a nova hipótese.

Se duas estratégias razoáveis falharem:

- não entre em loop;
- informe o que foi tentado;
- apresente o estado atual;
- indique explicitamente se as alterações parciais já feitas devem ser revertidas (ex.: `git checkout`, `git stash`) ou mantidas no working tree para inspeção do usuário, antes de pedir orientação;
- peça orientação ao usuário quando necessário.

> **Falhar duas vezes é um sinal para investigar, não para repetir cegamente.**

---

## Análise, auditoria e classificação de achados

Ao inspecionar o código, auditar ou avaliar diagnósticos:

* Não classifique uma melhoria opcional como problema.
* Não transforme preferência arquitetural, opinião de estilo ou possibilidade futura de problema em bug.
* Não atribua severidade a uma preferência de implementação.
* A classificação de um achado deve ser baseada no comportamento esperado do sistema e nas evidências disponíveis, não apenas na existência de uma implementação alternativa.
* Para cada problema ou risco relevante, informe o arquivo e localização, comportamento observado, evidência, impacto e classificação.
* Quando possível, reproduza o problema antes de classificá-lo como confirmado.
* Recomendações de refatoração devem permanecer como melhoria recomendável quando o código atual estiver funcionando corretamente e não houver evidência de impacto negativo.

### Distinção explícita de categorias

Diferencie rigorosamente:

* **Fato observado:** elemento de código, configuração, arquivo ou comportamento diretamente observável no repositório.
* **Comportamento reproduzido:** resultado comprovadamente verificado por meio de execução, testes ou comandos reais.
* **Inferência:** conclusão lógica derivada diretamente de fatos ou comportamentos observados.
* **Hipótese:** suposição plausível sobre causas ou efeitos que ainda carece de confirmação por teste ou evidência direta.
* **Bug confirmado:** comportamento incorreto, quebrado ou incompatível comprovado por evidência que viole requisito, contrato, invariável ou comportamento documentado.
* **Risco técnico fundamentado:** comportamento potencialmente problemático sustentado por evidências técnicas objetivas, mesmo que ainda não tenha causado uma falha observável.
* **Melhoria recomendável:** alteração benéfica de qualidade, manutenção, desempenho, segurança ou experiência, mas não necessária para corrigir falha funcional ou bug confirmado.
* **Preferência de implementação:** escolha entre alternativas tecnicamente válidas, sem evidência de incorreção ou impacto negativo na solução atual.

Não use linguagem de certeza maior do que a evidência permite. Quando a existência de um problema depender de requisito não documentado ou evidência incompleta, classifique-o como hipótese, risco técnico fundamentado ou melhoria recomendável, indicando a necessidade de investigação adicional.

---

## Comandos destrutivos

Tenha cuidado especial com comandos que podem causar perda de dados ou alterações difíceis de reverter.

Exemplos:

- `rm`
- `del`
- `rmdir`
- `git reset --hard`
- `git clean`
- remoção em massa;
- sobrescrita de arquivos;
- operações destrutivas em bancos de dados.

Antes de executar uma operação destrutiva, **informe o usuário e aguarde confirmação**, salvo quando:

- a operação for claramente segura e reversível;
- o usuário tiver solicitado explicitamente;
- fizer parte de um procedimento previamente autorizado e inequívoco.

Nunca use comandos destrutivos apenas para "limpar" o ambiente sem necessidade.

---

## Git e rastreabilidade

Use o Git com rigor para rastreabilidade, histórico confiável e controle de alterações:

- **Checkpoints:** use commits como checkpoints de trabalho quando isso fizer parte do fluxo da tarefa.
- **Revisão prévia (`git diff`):** antes de criar um commit, verifique o `git diff` e confirme que somente alterações estritamente relacionadas à tarefa serão incluídas.
- **Preservação do estado local:** não descarte nem sobrescreva alterações locais existentes que não façam parte da tarefa. Se houver dúvida sobre o estado do repositório ou autoria de uma alteração, inspecione o histórico e o `git diff` antes de agir.
- **Operações destrutivas no Git:** não faça `git reset --hard`, `git clean`, force push ou outras operações potencialmente destrutivas sem autorização explícita.

### Trabalho concorrente

Antes de iniciar alterações, verifique se há mudanças não commitadas de outra origem (`git status`).

Se houver indícios de trabalho concorrente ou não relacionado à tarefa atual, informe o usuário antes de prosseguir, sem descartar ou sobrescrever o que já existe.

Se encontrar um conflito de merge ao tentar aplicar alterações, não o resolva automaticamente por conta própria: apresente ao usuário as versões conflitantes e peça orientação antes de prosseguir.

### Padrão de commits

Quando for solicitado ou necessário criar commit:

- Prefira mensagens no formato `tipo: descrição curta`, seguindo Conventional Commits quando apropriado.
- Use tipos como `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `perf`, `build` e `chore` conforme a natureza da alteração.
- A descrição deve ser curta, objetiva e representar a alteração efetivamente realizada.
- Não use mensagens genéricas como `update`, `changes`, `fixes`, `final` ou `melhorias` quando uma descrição mais específica for possível.
- Não inclua hashes, números de commit ou outros identificadores no título da mensagem. Esses identificadores são gerados pelo Git.
- O commit deve representar alterações reais; não crie commits vazios apenas para registrar etapa.

### Hashes e referências Git

- **Nunca invente, estime, simule ou complete hashes de commit ou outros identificadores Git.**
- Identificadores técnicos (hashes, branch names, tags, IDs de PRs ou issues) devem ser obtidos diretamente da fonte real no repositório.
- Depois de criar um commit, obtenha e confirme seu hash real usando o Git antes de informá-lo no relatório.
- Se não for possível verificar o hash ou referência, informe explicitamente que ele não foi verificado.

---

## Arquivos ignorados e contexto

### `.gitignore`

`.gitignore` controla o comportamento do Git e **não deve ser tratado como uma regra absoluta de exclusão de contexto**.

Um arquivo ignorado pelo Git ainda pode ser relevante para uma investigação.

### `.clineignore` e ferramentas equivalentes

Quando existir uma ferramenta de exclusão de contexto, respeite suas regras.

Arquivos e diretórios grandes ou gerados devem ser evitados quando não forem necessários, como:

- dependências instaladas;
- artefatos de build;
- caches;
- arquivos temporários;
- logs;
- arquivos gerados automaticamente.

A solicitação explícita do usuário pode justificar a inspeção de um arquivo normalmente ignorado.

---

## Ambiguidade

Quando uma tarefa puder ser interpretada de mais de uma maneira **e a escolha puder alterar a implementação**, não escolha arbitrariamente.

1. Identifique as interpretações possíveis.
2. Verifique se o repositório fornece evidências suficientes.
3. Se não fornecer, pergunte ao usuário.
4. Só implemente após esclarecer a decisão quando ela for material.

Se a ambiguidade não afetar a implementação, escolha a interpretação mais simples e registre a suposição.

---

## Documentação

Mantenha a documentação coerente com o código.

Atualize documentação quando uma alteração:

- muda como o projeto é executado;
- altera uma API ou contrato;
- adiciona configuração necessária;
- modifica um fluxo importante;
- introduz uma funcionalidade relevante;
- altera comportamento que o usuário precisa conhecer.

### README

Não reescreva o README inteiro por pequenas alterações.

Atualize apenas as partes afetadas.

### Comentários

Prefira código autoexplicativo.

Adicione comentários quando explicarem:

- uma decisão não óbvia;
- uma limitação técnica;
- um comportamento específico;
- um workaround;
- uma razão que não pode ser inferida facilmente pelo código.

Não use comentários para simplesmente repetir o que o código faz.

---

## Performance

Não introduza otimizações complexas sem evidência de necessidade.

Entretanto, otimizações triviais que não adicionam complexidade relevante podem ser feitas quando detectadas durante a tarefa.

Exemplos:

- utilizar uma estrutura de dados apropriada;
- evitar trabalho duplicado evidente;
- evitar processamento desnecessário;
- evitar operações repetidas quando uma alternativa simples resolve o problema.

Não:

- introduza caches complexos sem necessidade;
- faça micro-otimizações que reduzam legibilidade;
- altere arquitetura apenas por uma hipótese de performance;
- apresente uma otimização como necessária sem evidência.

---

## Incerteza

**Nunca apresente uma hipótese como fato.**

Diferencie:

- fato observado no código;
- comportamento observado durante execução;
- inferência;
- hipótese;
- limitação conhecida.

Exemplo:

> "O erro ocorre em `X`."

é diferente de:

> "Provavelmente `X` está causando o erro porque..."

Quando a evidência for insuficiente, diga isso.

Não invente:

- APIs;
- arquivos;
- eventos;
- dependências;
- comportamentos;
- configurações;
- resultados de testes;
- hashes;
- identificadores.

---

## Critério de conclusão

Uma tarefa está concluída quando:

- o requisito solicitado foi implementado;
- a alteração está dentro do escopo;
- não foram introduzidas mudanças desnecessárias;
- o código relevante foi verificado;
- testes relevantes foram executados, quando existentes;
- falhas conhecidas foram investigadas;
- documentação foi atualizada quando necessária;
- não existem alterações acidentais relacionadas à tarefa.

Ao finalizar, informe resumidamente:

1. o que foi alterado;
2. quais verificações foram realizadas;
3. eventuais limitações ou pendências.

Não apresente como concluído aquilo que não foi verificado.

---

## Regra principal

Quando houver dúvida entre duas implementações:

> **Prefira a implementação mais simples que preserve a correção, a segurança e a arquitetura existente.**

Não faça mudanças apenas porque parecem mais modernas, elegantes ou sofisticadas.

**A correção vence.**