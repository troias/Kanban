import React, { useReducer, useState } from "react";
import "./index.css";

interface Task {
  name: string;
  stage: number;
  index?: number;
  stagesCount?: number;
}

const reducer = (
  state: {
    tasks: Task[];
  },
  action: {
    type: string;
    payload: {
      index?: number;
      stagesCount?: number;
      name?: string;
      stage?: number;
    };
  }
) => {
  switch (action.type) {
    case "CREATE_NEW_TASK":
      const newTask: Task = {
        name: action.payload.name!,
        stage: action.payload.stage!,
        index: state.tasks.length,
        stagesCount: action.payload.stagesCount!,
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    case "MOVE_TASK_FORWARD":
      const forwardTasks = [...state.tasks];
      const forwardTask = forwardTasks[action.payload.index!];
      if (forwardTask && forwardTask.stage < action.payload.stagesCount! - 1) {
        forwardTask.stage++;
      }
      return {
        ...state,
        tasks: forwardTasks,
      };

    case "MOVE_TASK_BACK":
      const backTasks = [...state.tasks];
      const backTask = backTasks[action.payload.index!];
      if (backTask && backTask.stage > 0) {
        backTask.stage--;
      }
      return {
        ...state,
        tasks: backTasks,
      };

    case "DELETE_TASK":
      const updatedTasks = state.tasks.filter(
        (task, index) => index !== action.payload.index
      );
      return {
        ...state,
        tasks: updatedTasks,
      };

    default:
      return state; // Return state as is for unknown actions
  }
};

interface Props {}

export default function KanbanBoard(props: Props) {
  const [tasks, setTasks] = useState<Task[]>([
    { name: "1", stage: 0, index: 0, stagesCount: 4 },
    { name: "2", stage: 0, index: 0, stagesCount: 4 },
  ]);

  const [message, setMessage] = useState<string>("");

  const [stagesNames, setStagesNames] = useState<string[]>([
    "Backlog",
    "To Do",
    "Ongoing",
    "Done",
  ]);

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const initialState = {
    tasks: tasks,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const stagesTasks: Task[][] = [];
  for (let i = 0; i < stagesNames.length; ++i) {
    stagesTasks.push([]);
  }

  // Organize tasks into stages
  state.tasks.forEach((task) => {
    const stageId = task.stage;
    stagesTasks[stageId].push(task);
  });

  return (
    <div className="mt-10 sm:mt-20 flex flex-col items-center justify-center">
      <section className="mb-4 sm:mb-8 flex items-center justify-center">
        <input
          id="create-task-input"
          type="text"
          className="w-56 sm:w-64 lg:w-96 xl:w-128 border rounded py-2 px-3 mr-2"
          placeholder="New task name"
          data-testid="create-task-input"
          onChange={inputHandler}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          data-testid="create-task-button"
          disabled={message.length === 0}
          onClick={() =>
            dispatch({
              type: "CREATE_NEW_TASK",
              payload: {
                name: message,
                stage: 0,
                stagesCount: stagesNames.length,
              },
            })
          }
        >
          Create task
        </button>
      </section>

      <div className="flex flex-wrap justify-center">
        {stagesTasks.map((tasksInStage, i) => {
          return (
            <div
              className="bg-white w-64 sm:w-72 lg:w-80 xl:w-96 border rounded m-2 p-4"
              key={`${i}`}
            >
              <div>
                <h4 className="font-bold">{stagesNames[i]}</h4>
                <ul className="mt-4" data-testid={`stage-${i}`}>
                  {tasksInStage.map((task, index) => {
                    const isBacklog = task.stage === 0;
                    const isDone = task.stage === stagesNames.length - 1;
                    return (
                      <li
                        className="border p-2 mb-2 rounded"
                        key={`${i}${index}`}
                      >
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
                                  payload: {
                                    index,
                                    stagesCount: stagesNames.length,
                                  },
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
                                  payload: {
                                    index,
                                    stagesCount: stagesNames.length,
                                  },
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
                                  payload: {
                                    index,
                                    stagesCount: stagesNames.length,
                                  },
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
