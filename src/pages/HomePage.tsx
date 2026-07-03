import { useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

type Filter = 'all' | 'active' | 'completed';

const STORAGE_KEY = 'todo-app.todos.v1';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.text === 'string' &&
        typeof t.done === 'boolean'
    );
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'completed') return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const remainingCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.length - remainingCount;

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput('');
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function commitEdit() {
    if (editingId === null) return;
    const text = editingText.trim();
    if (!text) {
      deleteTodo(editingId);
    } else {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text } : t))
      );
    }
    setEditingId(null);
    setEditingText('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText('');
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">
            todos
          </h1>
          <p className="mt-2 text-slate-500">
            Keep track of what needs to get done.
          </p>
        </header>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 overflow-hidden">
          {/* Add form */}
          <form onSubmit={addTodo} className="flex items-center gap-2 p-4 border-b border-slate-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 text-slate-800 placeholder:text-slate-400 transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition"
            >
              Add
            </button>
          </form>

          {/* Filter bar */}
          {todos.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <span className="text-sm text-slate-500">
                {remainingCount} {remainingCount === 1 ? 'item' : 'items'} left
              </span>
              <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
                {(['all', 'active', 'completed'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-sm rounded-md font-medium capitalize transition ${
                      filter === f
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          <ul className="divide-y divide-slate-100">
            {visibleTodos.map((todo) => {
              const isEditing = editingId === todo.id;
              return (
                <li
                  key={todo.id}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      todo.done
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {todo.done && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        else if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded-md border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-slate-800"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEditing(todo)}
                      className={`flex-1 select-none cursor-pointer ${
                        todo.done ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                      title="Double-click to edit"
                    >
                      {todo.text}
                    </span>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => startEditing(todo)}
                        aria-label="Edit"
                        className="p-2 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L4 13.172V16h2.828l7.379-7.379-2.828-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        aria-label="Delete"
                        className="p-2 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path
                            fillRule="evenodd"
                            d="M8 3a1 1 0 011-1h2a1 1 0 011 1v1h4a1 1 0 110 2h-1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 010-2h4V3zm2 4a1 1 0 10-2 0v8a1 1 0 102 0V7zm3 0a1 1 0 10-2 0v8a1 1 0 102 0V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Empty state */}
          {todos.length === 0 && (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-indigo-500">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-slate-500">Nothing here yet. Add your first task above.</p>
            </div>
          )}

          {todos.length > 0 && visibleTodos.length === 0 && (
            <div className="px-4 py-10 text-center text-slate-400 text-sm">
              No {filter} tasks.
            </div>
          )}

          {/* Footer / clear completed */}
          {completedCount > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                onClick={clearCompleted}
                className="text-sm text-slate-500 hover:text-rose-600 font-medium transition"
              >
                Clear completed ({completedCount})
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Double-click a task to edit. Your list is saved on this device.
        </p>
      </div>
    </div>
  );
}
