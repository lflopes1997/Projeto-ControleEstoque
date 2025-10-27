// src/controllers/produtoController.js
import prisma from '../prisma/client.js';

export const listar = async (req, res, next) => {
  try {
    const itens = await prisma.produto.findMany();
    res.json(itens);
  } catch (e) { next(e); }
};

export const buscar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.produto.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch (e) { next(e); }
};

export const criar = async (req, res, next) => {
  try {
    const { nome, quantidade, preco } = req.body; // preco = Float (número)
    const novo = await prisma.produto.create({ data: { nome, quantidade, preco } });
    res.status(201).json(novo);
  } catch (e) { next(e); }
};

export const atualizar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nome, quantidade, preco } = req.body;
    const upd = await prisma.produto.update({ where: { id }, data: { nome, quantidade, preco } });
    res.json(upd);
  } catch (e) { next(e); }
};

export const remover = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.produto.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
};
