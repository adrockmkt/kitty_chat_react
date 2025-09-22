# Comandos para Deploy no Servidor

## 1. Fazer build local
```bash
npm run build
```

## 2. Enviar arquivos para o servidor
```bash
rsync -avz dist/ root@147.182.183.10:/home/adrock/kitty-chat/dist/
```

## 3. Conectar no servidor
```bash
ssh root@147.182.183.10
```

## 4. Navegar para o diretório
```bash
cd /home/adrock/kitty-chat
```

## 5. Instalar serve se não estiver instalado
```bash
npm install -g serve
```

## 6. Iniciar o servidor (em background)
```bash
nohup serve -s dist -l 3000 -H 0.0.0.0 > server.log 2>&1 &
```

## 7. Verificar se está rodando
```bash
ps aux | grep serve
curl http://localhost:3000
```

## 8. Para parar o servidor (se necessário)
```bash
pkill -f "serve -s dist"
```

## 9. Para ver os logs
```bash
tail -f server.log
```

## URLs de acesso após deploy:
- http://147.182.183.10:3000
- http://mobiledelivery.com.br:3000