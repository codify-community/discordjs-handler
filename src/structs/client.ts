import { logger } from '@/utils/logger'
import { ApplicationCommandType, Client, ClientOptions, GatewayIntentBits, messageLink } from 'discord.js'
import path from 'path'
import fs, { PathLike } from 'fs'
import { env } from '@/env'
import { collectionStorage } from './collectionStorage'

interface BootstrapOptions extends Partial<ClientOptions> {
    workdir: PathLike
}

/**
 * @description This function initializes a Discord client and loads modules from the specified directory.
 * @param {PathLike} workdir - The directory to load modules from.
 * @param {Partial<ClientOptions>} options - Optional client options.
 * @returns {{ client: Client }} - The initialized Discord client.
 */
export function bootstrap(options: BootstrapOptions): { client: Client } {
    const client = createClient(env.DISCORD_TOKEN, options)

    loadModules(options.workdir)
    client.login()

    return { client }
}

/**
 * @description This function creates a new Discord client with the specified options.
 * @param {Partial<ClientOptions>} options - Optional client options.
 * @returns {Client} - The created Discord client.
 */
function createClient(token: string, options: BootstrapOptions): Client {
    const client = new Client({
        intents: options.intents ?? [GatewayIntentBits.Guilds],
        partials: options.partials ?? [],
    })
    client.token = token

    client.once('ready', async (client) => {
        logger.success(`Logged in as ${client.user?.tag}`)
        await registerSlashCommands(client)
    })

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return

        const slashCommand = collectionStorage.commands.get(interaction.commandName)
        logger.log(`Received command: ${interaction.commandName}`)

        if (!slashCommand) {
            await interaction.reply({ content: 'Command not found', ephemeral: true })
            return
        }

        try {
            await slashCommand.execute(interaction as any)
        } catch (error) {
            logger.error(`Error executing command: ${interaction.commandName}`, error)
            await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true })
        }
    })

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return
        if (!message.content.split(' ')[0].startsWith('!')) return

        const messageCommand = collectionStorage.messageCommands.get(message.content)
        logger.log(`Received message: ${message.content}`)

        if (!messageCommand) {
            await message.reply('Command not found')
            return
        }

        try {
            await messageCommand.execute(message)
        } catch (error) {
            logger.error(`Error executing message command: ${message.content}`, error)
            await message.reply('An error occurred while executing the command.')
        }
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

    const guildCommands = collectionStorage.commands.map((command) => command)
    await guild.commands.set(guildCommands).then(commands => {
        logger.success(`└ ${commands.size} ${commands.size === 1 ? 'command' : 'commands'} registered in ${guild.name} (${guild.id}) guild successfully!`)
    })
}
