import { DynamoDB } from 'aws-sdk';
import { Resource } from 'sst';

const dynamoDB = new DynamoDB.DocumentClient();

export const handler = async (event: any) => {
  try {
    const params = {
      TableName: Resource.connection.name,
      FilterExpression: 'attribute_exists(connectionId)',
    };

    const result = await dynamoDB.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Error fetching connections:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch connections' }),
    };
  }
};
