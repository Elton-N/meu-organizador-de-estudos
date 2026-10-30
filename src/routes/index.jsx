import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Ghost,
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
  "study-field h-12 w-full min-w-0 border border-input px-4 text-base text-foreground";

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
  const [listError, setListError] = useState("");
  const [announcement, setAnnouncement] = useState("");
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
      setAnnouncement(`Tarefa ${task.text} adicionada.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível adicionar a tarefa.");
    }
  }
  function addList(event) {
    event.preventDefault();
    const name = newList.trim();
    if (!name) return;
    if (lists.some((item) => item.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) {
      setListError("Já existe uma lista com esse nome.");
      return;
    }
    setLists((previous) => [...previous, name]);
    setList(name);
    setActiveList(name);
    setNewList("");
    setListError("");
    setShowListForm(false);
    setAnnouncement(`Lista ${name} criada.`);
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
      setAnnouncement(`Tarefa renomeada para ${editTitle.trim()}.`);
      cancelEditing();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Não foi possível salvar o título.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <header className="mb-10 flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            <div
              aria-hidden="true"
              className="mt-1 rounded-xl bg-primary p-3 text-primary-foreground shadow-sm"
            >
              <Ghost className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl leading-tight text-primary sm:text-5xl">
                Meu Organizador de Estudos
              </h1>
              <p className="mt-1 text-lg text-muted-foreground">
                Olá! Que bom ter você aqui. Vamos organizar seus estudos juntos? 🎃
              </p>
            </div>
          </div>
          {today && (
            <p className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-base capitalize text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-primary" />
              {today.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          )}
        </header>
        <section
          aria-label="Resumo das tarefas"
          className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4"
        >
          {[
            { label: "Tarefas cadastradas", value: tasks.length, Icon: ClipboardList },
            { label: "Tarefas concluídas", value: completed, Icon: CheckCheck },
            { label: "Tarefas agendadas", value: scheduled, Icon: Clock3 },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:gap-4 sm:p-5"
            >
              <Icon className="size-5 shrink-0 text-primary sm:size-6" />
              <div>
                <p className="font-display text-4xl leading-none text-primary">{value}</p>
                <p className="text-base leading-tight text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </section>
        <section
          aria-label="Agenda semanal"
          className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-2xl">
                <CalendarDays aria-hidden="true" className="size-5 text-primary" />
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
              <span className="text-base text-muted-foreground">
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
          <div
            aria-hidden="true"
            className="mb-2 grid grid-cols-7 gap-1 text-center text-sm font-bold capitalize text-muted-foreground sm:gap-3 sm:text-base"
          >
            {week.map((day) => (
              <span key={localDate(day)}>
                {day.toLocaleDateString("pt-BR", { weekday: "short" })}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-3">
            {week.map((day) => {
              const key = localDate(day);
              const isToday = today && key === localDate(today);
              const count = tasks.filter(
                (task) => task.scheduledAt && localDate(new Date(task.scheduledAt)) === key,
              ).length;
              const accessibleDay = day.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
              return (
                <Button
                  key={key}
                  variant={selectedDay === key ? "default" : "ghost"}
                  aria-pressed={selectedDay === key}
                  aria-label={`${accessibleDay}${count ? `, ${count} ${count === 1 ? "tarefa agendada" : "tarefas agendadas"}` : isToday ? ", hoje" : ""}`}
                  onClick={() => setSelectedDay(selectedDay === key ? null : key)}
                  className={`h-20 min-w-0 flex-col gap-1 px-1 ${isToday && selectedDay !== key ? "border border-primary/40 bg-secondary text-primary" : ""}`}
                >
                  <span className="font-display text-3xl leading-none">{day.getDate()}</span>
                  <span className="h-4 text-sm leading-none">
                    {count
                      ? count
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
          <div className="min-w-0 lg:col-start-2">
            <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 font-display text-3xl">Nova tarefa</h2>
              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <label htmlFor="nova" className="mb-1.5 block text-base font-bold">
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
                    <label htmlFor="task-list" className="mb-1.5 block text-base font-bold">
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
                    <legend className="mb-1.5 text-base font-bold">Prioridade</legend>
                    <div className="grid h-11 grid-cols-3 gap-2">
                      {priorities.map((value) => (
                        <Button
                          type="button"
                          key={value}
                          variant="outline"
                          aria-pressed={priority === value}
                          onClick={() => setPriority(value)}
                          className={`h-12 px-2 text-base ${priority === value ? `ring-1 ring-current ${priorityStyles[value]}` : "text-muted-foreground"}`}
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
                    <label htmlFor="schedule" className="mb-1.5 block text-base font-bold">
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
                  <Button type="submit" className="h-12 px-6 text-lg">
                    <Plus />
                    Adicionar tarefa
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="text-base text-destructive">
                    {error}
                  </p>
                )}
              </form>
            </section>
            <section className="border-t border-border pt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-3xl">
                  {activeList ?? "Minhas tarefas"}{" "}
                  <span className="ml-1 text-base font-normal text-muted-foreground">
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
                  <Ghost className="mx-auto mb-3 size-10 text-primary" />
                  <p className="text-lg text-muted-foreground">
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
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          setTasks((previous) => toggleTask(previous, task.id));
                          setAnnouncement(
                            `Tarefa ${task.text} marcada como ${task.completed ? "pendente" : "concluída"}.`,
                          );
                        }}
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
                              className="block text-base font-bold"
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
                                className="text-base text-destructive"
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
                            className={`break-words text-lg font-bold ${task.completed ? "text-muted-foreground line-through" : ""}`}
                          >
                            {task.text}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-base font-bold ${priorityStyles[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          <span className="break-all text-sm text-muted-foreground">
                            {task.list}
                          </span>
                        </div>
                        {task.scheduledAt && (
                          <p className="mt-2 flex items-center gap-1.5 text-base font-medium text-primary">
                            <CalendarDays className="size-3.5 shrink-0" />
                            <span>Agendada: {dateTime(task.scheduledAt)}</span>
                          </p>
                        )}
                        <p className="mt-2 text-base text-muted-foreground">
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
                            setAnnouncement(`Tarefa ${task.text} excluída.`);
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
          <aside className="rounded-2xl border border-border bg-card p-5 lg:col-start-1 lg:row-start-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl">Minhas listas</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Criar lista"
                title="Criar lista"
                aria-expanded={showListForm}
                aria-controls="new-list-form"
                onClick={() => setShowListForm(!showListForm)}
              >
                <ListPlus />
              </Button>
            </div>
            <nav aria-label="Listas de tarefas" className="flex flex-wrap gap-2 lg:flex-col">
              <Button
                variant={activeList === null ? "secondary" : "ghost"}
                className="justify-between"
                onClick={() => setActiveList(null)}
              >
                Todas as tarefas <span className="text-base">{tasks.length}</span>
              </Button>
              {lists.map((name) => (
                <Button
                  key={name}
                  variant={activeList === name ? "secondary" : "ghost"}
                  className="h-auto min-h-10 justify-between whitespace-normal text-left"
                  onClick={() => {
                    setActiveList(name);
                    setList(name);
                  }}
                >
                  <span className="break-all">{name}</span>
                  <span className="ml-2 text-base">
                    {tasks.filter((task) => task.list === name).length}
                  </span>
                </Button>
              ))}
            </nav>
            {showListForm && (
              <form id="new-list-form" onSubmit={addList} className="mt-3 space-y-2">
                <label htmlFor="new-list" className="text-base text-muted-foreground">
                  Nome da nova lista
                </label>
                <input
                  id="new-list"
                  autoFocus
                  maxLength={60}
                  value={newList}
                  onChange={(e) => {
                    setNewList(e.target.value);
                    setListError("");
                  }}
                  className={field}
                  aria-invalid={Boolean(listError)}
                  aria-describedby={listError ? "new-list-error" : undefined}
                  required
                />
                {listError && (
                  <p id="new-list-error" role="alert" className="text-base text-destructive">
                    {listError}
                  </p>
                )}
                <Button type="submit" size="sm">
                  <Plus />
                  Criar lista
                </Button>
              </form>
            )}
            <div className="mt-6 border-t border-border pt-4 text-base text-muted-foreground">
              <h3 className="flex items-center gap-2 font-bold">
                <BellOff aria-hidden="true" className="size-4" />
                Lembretes por SMS
              </h3>
              <p className="mt-2 text-base">Indisponíveis: serviço de SMS não conectado.</p>
              <p className="mt-1 text-base">Antecedência prevista: 30 minutos.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
