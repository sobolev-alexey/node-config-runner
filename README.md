# Config runner

The application acts as a workflow engine, dynamically executing HTTP requests and making conditional decisions based on the provided JSON configuration.

This application exposes an API endpoint `/api/execute-workflow` that accepts a workflow configuration in JSON format as the request body.  
  
The incoming JSON is parsed to extract a sequence of configuration steps. The application then iterates through this sequence, processing each step according to its type:

* **HTTP Steps:** These steps trigger an HTTP request using parameters specified within the step configuration (e.g., method, headers, body). The response from the HTTP call is either used as input for the subsequent step or returned as the final result if it's the last step in the sequence. For consecutive HTTP steps, responses are typically stored in a data structure for later use.
* **Condition Steps:** These steps evaluate a specified condition based on the results of previous steps. If the condition is true, the workflow proceeds to the step indicated by the `trueCase` parameter. Otherwise, it moves to the step defined in the `falseCase` parameter.  
  
## Scripts

In the project directory, you can run:

- `yarn` or `npm i` - Installs dependencies. Feel free to use `npm` instead of `yarn` if you wish.
- `yarn start` or `npm run start` - Runs the backend server on your computer. The server will restart if you make edits.
- `yarn test` or `npm run test` - Runs Jest test suite
- `yarn build` or `npm run build` - Generates production build in the `dist` directory
- `yarn prod` or `npm run prod` - Runs the production build from the `dist` directory


## Sample configuration
A sample configuration is provided below. You can send this JSON payload to the application using a tool like `cURL`.

```bash
curl --request POST \
  --url http://localhost:3000/api/execute-workflow \
  --header 'Content-Type: application/json' \
  --data '{
  "steps": [
    {
      "id": 1,
      "type": "http",
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/posts/1"
    },
    {
      "id": 2,
      "type": "condition",
      "condition": "context['\''step_1'\''].userId === 1",
      "trueCase": 4,
      "falseCase": 3
    },
    {
      "id": 3,
      "type": "http",
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/posts/2"
    },
    {
      "id": 4,
      "type": "http",
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/posts/3"
    },
    {
      "id": 5,
      "type": "condition",
      "condition": "context['\''step_4'\''] === undefined",
      "trueCase": 6,
      "falseCase": 7
    },
    {
      "id": 6,
      "type": "http",
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/posts/4"
    },
    {
      "id": 7,
      "type": "http",
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/posts/5"
    }
  ]
}'
```

