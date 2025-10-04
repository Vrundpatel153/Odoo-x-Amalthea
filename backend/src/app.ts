import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { errorHandler, notFoundHandler } from './middlewares/error';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import companyRoutes from './routes/company';
import expenseRoutes from './routes/expenses';
import approvalRoutes from './routes/approvals';
import flowRoutes from './routes/flows';
import adminRoutes from './routes/admin';
import utilsRoutes from './routes/utils';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/utils', utilsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
