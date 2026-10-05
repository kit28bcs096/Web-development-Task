import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchTasks() {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const taskData = { title, description };

    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }
      }

      setTitle("");
      setDescription("");
      setEditingId(null);
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  function editTask(task) {
    setTitle(task.title);
    setDescription(task.description);
    setEditingId(task._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTask(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      fetchTasks();
    } catch (error) {
      console.error(error);
      alert("Could not delete task.");
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  }

  function cancelEdit() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  return (
    <div className="app">
      <header>
        <h1>Task Manager</h1>
        <p>Full-Stack CRUD Application</p>
      </header>

      <main>
        <section className="form-card">
          <h2>{editingId ? "Update Task" : "Add New Task"}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              placeholder="Task description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="form-buttons">
              <button type="submit" className="primary">
                {editingId ? "Update Task" : "Add Task"}
              </button>
              {editingId && (
                <button type="button" className="cancel" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="task-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <span>{tasks.length} tasks</span>
          </div>

          {loading ? (
            <p className="message">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="message">No tasks found. Add your first task!</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div
                  className={`task-card ${task.completed ? "completed" : ""}`}
                  key={task._id}
                >
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <small>
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="task-actions">
                    <button
                      className="complete"
                      onClick={() => toggleTask(task)}
                    >
                      {task.completed ? "Undo" : "Complete"}
                    </button>
                    <button className="edit" onClick={() => editTask(task)}>
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>&copy; 2026 To-Do Web application</p>
      </footer>
    </div>
  );
}

export default App;