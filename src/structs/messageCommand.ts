import { Message, OmitPartialGroupDMChannel } from "discord.js"
import { collectionStorage } from "./collectionStorage"
import { logger } from "@/utils/logger"

type CommandName<N extends string> = N

export type MessageCommandData = {
    name: CommandName<string>
    execute(message: OmitPartialGroupDMChannel<Message>): Promise<void>
}

export function createMessageCommand(data: MessageCommandData) {
    collectionStorage.messageCommands.set(data.name, data)
    logger.log(`{#} ${data.name} command registered`)
}