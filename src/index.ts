
export import DynamoDB = require('aws-sdk/clients/dynamodb');
export import Joi = require('joi');

export {
    DynamoModel,
    DynamoQueryParams,
    DynamoQueryResult,
    DynamoModelReadParams,
} from './dynamo-model';

export {
    ModelUpdateData,
} from './base-dynamo-model';
