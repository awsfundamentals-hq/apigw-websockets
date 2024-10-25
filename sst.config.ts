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

    const api = new sst.aws.Function('api', {
      handler: 'functions/api.handler',
      link: [table],
      url: true,
    });

    const webSocketApi = new sst.aws.ApiGatewayWebSocket('ws-api');
    webSocketApi.route('$connect', {
      handler: 'functions/connections.handler',
      link: [table],
    });
    webSocketApi.route('$disconnect', {
      handler: 'functions/connections.handler',
      link: [table],
    });
    webSocketApi.route('$default', {
      handler: 'functions/connections.handler',
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
