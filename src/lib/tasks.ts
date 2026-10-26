export const priorities = ["Alta", "Média", "Baixa"] as const;
export type Priority = (typeof priorities)[number];
export type Task = {
  id: string;
  text: string;
  completed: boolean;
  list: string;
  priority: Priority;
  createdAt: string;
  scheduledAt: string | null;
};

export function createTask(input: { text: string; list: string; priority: Priority; scheduledAt: string }, now = new Date()): Task {
  const text = input.text.trim();
  if (!text) throw new Error("Digite o nome da tarefa.");
  const scheduled = input.scheduledAt ? new Date(input.scheduledAt) : null;
  if (scheduled && (!Number.isFinite(scheduled.getTime()) || scheduled <= now)) {
    throw new Error("Escolha uma data e hora no futuro.");
  }
  return { id: crypto.randomUUID(), text, list: input.list, priority: input.priority, completed: false, createdAt: now.toISOString(), scheduledAt: scheduled?.toISOString() ?? null };
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function filterTasks(tasks: Task[], list: string | null, day: string | null): Task[] {
  return tasks.filter((task) => (!list || task.list === list) && (!day || (task.scheduledAt && localDate(new Date(task.scheduledAt)) === day)));
}

export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}