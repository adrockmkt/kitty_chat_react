# Kitty Chat React - Sistema de Feedback com Emojis

Um sistema completo de feedback em React + TypeScript + Tailwind que permite aos usuários avaliar sua experiência através de um carrossel interativo de emojis, com persistência de dados em tempo real e modo compacto para blogs.

## 🎯 Funcionalidades

### Interface Principal
- **Carrossel de emojis interativo** com navegação horizontal infinita
- **Emoji central destacado** com bolinha verde e escala aumentada
- **Tooltip dinâmico** que aparece automaticamente quando cada emoji chega ao centro
- **Campo de comentário opcional** com gatinho animado
- **Envio de feedback** com estados de loading e mensagens de confirmação
- **Tema automático** baseado no horário (claro 6h-18h, escuro 18h-6h)
- **Alternador manual de tema** com ícones sol/lua

### Modo Compacto para Blogs
- **Interface compacta** otimizada para integração em blogs e posts
- **5 emojis essenciais** para avaliação rápida
- **Feedback instantâneo** com um clique
- **Identificação por post** com campo `post_id` opcional
- **Seletor de interface** para alternar entre modo completo e compacto
- **Gerador de código embed** com botão dedicado para copiar código HTML
- **Widget independente** que funciona em qualquer blog sem dependências
- **Tema automático** baseado nas preferências do sistema do usuário
- **Comunicação direta com Supabase** mantida no código embed

### Sistema de Dados
- **Persistência em Supabase** - todos os feedbacks são salvos no banco de dados
- **Estatísticas em tempo real** - painel lateral com gráficos dos feedbacks recebidos
- **Validação de dados** com tratamento de erros
- **Estados de loading** durante operações assíncronas
- **Políticas RLS** para segurança dos dados

### Experiência do Usuário
- **Design responsivo** adaptado para desktop e mobile
- **Animações suaves** com transições de 300ms
- **Feedback visual** claro para sucesso e erro
- **Auto-limpeza** do formulário após envio bem-sucedido
- **Loop infinito** no carrossel sem travamentos
- **Modo escuro/claro** com transições suaves

## 🎨 Emojis Disponíveis

### Modo Completo (8 emojis)
| Emoji | Sentimento | Descrição |
|-------|------------|-----------|
| 😭 | Extremamente insatisfeito | Experiência muito negativa |
| 😢 | Muito insatisfeito | Experiência ruim |
| 😕 | Insatisfeito | Experiência abaixo do esperado |
| 😐 | Neutro | Experiência mediana |
| 🙂 | Satisfeito | Experiência boa |
| 😊 | Muito satisfeito | Experiência muito boa |
| 🤩 | Encantado | Experiência excelente |
| 🔥 | Entusiasmado | Experiência excepcional |

### Modo Compacto (5 emojis)
| Emoji | Sentimento | Descrição |
|-------|------------|-----------|
| 😭 | Muito ruim | Experiência negativa |
| 😕 | Ruim | Experiência ruim |
| 😐 | Ok | Experiência mediana |
| 😊 | Bom | Experiência boa |
| 🤩 | Excelente | Experiência excelente |

## 🛠️ Tecnologias

