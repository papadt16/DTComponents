import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function AdminProjects() {
  const token = localStorage.getItem("dt_token");
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState(emptyProject());

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const res = await axios.get(`${API}/projects`);
    setProjects(res.data);
  }

  async function saveProject() {
    await axios.post(`${API}/projects`, newProject, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Project added");
    setNewProject(emptyProject());
    loadProjects();
  }

  async function updateProject(id, field, value) {
    await axios.put(
      `${API}/projects/${id}`,
      { [field]: value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadProjects();
  }

  async function deleteProject(id) {
    if (!confirm("Delete project?")) return;
    await axios.delete(`${API}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProjects();
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Project Manager</h2>

      {/* NEW PROJECT */}
      <h3>Add New Project</h3>
      {renderInputs(newProject, setNewProject)}
      <button onClick={saveProject}>Save Project</button>

      <hr />

      {/* EXISTING PROJECTS */}
      {projects.map((p) => (
        <div key={p._id} style={box}>
          <input
            value={p.title}
            onChange={(e) => updateProject(p._id, "title", e.target.value)}
          />
          <input
            value={p.slug}
            onChange={(e) => updateProject(p._id, "slug", e.target.value)}
          />
          <textarea
            value={p.overview}
            onChange={(e) => updateProject(p._id, "overview", e.target.value)}
          />
          <button onClick={() => deleteProject(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

function emptyProject() {
  return {
    title: "",
    slug: "",
    overview: "",
    features: [],
    components: [],
    schematic: "",
    code: "",
    explanation: [],
    difficulty: "Beginner",
  };
}

const box = {
  padding: 20,
  border: "1px solid #334155",
  marginBottom: 20,
};
