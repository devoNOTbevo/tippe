const QueueService = require("./queue-service");
const QueueConstantProvider = require('./queue-constant-provider')

/**
 * Acts as a mediator for the QueueConstantProvider as well as Service for 
 * the managed queue vendor sdk with respect to queue names and urls.
 * Can provide queue constants for use in consumers or producers of
 * queue messages.  When instantiated it will validate the queue constants
 * with the queues configured in the managed queue vendor.
 *
 * @class QueueUrlService
 * @extends {QueueService}
 */
class QueueUrlService extends QueueService {
  configuredQueues = [];
  static QUEUE_CONSTANTS = QueueConstantProvider;

  constructor(config) {
    super(config);
    console.log(QueueConstantProvider);
    this.loadQueues().then(() => this.validateAllQueues());
  }

  async loadQueues() {
    const { QueueUrls: queueUrls } = await this.sqs.listQueues({}).promise();
    const queueNames = queueUrls.map(queueUrl => {
        const queueNameSplit = queueUrl.split('\/');
        return queueNameSplit[queueNameSplit.length - 1];
    })
    
    this.configuredQueues = [...queueNames];
  }
  async isQueueConfigured(queueName) {
    return this.configuredQueues.includes(queueName);
  }

  async validateAllQueues() {
    Object.keys(QueueUrlService.QUEUE_CONSTANTS).forEach(key => {
        const constantsQueueName = QueueUrlService.QUEUE_CONSTANTS[key];
        if(!this.isQueueConfigured(constantsQueueName)){
            throw new Error(`Queue ${key} for constant ${constantsQueueName} is not configured`)
        }
    })
  }

  static findQueueName(queueName) {
    return Object.keys(this.queueNames).find(queueKey => {
      return queueName === this.queueNames[queueKey];
    });
  }

  static queueNameIsValid(queueName) {
    return !!this.findQueueName(queueName);
  }

  static getQueueName(queueName) {
    return this.queueNames.findQueueName(queueName);
  }

  static getAllQueueNames() {
    return this.queueNames;
  }
}

module.exports = QueueUrlService;

