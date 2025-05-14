import { Collection } from "discord.js";
import { GenericCommandData } from "./command";

export const collectionStorage = {
    commands: new Collection<string, GenericCommandData>(),
    messageCommands: new Collection(),
    events: new Collection(),
}
