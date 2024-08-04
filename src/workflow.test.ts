import { executeWorkflow, WorkflowConfig } from './workflow';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('Workflow execution', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should execute the sample workflow correctly', async () => {
    fetchMock.mockResponses(
      JSON.stringify({ userId: 1 }),
      JSON.stringify({ id: 2 }),
      JSON.stringify({ id: 5 })
    );

    const workflowConfig: WorkflowConfig = {
      steps: [
        { id: 1, type: 'http', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' },
        { id: 2, type: 'condition', condition: "context['step_1'].userId === 1", trueCase: 4, falseCase: 3 },
        { id: 3, type: 'http', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/2' },
        { id: 4, type: 'http', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/3' },
        { id: 5, type: 'condition', condition: "context['step_4'] === undefined", trueCase: 6, falseCase: 7 },
        { id: 6, type: 'http', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/4' },
        { id: 7, type: 'http', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/5' }
      ]
    };

    const result = await executeWorkflow(workflowConfig);

    expect(result).toEqual({ id: 5 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});