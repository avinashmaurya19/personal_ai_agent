"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Plus,
  X,
  Search,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  Tag,
} from "lucide-react";
import { api, TaskItem, NoteItem } from "@/lib/api-client";

interface TasksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TasksDrawer({ isOpen, onClose }: TasksDrawerProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "notes">("tasks");

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const statusParam = taskStatusFilter === "all" ? undefined : taskStatusFilter;
      const priorityParam = taskPriorityFilter === "all" ? undefined : taskPriorityFilter;
      const data = await api.getTasks(statusParam, priorityParam);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotes(noteSearchQuery.trim() || undefined);
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "tasks") {
        fetchTasks();
      } else {
        fetchNotes();
      }
    }
  }, [isOpen, activeTab, taskStatusFilter, taskPriorityFilter, noteSearchQuery]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isCreatingTask) return;

    setIsCreatingTask(true);
    try {
      const created = await api.createTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      setNewTaskDueDate("");
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim() || isCreatingNote) return;

    setIsCreatingNote(true);
    try {
      const tagsArray = newNoteTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const created = await api.createNote({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        tags: tagsArray,
      });
      setNotes((prev) => [created, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
      setNewNoteTags("");
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="flex h-full w-full max-w-lg flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Tasks & Notes</h2>
              <p className="text-xs text-slate-400">Manage daily actions and personal snippets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "tasks"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Tasks ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Notes ({notes.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "tasks" ? (
            <>
              {/* Quick Task Creation Form */}
              <form onSubmit={handleCreateTask} className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                <input
                  type="text"
                  placeholder="What needs to get done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="rounded-lg bg-slate-900 border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingTask || !newTaskTitle.trim()}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Task Filters */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  {["all", "pending", "completed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTaskStatusFilter(st)}
                      className={`px-2 py-1 rounded capitalize ${
                        taskStatusFilter === st
                          ? "bg-slate-800 text-indigo-400 font-medium"
                          : "hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-1">
                  {["all", "urgent", "high", "medium", "low"].map((pr) => (
                    <button
                      key={pr}
                      onClick={() => setTaskPriorityFilter(pr)}
                      className={`px-2 py-1 rounded capitalize ${
                        taskPriorityFilter === pr
                          ? "bg-slate-800 text-indigo-400 font-medium"
                          : "hover:text-slate-200"
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task List */}
              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No tasks found. Add a task above or tell the assistant in chat!
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const isDone = task.status === "completed";
                    const isUrgent = task.priority === "urgent" || task.priority === "high";

                    return (
                      <div
                        key={task.id}
                        className={`group flex items-start justify-between p-3 rounded-lg border transition-all ${
                          isDone
                            ? "bg-slate-950/30 border-slate-800/40 opacity-60"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start space-x-3 flex-1 min-w-0 pr-2">
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-400"
                          >
                            {isDone ? (
                              <CheckSquare className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium leading-relaxed ${
                                isDone ? "line-through text-slate-400" : "text-slate-200"
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1 text-[10px]">
                              <span
                                className={`px-1.5 py-0.5 rounded capitalize ${
                                  isUrgent
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.due_date && (
                                <span className="flex items-center space-x-1 text-slate-400">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Note Search & Creation */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search notes by keyword or tags..."
                    value={noteSearchQuery}
                    onChange={(e) => setNoteSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700/60 pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Create Note Form */}
                <form onSubmit={handleCreateNote} className="space-y-2.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700/60 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="Write note contents..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700/60 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Tags (comma separated, e.g. sprint, ideas)"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      className="flex-1 rounded-lg bg-slate-900 border border-slate-700/60 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingNote || !newNoteTitle.trim() || !newNoteContent.trim()}
                      className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Notes List */}
              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No notes found. Create a note above or ask the assistant in chat!
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="group p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-200">{note.title}</h4>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20"
                            >
                              <Tag className="h-2.5 w-2.5" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
