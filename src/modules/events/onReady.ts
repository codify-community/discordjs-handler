import { createEvent } from "@/structs/event";

createEvent({
    name: 'onMessageCreate',
    event: 'messageCreate',
    once: false,
    async execute(message) {
        console.log(`Message received: ${message.content}`);
        console.log(`Message author: ${message.author.username}`);

        const channel = await message.channel.fetch();
        console.log(`Channel name: ${channel}`);
    },
})

createEvent({
    name: 'onMessageCreate2',
    event: 'messageCreate',
    once: false,
    async execute(message) {
        console.log(`Message received: ${message.content}`);
        console.log(`Message author: ${message.author.username}`);

        const channel = await message.channel.fetch();
        console.log(`Channel name: ${channel}`);
    },
})

createEvent({
    name: 'ClientReady',
    event: 'ready',
    once: true,
    async execute(client) {
        console.log(`Client is ready!`)
        console.log(`Client user: ${client.user?.username}`);
    },
})