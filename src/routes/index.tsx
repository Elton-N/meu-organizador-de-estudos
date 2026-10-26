import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Organizador de Estudos" },
      { name: "description", content: "Organize suas tarefas acadêmicas de forma simples." },
      { property: "og:title", content: "Meu Organizador de Estudos" },
      { property: "og:description", content: "Organize suas tarefas acadêmicas de forma simples." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Tarefa = { id: number; texto: string; concluida: boolean };

function Index() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [texto, setTexto] = useState("");

  const adicionar = (e: FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setTarefas([...tarefas, { id: Date.now(), texto: t, concluida: false }]);
    setTexto("");
  };
  const alternar = (id: number) =>
    setTarefas(tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)));
  const excluir = (id: number) => setTarefas(tarefas.filter((t) => t.id !== id));
  const concluidas = tarefas.filter((t) => t.concluida).length;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Meu Organizador de Estudos</h1>
          <p className="mt-2 text-muted-foreground">
            Olá! Que bom ter você aqui. Vamos organizar seus estudos juntos? 📚
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-primary">{tarefas.length}</p>
            <p className="text-sm text-muted-foreground">Tarefas cadastradas</p>
          </div>
          <div className="rounded-2xl bg-card p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-primary">{concluidas}</p>
            <p className="text-sm text-muted-foreground">Tarefas concluídas</p>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <form onSubmit={adicionar} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="nova" className="sr-only">Nova tarefa</label>
            <input
              id="nova"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Digite uma nova tarefa..."
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Adicionar
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Minhas tarefas</h2>
          {tarefas.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Nenhuma tarefa ainda. Adicione a primeira!
            </p>
          ) : (
            <ul className="space-y-2">
              {tarefas.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                  <input
                    type="checkbox"
                    checked={t.concluida}
                    onChange={() => alternar(t.id)}
                    aria-label="Marcar como concluída"
                    className="h-5 w-5 accent-primary"
                  />
                  <span className={`flex-1 break-words ${t.concluida ? "text-muted-foreground line-through" : ""}`}>
                    {t.texto}
                  </span>
                  <button
                    onClick={() => excluir(t.id)}
                    className="rounded-lg px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
