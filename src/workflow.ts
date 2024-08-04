// import axios, { AxiosRequestConfig } from 'axios';

type WorkflowStep = {
  id: number | string;
  type: 'http' | 'condition';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url?: string;
  headers?: Record<string, string>;
  data?: any;
  condition?: string;
  trueCase?: number;
  falseCase?: number;
};

export type WorkflowConfig = {
  steps: WorkflowStep[];
};

type Context = Record<string, any>;

type ServerData = {
  userId: string;
  id: string;
  title: string;
  body: string;
}

export async function executeWorkflow(config: WorkflowConfig): Promise<ServerData> {
  const context: Context = {};
  const stepResults: any[] = [];
  let currentStepIndex = 0;

  while (currentStepIndex < config.steps.length) {
    const step = config.steps[currentStepIndex];

    if (step.type === 'http') {
      const result = await executeHttpStep(step);
      stepResults.push(result);
      context[`step_${step.id}`] = result;
      currentStepIndex++;
    } else if (step.type === 'condition') {
      const conditionMet = evaluateCondition(step.condition!, context);
      if (conditionMet) {
        currentStepIndex = config.steps.findIndex(s => s.id === step.trueCase);
      } else {
        currentStepIndex = config.steps.findIndex(s => s.id === step.falseCase);
      }
    }
  }

  return stepResults[stepResults.length - 1];
}

async function executeHttpStep(step: WorkflowStep): Promise<ServerData> {
  const response: Response = await fetch(step.url!, {
    method: step.method,
    headers: step.headers,
    body: step.method !== 'GET' && step.method !== 'DELETE' ? JSON.stringify(step.data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

function evaluateCondition(condition: string, context: Context): boolean {
  // Safe evaluation using "new Function" to avoid eval risks
  const func = new Function('context', `return ${condition}`);
  return func(context);
}