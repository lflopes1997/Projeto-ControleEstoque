import { Router } from 'express';
import { listar, buscar, criar, atualizar, remover } from '../controllers/produtoController.js';

const r = Router();
r.get('/', listar);
r.get('/:id', buscar);
r.post('/', criar);
r.put('/:id', atualizar);
r.delete('/:id', remover);

export default r;
