# Comandos de Deploy no Servidor

O deploy atual do Kitty Chat não usa mais `serve`.

Hoje o fluxo correto é:

1. `git pull`
2. `npm install`
3. `npm run build`
4. `pm2 restart kitty-chat --update-env`

Comandos:

```bash
cd /home/adrock/kitty-chat
git pull
npm install
npm run build
pm2 restart kitty-chat --update-env
```

Validação:

```bash
curl https://mobiledelivery.com.br/kitty-chat/api/health
pm2 status
```

Para operação completa, consulte:

- [OPERACOES.md](/Users/rafaellins/Documents/Projetos%20Ad%20Rockers/Ad%20Rockers/kitty_chat/OPERACOES.md)
