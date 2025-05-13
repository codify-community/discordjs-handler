import { env } from '@/env'
import { Client, ClientOptions, GatewayIntentBits } from 'discord.js'

function createClient(token: string, options: ClientOptions) {
    const client = new Client({
        intents: options.intents ?? [GatewayIntentBits.Guilds],
        partials: options.partials ?? [],
    })

    client.token = token
}