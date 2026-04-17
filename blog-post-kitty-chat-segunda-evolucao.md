# Kitty Chat React 2.0: da dependência do Supabase para um painel próprio de reações

## Título sugerido

Kitty Chat React 2.0: a segunda evolução do widget de reações para blog

## Subtítulo sugerido

Como o Kitty Chat deixou de depender do Supabase, ganhou backend próprio, banco local em SQLite, painel privado e um fluxo muito mais coerente com o uso real no blog.

## Contexto

No post anterior, publicado em [Kitty Chat React Sistema de Feedback com Emojis e Supabase](https://adrock.com.br/blog/kitty-chat-react-feedback-emojis-supabase), o projeto foi apresentado como um sistema de feedback com carrossel de emojis, comentários opcionais, dashboard e persistência em Supabase.

Essa fase foi importante para validar a ideia e provar que um widget leve de reações podia gerar dados úteis sobre a percepção do leitor. Mas, na prática, o uso real do projeto acabou ficando mais claro: o que fazia sentido no dia a dia do blog era o modo compacto, embedado nos posts, com reações simples e leitura rápida de sentimento.

Foi a partir dessa observação que nasceu a segunda evolução do Kitty Chat.

## A dor real do projeto

Apesar de funcionar bem tecnicamente, a arquitetura anterior tinha um problema operacional: a dependência do Supabase Free.

Como o uso do widget no blog não gera um volume massivo de eventos o tempo todo, a camada gratuita nem sempre era a melhor escolha para esse tipo de projeto. Isso trazia uma fricção desnecessária: reativações, dependência externa e uma manutenção que não combinava com a simplicidade do caso de uso.

Em outras palavras: o projeto estava maior do que a necessidade real.

## O que mudou na segunda evolução

O Kitty Chat foi redesenhado com foco total no uso prático:

- saiu o Supabase
- saiu a interface completa com carrossel
- saiu o campo de comentário
- entrou um backend próprio em Node.js com Express
- entrou um banco local em SQLite
- entrou um painel privado com login e senha
- ficou apenas o widget blog, que é a parte realmente usada em produção

Essa mudança reduziu dependência externa, simplificou o deploy e deixou o projeto mais coerente com o objetivo principal: medir rapidamente o sentimento do público em relação aos posts do blog.

## A nova arquitetura

Hoje o projeto funciona assim:

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- cookie-parser
- bcryptjs

### Persistência

- SQLite com better-sqlite3

Esse conjunto faz muito sentido para um projeto que precisa:

- ser leve
- rodar no próprio servidor
- ter manutenção simples
- armazenar dados de forma confiável
- dispensar serviços externos para uma necessidade pequena ou média

## Como o widget funciona agora

O widget continua visualmente alinhado ao blog, mas o fluxo interno mudou bastante.

Cada clique em um emoji agora envia uma requisição para a API própria do projeto, que salva:

- URL completa do post
- path da página
- título do documento
- emoji selecionado
- rótulo emocional correspondente
- score numérico de sentimento
- data do evento

Além disso, o embed atual tenta resolver corretamente o contexto do post mesmo quando está em ambientes como Framer, usando `canonical`, `og:url`, `document.referrer` e contexto pai quando necessário.

Esse detalhe da URL é essencial, porque transforma o widget em uma ferramenta de leitura editorial, e não apenas em um capturador de cliques.

## Análise de sentimento sem IA

Uma das decisões mais interessantes dessa versão foi assumir uma leitura simples e robusta de sentimento baseada no próprio emoji.

O mapeamento ficou assim:

- `😭` = muito ruim = `-2`
- `😕` = ruim = `-1`
- `😐` = ok = `0`
- `😊` = bom = `1`
- `🤩` = excelente = `2`

Isso significa que o projeto não depende de NLP, LLM ou análise semântica para gerar um painel acionável. O próprio gesto do usuário já carrega uma intenção emocional clara o suficiente para produzir leitura agregada.

Na prática, isso permite ver:

- sentimento médio geral do blog
- sentimento médio por post
- distribuição total por emoji
- ranking dos posts com maior volume de reação
- ranking dos posts com melhor percepção, apenas entre os positivos
- ranking dos posts com pior percepção, apenas entre os negativos

## O novo painel privado

Outro grande passo da segunda evolução foi a criação de um painel administrativo protegido por login.

Em vez de depender de um dashboard público ou acoplado a um backend de terceiros, o projeto agora tem uma área privada em:

- `https://mobiledelivery.com.br/kitty-chat/`

O painel entrega em uma única tela:

- total de reações
- quantidade de posts monitorados
- sentimento médio
- taxa positiva
- ranking por volume
- ranking por melhor sentimento
- ranking por pior sentimento
- busca por URL, path ou título
- detalhe completo de um post específico
- timeline recente de reações

Na prática, o Kitty Chat deixou de ser apenas um widget e passou a ser uma camada editorial de leitura de percepção sobre conteúdo.

## Por que SQLite fez sentido

Para esse caso de uso, SQLite foi uma escolha muito melhor do que manter um banco externo.

Motivos:

- elimina a dependência do Supabase
- reduz custo operacional
- simplifica backup
- roda junto da aplicação
- atende muito bem um painel de reações com volume controlado

Nem todo projeto precisa nascer com uma stack distribuída ou com banco remoto. Em vários casos, a solução certa é a que reduz atrito, não a que adiciona mais serviços.

## O que essa evolução melhora na prática

### Mais controle

Agora toda a coleta e leitura de dados acontece em infraestrutura própria.

### Menos fricção

Não existe mais a dependência do plano gratuito do Supabase para manter o sistema funcionando.

### Mais foco

O projeto foi simplificado para a parte que realmente gerava valor no blog: o widget compacto e a leitura das estatísticas por post.

### Mais contexto editorial

Como cada evento é associado a URL e path, o painel permite entender quais conteúdos geram maior identificação e melhor resposta emocional.

## Uma mudança de maturidade de produto

Talvez o ponto mais interessante dessa segunda fase seja que ela representa uma evolução de maturidade, e não apenas de tecnologia.

Na primeira fase, o Kitty Chat era uma prova de conceito expandida: queria mostrar possibilidades, interatividade, visual e integração com backend moderno.

Na segunda fase, ele virou uma ferramenta com escopo claro:

- medir reações reais
- organizar o dado por post
- entregar leitura consolidada de sentimento
- operar com simplicidade

Essa é a diferença entre um experimento técnico e um produto que encontra seu uso real.

## Conclusão

O Kitty Chat 2.0 não é uma versão "maior". É uma versão mais certa.

Ao remover dependências desnecessárias, simplificar a arquitetura e focar no uso real do widget no blog, o projeto ficou mais útil, mais sustentável e mais fácil de operar.

Ele continua sendo leve e visual, mas agora entrega algo ainda mais importante: autonomia.

## Blocos prontos para reaproveitar no post

### Trecho curto de destaque

O Kitty Chat deixou de ser um experimento com Supabase e virou uma infraestrutura própria de leitura de sentimento editorial. Agora, cada reação do leitor é vinculada ao post correto e analisada em um painel privado com backend local, SQLite e ranking por polaridade.

### CTA final sugerido

Se você trabalha com conteúdo, produto ou marketing e quer transformar reações simples em leitura acionável de sentimento por página, essa nova arquitetura do Kitty Chat mostra que dá para fazer isso com uma stack enxuta, própria e muito mais fácil de manter.
