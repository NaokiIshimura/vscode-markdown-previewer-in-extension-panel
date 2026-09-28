# Markdown Previewer in Extension Area

[![Version](https://img.shields.io/badge/version-1.1.2-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel) [![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-blue)](https://code.visualstudio.com/) [![VS Marketplace](https://img.shields.io/badge/VS%20Marketplace-Install-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel)

[English](README.md) | [日本語](README-JA.md) | [한국어](README-KO.md) | [简体中文](README-ZH-CN.md) | [繁體中文](README-ZH-TW.md) | Português (BR)

Uma extensão do VS Code que exibe uma pré-visualização de Markdown completa na área de extensões (barra lateral principal, barra lateral secundária ou painel), para que você possa ler e navegar pela sua documentação sem ficar alternando entre abas do editor.

## Recursos

### 🎯 Exibição na Área de Extensões

Pode ser exibida na barra lateral principal, na barra lateral secundária ou no painel.

![demo3](assets/demo3.gif)

| Recurso | Atalho | Descrição |
| --- | --- | --- |
| Navegar Anterior/Próximo | `←` / `→` | Navega para o arquivo Markdown anterior/próximo no mesmo diretório |
| Fixar/Desafixar | `p` | Fixa a pré-visualização no arquivo Markdown exibido no momento ou retorna ao modo de acompanhamento |
| Editar | `e` | Abre o documento pré-visualizado em uma aba do editor |
| Copiar Caminho do Arquivo | Clicar no caminho | Copia o caminho do arquivo para a área de transferência ao clicar nele; exibe uma notificação do VS Code |
| Abrir Configurações | Somente barra de ferramentas | Abre a seção de configurações da extensão |


### 🎨 Experiência de Pré-visualização Rica

Oferece diversos recursos para uma leitura confortável.

![demo2](assets/demo2.gif)

| Recurso | Atalho | Descrição |
| --- | --- | --- |
| Tema Claro/Escuro | `t` | Alterna entre os temas claro e escuro da pré-visualização |
| Aumentar/Diminuir Zoom | `+` / `-` | Aumenta/diminui o zoom da pré-visualização (exibe o nível de zoom atual) |
| Redefinir Zoom | `r` | Redefine o nível de zoom para 100% |
| Diagramas Mermaid | Automático | Renderiza diagramas Mermaid (fluxogramas, diagramas de sequência, diagramas de classes etc.) diretamente na pré-visualização |
| Copiar Mermaid | Barra ao passar o mouse | Copia o código-fonte do diagrama Mermaid como bloco de código Markdown para a área de transferência |
| Salvar Mermaid | Barra ao passar o mouse | Salva o diagrama Mermaid como imagem PNG pela caixa de diálogo de salvamento do VS Code |
| Realce de Sintaxe | Automático | Aplica cores de acordo com a linguagem em blocos de código delimitados quando a linguagem é especificada (por exemplo, <code>```javascript</code>) |
| Copiar Bloco de Código | Barra ao passar o mouse | Copia o bloco de código delimitado inteiro para a área de transferência com um clique |
| Copiar Texto Selecionado | `c` | Copia o texto selecionado para a área de transferência; exibe uma notificação do VS Code |
| Copiar como Citação | `q` | Copia o texto selecionado com o prefixo `> ` em cada linha, para citação em Markdown |
| Exibição do Caminho do Arquivo | Sempre visível | Mostra o caminho relativo à raiz do projeto no topo da pré-visualização |
| Barras de Rolagem Adaptadas ao Tema | Automático | As barras de rolagem seguem o tema claro/escuro ativo para melhor legibilidade |
| Menu de Contexto de Links | Clique com o botão direito em um link | Permite escolher entre o navegador padrão e o Simple Browser integrado do VS Code para links `http`/`https` |

### 🗂️ Recursos da Barra Lateral

Possui quatro abas (Estrutura, Arquivos, Histórico, Ajuda) para visualizar diversas informações.

| Aba | Atalho | Descrição |
| --- | --- | --- |
| Barra lateral | `s` | Mostra/oculta o painel lateral com as abas Estrutura, Arquivos, Histórico e Ajuda; use Tab para alternar entre abas, ↑/↓ para navegar pelos itens, Enter para selecionar e Esc para fechar |
| Estrutura | `o` | Abre a barra lateral na aba Estrutura; exibe o nome do arquivo atual com navegação por h1-h6. Use ↑/↓ para navegar, Enter para selecionar e Esc para fechar |
| Arquivos | `f` | Abre a barra lateral na aba de lista de arquivos; exibe os arquivos Markdown do mesmo diretório para navegação rápida. Use ↑/↓ para navegar, Enter para selecionar e Esc para fechar |
| Ordenação de arquivos | `a` | Alterna a ordenação dos arquivos entre nome (ordem alfabética) e data de modificação (mais recentes primeiro) |
| Histórico | `h` | Abre a barra lateral na aba Histórico; exibe os arquivos pré-visualizados recentemente para navegação rápida. Use ↑/↓ para navegar, Enter para selecionar e Esc para fechar |
| Ajuda | Tecla Tab | Consulte todos os recursos e atalhos de teclado na aba Ajuda da barra lateral; acessível pela tecla Tab quando a barra lateral está aberta |

**Observação**: os atalhos de teclado funcionam somente quando a pré-visualização está em foco.

## Configurações

| Configuração | Padrão | Descrição |
| --- | --- | --- |
| `markdownPreviewInExtensionPanel.defaultZoomLevel` | `100` | Porcentagem de zoom padrão (50–200) |
| `markdownPreviewInExtensionPanel.themeMode` | `auto` | Modo de tema da pré-visualização (`auto`, `light`, `dark`) |
| `markdownPreviewInExtensionPanel.fileSortOrder` | `name` | Ordenação dos arquivos na aba Arquivos (`name`, `modified`) |
| `markdownPreviewInExtensionPanel.scrollSync` | `true` | Sincroniza a rolagem entre o editor de origem e a pré-visualização (bidirecional). O editor de origem precisa estar visível junto com a pré-visualização. |

## Requisitos
- Visual Studio Code 1.74.0 ou superior
- Arquivos Markdown (`.md`) no workspace atual

## Desenvolvimento
```bash
npm install      # instala as dependências
npm run compile  # build única em ./out
npm run watch    # build incremental durante o desenvolvimento
npm test         # executa os testes unitários
```
Inicie o Extension Development Host do VS Code (`F5`) para testar as alterações ao vivo em uma janela isolada.

## Dicas e Limitações Conhecidas
- **Barra lateral**: pressione `s` para mostrar/ocultar um painel lateral que reúne Estrutura, Arquivos, Histórico e Ajuda em abas. Use Tab para alternar entre abas, ↑/↓ para navegar pelos itens, Enter para selecionar e Esc para fechar.
- **Estrutura**: pressione `o` para abrir a barra lateral na aba Estrutura. A aba mostra o nome do arquivo atual no topo com uma linha separadora, seguido dos títulos h1-h6 extraídos do documento Markdown para navegação clicável.
- **Lista de arquivos**: pressione `f` para abrir a barra lateral na aba de lista de arquivos. São exibidos todos os arquivos Markdown do mesmo diretório do arquivo atual, com o arquivo atual destacado. Clique em qualquer arquivo para alternar para ele. Pressione `a` para alternar a ordenação entre nome e data de modificação.
- **Histórico**: pressione `h` para abrir a barra lateral na aba Histórico. A aba mostra os arquivos Markdown pré-visualizados recentemente em ordem cronológica (mais recentes primeiro). Clique em qualquer arquivo para alternar para ele ou use o botão Clear para remover todo o histórico.
- **Ajuda**: a aba Ajuda da barra lateral oferece uma referência rápida de todos os recursos e atalhos de teclado. Pressione Tab para percorrer as abas da barra lateral até chegar a ela.
- A aba de lista de arquivos só aparece quando há 2 ou mais arquivos Markdown no diretório.
- Com a barra lateral aberta, use ↑/↓ para navegar pelos itens, Enter para selecionar e Esc para fechar.
- As setas esquerda/direita (←/→) sempre navegam para o arquivo Markdown anterior/próximo, mesmo com a barra lateral aberta.
- Os diagramas Mermaid são carregados da CDN jsDelivr; em ambientes offline, a renderização dos diagramas é ignorada.
- Imagens e links são resolvidos usando os caminhos do workspace do VS Code — certifique-se de que os arquivos referenciados estejam em locais acessíveis.
- Quando nenhum arquivo Markdown está aberto, a pré-visualização exibe automaticamente o README.md do workspace, se existir.
- A pré-visualização permanece ao alternar para arquivos que não são Markdown, permitindo manter a documentação visível enquanto você trabalha no código.
- A barra lateral permanece visível ao alternar para outro arquivo, preservando o contexto de navegação.
- Ao alternar para outro arquivo Markdown, a posição de rolagem volta automaticamente ao topo para uma nova leitura.
- O recurso Copiar como Citação é útil para citar conteúdo em issues, pull requests ou outros documentos Markdown.

## Feedback
Relate bugs ou solicite recursos pelo GitHub Issues. Capturas de tela e passos de reprodução concisos nos ajudam a responder mais rapidamente.
