import { describe, expect, it } from "vitest";
import { createTask, filterTasks, priorities, renameTask, toggleTask } from "@/lib/tasks";

const now = new Date("2026-10-26T18:00:00Z");
const input = {
  text: " Estudar matemática ",
  list: "Provas",
  priority: "Alta",
  scheduledAt: "2026-10-27T18:00:00Z",
};

describe("Tarefas acadêmicas", () => {
  it("edita somente o título da tarefa escolhida e preserva seus dados", () => {
    const task = { ...createTask(input, now), completed: true };
    const other = createTask({ ...input, text: "Ler história" }, now);
    const result = renameTask([task, other], task.id, " Revisar matemática ");
    expect(result).toEqual([{ ...task, text: "Revisar matemática" }, other]);
    expect(task.text).toBe("Estudar matemática");
  });
  it("recusa salvar um título vazio sem alterar a tarefa", () => {
    const task = createTask(input, now);
    expect(() => renameTask([task], task.id, "")).toThrow("Digite o título da tarefa.");
    expect(task.text).toBe("Estudar matemática");
  });
  it("recusa salvar um título composto apenas por espaços", () => {
    const task = createTask(input, now);
    expect(() => renameTask([task], task.id, "   ")).toThrow("Digite o título da tarefa.");
    expect(task.text).toBe("Estudar matemática");
  });
  it("registra a data e hora da criação sem confundir com o agendamento", () => {
    const task = createTask(input, now);
    expect(task.createdAt).toBe("2026-10-26T18:00:00.000Z");
    expect(task.scheduledAt).toBe("2026-10-27T18:00:00.000Z");
  });
  it("aceita exatamente as prioridades Alta, Média e Baixa", () => {
    expect(priorities).toEqual(["Alta", "Média", "Baixa"]);
    for (const priority of priorities)
      expect(createTask({ ...input, priority }, now).priority).toBe(priority);
  });
  it("separa tarefas por listas distintas", () => {
    const a = createTask(input, now);
    const b = createTask({ ...input, list: "Trabalhos" }, now);
    expect(filterTasks([a, b], "Provas", null).map((task) => task.id)).toEqual([a.id]);
  });
  it("preserva marcar e desmarcar uma tarefa concluída", () => {
    const task = createTask(input, now);
    const completed = toggleTask([task], task.id);
    expect(completed[0]?.completed).toBe(true);
    expect(toggleTask(completed, task.id)[0]?.completed).toBe(false);
  });
  it("permite tarefa sem agendamento", () => {
    expect(createTask({ ...input, scheduledAt: "" }, now).scheduledAt).toBeNull();
  });
  it("recusa um agendamento no passado", () => {
    expect(() => createTask({ ...input, scheduledAt: "2026-10-25T18:00:00Z" }, now)).toThrow();
  });
});
