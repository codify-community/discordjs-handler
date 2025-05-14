import { CacheType, ApplicationCommandType, ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js"
import { collectionStorage } from "./collectionStorage"
import { logger } from "@/utils/logger"

export type CommandType = ApplicationCommandType.ChatInput
type Cache<D extends boolean> = D extends false ? "cached" : CacheType

type SlashName<N extends string> = N

type ApplicationCommandData<
    N extends string,
    D extends boolean,
    T extends CommandType
> =
    T extends ApplicationCommandType.ChatInput ?
        ChatInputApplicationCommandData & {
            name: SlashName<N>,
            execute(interaction: ChatInputCommandInteraction<Cache<D>>): Promise<void>
        } : never

export type CommandData<
    Name extends string,
    DmPermission extends boolean,
    Type extends CommandType
> = ApplicationCommandData<Name, DmPermission, Type> & {
    type?: Type, 
    dmPermission?: DmPermission;
}

export type GenericCommandData = CommandData<any, any, any>;

export function createSlashCommand<
    Name extends string = string,
    DmPermission extends boolean = false,
    Type extends CommandType = ApplicationCommandType.ChatInput
>(data: CommandData<Name, DmPermission, Type>) {
    data.type ??= ApplicationCommandType.ChatInput as Type
    data.dmPermission ??= false as DmPermission

    collectionStorage.slashCommands.set(data.name, data)
    logger.log(`Slash command ${data.name} registered.`)
}