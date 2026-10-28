import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  ListPlus,
  Plus,
  Trash2,
  BellOff,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createTask,
  filterTasks,
  localDate,
  priorities,
  renameTask,
  toggleTask,
} from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Organizador de Estudos — Tarefas e agenda" },
      {
        name: "description",
        content: "Organize suas tarefas acadêmicas por lista, prioridade e data de agendamento.",
      },
      { property: "og:title", content: "Meu Organizador de Estudos — Tarefas e agenda" },
      {
        property: "og:description",
        content: "Suas listas de estudos, prioridades e agenda semanal em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const priorityStyles = {
  Alta: "bg-priority-high/10 text-priority-high",
  Média: "bg-priority-medium/10 text-priority-medium",
  Baixa: "bg-priority-low/10 text-priority-low",
};
const dateTime = (value) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const field =
  "h-11 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Index() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState(["Geral", "Provas", "Trabalhos"]);
  const [activeList, setActiveList] = useState(null);
  const [newList, setNewList] = useState("");
  const [showListForm, setShowListForm] = useState(false);
  const [text, setText] = useState("");
  const [list, setList] = useState("Geral");
  const [priority, setPriority] = useState("Média");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState("");
  const [today, setToday] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState("");
  useEffect(() => {
    setToday(new Date());
  }, []);
  const completed = tasks.filter((task) => task.completed).length;
  const scheduled = tasks.filter((task) => task.scheduledAt && !task.completed).length;
  const visible = filterTasks(tasks, activeList, selectedDay);
  const week = today
    ? Array.from({ length: 7 }, (_, i) => {
        const day = new Date(today);
        day.setDate(day.getDate() - ((day.getDay() + 6) % 7) + weekOffset * 7 + i);
        return day;
      })
    : [];

  function addTask(event) {
    event.preventDefault();
    try {
      const task = createTask({ text, list, priority, scheduledAt });
      setTasks((previous) => [...previous, task]);
      setText("");
      setScheduledAt("");
      setError("");
      setActiveList(null);
      setSelectedDay(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível adicionar a tarefa.");
    }
  }
  function addList(event) {
    event.preventDefault();
    const name = newList.trim();
    if (!name) return;
    if (lists.some((item) => item.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR")))
      return;
    setLists((previous) => [...previous, name]);
    setList(name);
    setActiveList(name);
    setNewList("");
    setShowListForm(false);
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditTitle(task.text);
    setEditError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditError("");
  }

  function saveTitle(event, id) {
    event.preventDefault();
    try {
      const updated = renameTask(tasks, id, editTitle);
      setTasks(updated);
      cancelEditing();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Não foi possível salvar o título.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-3 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Meu Organizador de Estudos
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Olá! Que bom ter você aqui. Vamos organizar seus estudos juntos? 📚
              </p>
            </div>
          </div>
          {today && (
            <p className="flex items-center gap-2 pt-2 text-sm capitalize text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              {today.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          )}
        </header>
        <section aria-label="Resumo das tarefas" className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Tarefas cadastradas", value: tasks.length, Icon: ClipboardList },
            { label: "Tarefas concluídas", value: completed, Icon: CheckCheck },
            { label: "Tarefas agendadas", value: scheduled, Icon: Clock3 },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <Icon className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
              </div>
            </div>
          ))}
        </section>
        <section aria-label="Agenda semanal" className="mb-8 border-y border-border py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold">
              <CalendarDays className="size-5 text-primary" />
              Sua semana
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Semana anterior"
                onClick={() => {
                  setWeekOffset((v) => v - 1);
                  setSelectedDay(null);
                }}
              >
                <ChevronLeft />
              </Button>
              <span className="text-xs text-muted-foreground">
                {week[0]?.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} —{" "}
                {week[6]?.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Próxima semana"
                onClick={() => {
                  setWeekOffset((v) => v + 1);
                  setSelectedDay(null);
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-3">
            {week.map((day) => {
              const key = localDate(day);
              const isToday = today && key === localDate(today);
              const count = tasks.filter(
                (task) => task.scheduledAt && localDate(new Date(task.scheduledAt)) === key,
              ).length;
              return (
                <Button
                  key={key}
                  variant={selectedDay === key ? "default" : "ghost"}
                  aria-pressed={selectedDay === key}
                  aria-label={day.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  onClick={() => setSelectedDay(selectedDay === key ? null : key)}
                  className={`h-24 min-w-0 flex-col gap-1 px-1 ${isToday && selectedDay !== key ? "bg-secondary text-primary" : ""}`}
                >
                  <span className="text-[11px] capitalize sm:text-xs">
                    {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </span>
                  <span className="text-xl font-semibold">{day.getDate()}</span>
                  <span className="h-4 text-[10px]">
                    {count
                      ? `${count} ${count === 1 ? "tarefa" : "tarefas"}`
                      : isToday
                        ? "Hoje"
                        : ""}
                  </span>
                </Button>
              );
            })}
          </div>
        </section>
        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Minhas listas</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Criar lista"
                title="Criar lista"
                onClick={() => setShowListForm(!showListForm)}
              >
                <ListPlus />
              </Button>
            </div>
            <nav aria-label="Listas de tarefas" className="flex flex-wrap gap-1 lg:flex-col">
              <Button
                variant={activeList === null ? "secondary" : "ghost"}
                className="justify-between"
                onClick={() => setActiveList(null)}
              >
                Todas as tarefas <span className="text-xs">{tasks.length}</span>
              </Button>
              {lists.map((name) => (
                <Button
                  key={name}
                  variant={activeList === name ? "secondary" : "ghost"}
                  className="h-auto min-h-9 justify-between whitespace-normal text-left"
                  onClick={() => {
                    setActiveList(name);
                    setList(name);
                  }}
                >
                  <span className="break-all">{name}</span>
                  <span className="ml-2 text-xs">
                    {tasks.filter((task) => task.list === name).length}
                  </span>
                </Button>
              ))}
            </nav>
            {showListForm && (
              <form onSubmit={addList} className="mt-3 space-y-2">
                <label htmlFor="new-list" className="text-xs text-muted-foreground">
                  Nome da nova lista
                </label>
                <input
                  id="new-list"
                  autoFocus
                  maxLength={60}
                  value={newList}
                  onChange={(e) => setNewList(e.target.value)}
                  className={field}
                  required
                />
                <Button type="submit" size="sm">
                  <Plus />
                  Criar lista
                </Button>
              </form>
            )}
            <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium">
                <BellOff className="size-4" />
                Lembretes por SMS
              </p>
              <p className="mt-2 text-xs">Indisponíveis: serviço de SMS não conectado.</p>
              <p className="mt-1 text-xs">Antecedência prevista: 30 minutos.</p>
            </div>
          </aside>
          <div className="min-w-0">
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Nova tarefa</h2>
              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <label htmlFor="nova" className="mb-1.5 block text-sm font-medium">
                    O que você precisa estudar?
                  </label>
                  <input
                    id="nova"
                    value={text}
                    maxLength={500}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Digite uma nova tarefa..."
                    className={field}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="task-list" className="mb-1.5 block text-sm font-medium">
                      Lista
                    </label>
                    <select
                      id="task-list"
                      value={list}
                      onChange={(e) => setList(e.target.value)}
                      className={field}
                    >
                      {lists.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <fieldset>
                    <legend className="mb-1.5 text-sm font-medium">Prioridade</legend>
                    <div className="grid h-11 grid-cols-3 gap-2">
                      {priorities.map((value) => (
                        <Button
                          type="button"
                          key={value}
                          variant="outline"
                          aria-pressed={priority === value}
                          onClick={() => setPriority(value)}
                          className={`h-11 px-2 ${priority === value ? `ring-1 ring-current ${priorityStyles[value]}` : "text-muted-foreground"}`}
                        >
                          <span
                            className={`size-2 shrink-0 rounded-full ${value === "Alta" ? "bg-priority-high" : value === "Média" ? "bg-priority-medium" : "bg-priority-low"}`}
                          />
                          {value}
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="schedule" className="mb-1.5 block text-sm font-medium">
                      Agendar para{" "}
                      <span className="font-normal text-muted-foreground">(opcional)</span>
                    </label>
                    <input
                      id="schedule"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className={field}
                    />
                  </div>
                  <Button type="submit" className="h-11 px-6">
                    <Plus />
                    Adicionar tarefa
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </form>
            </section>
            <section className="border-t border-border pt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {activeList ?? "Minhas tarefas"}{" "}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    ({visible.length})
                  </span>
                </h2>
                {selectedDay && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                    Limpar filtro de dia
                  </Button>
                )}
              </div>
              {visible.length === 0 ? (
                <div className="py-8 text-center">
                  <ClipboardList className="mx-auto mb-3 size-8 text-primary/60" />
                  <p className="text-sm text-muted-foreground">
                    {tasks.length === 0
                      ? "Nenhuma tarefa ainda. Adicione a primeira!"
                      : "Nenhuma tarefa neste filtro."}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {visible.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => setTasks((previous) => toggleTask(previous, task.id))}
                        aria-label={`Marcar ${task.text} como ${task.completed ? "pendente" : "concluída"}`}
                        className="mt-1 size-5 shrink-0 accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        {editingId === task.id ? (
                          <form
                            onSubmit={(event) => saveTitle(event, task.id)}
                            noValidate
                            className="space-y-2"
                          >
                            <label
                              htmlFor={`edit-${task.id}`}
                              className="block text-sm font-medium"
                            >
                              Título da tarefa
                            </label>
                            <input
                              id={`edit-${task.id}`}
                              autoFocus
                              maxLength={500}
                              value={editTitle}
                              onChange={(event) => {
                                setEditTitle(event.target.value);
                                setEditError("");
                              }}
                              aria-invalid={Boolean(editError)}
                              aria-describedby={editError ? `edit-error-${task.id}` : undefined}
                              className={field}
                            />
                            {editError && (
                              <p
                                id={`edit-error-${task.id}`}
                                role="alert"
                                className="text-sm text-destructive"
                              >
                                {editError}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button type="submit" size="sm">
                                <Check />
                                Salvar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                              >
                                <X />
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <p
                            className={`break-words font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}
                          >
                            {task.text}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          <span className="break-all text-xs text-muted-foreground">
                            {task.list}
                          </span>
                        </div>
                        {task.scheduledAt && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                            <CalendarDays className="size-3.5 shrink-0" />
                            <span>Agendada: {dateTime(task.scheduledAt)}</span>
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Adicionada: {dateTime(task.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                        {editingId !== task.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(task)}
                            aria-label={`Editar ${task.text}`}
                            title="Editar título"
                          >
                            <Pencil />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTasks((previous) => previous.filter((item) => item.id !== task.id));
                            if (editingId === task.id) cancelEditing();
                          }}
                          aria-label={`Excluir ${task.text}`}
                          title="Excluir tarefa"
                          className="text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
