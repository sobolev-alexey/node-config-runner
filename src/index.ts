import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import winston from 'winston';
import helmet from 'helmet';
import compression from 'compression';
import { executeWorkflow, WorkflowConfig } from './workflow';

const app = express();
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());

// Setup winston logger
const logger = winston.createLogger({
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" }),
  ],
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err.stack);
  res.status(500).json({ success: false, error: err.message });
};
app.use(errorHandler);

// Workflow execution API handler
app.post('/api/execute-workflow', async (req: Request, res: Response, next: NextFunction) => {
  const workflowConfig: WorkflowConfig = req.body;
  try {
    const result = await executeWorkflow(workflowConfig);
    logger.info(`Workflow executed, result: ${JSON.stringify(result)}`);
    res.send({ success: true, result });
  } catch (error: any) {
    next(error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
