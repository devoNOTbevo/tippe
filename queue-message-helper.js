const QueueService = require('./queue-service')

// Example for Messages:
// **********************
// {
//   MessageAttributes: {
//     test_attribute_1: {
//       DataType: "String",
//       StringValue: "string from a message attribute"
//     },
//     test_attribute_2: {
//       DataType: "Number",
//       StringValue: "123123"
//     }
//   },
//   MessageBody: JSON.stringify(message),
//   MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
//   MessageId: "Group1",  // Required for FIFO queues
//   QueueUrl: "http://localhost:4576/queue/test_queue"
// };
// **********************

class QueueMessageHelperService extends QueueService {
  constructor(config) {
      super(config);
      this.queueUrl = `${this.config.sqsBaseUrl}/${config.queueName}`;
  }

  async send(message, attributes = {}) {
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: this.queueUrl
    };
    if(Object.keys(attributes).length){
      params.MessageAttributes = this.createAttributes(attributes);
    }
    return this.sqs.sendMessage(params).promise();
  }

  createAttributes(attributes = {}) {
    const fullAttrObject = {};
    const attrKeys = Object.keys(attributes);
    if(attrKeys.length) {
      attrKeys.forEach(key => {
        const val = attributes[key];
        const valType = typeof val;
        let strVal = "";
        if(valType === "string"){
          strVal = val;
        } else if (valType === "number") {
          strVal = val.toString();
        } else {
          throw new Error("Queue message attributes must be string or number types.");
        }
        fullAttrObject[key] = {
          DataType: valType[0].toUpperCase() + valType.slice(1),
          StringValue: strVal
        }
      })
    }
    return fullAttrObject;
  }
}

module.exports = QueueMessageHelperService;

