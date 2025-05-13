import { Collection } from "discord.js";

export const storage = {
    commands: new Collection(),
    slashCommands: new Collection(),
    events: new Collection(),
}
