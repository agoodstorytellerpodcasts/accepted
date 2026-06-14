import 'dotenv/config';
import { buildApp } from './app.js';

const start = async () => {
  try {
    const app = await buildApp();
    const port = Number(process.env.PORT) || 3002;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
