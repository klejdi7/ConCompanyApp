"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import axios from "axios";

interface Invoice {
  id: number;
  projectId: number;
  amount: number;
  date: string;
}

export default function InvoicesPage() {
  const { token,  } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [modalInvoice, setModalInvoice] = useState<Invoice | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuthGuard();

  if (!user) {
    return <p>Redirecting...</p>;
  }

  const fetchInvoices = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:4000/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data);
    } catch (err) {
      alert("Failed to fetch invoices");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInvoice) return;

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:4000/invoices/${modalInvoice.id}`,
          modalInvoice,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:4000/invoices",
          modalInvoice,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModalInvoice(null);
      fetchInvoices();
      const modalEl = document.getElementById("invoiceModal");
      if (modalEl) (window as any).bootstrap.Modal.getInstance(modalEl)?.hide();
    } catch (err) {
      alert("Failed to save invoice");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:4000/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInvoices();
    } catch (err) {
      alert("Failed to delete invoice");
    }
  };

  return (
    <div className="container py-5">
      <h2>Invoices {user && `- Welcome, ${user.name}`}</h2>
      <button
        className="btn btn-success mb-3"
        data-bs-toggle="modal"
        data-bs-target="#invoiceModal"
        onClick={() =>
          setModalInvoice({ id: 0, projectId: 0, amount: 0, date: "" })
        }
      >
        Add Invoice
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.projectId}</td>
              <td>{inv.amount}</td>
              <td>{inv.date}</td>
              <td>
                <button
                  className="btn btn-primary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#invoiceModal"
                  onClick={() => {
                    setModalInvoice(inv);
                    setIsEdit(true);
                  }}
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(inv.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <div className="modal fade" id="invoiceModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? "Edit" : "Add"} Invoice</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Project ID"
                value={modalInvoice?.projectId || 0}
                onChange={(e) =>
                  setModalInvoice((prev) => ({ ...prev!, projectId: Number(e.target.value) }))
                }
                required
              />
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Amount"
                value={modalInvoice?.amount || 0}
                onChange={(e) =>
                  setModalInvoice((prev) => ({ ...prev!, amount: Number(e.target.value) }))
                }
                required
              />
              <input
                type="date"
                className="form-control mb-2"
                value={modalInvoice?.date || ""}
                onChange={(e) =>
                  setModalInvoice((prev) => ({ ...prev!, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? "Save Changes" : "Add Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
