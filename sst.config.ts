/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'apigw-websockets',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    const table = new sst.aws.Dynamo('connection', {
      fields: {
        connectionId: 'string',
      },
      primaryIndex: { hashKey: 'connectionId' },
      ttl: 'timestamp',
    });

    const webSocketApi = new sst.aws.ApiGatewayWebSocket('ws-api');

    const environment = {
      WEBSOCKET_URL: webSocketApi.managementEndpoint,
    };
    const permissions = [
      {
        actions: ['execute-api:ManageConnections'],
        resources: [
          `arn:aws:execute-api:*:*:*/$default/POST/@connections/{connectionId}`,
        ],
      },
      {
        actions: ['execute-api:Invoke'],
        resources: ['*'],
      },
    ];

    const cron = new sst.aws.Function('cron', {
      handler: 'functions/cron.handler',
      timeout: '60 seconds',
      link: [table],
      environment,
      permissions,
    });

    const api = new sst.aws.Function('api', {
      handler: 'functions/api.handler',
      link: [table, cron],
      url: true,
      environment,
      permissions,
    });

    webSocketApi.route('$connect', {
      handler: 'functions/connections.handler',
      environment,
      permissions,
      link: [table, cron],
    });
    webSocketApi.route('$disconnect', {
      handler: 'functions/connections.handler',
      environment,
      permissions,
      link: [table],
    });
    webSocketApi.route('$default', {
      handler: 'functions/connections.handler',
      environment,
      permissions,
      link: [table],
    });
    webSocketApi.route('send', {
      handler: 'functions/connections.handler',
      environment,
      permissions,
      link: [table],
    });

    new sst.aws.Nextjs('frontend', {
      environment: {
        NEXT_PUBLIC_WEBSOCKET_URL: webSocketApi.url,
        NEXT_PUBLIC_API_URL: api.url,
      },
    });
  },
});
