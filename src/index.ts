import express from 'express';
import client from 'prom-client';

// Criando uma instância do aplicativo Express
const app = express();

// Criando um registrador de métricas do Prometheus
const register = new client.Registry();

// Definindo uma métrica de contador (counter) para contar as requisições
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Intervalos de tempo (em segundos)
});

// Registrando a métrica
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware para medir o tempo de duração das requisições
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    // Marcar a duração da requisição quando ela for concluída
    end();
  });
  next();
});

// Rota padrão para responder ao cliente
app.get('/', (req, res) => {
  res.send('Olá, mundo!');
});

// Rota para expor as métricas para o Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await register.metrics());
});

// Iniciando o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
