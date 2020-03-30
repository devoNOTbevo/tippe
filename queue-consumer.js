const QueueService = require('./queue-service');
const { Consumer } = require('sqs-consumer');
const { isJson } = require('./helpers');
const colors = require('colors');
const EventEmitter = require('events');

class QueueConsumerService extends QueueService {
  constructor(config) {
    super(config);
    this.queueHandlers = config.queueHandlers;
    this.allRemovedHandler = config.allRemovedHandler;
    this.consumers = [];
    this.eventEmitter = new EventEmitter();
    this.attachEventListeners();
  }

  async createAllConsumers() {
    this.queueHandlers.forEach(queueHandler => {
      const queueUrl = `${this.config.sqsBaseUrl}/${queueHandler.queueName}`;
      //create first
      const consumer = QueueConsumerService.createConsumer({
        queueUrl,
        messageAttributeNames: queueHandler.messageAttributeNames,
        handleMessage: async message => {
          if (isJson(message.Body)) {
            message.parsedBody = JSON.parse(message.Body);
          }
          queueHandler.handler(message);
        }
      });

      // attach some event handlers
      consumer.on('error', err => {
        err.queueUrl = queueUrl;
        console.error(
          `Error Event for consumer for queue ${colors.red(
            queueHandler.queueName
          )} - `,
          err
        );
        consumer.stop();
      });
      consumer.on('stopped', () => {
        console.log(
          `Finished shutdown for queue: ${colors.yellow(
            queueHandler.queueName
          )}.`
        );

        // in the case of any errors
        this.removeStoppedConsumers();
      });
      consumer.on('processing_error', err => {
        console.log(
          `Consumer for queue ${colors.red(
            queueHandler.queueName
          )} encountered processing error - `,
          err
        );
      });

      //push to stack
      this.consumers.push(consumer);
    });
  }

  static createConsumer(options) {
    return Consumer.create(options);
  }

  startAllConsumers() {
    this.consumers.forEach(consumer => {
      consumer.start();
    });
  }

  async stopAllConsumers(stopEvent) {
    this.consumers.forEach(consumer => {
      consumer.stop();
    });
    if (stopEvent) {
      this.eventEmitter.emit(stopEvent);
    }
  }

  removeStoppedConsumers() {
    console.log('Removing any stopped consumers....');
    this.consumers.forEach((consumer, index, array) => {
      if (consumer.stopped) {
        array.splice(index, 1);
      }
      if (array.length === 0) {
        this.eventEmitter.emit('all_removed');
      }
    });
  }

  attachEventListeners() {
    this.eventEmitter.on('all_started', () => {
      setTimeout(() => {
        console.log(
          colors.green(
            `${this.consumers.length} queue consumers successfully started.`
          )
        );
      }, 1500);
    });
    this.eventEmitter.on('all_removed', () => {
      console.log('All consumers have been removed...');
      if (this.allRemovedHandler) {
        this.allRemovedHandler();
      } else {
        console.log('No alternative "all_removed" handler.  Exiting....');
        process.exit(0);
      }
    });
    this.eventEmitter.on('all_stopped_exit', () => {
      console.log('All consumers stopped.  Exiting...');
      process.exit(0);
    });
  }
}

module.exports = QueueConsumerService;
