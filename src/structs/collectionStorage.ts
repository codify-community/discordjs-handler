import { Collection } from "discord.js"
import { GenericSlashCommandData } from "./slashCommand"

/**
 * @description This object stores collections of commands and events.
 * It contains:
 * - commands: A collection of slash commands.
 * - messageCommands: A collection of message commands.
 * - events: A collection of events.
*/
export const collectionStorage = {
    slashCommands: new Collection<string, GenericSlashCommandData>(),
    messageCommands: new Collection(),
    events: new Collection(),
}