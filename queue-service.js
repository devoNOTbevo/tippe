const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1'
});

/**
 *
 * base class for Queue services to take advantage of constructor inheritance (super)
 * @class QueueService
 */
class QueueService {
  constructor(config = {}) {
    this.sqs = config.sqs || new AWS.SQS();
    this.config = {
      sqsBaseUrl: config.sqsBaseUrl
    };
  }
}

module.exports = QueueService;
