# Bot do Discord do FoxLT

Bot inicial com mensagem de boas-vindas e comandos de moderação.

## O que ele faz

- Envia uma mensagem quando alguém entra. Configure `WELCOME_CHANNEL_ID`; sem ela, tenta usar o canal de sistema do servidor.
- Disponibiliza `/kick`, `/ban`, `/timeout` e `/clear`.
- Os comandos exigem a permissão correspondente no Discord e o bot precisa ter permissões e cargo acima do membro moderado.

## Criar e convidar o bot

1. Crie uma aplicação no [Discord Developer Portal](https://discord.com/developers/applications).
2. Na página **Bot**, crie/copiei o token. Mantenha-o secreto; não o coloque no GitHub nem o envie no chat.
3. Em **Bot > Privileged Gateway Intents**, ative **Server Members Intent** para receber o evento de entrada de membros.
4. Em **OAuth2 > URL Generator**, marque os escopos `bot` e `applications.commands`.
5. Convide o bot ao seu servidor com as permissões **View Channels**, **Send Messages**, **Kick Members**, **Ban Members**, **Moderate Members** e **Manage Messages**. Dê ao cargo do bot uma posição acima dos membros que ele poderá moderar.

## Configuração local

Requer Node.js 24.17 ou mais recente.

1. Copie `.env.example` para `.env` e preencha:
   - `DISCORD_TOKEN`: token do bot.
   - `DISCORD_CLIENT_ID`: Application ID da aplicação.
   - `DISCORD_GUILD_ID`: ID do seu servidor (ative o Modo Desenvolvedor no Discord e use **Copiar ID**).
   - `WELCOME_CHANNEL_ID`: ID do canal de boas-vindas.
2. No terminal, nesta pasta:
   ```sh
   npm install
   npm run deploy-commands
   npm start
   ```

Os comandos são registrados para o servidor indicado em `DISCORD_GUILD_ID`. Para deixar o bot online continuamente, hospede-o como um processo de background worker e configure as mesmas variáveis secretas no painel da hospedagem.
