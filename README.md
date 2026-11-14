# smegmacord

Chat + calls com compartilhamento de tela. Sem dependências: só precisa de Node 18 ou mais novo.

## Rodar no seu computador
    node server.js
Abra http://localhost:3000. Microfone e tela funcionam em localhost.

## Colocar no ar pros amigos
Mic e compartilhamento de tela exigem HTTPS. Use qualquer hospedagem de Node que dê HTTPS (Render, Railway, Fly.io, Replit...):
1. Suba esta pasta num repositório do GitHub.
2. Crie um "Web Service" na hospedagem apontando pro repositório.
3. Comando de build: vazio. Comando de start: `node server.js`.
4. Mande a URL gerada pros amigos.

Sem hospedar: rode `node server.js` e exponha com um túnel (ex.: `cloudflared tunnel --url http://localhost:3000`).

## Observações
- As mensagens ficam em `data.json` (últimas 300 por canal). Em hospedagem gratuita o arquivo pode zerar a cada deploy.
- Qualquer pessoa com a URL entra. Não divulgue o link.
- As calls usam WebRTC com servidor STUN do Google. Em redes muito restritas pode ser preciso um servidor TURN.

## No celular
Abra a URL no Chrome (Android) ou Safari (iPhone) e use "Adicionar à tela inicial" / "Instalar app". Vira um ícone com a logo e abre em tela cheia.
Chat, voz e assistir a tela dos outros funcionam. Compartilhar a própria tela não funciona em navegador de celular (limitação do sistema).

## App Android
Pra compartilhar a tela pelo celular, use o projeto `smegmacord-android` (APK). Ele abre este mesmo site.
