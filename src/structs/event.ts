import { ClientEvents, Collection } from "discord.js";
import { collectionStorage } from "./collectionStorage";
import { logger } from "@/utils/logger";
import chalk from "chalk";

export interface EventData<
    EventName extends keyof ClientEvents
> {
    name: string
    event: EventName
    once?: boolean
    execute(...args: ClientEvents[EventName]): Promise<void>
}

type GenericEventData = EventData<keyof ClientEvents>
export type EventsCollection = Collection<string, GenericEventData>

export function createEvent<
    EventName extends keyof ClientEvents
>(data: EventData<EventName>) {
    const eventCollection = collectionStorage.events.get(data.event) ?? new Collection()

    eventCollection.set(data.name, data)
    collectionStorage.events.set(data.event, eventCollection)

    logger.log(`{⋆} ${data.name} event registered ${chalk.blue(`(${data.event})`)}`)
}