import { APIGatewayProxyHandler } from 'aws-lambda';
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { Resource } from 'sst';

const dynamoDB = new DynamoDB.DocumentClient();
const apiGateway = new ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_URL,
});

export const handler: APIGatewayProxyHandler = async (event) => {
  const { connectionId, routeKey } = event.requestContext;

  if (!connectionId) {
    return { statusCode: 400, body: 'Missing connectionId' };
  }

  if (routeKey === '$connect') {
    await saveConnection(connectionId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected', connectionId }),
    };
  } else if (routeKey === '$disconnect') {
    await deleteConnection(connectionId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected' }),
    };
  } else if (routeKey === 'send') {
    const {
      message,
      connectionId: targetId,
    }: { message: string; connectionId: string } = JSON.parse(
      event.body as string
    );
    await sendMessage({ message, connectionId, targetId });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent' }),
    };
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

async function sendMessage(params: {
  message: string;
  connectionId: string;
  targetId: string;
}) {
  const { message, connectionId, targetId } = params;
  try {
    await apiGateway
      .postToConnection({
        ConnectionId: targetId,
        Data: JSON.stringify({ message, from: connectionId, to: targetId }),
      })
      .promise();
  } catch (error: any) {
    if (error.statusCode === 410) {
      console.log(`Connection ${targetId} is no longer active`);
      await deleteConnection(targetId);
    } else {
      throw error;
    }
  }
}
