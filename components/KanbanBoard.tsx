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
import axios from 'axios';
import { set } from 'zod';

import ColumnContainer from './ColumnContainer';
import TaskCard from './TaskCard';

import PlusIcon from '../icons/PlusIcon';
import { Column, Id, Task } from '../types/types';

import { ProjectProps, TicketProps } from '@/types';

interface ProjectDetailProps {
  project: ProjectProps;
  selectedTag: string;
}

interface ColumnData {
  id: string;
  title: string;
}

const token = localStorage.getItem('token');
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function KanbanBoard({ project, selectedTag }: ProjectDetailProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns?.map(col => col.id), [columns]);
  console.log(selectedTag);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Task[]>([]);
  // create a useMemo for
  const cache = useMemo(() => tasks, [tasks]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  function sortTag(tag: string) {
    if (tag === 'All') {
      setTasks(tickets);

      return;
    }
    if (tag === '+') return;
    if (tasks !== undefined) {
      const newTasks = tickets.filter(
        ticket => ticket.ticket.tag!.title === tag,
      );
      setTasks(newTasks);
    }
  }

  useEffect(() => {
    sortTag(selectedTag);
  }, [selectedTag]);

  useEffect(() => {
    const columns: ColumnData[] = [];
    project.stages.forEach(col => {
      columns.push({
        id: col.id,
        title: col.title,
      } as ColumnData);
    });
    setColumns(columns);

    const fetchTasksForAllStages = async () => {
      // Collect promises for fetching tickets for each stage
      const tasksPromises = project.stages.map(async stage => {
        const tickets = (await (
          await axios.get(`${API_URL}/tickets/get/stage/${stage.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ).data.tickets) as TicketProps[];

        if (!tickets) return [];

        return tickets.map(ticket => ({
          id: ticket.ticketId,
          columnId: stage.id,
          ticket: ticket,
        }));
      });

      // Wait for all promises to resolve and collect the tasks
      try {
        const allTasks = await Promise.all(tasksPromises);
        setTasks(allTasks.flat());
        setTickets(allTasks.flat());
        console.log('Tasks fetched successfully');
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Handle error gracefully, e.g., display an error message
        setTasks(cache);
      }
    };

    fetchTasksForAllStages();
  }, [project.stages]);
  console.log(tasks);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

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
                  setTasks={setTasks}
                  tags={project.tags}
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
                setTasks={setTasks}
                tags={project.tags}
                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                updateColumn={updateColumn}
                updateTask={updateTask}
              />
            )}
            {activeTask && (
              <TaskCard
                deleteTask={deleteTask}
                setTasks={setTasks}
                tags={project.tags}
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
    let newTask: Task = {} as Task;
    async function createTask() {
      await axios
        .post(
          `${API_URL}/tickets/create/${columnId}`,
          {
            title: 'New Task',
            description: 'idk man',
            assignedUserIds: [project.admin.id],
            deadline: new Date().toISOString(),
            parentTicketId: '',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(async res => {
          console.log('Create ticket successfully');
          const newTicket = (
            await axios.get(
              `${API_URL}/tickets/get/ticket/${res.data.ticketId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
          ).data.ticket as TicketProps;
          newTask = {
            id: res.data.ticketId,
            columnId: columnId,
            ticket: newTicket,
          } as Task;
          setTasks([...tasks, newTask]);
        });
    }
    createTask();
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
    let columnToAdd: Column = {} as Column;

    async function createColumn() {
      console.log('create column');
      await axios
        .post(
          `${API_URL}/stages/create/${project.id}`,
          {
            title: 'New Column',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(res => {
          console.log('Create stage successfully');
          columnToAdd = {
            id: res.data.stageId,
            title: 'New Column',
          } as Column;

          setColumns([...columns, columnToAdd]);
        });
    }
    createColumn();
  }

  function deleteColumn(id: string) {
    const filteredColumns = columns.filter(col => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter(t => t.columnId !== id);
    setTasks(newTasks);
    async function deleteColumn() {
      await axios
        .delete(`${API_URL}/stages/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(res => {
          console.log(res.data);
          console.log('Delete stage successfully');
        })
        .catch(err => {
          console.log(err);
        });
    }
    deleteColumn();
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
      console.log(activeId, overId);
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);

        tasks[activeIndex].columnId = overId.toString();
        console.log('DROPPING TASK OVER COLUMN', { activeIndex });
        async function updateTicket() {
          await axios
            .put(
              `${API_URL}/tickets/update/stage/${activeId}`,
              {
                stageId: overId,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .then(res => {
              console.log(overId);
              console.log(res.data);
              console.log('Update ticket successfully');
            })
            .catch(err => {
              console.log(err);
              console.log('Update ticket failed');
            });
        }
        const overIndex = tasks.findIndex(t => t.id === overId);
        if (
          tasks[activeIndex].columnId != overId &&
          overId !== tasks[activeIndex].id &&
          overId !== tasks[activeIndex].ticket.ticketId &&
          overId !== columns[overIndex].id
        ) {
          updateTicket();
        }

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

export default KanbanBoard;
