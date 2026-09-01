import { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api.js";
import AdminGate from "../components/AdminGate.jsx";
import AdminShell from "../components/AdminShell.jsx";

export default function AdminProjects() {
  return (
    <AdminGate>
      <AdminShell title="Featured builds">
        <ProjectsPanel />
      </AdminShell>
    </AdminGate>
  );
}

function ProjectsPanel() {
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
    setNewProject(emptyProject());
    loadProjects();
  }

  async function updateProject(id, field, value) {
    await axios.put(
      `${API}/projects/${id}`,
      { [field]: value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async function deleteProject(id) {
    if (!window.confirm("Delete this project?")) return;
    await axios.delete(`${API}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProjects();
  }

  return (
    <>
      <div className="admin-panel">
        <strong>Add new project</strong>
        <div className="admin-form-grid" style={{ marginTop: "12px" }}>
          <input placeholder="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
          <input placeholder="Slug" value={newProject.slug} onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })} />
        </div>
        <textarea
          placeholder="Overview"
          className="field-input"
          style={{ marginTop: "10px", minHeight: "70px" }}
          value={newProject.overview}
          onChange={(e) => setNewProject({ ...newProject, overview: e.target.value })}
        />
        <button className="btn btn-primary" onClick={saveProject}>Save project</button>
      </div>

      <div className="admin-panel">
        <strong>Existing projects</strong>
        {projects.map((p) => (
          <div key={p._id} style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div className="admin-form-grid">
              <input defaultValue={p.title} onBlur={(e) => updateProject(p._id, "title", e.target.value)} />
              <input defaultValue={p.slug} onBlur={(e) => updateProject(p._id, "slug", e.target.value)} />
            </div>
            <textarea
              className="field-input"
              style={{ marginTop: "10px", minHeight: "60px" }}
              defaultValue={p.overview}
              onBlur={(e) => updateProject(p._id, "overview", e.target.value)}
            />
            <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p._id)}>Delete</button>
          </div>
        ))}
      </div>
    </>
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
