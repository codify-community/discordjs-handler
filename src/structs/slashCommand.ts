import { CacheType, ApplicationCommandType, ChatInputApplicationCommandData, ChatInputCommandInteraction, AutocompleteInteraction, ApplicationCommandOptionChoiceData } from "discord.js"
import { storage } from "./storage"
import { logger } from "@/utils/logger"

type AutocompleteReturn = Promise<void | undefined | readonly ApplicationCommandOptionChoiceData[]>

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
            autocomplete?(interaction: AutocompleteInteraction<Cache<D>>): AutocompleteReturn
        } : never

export type SlashCommandData<
    Name extends string,
    DmPermission extends boolean,
    Type extends CommandType
> = ApplicationCommandData<Name, DmPermission, Type> & {
    type?: Type, 
    dmPermission?: DmPermission;
}

export type GenericSlashCommandData = SlashCommandData<any, any, any>;

export function createSlashCommand<
    Name extends string = string,
    DmPermission extends boolean = false,
    Type extends CommandType = ApplicationCommandType.ChatInput
>(data: SlashCommandData<Name, DmPermission, Type>) {
    data.type ??= ApplicationCommandType.ChatInput as Type
    data.dmPermission ??= false as DmPermission

    storage.slashCommands.set(data.name, data)
    logger.log(`{/} ${data.name} command registered`)
}