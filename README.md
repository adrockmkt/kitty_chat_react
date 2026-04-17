# Kitty Chat

Widget de reacoes para blog com painel privado de estatisticas.

Este projeto deixa de ser um sistema de feedback geral com duas interfaces e passa a ter um foco unico: registrar reacoes dos leitores nos posts do blog e consolidar tudo em um painel administrativo privado hospedado no proprio servidor da DigitalOcean, sem dependencia de Supabase.

## Objetivo

- Manter o widget visual do blog como ja esta hoje.
- Remover completamente a dependencia de Supabase.
- Registrar reacoes em infraestrutura propria.
- Identificar em qual post cada reacao aconteceu.
- Exibir estatisticas totais e por URL em uma unica tela privada.
- Criar ranking de posts por volume e por sentimento.

## Escopo Atual do Produto

O produto passa a ter apenas dois blocos:

1. Widget publico de reacoes para o blog.
2. Painel privado de estatisticas com login e senha.

Itens fora do novo escopo:

- Interface completa antiga com carrossel.
- Campo de comentario.
- Dashboard publico.
- Heartbeat via Supabase Function.
- Cliente e servicos ligados ao Supabase.

## Requisitos Funcionais

### Widget do blog

- Preservar o layout atual do widget ja publicado no blog.
- Exibir apenas os 5 emojis da versao blog.
- Permitir registrar a reacao com um clique.
- Exibir mensagem visual de confirmacao apos o envio.
- Funcionar em qualquer post do blog via embed ou inclusao no front atual.
- Enviar os dados para uma API propria hospedada na DigitalOcean.

### Identificacao do post

Cada reacao precisa carregar contexto suficiente para analise posterior:

- `post_url`: URL completa da pagina.
- `post_path`: caminho da pagina para agrupamento.
- `post_title`: titulo do documento, quando disponivel.
- `post_id`: opcional, caso no futuro o blog queira enviar um identificador proprio.

### Analise por reacao

Cada emoji representa uma classificacao de sentimento fixa:

| Emoji | Rotulo | Score |
| --- | --- | --- |
| `😭` | muito ruim | `-2` |
| `😕` | ruim | `-1` |
| `😐` | ok | `0` |
| `😊` | bom | `1` |
| `🤩` | excelente | `2` |

Esse mapeamento permite:

- score medio geral do blog
- score medio por post
- distribuicao total por emoji
- comparacao entre posts melhores e piores avaliados

### Painel administrativo

O painel privado deve ficar em:

- `https://mobiledelivery.com.br/kitty-chat`

O acesso deve ser protegido por login e senha.

### Tela unica de estatisticas

O painel deve consolidar em uma unica tela:

- total de reacoes
- distribuicao por emoji
- score medio de sentimento
- serie temporal de reacoes
- ranking de posts com mais reacoes
- ranking de posts com melhor sentimento medio
- ranking de posts com pior sentimento medio
- filtro e busca por URL ou path
- detalhe por post com contagem por emoji
- resumo de sentimento por URL especifica

## Arquitetura Proposta

### Frontend

- Manter a base em `React + TypeScript + Vite`.
- Simplificar a aplicacao para trabalhar apenas com o modo blog e o painel admin.

### Backend

Recomendacao inicial:

- `Node.js + Express`

Motivos:

- simples de manter
- rapido para colocar em producao
- combina com o stack atual do projeto
- suficiente para um volume leve a moderado de reacoes

### Banco de dados

Recomendacao inicial:

- `SQLite`

Motivos:

- elimina servico externo
- facil de fazer backup
- baixo custo operacional
- suficiente para o caso de uso atual

## Modelo de Dados Inicial

### Tabela `reactions`

Campos sugeridos:

- `id`
- `post_url`
- `post_path`
- `post_title`
- `post_id`
- `emoji`
- `emotion_label`
- `sentiment_score`
- `created_at`
- `ip_hash`
- `user_agent`

### Tabela `admin_users`

Campos sugeridos:

- `id`
- `username`
- `password_hash`
- `created_at`

## Endpoints Minimos

### Publicos

- `POST /api/reactions`

Payload esperado:

```json
{
  "emoji": "😊",
  "emotionLabel": "bom",
  "sentimentScore": 1,
  "postUrl": "https://mobiledelivery.com.br/post/exemplo",
  "postPath": "/post/exemplo",
  "postTitle": "Titulo do post",
  "postId": "opcional"
}
```

