// libraries
const AWS = require('aws-sdk');

//services
const {
  QueueConsumerService,
  queueHandlers,
  QueueUrlService
} = require('./index.js');
const consumerService = new QueueConsumerService({
  queueHandlers
  // sqsBaseUrl: config.SQS_BASE_URL
});

//bootstrap what's needed

AWS.config.update({
  region: 'us-east-1'
});

(async () => {
  try {
    await consumerService.createAllConsumers();
    consumerService.startAllConsumers();
  } catch (e) {
    console.log('Error creating/starting Queue Consumers: ', e);
  }
})();

process.on('SIGINT', () => {
  console.log('Stop Signal Received. Stopping all consumers...');
  consumerService.stopAllConsumers('all_stopped_exit');
});
