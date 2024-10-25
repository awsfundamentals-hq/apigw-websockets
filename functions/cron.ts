import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { Table } from 'sst/node/table';

const dynamoDB = new DynamoDB.DocumentClient();
const api = new ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_API_URL,
});

export async function handler() {
  try {
    const connections = await loadConnections();
    await sendToAllConnections(connections);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Cron job executed successfully' }),
    };
  } catch (error) {
    console.error('Error in cron job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error executing cron job' }),
    };
  }
}

async function loadConnections(): Promise<string[]> {
  const params = {
    TableName: Table.Connections.tableName,
  };

  const result = await dynamoDB.scan(params).promise();
  return result.Items?.map((item) => item.connectionId) || [];
}

async function sendToAllConnections(connections: string[]) {
  const sendPromises = connections.map(async (connectionId) => {
    try {
      await api
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({ connectionId }),
        })
        .promise();
    } catch (error) {
      if ((error as any).statusCode === 410) {
        console.log(`Stale connection: ${connectionId}`);
        await removeConnection(connectionId);
      } else {
        console.error(`Error sending to connection ${connectionId}:`, error);
      }
    }
  });

  await Promise.all(sendPromises);
}

async function removeConnection(connectionId: string) {
  const params = {
    TableName: Table.Connections.tableName,
    Key: { connectionId },
  };

  await dynamoDB.delete(params).promise();
}
