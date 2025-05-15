import { logger } from '@/utils/logger'
import { Client, ClientOptions, GatewayIntentBits, MessageFlags } from 'discord.js'
import path from 'path'
import fs, { PathLike } from 'fs'
import { env } from '@/env'
import { collectionStorage } from './collectionStorage'
import chalk from 'chalk'

interface BootstrapOptions extends Partial<ClientOptions> {
    workdir: PathLike
}

/**
 * @description This function bootstraps a Discord client with the specified options.
 * @param {BootstrapOptions} options - The options for bootstrapping the client.
 * @returns {{ client: Client }} - The created Discord client.
 */
export function bootstrap(options: BootstrapOptions): { client: Client } {
    const client = createClient(env.DISCORD_TOKEN, options)

    loadModules(options.workdir)
    client.login()

    return { client }
}

/**
 * @description This function creates a Discord client with the specified token and options.
 * @param {string} token - The Discord bot token.
 * @param {BootstrapOptions} options - The options for creating the client.
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

        const slashCommand = collectionStorage.slashCommands.get(interaction.commandName)
        if (!slashCommand)
            return await interaction.reply({ content: 'Command not found', flags: MessageFlags.Ephemeral })

        try {
            await slashCommand.execute(interaction as any)
        } catch (error) {
            logger.error(`Error executing command: ${interaction.commandName}`, error)
            await interaction.reply({ content: 'An error occurred while executing the command.', flags: MessageFlags.Ephemeral })
        }
    })

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return

        const commandNameWithPrefix = message.content.split(' ')[0]
        if (!commandNameWithPrefix.startsWith('!')) return

        const commandName = commandNameWithPrefix.replace('!', '')
        const messageCommand = collectionStorage.messageCommands.get(commandName)
        if (!messageCommand)
            return await message.reply('Command not found')

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
 * @description This function loads modules from the specified directory.
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

    files.forEach((file, index) => {
        const shortPath = file.replace(modulesPath, '').replace(/^[\\/]/, '')
        try {
            require(file)
            logger.success(`[${index + 1}/${files.length}] Module loaded: ${chalk.blue(shortPath)}`)
        } catch (error) {
            logger.error(`[${index + 1}/${files.length}] Failed to load module: ${chalk.red(shortPath)}`, error)
        }
    })
}

/**
 * @description This function registers slash commands in the specified guild.
 * @param {Client} client - The Discord client.
 */
async function registerSlashCommands(client: Client<true>) {
    function plural(size: number) {
        return size === 1 ? '' : 's'
    }

    const guild = client.guilds.cache.get(env.DISCORD_GUILD_ID)
    if (!guild)
        return logger.error('Guild not found')

    logger.log(`Registering slash commands in ${guild.name} guild:`)
    const guildCommands = collectionStorage.slashCommands.map((slashCommand) => slashCommand)
    await guild.commands.set(guildCommands).then(commands => {
        logger.success(`└ ${commands.size} {/} command${plural(commands.size)} registered in ${guild.name} guild successfully!`)
    }).catch(error => {
        logger.error(`Failed to register {/} commands in ${guild.name} guild`, error)
    })
}