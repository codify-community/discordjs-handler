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
    name: 'onMessageCreate3',
    event: 'messageCreate',
    once: false,
    async execute(message) {
        console.log(`Message received: ${message.content}`);
        console.log(`Message author: ${message.author.username}`);

        const channel = await message.channel.fetch();
        console.log(`Channel name: ${channel}`);
    },
})