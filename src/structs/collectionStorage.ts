import { Collection } from "discord.js";
import { GenericCommandData } from "./command";

export const collectionStorage = {
    commands: new Collection(),
    slashCommands: new Collection<string, GenericCommandData>(),
    events: new Collection(),
}
