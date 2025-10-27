import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';                  
import produtoRoutes from './routes/produtoRoutes.js';

dotenv.config();
const app = express();

// middlewares
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// rotas
app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/produtos', produtoRoutes);

app.get('/', (req, res) => {
  res.send('API do Controle de Estoque está rodando. Use /produtos ou /health.');
});

// middleware de erro SEMPRE por último
app.use((err, req, res, next) => {
  console.error('[ERR]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

