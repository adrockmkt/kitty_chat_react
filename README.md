# Kitty Chat

Painel de reações para blog com backend próprio, banco local e dashboard privado.

O Kitty Chat evoluiu da versão antiga baseada em Supabase para uma arquitetura mais simples de operar na DigitalOcean: widget de reações para blog, API própria em `Express`, persistência em `SQLite` e painel privado para leitura de sentimento por post.

## Status Atual

O escopo ativo hoje é:

1. Widget de reações para blog com 5 emojis.
2. API própria para registrar reações.
3. Painel administrativo privado com login.
4. Análise consolidada de sentimento por URL e ranking de posts.

Itens removidos do fluxo principal:

- interface completa antiga com carrossel
- comentários opcionais
- estatísticas públicas
- heartbeat via Supabase
- cliente e persistência em Supabase

## Principais Recursos

### Widget do blog

- 5 emojis para avaliação rápida do conteúdo
- confirmação visual após o clique
- captura automática de `post_url`, `post_path` e `post_title`
- suporte a embed para uso em páginas do blog e no Framer
- visual do widget preservado para harmonizar com o site

### Painel administrativo

- login com usuário e senha
- visão geral com total de reações, posts rastreados, sentimento médio e taxa positiva
- ranking por volume de reações
- ranking de melhor sentimento, filtrando apenas posts positivos
- ranking de pior sentimento, filtrando apenas posts negativos
- detalhe por URL/post
- timeline recente de reações
- busca por URL, path ou título

### Tema

- o painel segue automaticamente o tema do sistema ou navegador via `prefers-color-scheme`
- se o sistema estiver em modo claro, o painel abre claro
- se o sistema estiver em modo escuro, o painel abre escuro

## Arquitetura

### Frontend

- `React`
- `TypeScript`
- `Vite`
- `Tailwind CSS`

### Backend

- `Node.js`
- `Express`
- `cookie-parser`
- `bcryptjs`

### Persistência

- `SQLite` via `better-sqlite3`

## Estrutura Principal

```text
kitty_chat/
  src/
    assets/
    components/
    hooks/
    lib/
    services/
  server/
    auth.js
    config.js
    db.js
    index.js
    reactions.js
  data/
    kitty-chat.sqlite
```

## Mapeamento de Sentimento

| Emoji | Rótulo | Score |
| --- | --- | --- |
| `😭` | Muito ruim | `-2` |
| `😕` | Ruim | `-1` |
| `😐` | Ok | `0` |
| `😊` | Bom | `1` |
| `🤩` | Excelente | `2` |

Esse score é usado para:

- sentimento médio geral
- sentimento médio por post
- comparação entre posts
- ranking de conteúdos com percepção melhor ou pior

## Dados Registrados por Reação

Cada clique no widget salva:

- `post_url`
- `post_path`
- `post_title`
- `post_id` opcional
- `emoji`
- `emotion_label`
- `sentiment_score`
- `created_at`
- `ip_hash`
- `user_agent`

O embed atual também tenta resolver corretamente o contexto do post quando está inserido em ambientes como Framer, usando `canonical`, `og:url`, `document.referrer` e contexto pai quando necessário.

## Endpoints

### Públicos

- `POST /api/reactions`

Payload base:

```json
{
  "emoji": "😊",
  "postUrl": "https://adrock.com.br/blog/exemplo",
  "postPath": "/blog/exemplo",
  "postTitle": "Título do post"
}
```

### Privados

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/stats/overview`
- `GET /api/stats/posts`
- `GET /api/stats/post?path=...`

## Variáveis de Ambiente

Crie um `.env` na raiz baseado em [/.env.example](/Users/rafaellins/Documents/Projetos%20Ad%20Rockers/Ad%20Rockers/kitty_chat/.env.example):

```env
KITTY_ADMIN_USERNAME=admin
KITTY_ADMIN_PASSWORD=troque-esta-senha
KITTY_SESSION_SECRET=troque-esta-chave
KITTY_BASE_PATH=/kitty-chat
PORT=3100
```

### O que cada variável faz

- `KITTY_ADMIN_USERNAME`: usuário de acesso ao painel
- `KITTY_ADMIN_PASSWORD`: senha do painel
- `KITTY_SESSION_SECRET`: chave usada para assinar a sessão autenticada
- `KITTY_BASE_PATH`: base pública do painel
- `PORT`: porta do servidor backend

## Execução Local

Instale as dependências:

```bash
npm install
```

Suba o backend:

```bash
npm run server
```

Em outro terminal, suba o frontend:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:5173/kitty-chat
```

## Scripts

```bash
npm run dev
npm run server
npm run start
npm run build
npm run lint
npm run preview
```

## Banco e Login Admin

- o banco local é criado automaticamente em `data/kitty-chat.sqlite`
- o usuário admin inicial é criado a partir do `.env`
- se o usuário `KITTY_ADMIN_USERNAME` já existir, a senha é sincronizada com `KITTY_ADMIN_PASSWORD`

## Segurança

- senha armazenada com hash
- sessão autenticada por cookie `httpOnly`
- hash de IP para reduzir armazenamento sensível
- cooldown básico por IP e por post no endpoint público de reações
- CORS habilitado no endpoint público para permitir uso do widget embedado fora do painel

## Deploy

Em produção, o projeto roda assim:

1. frontend buildado em `dist/`
2. backend Node com `server/index.js`
3. banco `SQLite` local no servidor
4. `pm2` segurando o processo do app
5. `nginx` servindo `/kitty-chat/` e roteando `/kitty-chat/api/`

URL atual:

- `https://mobiledelivery.com.br/kitty-chat/`

## Critérios de Aceite da Nova Versão

- o widget registra reações sem depender de Supabase
- cada reação fica vinculada ao post correto
- o painel privado exige login
- o painel mostra estatísticas totais e por URL
- o painel mostra ranking por volume e por sentimento
- o sistema opera com banco próprio no servidor

## Observações

- o embed do widget segue independente do painel
- o visual do widget foi preservado para não quebrar a harmonia com o blog
- o painel foi redesenhado para refletir a identidade visual da marca
- o ranking de melhor sentimento mostra apenas posts positivos
- o ranking de pior sentimento mostra apenas posts negativos
