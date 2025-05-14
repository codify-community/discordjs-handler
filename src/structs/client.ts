import { logger } from '@/utils/logger'
import { ApplicationCommand, Client, ClientOptions, GatewayIntentBits } from 'discord.js'
import path from 'path'
import fs, { PathLike } from 'fs'
import { env } from '@/env'
import { collectionStorage } from './collectionStorage'

/**
 * @description This function initializes a Discord client and loads modules from the specified directory.
 * @param {PathLike} workdir - The directory to load modules from.
 * @param {Partial<ClientOptions>} options - Optional client options.
 * @returns {{ client: Client }} - The initialized Discord client.
 */
export function bootstrap(workdir: PathLike, options: Partial<ClientOptions> = {}): { client: Client } {
    const client = createClient(options)
    client.token = env.DISCORD_TOKEN

    client.login()
    loadModules(workdir)

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return

        const slashCommand = collectionStorage.slashCommands.get(interaction.commandName)
        logger.log(`Received command: ${interaction.commandName}`)
    })

    client.once('ready', async (client) => {
        logger.success(`Logged in as ${client.user?.tag}`)
        await registerSlashCommands(client)
    })

    return { client }
}

/**
 * @description This function creates a new Discord client with the specified options.
 * @param {Partial<ClientOptions>} options - Optional client options.
 * @returns {Client} - The created Discord client.
 */
function createClient(options: Partial<ClientOptions>): Client {
    const client = new Client({
        intents: options.intents ?? [GatewayIntentBits.Guilds],
        partials: options.partials ?? [],
    })

    return client
}

/**
 * @description This function loads modules from the specified directory and registers them with the client.
 * @param {PathLike} workdir - The directory to load modules from.
 */
function loadModules(workdir: PathLike) {
    const modulesPath = path.resolve(__dirname, workdir.toString())

    function readAllFilesRecursively(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        return entries.flatMap(entry => {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                return readAllFilesRecursively(fullPath)
            } else if (entry.isFile() && /\.(t|j)s$/.test(entry.name)) {
                return [fullPath]
            } else {
                return []
            }
        })
    }

    const files = readAllFilesRecursively(modulesPath)
    logger.log(`Loading ${files.length} modules...`)

    files.forEach(file => {
        try {
            require(file)
            logger.success(`Loaded module: ${file.replace(modulesPath, '')}`)
        } catch (error) {
            logger.error(`Failed to load module: ${file.replace(modulesPath, '')}`, error)
        }
    })
}

/**
 * @description This function registers slash commands with the Discord API.
 * @param {Client<true>} client - The Discord client.
 */
async function registerSlashCommands(client: Client<true>) {
    const guild = client.guilds.cache.get(env.DISCORD_GUILD_ID)

    if (!guild) {
        logger.error('Guild not found')
        return
    }

    const guildCommands = collectionStorage.slashCommands.map((command) => command.data.toJSON())
    await guild.commands.set(guildCommands).then(commands => {
        logger.success(`└ ${commands.size} ${commands.size === 1 ? 'command' : 'commands'} registered in ${guild.name} (${guild.id}) guild successfully!`)
    })
}
