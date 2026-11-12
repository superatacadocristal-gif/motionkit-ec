# MotionKit EC · v0.8.1-beta

**by Edy Bastos — 11/2026**  
Painel independente para [EffectCraft](https://github.com/storytold/effectcraft), voltado à criação de vídeos e motion graphics. Licença MIT.

## Correção v0.8.1 — sobreposição da interface

O painel **não usa mais `tabbedpanel` aninhado**. O menu principal, o menu secundário e a área de ferramentas têm alturas separadas; apenas a página escolhida fica visível. Isso evita que nomes como “Objetos”, “Textos” e “Animações de objetos” ocupem o mesmo espaço. O cabeçalho de conteúdo indica a seção atual em laranja.

**Recomendação:** mantenha a coluna do painel com pelo menos **390 px de largura**. Uma área menor pode cortar os controles, porque o ScriptUI não oferece rolagem automática.

## Novidades

- **Navegação corrigida**: quatro seções (Âncora, Animações, Curvas e Camadas) com botões de subabas separados (Ponto/Alinhar, Objetos/Textos e Organizar/Mover). Sem painéis de abas aninhados, que causavam sobreposição no EffectCraft.
- Destaques personalizados em **laranja**, mantendo as cores nativas do tema claro ou escuro.
- **Somente os nove botões de ponto de âncora** (e o de centralização rápida) têm ícones sem texto. Os demais controles mostram nomes legíveis.
- **Alinhamento** 3×3 diretamente na seção Âncora, sem sair do painel.
- **Animações de objetos**: 25 famílias de Entrada/Saída/Ambos e seis destaques como Show Up, com lista, categorias e busca tolerante a pequenos erros.
- **Animações de texto**: as mesmas famílias em uma subaba própria, com animadores de texto e seletor de intervalo (letra por letra); saídas começam sem ocultar o texto antecipadamente.
- **Curvas**: seis opções, edição de influência/velocidade e salvamento de curvas pessoais.
- **Camadas**: renomeação, escalonamento e controlador de movimento por objeto nulo.
- Mensagens de erro mais específicas quando um preset não pode ser aplicado. Não substitui silenciosamente keyframes existentes.
- Rodapé discreto "by Edy Bastos", com opacidade nominal de 10% (a implementação exata depende do suporte a alfa do ScriptUI).

## Instalação com um clique (Windows)

1. **Feche o EffectCraft**.
2. Extraia **todos os arquivos** do ZIP para uma mesma pasta.
3. Dê dois cliques em **`INSTALAR.cmd`**. O script PowerShell local cria backup das versões anteriores e instala o arquivo com o nome estável `MotionKit EC.jsx`.
4. Reabra o EffectCraft e selecione **Janela (Window) → MotionKit EC.jsx**.

O instalador usa `%APPDATA%\EffectCraft\Scripts\ScriptUI Panels`, **não** o diretório de instalação do aplicativo. Não requer privilégios de administrador, não acessa a internet nem solicita credenciais. Backups ficam em `_MotionKit_Backups` dentro da pasta de painéis.

### Instalação manual

Copie `MotionKit EC.jsx` para `%APPDATA%\EffectCraft\Scripts\ScriptUI Panels`. Antes, renomeie a versão antiga para backup. Reinicie o EffectCraft.

## Uso das animações

1. Abra a composição e selecione uma camada 2D (ou texto, na subaba **Textos**).
2. Vá para **Animações → Objetos** ou **Animações → Textos**.
3. Pesquise um preset ou filtre por categoria.
4. Escolha **Entrada**, **Saída** ou **Ambos**. Em **Destaques**, o preset é aplicado no tempo atual, sem esses modos.
5. Ajuste a duração e a força; clique em **Aplicar**.

Se houver chaves em propriedades de objeto dentro do intervalo, o plugin evita sobrescrevê-las e informa o motivo. Para reposicionar uma animação existente sem alterar os quadros-chave, use **Camadas → Mover → Criar controlador nulo**.

## Testes e limitações

O arquivo passou por **16 testes simulados** (incluindo alternância das seções e subabas, exclusão de abas aninhadas, verificação das listas e aplicação de animações). O arquivo foi verificado por Node.js e testado com um simulador de ScriptUI e da API de scripts: inicialização da interface, listas, busca, animações de opacidade, criação de animadores de texto, saída que preserva a visibilidade antes de seu início, alinhamento e controlador nulo.

**Esses testes não verificam a geometria real desenhada pelo EffectCraft no Windows.** A validação visual final e a renderização dos presets devem ser verificadas com uma cópia do projeto dentro do EffectCraft. A compatibilidade pode variar entre versões da aplicação.

Algumas propriedades animadas, expressões, camada 3D e posições separadas não são alteradas automaticamente, para evitar resultados inesperados.

## Crédito e licença

Criado por **Edy Bastos, novembro de 2026**. Licença MIT. Projeto não afiliado ao EffectCraft, ao Mister Horse ou ao CapCut.