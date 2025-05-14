import { createSlashCommand } from "@/structs/slashCommand"
import { logger } from "@/utils/logger"
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, MessageFlags } from "discord.js"

createSlashCommand({
    name: "ban",
    description: "Ban a user from the server.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "The user to ban.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "reason",
            description: "The reason for the ban.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided.";

        if (!user) {
            await interaction.reply({ content: "User not found.", ephemeral: true });
            return;
        }

        logger.log(`Banning user ${user.tag} (${user.id}) for reason: ${reason}`);
        await interaction.reply({ content: `Banning user ${user.tag} for reason: ${reason}`, flags: MessageFlags.Ephemeral });
    },
})