- **[React 18](https://reactjs.org/)** - Biblioteca principal
- **[Vite](https://vitejs.dev/)** - Build tool e dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Supabase](https://supabase.com/)** - Backend as a Service (banco de dados)
- **[Lucide React](https://lucide.dev/)** - Ícones SVG

## 🗄️ Estrutura do Banco de Dados

```sql
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji text NOT NULL,
  emotion text NOT NULL,
  comment text,
  post_id text,
  created_at timestamptz DEFAULT now()
);

-- Políticas RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access to feedback"
  ON feedback FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to feedback"
  ON feedback FOR SELECT
  TO public
  USING (true);
```

## 📦 Instalação e Configuração

### Para Desenvolvedores

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Clique no botão **"Connect to Supabase"** no topo direito da interface
2. Configure seu projeto Supabase
3. As variáveis de ambiente serão configuradas automaticamente no arquivo `.env`

### 3. Executar o projeto
```bash
npm run dev
```

### 4. Build para produção
```bash
npm run build
```

### Para Blogueiros (Código Embed)

1. **Acesse o sistema**: Vá para o modo "Blog" usando o seletor
2. **Clique em "📋 Embed"**: Botão no canto superior direito do widget
3. **Copie o código**: Clique em "Copiar código" no modal
4. **Cole no seu blog**: Insira o código HTML em qualquer post ou página
5. **Funciona automaticamente**: O widget detecta tema e salva no banco

#### Exemplo de uso do código embed:
```html
<!-- Cole este código onde quiser o widget de feedback -->
<div id="kitty-feedback-widget"></div>
<script>
// Código gerado automaticamente pelo sistema
// Inclui CSS, JavaScript e conexão com Supabase
</script>
```

#### Características do widget embed:
- ✅ **Tema automático**: Detecta preferência dark/light do usuário
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Independente**: Não precisa de bibliotecas externas
- ✅ **Seguro**: Conexão direta com Supabase mantida
- ✅ **Identificação**: Usa URL da página como identificador do post

## 🎮 Como Usar

### Modo Completo
1. **Navegar pelos emojis**: Use as setas laterais ou clique nos emojis
2. **Ver tooltip**: Cada emoji mostra automaticamente sua descrição quando centralizado
3. **Adicionar comentário**: Digite um comentário opcional na área de texto
4. **Enviar feedback**: Clique em "Enviar feedback" para salvar no banco
5. **Ver estatísticas**: Observe o painel lateral com dados em tempo real
6. **Alternar tema**: Use o botão sol/lua no canto superior direito

### Modo Compacto
1. **Alternar interface**: Use o seletor no canto superior esquerdo
2. **Avaliação rápida**: Clique diretamente no emoji desejado
3. **Feedback instantâneo**: Receba confirmação imediata do envio
4. **Integração em blogs**: Ideal para avaliar posts específicos
5. **Gerar código embed**: Clique no botão "📋 Embed" para obter código HTML
6. **Copiar e colar**: Cole o código gerado em qualquer blog ou site
7. **Funcionamento automático**: O widget funciona independentemente com tema automático

## 📊 Funcionalidades do Dashboard

- **Contadores em tempo real** de cada tipo de emoção
- **Barras de progresso visuais** mostrando distribuição percentual
- **Total de feedbacks** recebidos
- **Atualização automática** quando novos feedbacks são enviados
- **Ordenação por popularidade** (mais votados primeiro)

## 🎨 Componentes Principais

- **`App.tsx`** - Componente principal com carrossel e formulário
- **`CompactFeedback.tsx`** - Interface compacta para blogs
  - Inclui gerador de código embed
  - Modal com código HTML completo
  - Funcionalidade de copiar para clipboard
- **`InterfaceSelector.tsx`** - Seletor entre modo completo e compacto
- **`GatinhoAnimado.tsx`** - Animação do gatinho com rotação de GIFs
- **`FeedbackStats.tsx`** - Painel de estatísticas em tempo real
- **`feedbackService.ts`** - Serviços para comunicação com Supabase
- **`supabase.ts`** - Configuração do cliente Supabase
- **`useTheme.ts`** - Hook para gerenciamento de tema

## 🌙 Sistema de Temas

- **Detecção automática**: Tema escuro das 18h às 6h, claro das 6h às 18h
- **Alternador manual**: Botão sol/lua para override manual
- **Transições suaves**: Animações de 300ms entre temas
- **Persistência visual**: Cores adaptadas para ambos os modos

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Verificação de código
```

## 🚀 Deploy

### Build Local + Upload
```bash
# 1. Fazer build
npm run build

# 2. Enviar para servidor
rsync -avz . root@147.182.183.10:/home/adrock/kitty-chat/
```

### Configuração no Servidor
```bash
# Instalar dependências
npm install

# Servir arquivos estáticos
npm install -g serve
serve -s dist -l 3000 -H 0.0.0.0
```

## 🌐 URLs de Acesso

- **Desenvolvimento local**: `http://localhost:5173`
- **Servidor produção**: `http://147.182.183.10:3000`
- **Com domínio**: `http://mobiledelivery.com.br:3000`

## 📱 Responsividade

- **Desktop**: Interface completa com painel lateral de estatísticas
- **Tablet**: Layout adaptado sem perda de funcionalidades
- **Mobile**: Interface otimizada para toque, estatísticas em modal
- **Modo compacto**: Ideal para integração em qualquer layout

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- **Políticas públicas** apenas para leitura e inserção
- **Validação client-side** e server-side
- **Sanitização de dados** antes do envio
- **Código embed seguro** com chaves públicas do Supabase
- **CORS configurado** para aceitar requisições de qualquer domínio

## 🌍 Integração Universal

O sistema foi projetado para funcionar em **qualquer ambiente**:

### Sistema Principal
- Interface completa com estatísticas
- Painel administrativo
- Tema automático baseado no horário

### Widget para Blogs
- Código HTML independente
- Tema baseado nas preferências do usuário
- Funciona sem dependências externas
- Mantém conexão com banco de dados central

### Casos de Uso
- **Blogs pessoais**: Avaliação de posts
- **Sites corporativos**: Feedback de conteúdo
- **Documentação**: Qualidade das páginas
- **E-commerce**: Avaliação de produtos
- **Educação**: Feedback de aulas/materiais

## 📝 Licença

Este projeto é de uso livre para fins educacionais e demonstrativos.

---

**Desenvolvido com ❤️ usando React + TypeScript + Supabase**

*Última atualização: Setembro 2025*
