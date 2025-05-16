import { Client, ClientEvents, Collection } from "discord.js";
import { storage } from "./storage";
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

export function registerEventHandlers(client: Client) {
    const eventHandlers = storage.events.map((collection, event) => ({
        event, handlers: collection.map((e) => ({ execute: e.execute, once: e.once })),
    }))

    for (const { event, handlers } of eventHandlers) {
        const onEventHandlers = handlers.filter((e) => !e.once)
        const onceEventHandlers = handlers.filter((e) => e.once)

        client.on(event, (...args) => {
            for (const handler of onEventHandlers) {
                handler.execute(...args)
            }
        })

        client.once(event, (...args) => {
            for (const handler of onceEventHandlers) {
                handler.execute(...args)
            }
        })
    }
}

export function createEvent<
    EventName extends keyof ClientEvents
>(data: EventData<EventName>) {
    const eventCollection = storage.events.get(data.event) ?? new Collection()

    eventCollection.set(data.name, data)
    storage.events.set(data.event, eventCollection)

    logger.log(`{⋆} ${data.name} event registered ${chalk.blue(`(${data.event})`)}`)
}