import { fireEvent, render, screen, within, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Route } from "@/routes/index";

afterEach(cleanup);

function addTask(title) {
  fireEvent.change(screen.getByLabelText("O que você precisa estudar?"), { target: { value: title } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar tarefa" }));
}

describe("Edição de tarefas", () => {
  it("mantém o título anterior ao cancelar, inclusive após uma tentativa inválida", () => {
    const Page = Route.options.component;
    render(<Page />);
    addTask("Estudar matemática");
    fireEvent.click(screen.getByRole("button", { name: "Editar Estudar matemática" }));
    fireEvent.change(screen.getByLabelText("Título da tarefa"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Título da tarefa"), { target: { value: "Outro título" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("Estudar matemática")).toBeInTheDocument();
    expect(screen.queryByText("Outro título")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Título da tarefa")).not.toBeInTheDocument();
  });

  it("salva o título e mantém adicionar, concluir, desmarcar e excluir", () => {
    const Page = Route.options.component;
    render(<Page />);
    addTask("Estudar matemática");
    addTask("Ler história");
    fireEvent.click(screen.getByRole("button", { name: "Editar Estudar matemática" }));
    fireEvent.change(screen.getByLabelText("Título da tarefa"), { target: { value: " Revisar álgebra " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("Revisar álgebra")).toBeInTheDocument();
    expect(screen.getByText("Ler história")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Marcar Revisar álgebra como concluída" }));
    expect(screen.getByRole("checkbox", { name: "Marcar Revisar álgebra como pendente" })).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: "Marcar Revisar álgebra como pendente" }));
    expect(screen.getByRole("checkbox", { name: "Marcar Revisar álgebra como concluída" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Excluir Revisar álgebra" }));
    expect(screen.queryByText("Revisar álgebra")).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Listas de tarefas" })).getByRole("button", { name: "Todas as tarefas 1" })).toBeInTheDocument();
  });
});