### Privados

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/stats/overview`
- `GET /api/stats/posts`
- `GET /api/stats/post?url=...`

## Requisitos de Seguranca

- Senha armazenada apenas com hash seguro.
- Sessao autenticada para o painel admin.
- Rate limit basico no endpoint de reacoes.
- Cooldown curto por IP e por post para reduzir spam.
- Hash do IP em vez de armazenar IP puro, quando possivel.

## Fluxos Principais

### Fluxo do leitor

1. O leitor abre um post.
2. O widget exibe os 5 emojis.
3. O leitor clica em uma reacao.
4. O frontend envia a reacao para a API propria.
5. A API grava no SQLite com os metadados do post.
6. O widget exibe confirmacao visual.

### Fluxo do administrador

1. O administrador acessa `https://mobiledelivery.com.br/kitty-chat`.
2. Faz login com usuario e senha.
3. Visualiza a tela unica de estatisticas.
4. Filtra por post, URL ou periodo.
5. Analisa ranking, volume e sentimento.

## Estrategia de Migracao

### Fase 1

- Manter o widget atual.
- Criar API propria.
- Criar banco SQLite.
- Trocar o envio de reacoes do Supabase para a nova API.

### Fase 2

- Implementar login admin.
- Criar dashboard privado.
- Exibir totais, rankings e analise por URL.

### Fase 3

- Remover codigo legado da interface completa.
- Remover dependencias e arquivos do Supabase.
- Atualizar deploy e documentacao operacional.

## Plano Tecnico de Implementacao

### Etapa 1. Preparacao do projeto

- revisar a estrutura atual e separar o que e widget blog do que e legado
- remover do fluxo principal a interface completa
- mapear todos os pontos que hoje dependem de `supabase`

### Etapa 2. Backend proprio

- criar uma pasta de servidor no projeto
- instalar `express`, `sqlite` ou biblioteca equivalente, middleware de auth e seguranca
- criar rotas de reacoes e estatisticas
- criar inicializacao automatica do banco

### Etapa 3. Persistencia

- criar schema do banco SQLite
- implementar insercao de reacoes
- implementar agregacoes para overview, ranking e detalhe por post

### Etapa 4. Integracao do widget

- manter o visual atual do widget
- trocar o `submitFeedback` para usar a nova API
- capturar `window.location.href`, `pathname` e `document.title`
- manter mensagem de sucesso e erro no frontend

### Etapa 5. Autenticacao admin

- criar usuario admin inicial
- implementar login com senha hasheada
- proteger os endpoints privados
- proteger a rota do painel

### Etapa 6. Dashboard

- criar uma unica tela administrativa
- exibir cards de resumo
- exibir tabela ou ranking de posts
- exibir analise por emoji e sentimento
- permitir filtro por URL/post

### Etapa 7. Deploy

- adaptar o servidor da DigitalOcean para servir frontend e API
- decidir entre processo unico Node ou frontend estatico + backend Node separado
- configurar variaveis de ambiente
- configurar rotina simples de backup do arquivo SQLite

### Etapa 8. Limpeza final

- remover `src/lib/supabase.ts`
- remover servicos e embeds que falam com Supabase
- remover `supabase/functions` e migracoes antigas, quando a migracao estiver concluida
- atualizar comandos de deploy e operacao

## Estrutura Esperada apos a Migracao

Exemplo de organizacao desejada:

```text
kitty_chat/
  src/
    admin/
    components/
    services/
  server/
    db/
    routes/
    middleware/
    services/
  data/
    kitty-chat.sqlite
```

## Riscos e Cuidados

- `SQLite` atende bem o caso atual, mas precisa backup recorrente.
- Sem protecao minima, o endpoint publico pode sofrer spam.
- O deploy atual parece orientado a front estatico, entao sera preciso acomodar uma API no servidor.
- A remocao do Supabase deve acontecer so depois que a nova persistencia estiver validada ponta a ponta.

## Criterios de Aceite

- O widget visual continua funcionando no blog sem regressao visual relevante.
- Nenhuma reacao depende de Supabase.
- Cada reacao fica vinculada ao post correto.
- O painel privado exige login.
- O painel mostra estatisticas totais e por URL.
- O painel mostra ranking por volume e por sentimento.
- O sistema roda no servidor da DigitalOcean com banco proprio.

## Scripts Atuais

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Proximo Passo

Implementar a migracao do projeto para:

- backend proprio com `Express`
- persistencia em `SQLite`
- painel admin protegido
- remocao definitiva do Supabase
- remocao da interface completa antiga
