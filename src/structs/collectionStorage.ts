import { Collection } from "discord.js";

export const collectionStorage = {
    commands: new Collection(),
    slashCommands: new Collection(),
    events: new Collection(),
}
