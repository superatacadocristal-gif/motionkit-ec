# EdyTools 2.0.0-beta

**by Edy Bastos — 11/2026**

Painel de motion para EffectCraft com cartões de presets, ícones desenhados, navegação inferior e tema automático.

## Instalar

As duas opções oferecem as mesmas funções.

- **Script** — use Arquivo > Scripts > Instalar painel ScriptUI e escolha EdyTools.jsx.
- **Windows** — extraia o ZIP completo, feche o EffectCraft e execute INSTALAR-EDYTOOLS.cmd. O instalador guarda a versão anterior em Scripts/EdyTools Backups e verifica a cópia.

Abra Janela > EdyTools.jsx. Reinicie o EffectCraft para atualizar um painel que estava aberto.

## Usar

- **Animar** — selecione uma camada, escolha Objetos ou Textos, busque um preset, ajuste duração e intensidade e aplique. Entrada usa o início da camada, saída usa o fim e destaques usam a agulha. O cartão selecionado reproduz uma amostra animada. Pausar e reiniciar controlam essa amostra.
- **Curvas** — selecione quadros-chave. Escolha uma curva visual e aplique. Copiar curva lê dois quadros consecutivos. Clique no gráfico maior para editar influência e velocidade. Salve curvas e recupere-as em Curvas salvas. Um número negativo nesse seletor exclui a curva correspondente.
- **Layout** — use a grade 3×3 para âncora ou alinhamento. O controlador nulo reposiciona uma camada animada.
- **Camadas** — escolha o sentido da escada, ajuste o intervalo e escalone a seleção. Também oferece prefixo de nomes, controlador e duplicação de composição com precomps independentes.

A cor de destaque acompanha o tema do aplicativo, laranja no escuro e azul no claro. O indicador mostra seleção, confirmação e falhas.

## Espaço e prévias

O conteúdo usa pelo menos 300 × 720 pixels. Colunas menores usam a rolagem do EffectCraft. Amplie ou solte o painel para visualizar todos os controles de uma vez.

As prévias são amostras vetoriais do movimento. Texto usa letras de demonstração. A composição real, com sua fonte, dimensões e interpolação, deve ser conferida na timeline.

## Verificação

Testado no EffectCraft 0.24.1 para Windows, em instância e projeto separados. Foram verificadas 162 aplicações de presets e 581 condições automatizadas, incluindo canais animados, limites de tempo, busca, direções da escada e temas. Na janela do programa, foram conferidos painel flutuante e acoplado, temas claro e escuro, seleção ao vivo, animação contínua, aplicação com um clique e desfazer.

Execute `node tests/run-edytools.cjs` para repetir os testes. Um caminho alternativo do effectcraft-cli.exe pode ser passado como primeiro argumento.

## Histórico

O EdyTools deriva das ferramentas do MotionKit EC. A versão 2.0 reconstrói a interface e corrige o agendador das prévias no painel acoplado. O histórico Git e a licença MIT acompanham o código.
