# Kitty Chat React - Sistema de Feedback com Emojis

Um sistema completo de feedback em React + TypeScript + Tailwind que permite aos usuários avaliar sua experiência através de um carrossel interativo de emojis, com persistência de dados em tempo real.

## 🎯 Funcionalidades

### Interface Principal
- **Carrossel de emojis interativo** com navegação horizontal infinita
- **Emoji central destacado** com bolinha verde e escala aumentada
- **Tooltip dinâmico** que aparece automaticamente quando cada emoji chega ao centro
- **Campo de comentário opcional** com gatinho animado
- **Envio de feedback** com estados de loading e mensagens de confirmação

### Sistema de Dados
- **Persistência em Supabase** - todos os feedbacks são salvos no banco de dados
- **Estatísticas em tempo real** - painel lateral com gráficos dos feedbacks recebidos
- **Validação de dados** com tratamento de erros
- **Estados de loading** durante operações assíncronas

### Experiência do Usuário
- **Design responsivo** adaptado para desktop e mobile
- **Animações suaves** com transições de 300ms
- **Feedback visual** claro para sucesso e erro
- **Auto-limpeza** do formulário após envio bem-sucedido
- **Loop infinito** no carrossel sem travamentos

## 🎨 Emojis Disponíveis

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
  created_at timestamptz DEFAULT now()
);
```

## 📦 Instalação e Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Clique no botão **"Connect to Supabase"** no topo direito da interface
2. Configure seu projeto Supabase
3. As variáveis de ambiente serão configuradas automaticamente

### 3. Executar o projeto
```bash
npm run dev
```

### 4. Build para produção
```bash
npm run build
```

## 🎮 Como Usar

1. **Navegar pelos emojis**: Use as setas laterais ou clique nos emojis
2. **Ver tooltip**: Cada emoji mostra automaticamente sua descrição quando centralizado
3. **Adicionar comentário**: Digite um comentário opcional na área de texto
4. **Enviar feedback**: Clique em "Enviar feedback" para salvar no banco
5. **Ver estatísticas**: Observe o painel lateral com dados em tempo real

## 📊 Funcionalidades do Dashboard

- **Contadores em tempo real** de cada tipo de emoção
- **Barras de progresso visuais** mostrando distribuição percentual
- **Total de feedbacks** recebidos
- **Atualização automática** quando novos feedbacks são enviados

## 🎨 Componentes Principais

- **`App.tsx`** - Componente principal com carrossel e formulário
- **`GatinhoAnimado.tsx`** - Animação do gatinho com rotação de GIFs
- **`FeedbackStats.tsx`** - Painel de estatísticas em tempo real
- **`feedbackService.ts`** - Serviços para comunicação com Supabase
- **`supabase.ts`** - Configuração do cliente Supabase

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Verificação de código
```

## 🚀 Deploy

O projeto está configurado para deploy automático. Todos os assets estáticos são gerados na pasta `dist/` após o build.

## 📝 Licença

Este projeto é de uso livre para fins educacionais e demonstrativos.

---

**Desenvolvido com ❤️ usando React + TypeScript + Supabase**