import express from 'express';
import client from 'prom-client';

const app = express();

const register = new client.Registry();

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Intervalos de tempo (em segundos)
});

register.registerMetric(httpRequestDurationMicroseconds);

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end();
  });
  next();
});

app.get('/', (req, res) => {
  res.send('Olá, mundo!');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await register.metrics());
});

// Iniciando o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
