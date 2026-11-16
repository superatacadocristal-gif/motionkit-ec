# EdyTools 2.2.0-beta

**by Edy Bastos — 11/2026**

Painel de motion para EffectCraft com cartões de presets, ícones desenhados, navegação inferior e tema automático.

## Instalar

As duas opções oferecem as mesmas funções.

- **Script** — use Arquivo > Scripts > Instalar painel ScriptUI e escolha EdyTools.jsx.
- **Windows** — extraia o ZIP completo, feche o EffectCraft e execute INSTALAR-EDYTOOLS.cmd. O instalador guarda a versão anterior em Scripts/EdyTools Backups e verifica a cópia.

Abra Janela > EdyTools.jsx. Reinicie o EffectCraft para atualizar um painel que estava aberto.

## Usar

- **Animar** — selecione uma camada, escolha Objetos ou Textos, busque um preset, ajuste duração e intensidade e aplique. Entrada usa o início da camada, saída usa o fim e destaques usam a agulha. As subabas Entrada, Saída, Ambos e Destaques filtram os presets e definem a aplicação. Ver prévia anima somente a opção selecionada por três segundos; outro clique interrompe. Deslizar e Quicar agrupam quatro direções, escolhidas pelas setas abaixo dos ajustes. A seta indica o sentido do movimento tanto na entrada quanto na saída. A prévia fica parada por padrão, inclusive no contador.
- **Contador** — em Animar > Contador, selecione uma camada de texto e informe os números inicial/final (por exemplo, 500 e 1000) e a duração. Para contagem regressiva, use um início maior que o final. Escolha Início para começar no início da camada ou Na agulha para começar no cursor. Usar até o fim da camada calcula a duração disponível. Duas chaves lineares no efeito EdyTools Contador controlam o tempo: arraste-as na timeline para acelerar, desacelerar ou mudar o início. Mover apenas a agulha após aplicar não altera essas chaves. A contagem usa inteiros, mantém a fonte/estilo e substitui o texto por números. Textos com outra expressão ou chaves de conteúdo são ignorados. Reaplicar substitui o contador anterior, sem acumular efeitos. Desfazer reverte a aplicação.
- **Curvas** — selecione quadros-chave. Escolha uma curva visual e aplique. Copiar curva lê dois quadros consecutivos. Clique no gráfico maior para editar influência e velocidade. Salve curvas e recupere-as em Curvas salvas. Um número negativo nesse seletor exclui a curva correspondente.
- **Layout** — use a grade 3×3 para âncora ou alinhamento. O controlador nulo reposiciona uma camada animada.
- **Camadas** — escolha o sentido da escada, ajuste o intervalo e escalone a seleção. Também oferece prefixo de nomes, controlador e duplicação de composição com precomps independentes.

A cor de destaque acompanha o tema do aplicativo, laranja no escuro e azul no claro. O indicador mostra seleção, confirmação e falhas.

## Espaço e prévias

Animar e Contador usam uma área de conteúdo mínima de 280 × 560 pixels (janela de 292 × 572), reduzindo a altura em 22% em relação à versão 2.1. Curvas, Layout e Camadas mantêm uma área rolável de 720 pixels. Redimensione o painel acoplado para aproveitar a altura menor.

As prévias são amostras vetoriais do movimento. Texto usa letras de demonstração. A composição real, com sua fonte, dimensões e interpolação, deve ser conferida na timeline.

## Verificação

Testado no EffectCraft 0.24.1 para Windows, em instância e projeto separados. A suíte 2.2 verifica 567 condições, incluindo aplicação dos presets, direções agrupadas, contagem crescente/regressiva, valores intermediários, reaplicação, limites, expressões existentes, ajuste de tempo pelas chaves e layout mínimo. A tela compacta foi conferida no programa em 280 × 560 pixels. Testes verificam filtros das subabas, fim automático da prévia e ausência de redesenho pelo temporizador em repouso. Não foi medido um percentual de ganho de CPU.

Execute `node tests/run-edytools.cjs` para repetir os testes. Um caminho alternativo do effectcraft-cli.exe pode ser passado como primeiro argumento.

## Histórico

O EdyTools deriva das ferramentas do MotionKit EC. A versão 2.0 reconstrói a interface e corrige o agendador das prévias no painel acoplado. O histórico Git e a licença MIT acompanham o código.
