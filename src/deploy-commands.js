const {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error("Configure DISCORD_TOKEN, DISCORD_CLIENT_ID e DISCORD_GUILD_ID.");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa um membro do servidor.")
    .addUserOption(option =>
      option.setName("membro").setDescription("Membro para expulsar.").setRequired(true))
    .addStringOption(option =>
      option.setName("motivo").setDescription("Motivo da expulsão.").setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um membro do servidor.")
    .addUserOption(option =>
      option.setName("membro").setDescription("Membro para banir.").setRequired(true))
    .addStringOption(option =>
      option.setName("motivo").setDescription("Motivo do banimento.").setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aplica timeout em um membro.")
    .addUserOption(option =>
      option.setName("membro").setDescription("Membro para silenciar.").setRequired(true))
    .addIntegerOption(option =>
      option.setName("minutos").setDescription("Duração entre 1 e 40320 minutos.").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption(option =>
      option.setName("motivo").setDescription("Motivo do timeout.").setMaxLength(500))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Apaga de 1 a 100 mensagens recentes deste canal.")
    .addIntegerOption(option =>
      option.setName("quantidade").setDescription("Quantidade de mensagens.").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
].map(command => command.toJSON());

async function main() {
  const rest = new REST({ version: "10" }).setToken(token);
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log("Comandos registrados no servidor configurado.");
}

main().catch(error => {
  console.error("Não foi possível registrar os comandos:", error);
  process.exit(1);
});
