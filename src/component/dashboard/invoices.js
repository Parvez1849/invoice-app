import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./invoices.css";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const q = query(collection(db, "invoices"), where("uid", "==", localStorage.getItem("uid")));
    const querySnapshot = await getDocs(q);
    let data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort the data by date, with most recent first
    data = data.sort((a, b) => b.date.seconds - a.date.seconds);
    
    setInvoices(data);
    setLoading(false);
  };

  const deleteInvoices = async (id) => {
    const isSure = window.confirm("Are you sure you want to delete?");
    if (isSure) {
      try {
        await deleteDoc(doc(db, "invoices", id));
        getData(); // Refresh the list after deleting
      } catch {
        window.alert("Something went wrong");
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
          <i style={{ fontSize: "24px" }} className="fa-solid fa-spinner fa-spin-pulse"></i> Loading...
        </div>
      ) : (
        <div>
          {invoices.map((data) => (
            <div className="box" key={data.id}>
              <p>{data.to}</p>
              <p>{new Date(data.date.seconds * 1000).toLocaleDateString()}</p>
              <p>Rs {data.total}</p>
              <button onClick={() => deleteInvoices(data.id)} className="delete-btn">
                <i className="fa-solid fa-trash"></i> Delete
              </button>
              <button
                onClick={() => {
                  navigate("/dashboard/invoiceDetail", { state: data });
                }}
                className="delete-btn view-btn"
              >
                <i className="fa-solid fa-eye"></i> View
              </button>
            </div>
          ))}
          {invoices.length < 1 && (
            <div className="no-invoice-wrapper">
              <p>You have no invoices yet</p>
              <button onClick={() => navigate("/dashboard/newinvoice")}>Create New Invoice</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoices;
