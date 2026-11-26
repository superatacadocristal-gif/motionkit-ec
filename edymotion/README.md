# EdyMotion 1.1.0-beta para EffectCraft

**by Edy Bastos — 11/2026** · MIT

Painel independente inspirado no fluxo de biblioteca/aplicação/edição do Animation Composer. Implementação e elementos próprios. O EdyTools é mantido separado.

## Instalação

- **Script:** Arquivo > Scripts > Instalar painel ScriptUI; selecione `EdyMotion.jsx`.
- **Windows:** extraia o ZIP e execute `INSTALAR-EDYMOTION.cmd`.

Abra **Janela > EdyMotion.jsx**. Feche e reabra o programa se um painel antigo já estiver carregado. O instalador só atualiza EdyMotion.jsx e guarda backup das versões anteriores dele.

## Usar

- **Animar:** 25 famílias de presets, com Entrada, Saída, Ambos e Destaques; Objetos, Textos e Contador. Deslizar e Quicar têm direções. Entrada começa no início da camada e saída termina no fim. Destaques usam a agulha. Textos reproduzem os quadros intermediários com influência sobre a faixa inteira; para revelar letras/palavras em sequência, use Mais > Texto em série.
- **Prévias:** botão Ver prévia, por três segundos, somente na opção selecionada. São amostras vetoriais ilustrativas, não renderizações exatas da composição. Não há loop de redesenho em repouso.
- **Favoritos e presets pessoais:** estrela marca a opção atual; o filtro Todos/Salvos exibe favoritos. O botão + salva preset, modo, duração, força e direção. Até 100 combinações pessoais.
- **Editar:** selecione camadas animadas pelo EdyMotion. Altere duração, mova o início para a agulha ou remova a última aplicação. Registros acompanham os comentários da camada no projeto. Edições manuais nos canais registrados impedem remoção/retiming automático para não sobrescrever seu trabalho; nesse caso use as ações de keyframes. Não apague os blocos `[EdyMotion:v1]` se quiser continuar editando pelo painel. Contadores e elementos criados têm seus próprios controles na timeline.
- **Criar:** título, lower third, oferta, callout, lista e fundo, com texto, duração e cor HEX. Cria camadas de texto e formas editáveis na agulha; edite conteúdo e fontes no EffectCraft. Lista aceita itens separados por `|`.
- **Biblioteca:** presets pessoais e até 500 referências de mídia local. Adicionar arquivo pede o caminho completo e importa o item no painel Projeto; Importar selecionado o insere na composição a partir da agulha. Remover da lista mantém o arquivo e os itens do projeto. Caminhos absolutos precisam ser atualizados se os arquivos forem movidos. O suporte a formatos depende do importador instalado no EffectCraft.
- **Mais:** curvas de velocidade, âncora/alinhamento, escada de camadas, renomeação, duplicação de composições, controlador nulo e organizador do projeto.
- **Ações de keyframes:** inverter, clonar na agulha, alinhar início/fim à agulha, deslocar em segundos e copiar/colar easing. Aceita propriedades numéricas; recusa expressões, chaves móveis e colisões com chaves não selecionadas. Preserva interpolação e tangentes suportadas.

## Novidades 1.1

- **Mais > Texto em série:** Por letras ou Por palavras; Esmaecer, Subir ou Máquina de escrever; Entrada, Saída ou Ambos. Selecione texto e informe a duração. Usa seletores reais; depois ajuste as chaves do seletor na timeline. Remover sequência remove apenas os animadores EMSEQ e mantém os demais. Reaplicar no mesmo lado é bloqueado para evitar acumulação.
- **Mais > Transições:** Cortina (quatro direções e cor HEX), Flash branco e Escurecer. No corte, selecione dois clipes visuais consecutivos, sem lacuna; o início do segundo define o corte. Na agulha permite criar em qualquer ponto que comporte a duração. Cria uma forma independente acima dos clipes, sem alterar seus tempos ou transformações. A forma cobre o corte e depois revela o próximo clipe; não é uma dissolução entre os vídeos. Duração mínima de quatro frames. Para ajustar depois, edite as chaves e os limites da camada criada; Ctrl+Z desfaz.

## Escopo e compatibilidade

Testado no **EffectCraft 0.24.1 para Windows**. Esta é uma versão beta própria, não uma cópia integral do produto Mister Horse nem compatibilidade com os pacotes dele. Não inclui os catálogos pagos, MOGRT, fontes animadas, animações 3D, transições de filme/glitch, áudio comercial ou importação de projetos After Effects. Não executa plugins `.aex` nem arquivos proprietários do Animation Composer.

Animar, Editar, Criar, Biblioteca, organizador e ações de chaves cabem em área de 280 × 560 px. Algumas ferramentas herdadas usam 720 px de conteúdo rolável. Tema escuro laranja e tema claro azul.

## Verificação e código

`node build.cjs` recompila os módulos de `src/` em um JSX instalável. `node test.cjs` executa testes no motor real, com configuração isolada e arquivos sintéticos. São **1.036 verificações**: 582 da base adaptada, 150 de conteúdo/mídia, 6 de correções do motor, 21 de edição de aplicações e 36 de keyframes, 194 de texto em série e 47 de transições. A contagem inclui asserções dentro de cenários; não representa 795 recursos. Foram renderizados elementos reais para conferência visual. Nenhuma suíte garante ausência absoluta de erros em todos os projetos.

Os módulos separam ferramentas de chaves, criação/mídia, registros das aplicações, interface e inicialização. A base de animações e utilitários vem do histórico MotionKit/EdyTools, preservado no repositório. O agendador usa identificador por instância, sem colidir com EdyTools.

## Referências estudadas

Consulta em 24–25/11/2026, fontes oficiais:

- [Animation Composer](https://misterhorse.com/animation-composer-for-after-effects): organização da biblioteca, edição e ferramentas.
- [Keyframe Actions](https://misterhorse.com/keyframe-actions): operações sobre chaves.
- [Keyframe Wingman](https://misterhorse.com/keyframe-wingman): controle de easing.
- [Transition Shifter](https://misterhorse.com/transition-shifter): deslocamento e escalonamento.
- [Anchor Point Mover](https://misterhorse.com/anchor-point-mover): posicionamento de âncora.

Essas referências orientam o fluxo de trabalho. O código, os modelos e os ícones do EdyMotion são próprios ou derivados da base MIT deste repositório.
