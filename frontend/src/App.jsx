import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.8:8080';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch(`${API_URL}/api/todos`);
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    await fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo })
    });

    setNewTodo('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  };

  const updateTodo = async (id) => {
    await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editText })
    });

    setEditingId(null);
    fetchTodos();
  };

  const toggleTodo = async (todo) => {
    await fetch(`${API_URL}/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: todo.title,
        completed: !todo.completed
      })
    });
    fetchTodos();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      padding: '40px',
      fontFamily: 'Segoe UI'
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: '#fff',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
          🚀 DevOps Todo App
        </h1>

        {/* ADD */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter a new task..."
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              marginRight: '10px'
            }}
          />
          <button
            onClick={addTodo}
            style={{
              padding: '12px 20px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>

        {/* LIST */}
        <div>
          {todos.map(todo => (
            <div key={todo.id} style={{
              padding: '15px',
              marginBottom: '12px',
              borderRadius: '10px',
              background: '#f7f7f7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}>

              {/* LEFT */}
              <div style={{ flex: 1 }}>
                {editingId === todo.id ? (
                  <div style={{ display: 'flex' }}>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc'
                      }}
                    />
                    <button
                      onClick={() => updateTodo(todo.id)}
                      style={{ marginLeft: '8px' }}
                    >
                      💾
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => toggleTodo(todo)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '16px',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#999' : '#333'
                    }}
                  >
                    {todo.title}
                  </span>
                )}
              </div>

              {/* RIGHT */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  marginRight: '10px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: todo.completed ? '#d4edda' : '#fff3cd',
                  color: todo.completed ? '#155724' : '#856404'
                }}>
                  {todo.completed ? 'Done' : 'Pending'}
                </span>

                <button
                  onClick={() => {
                    setEditingId(todo.id);
                    setEditText(todo.title);
                  }}
                  style={{ marginRight: '5px' }}
                >
                  ✏️
                </button>

                <button onClick={() => deleteTodo(todo.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '12px',
          color: '#777'
        }}>
          Click task to toggle ✔ / ✖
        </p>
      </div>
    </div>
  );
}

export default App;