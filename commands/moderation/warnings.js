/**
 * /warnings command
 * View a member's warnings from the MySQL database.
 * This command displays warnings one at a time with navigation buttons.
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getWarnings } = require("../../functions/dbWarnings.js");

// Creates the navigation buttons for the warnings embed.
function createButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("back")
      .setLabel("⏪ Back")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next ⏩")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("close")
      .setLabel("✖ Close")
      .setStyle(ButtonStyle.Danger)
  );
}

// Creates an embed for a specific warning.
function createWarningEmbed(target, warning, index, total) {
  return new EmbedBuilder()
    .setColor(16776960)
    .setTitle(`Warnings for ${target.tag}`)
    .setDescription(`#${index + 1} of ${total}`)
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .addFields(
      {
        name: "Member",
        value: `${target.tag} (<@${target.id}>)`,
        inline: true,
      },
      { name: "Warned by", value: `<@${warning.moderator_id}>`, inline: true },
      { name: "Reason", value: warning.reason, inline: false },
      {
        name: "Date",
        value: `<t:${Math.floor(warning.timestamp / 1000)}:F>`,
        inline: false,
      }
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View a member's warnings.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to check for warnings.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // Executes the /warnings command.
  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const warnings = await getWarnings(interaction.guild.id, target.id);

    if (!warnings || warnings.length === 0) {
      return await interaction.reply({
        content: "No warnings found for this member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    let currentIndex = 0;
    const buttons = createButtons();

    // Send the first warning embed with navigation buttons
    await interaction.reply({
      embeds: [
        createWarningEmbed(
          target,
          warnings[currentIndex],
          currentIndex,
          warnings.length
        ),
      ],
      components: [buttons],
      flags: MessageFlags.Ephemeral,
    });

    // Set up a collector to handle button navigation
    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      time: 120_000, // 2 minutes
    });
    let closedEarly = false;

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        return await buttonInteraction.reply({
          content: "You cannot interact with this button.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (buttonInteraction.customId === "close") {
        await buttonInteraction.deferUpdate();
        try {
          await interaction.deleteReply();
        } catch {}
        closedEarly = true;
        collector.stop();
        return;
      }

      await buttonInteraction.deferUpdate();

      if (buttonInteraction.customId === "back") {
        currentIndex = (currentIndex - 1 + warnings.length) % warnings.length;
      } else if (buttonInteraction.customId === "next") {
        currentIndex = (currentIndex + 1) % warnings.length;
      }

      await interaction.editReply({
        embeds: [
          createWarningEmbed(
            target,
            warnings[currentIndex],
            currentIndex,
            warnings.length
          ),
        ],
        components: [buttons],
      });
    });

    collector.on("end", async () => {
      if (closedEarly) return;
      buttons.components.forEach((button) => button.setDisabled(true));
      try {
        await interaction.editReply({
          content:
            "Session expired. Re-run the /warnings command to start a new session.",
          embeds: [],
          components: [buttons],
        });
      } catch {}
    });
  },
};
