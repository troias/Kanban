import React, { useReducer, useState, useId } from "react";

import "./index.css";

interface Task {
  id: number; // Add a unique id to each task.
  name: string;
  stage: number;
}

type Action =
  | { type: "CREATE_NEW_TASK"; payload: { name: string } }
  | {
      type: "MOVE_TASK_FORWARD";
      payload: { taskId: number; stagesNames: string[] };
    }
  | {
      type: "MOVE_TASK_BACK";
      payload: { taskId: number; stagesNames: string[] };
    }
  | { type: "DELETE_TASK"; payload: { taskId: number } };

const reducer = (state: Task[], action: Action) => {
  switch (action.type) {
    case "CREATE_NEW_TASK":
      const newTask: Task = {
        id: Date.now(),
        name: action.payload.name,
        stage: 0,
      };
      return [...state, newTask];

    case "MOVE_TASK_FORWARD":
      return state.map((task) => {
        if (task.id === action.payload.taskId) {
          const nextStage = task.stage + 1;
          if (nextStage < action.payload.stagesNames.length) {
            return { ...task, stage: nextStage };
          }
        }
        return task;
      });

    case "MOVE_TASK_BACK":
      return state.map((task) => {
        if (task.id === action.payload.taskId) {
          const prevStage = task.stage - 1;
          if (prevStage >= 0) {
            return { ...task, stage: prevStage };
          }
        }
        return task;
      });

    case "DELETE_TASK":
      return state.filter((task) => task.id !== action.payload.taskId);

    default:
      return state;
  }
};

interface Props {}

export default function KanbanBoard(props: Props) {
  const [tasks, dispatch] = useReducer(reducer, [
    { id: 1, name: "Task 1", stage: 0 },
    { id: 2, name: "Task 2", stage: 0 },
  ]);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  console.log("tasks", tasks);

  const [message, setMessage] = useState<string>("");

  const [stagesNames] = useState<string[]>([
    "Backlog",
    "To Do",
    "Ongoing",
    "Done",
  ]);

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const createNewTask = () => {
    if (message.length > 0) {
      dispatch({ type: "CREATE_NEW_TASK", payload: { name: message } });
      setMessage("");
    }
  };

  const selectTask = (taskId: number) => {
    setSelectedTaskId(taskId); // Set the selected task ID.
  };

  return (
    <div className="mt-10 sm:mt-20 flex flex-col items-center justify-center">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 py-4">
        Sandfield Interview Kanban Board
      </h1>
      <section className="mb-4 sm:mb-8 flex items-center justify-center">
        <input
          id="create-task-input"
          type="text"
          className="w-56 sm:w-64 lg:w-96 xl:w-128 border rounded py-2 px-3 mr-2"
          placeholder="Enter new task name"
          data-testid="create-task-input"
          onChange={inputHandler}
          value={message}
        />
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  ${
            message.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          data-testid="create-task-button"
          disabled={message.length === 0}
          onClick={createNewTask}
        >
          Create task
        </button>
      </section>

      <div className="flex flex-wrap justify-center">
        {stagesNames.map((stageName, i) => {
          const tasksInStage = tasks.filter((task) => task.stage === i);
          return (
            <div
              className="bg-white w-64 sm:w-72 lg:w-80 xl:w-96 border rounded m-2 p-4"
              key={stageName}
            >
              <div>
                <h4 className="font-bold">{stageName}</h4>
                <ul className="mt-4" data-testid={`stage-${i}`}>
                  {tasksInStage.map((task, index) => {
                    const isBacklog = task.stage === 0;
                    const isDone = task.stage === stagesNames.length - 1;
                    return (
                      <li className="border p-2 mb-2 rounded" key={index}>
                        <div className="flex justify-between items-center">
                          <span
                            data-testid={`${task.name
                              .split(" ")
                              .join("-")}-name`}
                          >
                            {task.name}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ${
                                isBacklog ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              data-testid={`${task.name
                                .split(" ")
                                .join("-")}-back`}
                              onClick={() =>
                                !isBacklog &&
                                dispatch({
                                  type: "MOVE_TASK_BACK",
                                  payload: { taskId: task.id, stagesNames },
                                })
                              }
                              disabled={isBacklog}
                            >
                              Back
                            </button>
                            <button
                              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ${
                                isDone ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              data-testid={`${task.name
                                .split(" ")
                                .join("-")}-forward`}
                              onClick={() =>
                                !isDone &&
                                dispatch({
                                  type: "MOVE_TASK_FORWARD",
                                  payload: { taskId: task.id, stagesNames },
                                })
                              }
                              disabled={isDone}
                            >
                              Forward
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                              data-testid={`${task.name
                                .split(" ")
                                .join("-")}-delete`}
                              onClick={() =>
                                dispatch({
                                  type: "DELETE_TASK",
                                  payload: { taskId: task.id },
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
