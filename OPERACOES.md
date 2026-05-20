# Operações do Kitty Chat

Guia curto para manter o projeto em produção na DigitalOcean.

## Estrutura atual

- aplicação: `/home/adrock/kitty-chat`
- banco: `/home/adrock/kitty-chat/data/kitty-chat.sqlite`
- processo Node: `pm2` com nome `kitty-chat`
- rota pública: `https://mobiledelivery.com.br/kitty-chat/`
- healthcheck: `https://mobiledelivery.com.br/kitty-chat/api/health`

## Deploy padrão

No servidor:

```bash
cd /home/adrock/kitty-chat
git pull
npm install
npm run build
pm2 restart kitty-chat --update-env
```

## Validação pós-deploy

```bash
curl https://mobiledelivery.com.br/kitty-chat/api/health
pm2 status
```

O healthcheck deve responder:

```json
{"ok":true}
```

## Variáveis de ambiente

Arquivo:

```bash
/home/adrock/kitty-chat/.env
```

Campos mínimos:

```env
KITTY_ADMIN_USERNAME=admin
KITTY_ADMIN_PASSWORD=troque-a-senha
KITTY_SESSION_SECRET=troque-a-chave
KITTY_BASE_PATH=/kitty-chat
PORT=3100
```

## PM2

Ver status:

```bash
pm2 status
```

Reiniciar:

```bash
pm2 restart kitty-chat --update-env
```

Salvar estado atual:

```bash
pm2 save
```

Garantir inicialização após reboot:

```bash
pm2 startup
```

## Backup do banco

Criar backup manual:

```bash
cd /home/adrock/kitty-chat
npm run backup:db
```

Os arquivos são salvos em:

```bash
/home/adrock/kitty-chat/data/backups/
```

### Sugestão de cron diário

Abra o crontab:

```bash
crontab -e
```

Adicione:

```cron
0 3 * * * cd /home/adrock/kitty-chat && /usr/bin/npm run backup:db >> /home/adrock/kitty-chat/logs/backup.log 2>&1
```

Antes disso, garanta a pasta de logs:

```bash
mkdir -p /home/adrock/kitty-chat/logs
```

## Limpeza de dados de teste

Ver quantos registros de teste/local existem:

```bash
cd /home/adrock/kitty-chat
npm run cleanup:test-data
```

Remover de verdade:

```bash
npm run cleanup:test-data:apply
```

Recomendação:

1. rode o backup antes
2. faça a limpeza
3. valide o painel

## Nginx

Arquivo principal usado hoje:

```bash
/etc/nginx/sites-enabled/agente-palavras-adrock
```

Trechos importantes:

- `/kitty-chat/` serve o frontend
- `/kitty-chat/api/` faz proxy para `127.0.0.1:3100`

Depois de alterar:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Restauração rápida do banco

1. parar a app:

```bash
pm2 stop kitty-chat
```

2. restaurar um backup:

```bash
cp /home/adrock/kitty-chat/data/backups/ARQUIVO.sqlite /home/adrock/kitty-chat/data/kitty-chat.sqlite
```

3. subir de novo:

```bash
pm2 start kitty-chat
```

## Checklist de produção

- login do painel funcionando
- widget registrando reações
- URL e título do post chegando corretamente
- ranking carregando
- healthcheck respondendo
- `pm2 status` com `kitty-chat` online
