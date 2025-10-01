import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: 'https://my-elasticsearch-project-f86306.es.us-central1.gcp.elastic.cloud:443',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY as string,
  },
  serverMode: 'serverless',
});

export default client;