This is a demo project for implementing Amplitude Experiment using Amplitude Analytics SDK integration in a basic HTML page.

## Getting Started

1. Update `index.html` by replacing `ANALYTICS_KEY` with your Amplitude API Key and `DEPLOYMENT_KEY` with your Experiment deployment key.
2. Create a flag called `demo-button` in Amplitude Experiment, add your deployment, and roll out to 100%
3. Run the development server

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result. If successful you should see two buttons. Roll back the flag to 0% and the second button should disappear. 
