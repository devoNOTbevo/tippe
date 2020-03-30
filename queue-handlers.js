const QueueUrlService = require('./queue-url-service');
const QUEUE_NAMES = QueueUrlService.QUEUE_CONSTANTS;

const testQueueHandler = message => {
  console.log('test queue with message: ', message);
};

const queueHandlers = {
  development: [
    {
      queueName: 'development_test',
      handler: testQueueHandler
    }
  ],
  production: []
};

module.exports = queueHandlers['development'];
