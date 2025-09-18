"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import axios from "axios";

interface Project {
  id: number;
  name: string;
  location: string;
  description: string;
  offer: number;
  total: number;
}

export default function ProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [isEdit, setIsEdit] = useState(false);
	const { user, loading } = useAuthGuard();


  const fetchProjects = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:4000/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.log("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProject) return;

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:4000/projects/${modalProject.id}`,
          modalProject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:4000/projects",
          modalProject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModalProject(null);
      fetchProjects();
      const modalEl = document.getElementById("projectModal");
      if (modalEl) (window as any).bootstrap.Modal.getInstance(modalEl)?.hide();
    } catch (err) {
      alert("Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:4000/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  	if (loading) return <p>Checking authentication...</p>;
	if (!user) return <p>Redirecting...</p>;
  return (
    <div className="container py-5">
      <h2>Projects</h2>
      <button
        className="btn btn-success mb-3"
        data-bs-toggle="modal"
        data-bs-target="#projectModal"
        onClick={() =>
          setModalProject({
            id: 0,
            name: "",
            location: "",
            description: "",
            offer: 0,
            total: 0,
          })
        }
      >
        Add Project
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Description</th>
            <th>Offer</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj.id}>
              <td>{proj.name}</td>
              <td>{proj.location}</td>
              <td>{proj.description}</td>
              <td>{proj.offer}</td>
              <td>{proj.total}</td>
              <td>
                <button
                  className="btn btn-primary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#projectModal"
                  onClick={() => {
                    setModalProject(proj);
                    setIsEdit(true);
                  }}
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(proj.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <div className="modal fade" id="projectModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? "Edit" : "Add"} Project</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Name"
                value={modalProject?.name || ""}
                onChange={(e) =>
                  setModalProject((prev) => ({ ...prev!, name: e.target.value }))
                }
                required
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Location"
                value={modalProject?.location || ""}
                onChange={(e) =>
                  setModalProject((prev) => ({ ...prev!, location: e.target.value }))
                }
                required
              />
              <textarea
                className="form-control mb-2"
                placeholder="Description"
                value={modalProject?.description || ""}
                onChange={(e) =>
                  setModalProject((prev) => ({ ...prev!, description: e.target.value }))
                }
              />
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Offer"
                value={modalProject?.offer || 0}
                onChange={(e) =>
                  setModalProject((prev) => ({ ...prev!, offer: Number(e.target.value) }))
                }
              />
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Total"
                value={modalProject?.total || 0}
                onChange={(e) =>
                  setModalProject((prev) => ({ ...prev!, total: Number(e.target.value) }))
                }
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? "Save Changes" : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
