'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { arrayMove, SortableContext } from '@dnd-kit/sortable';

import ColumnContainer from './ColumnContainer';
import TaskCard from './TaskCard';

import PlusIcon from '../icons/PlusIcon';
import { Column, Id, Task } from '../types/types';

import { ProjectProps } from '@/types';

interface ProjectDetailProps {
  project: ProjectProps;
}

interface ColumnData {
  id: string;
  title: string;
}

const defaultTasks: Task[] = [
  {
    id: '1',
    columnId: 'todo',
    content: 'List admin APIs for dashboard',
  },
  {
    id: '2',
    columnId: 'todo',
    content:
      'Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation',
  },
  {
    id: '3',
    columnId: 'doing',
    content: 'Conduct security testing',
  },
  {
    id: '4',
    columnId: 'doing',
    content: 'Analyze competitors',
  },
  {
    id: '5',
    columnId: 'done',
    content: 'Create UI kit documentation',
  },
  {
    id: '6',
    columnId: 'done',
    content: 'Dev meeting',
  },
  {
    id: '7',
    columnId: 'done',
    content: 'Deliver dashboard prototype',
  },
  {
    id: '8',
    columnId: 'todo',
    content: 'Optimize application performance',
  },
  {
    id: '9',
    columnId: 'todo',
    content: 'Implement data validation',
  },
  {
    id: '10',
    columnId: 'todo',
    content: 'Design database schema',
  },
  {
    id: '11',
    columnId: 'todo',
    content: 'Integrate SSL web certificates into workflow',
  },
  {
    id: '12',
    columnId: 'doing',
    content: 'Implement error logging and monitoring',
  },
  {
    id: '13',
    columnId: 'doing',
    content: 'Design and implement responsive UI',
  },
];

function KanbanBoard({ project }: ProjectDetailProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns?.map(col => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    const columns: ColumnData[] = [];
    project.stages.forEach(col => {
      columns.push({
        id: col.id,
        title: col.title,
      } as ColumnData);
    });
    setColumns(columns);
  }, [project]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );
  // i want to print out the project name here
  console.log(project);

  return (
    <div
      className="
        m-auto
        flex
        w-full
        h-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
    "
    >
      <DndContext
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map(col => (
                <ColumnContainer
                  column={col}
                  createTask={createTask}
                  deleteColumn={deleteColumn}
                  deleteTask={deleteTask}
                  key={col.id}
                  tasks={tasks.filter(task => task.columnId === col.id)}
                  updateColumn={updateColumn}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            className="
                h-[60px]
                w-[350px]
                min-w-[350px]
                cursor-pointer
                rounded-lg
                bg-mainBackgroundColor
                border-2
                border-columnBackgroundColor
                p-4
                text-white
                ring-rose-500
                hover:ring-2
                flex
                flex-row
                justify-center
                items-center
                gap-2
                "
            onClick={() => {
              createNewColumn();
            }}
            type="button"
          >
            <PlusIcon className="w-6 h-6 text-white" />
            <p>Add column</p>
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                createTask={createTask}
                deleteColumn={deleteColumn}
                deleteTask={deleteTask}
                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                updateColumn={updateColumn}
                updateTask={updateTask}
              />
            )}
            {activeTask && (
              <TaskCard
                deleteTask={deleteTask}
                task={activeTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );

  function createTask(columnId: string) {
    const newTask: Task = {
      id: generateId(),
      columnId: columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map(task => {
      if (task.id !== id) return task;

      return { ...task, content };
    });

    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: string) {
    const filteredColumns = columns.filter(col => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter(t => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: string, title: string) {
    const newColumns = columns.map(col => {
      if (col.id !== id) return col;

      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);

      return;
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);

      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === 'Column';
    if (!isActiveAColumn) return;

    console.log('DRAG END');

    setColumns(columns => {
      const activeColumnIndex = columns.findIndex(col => col.id === activeId);

      const overColumnIndex = columns.findIndex(col => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId;

          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === 'Column';

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);

        tasks[activeIndex].columnId = overId.toString();
        console.log('DROPPING TASK OVER COLUMN', { activeIndex });

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001).toString();
}

export default KanbanBoard;
