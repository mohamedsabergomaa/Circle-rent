import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import authRouter from './modules/auth/auth.routes';
import { notFound } from './common/middleware/notFound';
import { errorHandler } from './common/middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.use('/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
