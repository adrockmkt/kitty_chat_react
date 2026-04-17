# Kitty Chat

Painel de reacoes para blog com backend proprio, banco local e dashboard privado.

O projeto evoluiu da versao anterior baseada em Supabase para uma arquitetura mais simples de operar na DigitalOcean: widget de reacoes para blog, API propria em `Express`, persistencia em `SQLite` e painel privado para leitura de sentimento por post.

## Status Atual

O escopo ativo hoje e:

1. Widget de reacoes para blog com 5 emojis.
2. API propria para registrar reacoes.
3. Painel administrativo privado com login.
4. Analise consolidada de sentimento por URL e ranking de posts.

Itens removidos do fluxo principal:

- interface completa antiga com carrossel
- comentarios opcionais
- estatisticas publicas
- heartbeat via Supabase
- cliente e persistencia em Supabase

## Principais Recursos

### Widget do blog

- 5 emojis para avaliacao rapida do conteudo
- confirmacao visual apos o clique
- captura automatica de `post_url`, `post_path` e `post_title`
- embed independente para inserir em qualquer pagina
- visual do widget preservado para harmonizar com o blog

### Painel administrativo

- login com usuario e senha
- visao geral com total de reacoes, posts rastreados, sentimento medio e taxa positiva
- ranking por volume de reacoes
- ranking de melhor sentimento
- ranking de pior sentimento
- detalhe por URL/post
- timeline recente de reacoes
- busca por URL, path ou titulo

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

### Persistencia

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

| Emoji | Rotulo | Score |
| --- | --- | --- |
| `😭` | Muito ruim | `-2` |
| `😕` | Ruim | `-1` |
| `😐` | Ok | `0` |
| `😊` | Bom | `1` |
| `🤩` | Excelente | `2` |

Esse score e usado para:

- sentimento medio geral
- sentimento medio por post
- comparacao entre posts
- ranking de conteudos com percepcao melhor ou pior

## Dados Registrados por Reacao

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

## Endpoints

### Publicos

- `POST /api/reactions`

Payload base:

```json
{
  "emoji": "😊",
  "postUrl": "https://adrock.com.br/blog/exemplo",
  "postPath": "/blog/exemplo",
  "postTitle": "Titulo do post"
}
```

### Privados

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/stats/overview`
- `GET /api/stats/posts`
- `GET /api/stats/post?path=...`

## Variaveis de Ambiente

Crie um `.env` na raiz baseado em [/.env.example](/Users/rafaellins/Documents/Projetos%20Ad%20Rockers/Ad%20Rockers/kitty_chat/.env.example):

```env
KITTY_ADMIN_USERNAME=admin
KITTY_ADMIN_PASSWORD=troque-esta-senha
KITTY_SESSION_SECRET=troque-esta-chave
KITTY_BASE_PATH=/kitty-chat
PORT=3000
```

### O que cada variavel faz

- `KITTY_ADMIN_USERNAME`: usuario de acesso ao painel
- `KITTY_ADMIN_PASSWORD`: senha do painel
- `KITTY_SESSION_SECRET`: chave usada para assinar a sessao autenticada
- `KITTY_BASE_PATH`: base publica do painel
- `PORT`: porta do servidor backend

## Execucao Local

Instale as dependencias:

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

- o banco local e criado automaticamente em `data/kitty-chat.sqlite`
- o usuario admin inicial e criado a partir do `.env`
- se o usuario `KITTY_ADMIN_USERNAME` ja existir, a senha e sincronizada com `KITTY_ADMIN_PASSWORD`

## Seguranca

- senha armazenada com hash
- sessao autenticada por cookie `httpOnly`
- hash de IP para reduzir armazenamento sensivel
- cooldown basico por IP e por post no endpoint publico de reacoes

## Deploy

Para producao, a ideia atual e servir:

1. frontend buildado em `dist/`
2. backend Node com `node server/index.js`
3. banco `SQLite` local no servidor

O painel previsto continua em:

- `https://mobiledelivery.com.br/kitty-chat`

## Criterios de Aceite da Nova Versao

- o widget registra reacoes sem depender de Supabase
- cada reacao fica vinculada ao post correto
- o painel privado exige login
- o painel mostra estatisticas totais e por URL
- o painel mostra ranking por volume e por sentimento
- o sistema opera com banco proprio no servidor

## Observacoes

- o embed do widget segue independente do painel
- o visual do widget foi preservado para nao quebrar a harmonia com o blog
- o painel foi redesenhado para refletir a identidade visual da marca e acompanhar tema claro/escuro automaticamente
