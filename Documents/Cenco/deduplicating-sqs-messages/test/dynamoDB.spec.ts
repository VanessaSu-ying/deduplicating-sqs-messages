const { DocumentClient } = require("aws-sdk/clients/dynamodb");

const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: "localhost:8000",
    sslEnabled: false,
    region: "local-env",
  }),
};

const ddb = new DocumentClient(config);

describe("DynamoDB actions", () => {
  it("should put a item in table when status is IN_PROGRESS ", async () => {
    const params = {
      TableName: "test",
      Key: {
        id: { S: "3" },
      },
      Item: {
        id: "3",
        consumption_count: 1,
        updated_message: 50,
        status_message: "IN_PROGRESS",
      },
      //UpdateExpression: `set consumption_count = :consumptionCount, updated_message = :updatedMessage, status_message = :statusMessage `,
      ConditionExpression:
        " :statusDefault = :statusMessage AND :updatedMessage > :differenceTimeOut ",
      // ExpressionAttributeNames: {
      //   "#s": "status_message",
      // },
      ExpressionAttributeValues: {
        ":statusMessage": { S: "IN_PROGRESS" },
        ":differenceTimeOut": 45,
        //":consumptionCount": { N: "1" },
        ":updatedMessage": 50,
        ":statusDefault": { S: "IN_PROGRESS" },
      },
    };
    await ddb.put(params).promise();

    const { Item } = await ddb
      .get({ TableName: "test", Key: { id: "3" } })
      .promise();

    expect(Item).toEqual({
      id: "3",
      consumption_count: 1,
      updated_message: 50,
      status_message: "IN_PROGRESS",
    });
  });

  it("should update a item in table when status is COMPLETE ", async () => {
    await ddb
      .put({
        TableName: "test",
        Item: {
          id: "3",
          consumption_count: 1,
          updated_message: 50,
          status_message: "IN_PROGRESS",
        },
      })
      .promise();
    const params = {
      TableName: "test",
      Key: {
        id: "3",
      },
      UpdateExpression: `SET #um = :updatedMessage, #sm = :statusMessage `,
      ExpressionAttributeNames: {
        "#um": "updated_message",
        "#sm": "status_message",
      },
      ExpressionAttributeValues: {
        ":statusMessage": "COMPLETE",
        ":updatedMessage": 50,
      },
    };

    await ddb.update(params).promise();

    const { Item } = await ddb
      .get({ TableName: "test", Key: { id: "3" } })
      .promise();

    expect(Item).toEqual({
      id: "3",
      consumption_count: 1,
      updated_message: 50,
      status_message: "COMPLETE",
    });
  });
});
