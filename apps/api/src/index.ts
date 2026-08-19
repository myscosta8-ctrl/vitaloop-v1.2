import { loadConfig } from './config.ts';
import { buildServer } from './server.ts';

const config = loadConfig();
const app = buildServer(config);

app.listen({ host: config.host, port: config.port }).then(
  (address) => app.log.info(`Vitaloop UPA API on ${address} (${config.env})`),
  (err) => {
    app.log.error(err);
    process.exit(1);
  },
);
