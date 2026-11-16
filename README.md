## EdyTools 2.3.0-beta

[Baixar instalador Windows (.zip)](./downloads/EdyTools-2.3.0-beta-Windows.zip) · [Baixar script EdyTools.jsx](./EdyTools.jsx)

A nova interface está em [EdyTools.jsx](./EdyTools.jsx). Veja as [duas opções de instalação e o guia de uso](./EDYTOOLS.md). O histórico do MotionKit EC continua abaixo.

# MotionKit EC · v0.9.0-beta

**by Edy Bastos — 11/2026**

Painel para [EffectCraft](https://github.com/storytold/effectcraft) com presets de animação e ferramentas para edição de vídeo e motion graphics. Licença MIT.

## Duas opções de instalação

As duas opções instalam o mesmo painel `MotionKit EC.jsx`, com as mesmas ferramentas e o mesmo funcionamento. Escolha uma delas.

### 1. Script pelo EffectCraft

1. Baixe o [MotionKit EC.jsx](./MotionKit%20EC.jsx).
2. No EffectCraft, vá a **Arquivo → Scripts → Instalar painel ScriptUI** (*File → Scripts → Install ScriptUI Panel*).
3. Selecione o arquivo baixado e abra **Janela → MotionKit EC.jsx**. Se estiver atualizando um painel já aberto, reinicie o EffectCraft.

### 2. Instalador para Windows

1. Baixe o repositório em **Code → Download ZIP** e extraia todos os arquivos para a mesma pasta.
2. Feche o EffectCraft e execute `INSTALAR.cmd`.
3. Reabra o EffectCraft e abra **Janela → MotionKit EC.jsx**.

O instalador faz backup das versões anteriores e copia o painel para `%APPDATA%\EffectCraft\Scripts\ScriptUI Panels`. Os backups ficam na subpasta `_MotionKit_Backups`. A instalação funciona offline e dispensa privilégios de administrador.

## O que o painel faz

- **Início** mostra as ferramentas e oferece acesso direto a cada uma.
- **Animar** reúne presets de objetos 2D e textos. Selecione a camada, escolha o preset, ajuste duração e intensidade e clique em **Aplicar**. **Entrada** começa no início da camada, **Saída** termina no fim dela e **Destaque** parte da agulha. Depois de aplicar, o painel leva a agulha ao começo do trecho animado.
- **Curvas** permite copiar a suavização de dois quadros-chave consecutivos, aplicar curvas e salvar ajustes próprios.
- **Âncora** reúne os controles de ponto de âncora e alinhamento 3×3.
- **Camadas** permite renomear, escalonar, criar um nulo de controle e duplicar uma composição com suas precomposições.

## Testes e compatibilidade

A v0.9.0-beta passou por 162 aplicações de presets no motor do EffectCraft, além de testes de cópia de curva, duplicação de precomposições e instalação em pasta isolada. A aparência do painel acoplado ainda precisa de conferência visual no Windows. Para os presets de objetos, use camadas 2D. O painel preserva quadros-chave de transformação existentes no intervalo do preset.

Consulte o [histórico de versões](./CHANGELOG.md) e a [licença MIT](./LICENSE).
