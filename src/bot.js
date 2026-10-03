const {
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Configure DISCORD_TOKEN nas variáveis de ambiente.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once(Events.ClientReady, readyClient => {
  console.log(`Bot conectado como ${readyClient.user.tag}.`);
});

async function announceMemberEvent(guild, message) {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  const channel = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : guild.systemChannel;

  if (!channel?.isTextBased() || !channel.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)) {
    console.warn(`Não consegui enviar aviso no servidor ${guild.name}.`);
    return;
  }

  await channel.send(message)
    .catch(error => console.error("Falha ao enviar aviso de membros:", error));
}

client.on(Events.GuildMemberAdd, async member => {
  await announceMemberEvent(
    member.guild,
    `Bem-vindo(a) ${member}! Seja muito bem-vindo(a) ao **${member.guild.name}**! 🎉`,
  );
});

client.on(Events.GuildMemberRemove, async member => {
  await announceMemberEvent(
    member.guild,
    `👋 **${member.user.tag}** saiu do servidor **${member.guild.name}**.`,
  );
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply({ content: "Pong! 🏓" });
    return;
  }

  const requiredPermissions = {
    kick: PermissionFlagsBits.KickMembers,
    ban: PermissionFlagsBits.BanMembers,
    timeout: PermissionFlagsBits.ModerateMembers,
    clear: PermissionFlagsBits.ManageMessages,
  };
  const permission = requiredPermissions[interaction.commandName];

  if (!permission) return;
  if (!interaction.memberPermissions?.has(permission)) {
    await interaction.reply({ content: "Você não tem permissão para usar este comando.", ephemeral: true });
    return;
  }

  try {
    if (interaction.commandName === "clear") {
      const amount = interaction.options.getInteger("quantidade", true);
      const channel = interaction.channel;
      if (!channel?.isTextBased() || !("bulkDelete" in channel)) {
        await interaction.reply({ content: "Este comando só funciona em canais de texto.", ephemeral: true });
        return;
      }
      const deleted = await channel.bulkDelete(amount, true);
      await interaction.reply({ content: `${deleted.size} mensagem(ns) apagada(s).`, ephemeral: true });
      return;
    }

    const user = interaction.options.getUser("membro", true);
    const reason = interaction.options.getString("motivo") || `Ação de moderação por ${interaction.user.tag}`;
    if (user.id === interaction.user.id) {
      await interaction.reply({ content: "Você não pode aplicar essa ação em si mesmo.", ephemeral: true });
      return;
    }
    if (user.id === client.user.id) {
      await interaction.reply({ content: "Não posso aplicar essa ação em mim mesmo.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Esse usuário não é membro deste servidor.", ephemeral: true });
      return;
    }

    if (interaction.commandName === "kick") {
      await member.kick(reason);
      await interaction.reply({ content: `👢 ${user.tag} foi expulso. Motivo: ${reason}`, ephemeral: true });
    } else if (interaction.commandName === "ban") {
      await member.ban({ reason });
      await interaction.reply({ content: `🔨 ${user.tag} foi banido. Motivo: ${reason}`, ephemeral: true });
    } else if (interaction.commandName === "timeout") {
      const minutes = interaction.options.getInteger("minutos", true);
      await member.timeout(minutes * 60_000, reason);
      await interaction.reply({ content: `⏳ ${user.tag} recebeu timeout por ${minutes} minuto(s). Motivo: ${reason}`, ephemeral: true });
    }
  } catch (error) {
    console.error(`Erro no comando /${interaction.commandName}:`, error);
    const response = { content: "Não consegui concluir. Confira minhas permissões e minha posição na hierarquia de cargos.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(() => {});
    } else {
      await interaction.reply(response).catch(() => {});
    }
  }
});

client.login(token);
