# Kitty Chat React 2.0: da dependencia do Supabase para um painel proprio de reacoes

## Titulo sugerido

Kitty Chat React 2.0: a segunda evolucao do widget de reacoes para blog

## Subtitulo sugerido

Como o Kitty Chat deixou de depender do Supabase, ganhou backend proprio, banco local em SQLite e um painel privado para leitura de sentimento por post.

## Contexto

No post anterior, publicado em [Ad Rock Digital Mkt - Blog - Kitty Chat React Sistema de Feedback com Emojis e Supabase](https://adrock.com.br/blog/kitty-chat-react-feedback-emojis-supabase), o projeto foi apresentado como um sistema de feedback com carrossel de emojis, comentarios opcionais, dashboard e persistencia em Supabase.

Essa fase foi importante para validar a ideia e provar que um widget leve de reacoes podia gerar dados uteis sobre a percepcao do leitor. Mas, na pratica, o uso real do projeto acabou ficando mais claro: o que fazia sentido no dia a dia do blog era o modo compacto, embedado nos posts, com reacoes simples e leitura rapida de sentimento.

Foi a partir dessa observacao que nasceu a segunda evolucao do Kitty Chat.

## A dor real do projeto

Apesar de funcionar bem tecnicamente, a arquitetura anterior tinha um problema operacional: a dependencia do Supabase Free.

Como o uso do widget no blog nao gera um volume massivo de eventos o tempo todo, a camada gratuita nem sempre era a melhor escolha para esse tipo de projeto. Isso trazia uma friccao desnecessaria: reativacoes, dependencia externa e uma manutencao que nao combinava com a simplicidade do caso de uso.

Em outras palavras: o projeto estava maior do que a necessidade real.

## O que mudou na segunda evolucao

O Kitty Chat foi redesenhado com foco total no uso pratico:

- saiu o Supabase
- saiu a interface completa com carrossel
- saiu o campo de comentario
- entrou um backend proprio em Node.js com Express
- entrou um banco local em SQLite
- entrou um painel privado com login e senha
- ficou apenas o widget blog, que e a parte realmente usada em producao

Essa mudanca reduziu dependencia externa, simplificou o deploy e deixou o projeto mais coerente com o objetivo principal: medir rapidamente o sentimento do publico em relacao aos posts do blog.

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

### Persistencia

- SQLite com better-sqlite3

Esse conjunto faz muito sentido para um projeto que precisa:

- ser leve
- rodar no proprio servidor
- ter manutencao simples
- armazenar dados de forma confiavel
- dispensar servicos externos para uma necessidade pequena ou media

## Como o widget funciona agora

O widget continua visualmente alinhado ao blog, mas o fluxo interno mudou bastante.

Cada clique em um emoji agora envia uma requisicao para a API propria do projeto, que salva:

- URL completa do post
- path da pagina
- titulo do documento
- emoji selecionado
- rotulo emocional correspondente
- score numerico de sentimento
- data do evento

Esse detalhe da URL e essencial, porque transforma o widget em uma ferramenta de leitura editorial, e nao apenas em um capturador de cliques.

## Analise de sentimento sem IA

Uma das decisoes mais interessantes dessa versao foi assumir uma leitura simples e robusta de sentimento baseada no proprio emoji.

O mapeamento ficou assim:

- `😭` = muito ruim = `-2`
- `😕` = ruim = `-1`
- `😐` = ok = `0`
- `😊` = bom = `1`
- `🤩` = excelente = `2`

Isso significa que o projeto nao depende de NLP, LLM ou analise semantica para gerar um painel acionavel. O proprio gesto do usuario ja carrega uma intencao emocional clara o suficiente para produzir leitura agregada.

Na pratica, isso permite ver:

- sentimento medio geral do blog
- sentimento medio por post
- distribuicao total por emoji
- ranking dos posts com maior volume de reacao
- ranking dos posts com melhor percepcao
- ranking dos posts com pior percepcao

## O novo painel privado

Outro grande passo da segunda evolucao foi a criacao de um painel administrativo protegido por login.

Em vez de depender de um dashboard publico ou acoplado a um backend de terceiros, o projeto agora tem uma area privada em:

- `https://mobiledelivery.com.br/kitty-chat`

O painel entrega em uma unica tela:

- total de reacoes
- quantidade de posts monitorados
- sentimento medio
- taxa positiva
- ranking por volume
- ranking por melhor sentimento
- ranking por pior sentimento
- busca por URL, path ou titulo
- detalhe completo de um post especifico
- timeline recente de reacoes

Na pratica, o Kitty Chat deixou de ser apenas um widget e passou a ser uma camada editorial de leitura de percepcao sobre conteudo.

## Por que SQLite fez sentido

Para esse caso de uso, SQLite foi uma escolha muito melhor do que manter um banco externo.

Motivos:

- elimina a dependencia do Supabase
- reduz custo operacional
- simplifica backup
- roda junto da aplicacao
- atende muito bem um painel de reacoes com volume controlado

Nem todo projeto precisa nascer com uma stack distribuida ou com banco remoto. Em varios casos, a solucao certa e a que reduz atrito, nao a que adiciona mais servicos.

## O que essa evolucao melhora na pratica

### Mais controle

Agora toda a coleta e leitura de dados acontece em infraestrutura propria.

### Menos friccao

Nao existe mais a dependencia do plano gratuito do Supabase para manter o sistema funcionando.

### Mais foco

O projeto foi simplificado para a parte que realmente gerava valor no blog: o widget compacto e a leitura das estatisticas por post.

### Mais contexto editorial

Como cada evento e associado a URL e path, o painel permite entender quais conteudos geram maior identificacao e melhor resposta emocional.

## Uma mudanca de maturidade de produto

Talvez o ponto mais interessante dessa segunda fase seja que ela representa uma evolucao de maturidade, e nao apenas de tecnologia.

Na primeira fase, o Kitty Chat era uma prova de conceito expandida: queria mostrar possibilidades, interatividade, visual e integracao com backend moderno.

Na segunda fase, ele virou uma ferramenta com escopo claro:

- medir reacoes reais
- organizar o dado por post
- entregar leitura consolidada de sentimento
- operar com simplicidade

Essa e a diferenca entre um experimento tecnico e um produto que encontra seu uso real.

## Conclusao

O Kitty Chat 2.0 nao e uma versao "maior". E uma versao mais certa.

Ao remover dependencias desnecessarias, simplificar a arquitetura e focar no uso real do widget no blog, o projeto ficou mais util, mais sustentavel e mais facil de operar.

Ele continua sendo leve e visual, mas agora entrega algo ainda mais importante: autonomia.

## Blocos prontos para reaproveitar no post

### Trecho curto de destaque

O Kitty Chat deixou de ser um experimento com Supabase e virou uma infraestrutura propria de leitura de sentimento editorial. Agora, cada reacao do leitor e vinculada ao post correto e analisada em um painel privado com backend local, SQLite e ranking por percepcao.

### CTA final sugerido

Se voce trabalha com conteudo, produto ou marketing e quer transformar reacoes simples em leitura acionavel de sentimento por pagina, essa nova arquitetura do Kitty Chat mostra que da para fazer isso com uma stack enxuta, propria e muito mais facil de manter.
