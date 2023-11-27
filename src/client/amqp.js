import amqplib from 'amqplib';

import config from '../config/init';

export let GLOBAL_MQ_CONN = null;

export const connection = () => {
	return amqplib.connect(`amqp://${config.messageQueue.amqpUser}:${config.messageQueue.amqpPassword}@${config.messageQueue.amqpHost}:${config.messageQueue.amqpPort}/`);
}

export const initMessageQueueConnection = async () => {
	GLOBAL_MQ_CONN = await connection();
}

export const pushToQueue = (ch, queueName, msg) => {
	ch.assertQueue(queueName, {
		durable: true,
	});
	ch.sendToQueue(queueName, Buffer.from(msg), { persistent: true });

	// console.log("Message sent");
}