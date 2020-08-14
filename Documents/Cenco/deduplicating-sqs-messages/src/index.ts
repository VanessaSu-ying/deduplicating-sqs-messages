import { DynamoDB } from "./dynamoDB";
import { Status } from "./const";
import { ItemModel } from "./model/Item.model";
const tableName: string = process.env.tableName;
const lamdbaTimeOut: number = Number(process.env.LAMBDA_TIMEOUT);

export const messageConsumed = async (messageId: string) => {
  // if (item && item.satus === Status.COMPLETE) {
  //   console.log(
  //     `Corresponding DynamoDB table item with message ID ${messageId} marked COMPLETE`
  //   );
  //   return;
  // } else {
  //   console.log(`Creating a new DynamoDB item `);
  //   item = {
  //     message_id: messageId,
  //     consumption_count: 0,
  //     status: "",
  //     updated: 0,
  //   };
  //   updateDynamoDB(item, Status.IN_PROGRESS);
  //   updateDynamoDB(item, Status.COMPLETE);
  // }
};

export const queryDynamoDB = async (messageId: string, tableName: string) => {
  try {
    const responseDB = await DynamoDB.getItem(tableName, messageId);
    if (responseDB) {
      console.log(
        `Item with ID ${messageId} read from DynamoDB table ${tableName}`
      );
      return responseDB.value;
    }
  } catch (err) {
    return err;
  }
};

export const updateDynamoDB = async (
  item: ItemModel,
  status: string,
  tableName: string,
  lamdbaTimeOut: number
) => {
  console.log(
    `Incrementing item consumption count and setting item status to ${status}`
  );
  item.consumption_count += 1;
  item.status = status;
  const currentTime = new Date().getTime();
  item.updated = currentTime;
  const differenceTimeOut = currentTime - lamdbaTimeOut;

  const conditionExpression: string = `#s = :statusItem and ${item.updated} > :differenceTimeOut`;

  try {
    const responseDB = await DynamoDB.putItem(
      tableName,
      item,
      item.message_id,
      differenceTimeOut,
      conditionExpression
    );
  } catch (err) {
    return err;
  }
};
