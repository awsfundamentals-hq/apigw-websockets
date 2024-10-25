import { DynamoDB, Lambda } from 'aws-sdk';
import { Resource } from 'sst';

const dynamoDB = new DynamoDB.DocumentClient();
const lambda = new Lambda();

export const handler = async () => {
  try {
    const params = {
      TableName: Resource.connection.name,
      FilterExpression: 'attribute_exists(connectionId)',
    };

    const result = await dynamoDB.scan(params).promise();
    await invokeCronLambda();

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

async function invokeCronLambda() {
    const params = {
      FunctionName: Resource.cron.name,
      InvocationType: 'Event',
    };
  
    try {
      await lambda.invoke(params).promise();
      console.log('Cron Lambda invoked successfully');
    } catch (error) {
      console.error('Error invoking Cron Lambda:', error);
    }
  }