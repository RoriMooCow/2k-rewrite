/**
 * /jsonembed command
 * Allows users to upload a JSON file containing Discord embed(s) and button(s),
 * then sends them as a message in the channel.
 * 
 * This is useful for admins who want to create rich embed messages
 * without coding them directly in JavaScript.
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

module.exports = {
  // Register the /jsonembed command with Discord, requiring Manage Webhooks permission
  data: new SlashCommandBuilder()
    .setName("jsonembed")
    .setDescription("Upload a JSON file to convert it to a Discord embed.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Upload a JSON file containing an embed.")
        .setRequired(true)
    ),

  // Executes the /jsonembed command.
  async execute(interaction) {
    const file = interaction.options.getAttachment("file");

    // Validate file extension
    if (!file.name.endsWith(".json")) {
      return await interaction.reply({
        content: "Invalid file. Please upload a '.json' file.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // Download and parse the JSON file
      const response = await fetch(file.url);
      const json = await response.json();

      // Build embeds from JSON (must be in Discord embed format)
      const embeds = (json.embeds || [])
        .filter((data) => data && typeof data === "object")
        .map((data) => EmbedBuilder.from(data));

      // Build components (buttons) from JSON
      const components = (json.components || [])
        .filter((row) => row && Array.isArray(row.components))
        .map((row) => {
          const newRow = new ActionRowBuilder();

          for (const component of row.components) {
            if (component.type !== 2) continue; // Only handle buttons

            // Convert style number to ButtonStyle enum if needed
            let style = component.style;
            if (typeof style === "number") {
              style = Object.values(ButtonStyle)[style] || ButtonStyle.Primary;
            }

            const button = new ButtonBuilder()
              .setStyle(style)
              .setLabel(component.label || "")
              .setDisabled(component.disabled || false);

            if (component.emoji) button.setEmoji(component.emoji);

            // Link buttons must have a URL, others must have a custom_id
            if (style === ButtonStyle.Link) {
              if (component.url) button.setURL(component.url);
            } else if (component.custom_id) {
              button.setCustomId(component.custom_id);
            }

            newRow.addComponents(button);
          }

          return newRow;
        });

      // Ensure there is something to send
      if (embeds.length === 0 && components.length === 0) {
        return await interaction.reply({
          content: "The JSON file does not contain valid embeds or components.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Send the embed(s) and component(s) to the channel
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await interaction.channel.send({ embeds, components });
      await interaction.deleteReply();
    } catch (error) {
      console.error("Failed to process embed JSON:", error);
      await interaction.reply({
        content:
          "Failed to process JSON file. Ensure it is properly formatted.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
