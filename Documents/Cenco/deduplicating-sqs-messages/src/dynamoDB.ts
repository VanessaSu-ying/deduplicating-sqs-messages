import * as AWS from "aws-sdk";
import { ItemModel } from "./model/Item.model";

//AWS.config.update({ region: "us-east-1" }); //evaluar si es necerario
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export class DynamoDB {
  static getItem = (tableName: string, messageId: string) => {
    const params = {
      TableName: tableName,
      Key: {
        messageId: { S: messageId },
      },
    };
    return dynamoDB
      .get(params)
      .promise()
      .then((res) => res.Item)
      .catch((err) => err);
  };

  static putItem = (
    tableName: string,
    item: ItemModel,
    messageId: string,
    differenceTimeOut: number,
    conditionExpression: string
  ) => {
    const params = {
      TableName: tableName,
      Key: {
        messageId: { S: messageId },
      },
      Item: {
        id: messageId,
        consumption_count: item.consumption_count,
        updated_message: item.updated,
        status_message: item.status,
      },
      //UpdateExpression: `set consumption_count = :consumptionCount, updated_message = :updatedMessage, status_message = :statusMessage `,
      ConditionExpression: `#s = :statusMessage and :updatedMessage > :differenceTimeOut`,
      ExpressionAttributeNames: {
        "#s": "IN_PROGRESS",
      },
      ExpressionAttributeValues: {
        ":statusMessage": { S: item.status },
        ":differenceTimeOut": { N: differenceTimeOut },
        //":consumptionCount": { N: item.consumption_count },
        ":updatedMessage": { N: item.updated },
      },
    };

    return dynamoDB
      .put(params)
      .promise()
      .then((res) => res)
      .catch((err) => err);
  };

  static updateItem = (
    tableName: string,
    item: ItemModel,
    messageId: string
  ) => {
    const params = {
      TableName: tableName,
      Key: {
        messageId: { S: messageId },
      },
      UpdateExpression: `set updated_message = :updatedMessage, status_message = :statusMessage `,
      //ConditionExpression: `#s = :statusMessage and :updatedMessage > :differenceTimeOut`,
      ExpressionAttributeValues: {
        ":statusMessage": { S: item.status },
        ":updatedMessage": { N: item.updated },
      },
    };

    return dynamoDB
      .update(params)
      .promise()
      .then((res) => res)
      .catch((err) => err);
  };
}
