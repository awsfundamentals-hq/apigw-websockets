import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Resource } from 'sst';

const dynamoDB = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const { connectionId, routeKey } = event.requestContext;

  if (!connectionId) {
    return { statusCode: 400, body: 'Missing connectionId' };
  }

  console.info(`Received event: ${JSON.stringify(event, null, 2)}`);

  if (routeKey === '$connect') {
    await saveConnection(connectionId);
    return { statusCode: 200, body: 'Connected' };
  } else if (routeKey === '$disconnect') {
    await deleteConnection(connectionId);
    return { statusCode: 200, body: 'Disconnected' };
  }

  return { statusCode: 400, body: 'Unsupported route' };
};

async function saveConnection(connectionId: string) {
  await dynamoDB
    .put({
      TableName: Resource.connection.name,
      Item: {
        connectionId,
        timestamp: Date.now(),
      },
    })
    .promise();
}

async function deleteConnection(connectionId: string) {
  await dynamoDB
    .delete({
      TableName: Resource.connection.name,
      Key: { connectionId },
    })
    .promise();
}
