// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ------- helpers ------- */
const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(v || 0)
  );

/* ------- UI simples ------- */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold m-0">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextField({ label, type = "text", value, onChange, min, step, required }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        step={step}
        required={required}
      />
    </label>
  );
}
const NumberField = (props) => <TextField type="number" step={props.step ?? "0.01"} {...props} />;

function Button({ children, variant = "primary", ...rest }) {
  const cls =
    variant === "primary"
      ? "bg-black text-white hover:bg-gray-900"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : variant === "ghost"
      ? "bg-transparent text-gray-700 hover:bg-gray-100"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300";
  return (
    <button className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition ${cls}`} {...rest}>
      {children}
    </button>
  );
}

/* --------------- App --------------- */
export default function InventoryApp() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros e ordenação
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ by: "id", dir: "desc" });

  // modal/criação/edição
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("0");
  const [preco, setPreco] = useState("0");

  function resetForm() {
    setNome("");
    setQuantidade("0");
    setPreco("0");
    setEditing(null);
  }

  async function fetchItems() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/produtos`);
      if (!res.ok) throw new Error(`Falha ao carregar: ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setNome(item.nome ?? "");
    setQuantidade(String(item.quantidade ?? 0));
    setPreco(String(item.preco ?? 0));
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      nome: nome.trim(),
      quantidade: Number(quantidade),
      preco: Number(preco),
    };
    if (!payload.nome) return alert("Informe o nome");
    if (Number.isNaN(payload.quantidade) || payload.quantidade < 0)
      return alert("Quantidade inválida");
    if (Number.isNaN(payload.preco) || payload.preco < 0) return alert("Preço inválido");

    try {
      setError("");
      const isEdit = Boolean(editing?.id);
      const url = isEdit ? `${API_URL}/produtos/${editing.id}` : `${API_URL}/produtos`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Falha ao salvar (${res.status}): ${detail}`);
      }
      await fetchItems();
      setOpen(false);
      resetForm();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Excluir “${item.nome}”?`)) return;
    try {
      const res = await fetch(`${API_URL}/produtos/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Falha ao excluir: ${res.status}`);
      await fetchItems();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = [...items];
    if (term) list = list.filter((it) => String(it.nome).toLowerCase().includes(term));
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const va = a[sort.by];
      const vb = b[sort.by];
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return list;
  }, [items, q, sort]);

  function SortButton({ id, label }) {
    const active = sort.by === id;
    const dir = active ? sort.dir : "asc";
    return (
      <button
        className={`flex items-center gap-1 hover:underline ${active ? "font-semibold" : ""}`}
        onClick={() => setSort({ by: id, dir: active && dir === "asc" ? "desc" : "asc" })}
      >
        {label}
        <span className="text-xs">{active ? (dir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl pt-6">{/* ⬅ evita margem colapsada */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 mt-0 text-2xl font-bold">Controle de Estoque</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Pesquisar por nome…"
              className="w-64 rounded-xl border border-gray-300 px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button onClick={openCreate}>+ Novo produto</Button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-4 py-3">
                  <SortButton id="id" label="#" />
                </th>
                <th className="px-4 py-3">
                  <SortButton id="nome" label="Nome" />
                </th>
                <th className="px-4 py-3">
                  <SortButton id="quantidade" label="Qtd." />
                </th>
                <th className="px-4 py-3">
                  <SortButton id="preco" label="Preço" />
                </th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={5}>
                    Carregando…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    Nenhum produto
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{it.id}</td>
                    <td className="px-4 py-3">{it.nome}</td>
                    <td className="px-4 py-3">{it.quantidade}</td>
                    <td className="px-4 py-3">{formatBRL(it.preco)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => openEdit(it)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(it)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={open}
          title={editing ? "Editar produto" : "Novo produto"}
          onClose={() => setOpen(false)}
        >
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <TextField label="Nome" value={nome} onChange={setNome} required />
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Quantidade"
                value={quantidade}
                onChange={setQuantidade}
                step="1"
              />
              <NumberField label="Preço (R$)" value={preco} onChange={setPreco} />
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
