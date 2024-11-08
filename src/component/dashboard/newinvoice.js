import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, Timestamp, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./newinvoice.css";

const NewInvoice = () => {
  const [to, setTo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);  // Spinner state for page load

  const [product, setProduct] = useState([]);
  const navigate = useNavigate();

  // Simulate data fetching/loading for demonstration
  useEffect(() => {
    // Simulate loading for 2 seconds (replace this with actual data fetching if needed)
    setTimeout(() => {
      setLoading(false); // Stop showing spinner after data loads
    }, 2000);
  }, []);

  const addProduct = () => {
    if (product.length < 12) {
      setProduct([...product, { id: product.length, name, price, qty }]);
      const t = qty * price;
      setTotal(total + t);
      setName("");
      setPrice("");
      setQty(1);
    }

    if (product.length + 1 === 12) {
      saveData();
    }
  };

  const saveData = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "invoices"), {
        to: to,
        phone: phone,
        address: address,
        product: product,
        total: total,
        uid: localStorage.getItem("uid"),
        date: Timestamp.fromDate(new Date()),
      });
      navigate("/dashboard/invoices");
    } catch (error) {
      console.error("Error saving invoice: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="spinner-container"  style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", }}>
        <i style={{ fontSize: "24px" }} className="fa-solid fa-spinner fa-spin-pulse"></i>  Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="header-row">
        <p className="new-invoice-heading">New Invoice</p>
        <button
          onClick={saveData}
          className="add-btn"
          type="button"
          disabled={isLoading} // Disable button when loading
        >
          {isLoading && <i className="fa-solid fa-spinner fa-spin-pulse"></i>}{" "}
          {isLoading ? "Saving..." : "Save Data"}
        </button>
      </div>
      <form className="new-invoice-form">
        <div className="first-row">
          <input
            onChange={(e) => setTo(e.target.value)}
            placeholder="To"
            value={to}
          />
          <input
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            value={phone}
          />
          <input
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            value={address}
          />
        </div>
        <div className="first-row">
          <input
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
            value={name}
          />
          <input
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            value={price}
          />
          <input
            onChange={(e) => setQty(e.target.value)}
            type="number"
            placeholder="Quantity"
            value={qty}
          />
        </div>
        <button
          onClick={addProduct}
          className="add-btn"
          type="button"
          disabled={isLoading} // Disable the button when loading
        >
          Add Product
        </button>
      </form>
      {product.length > 0 && (
        <div className="product-wrapper">
          <div className="product-list">
            <p>S.no</p>
            <p>Product Name</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total Price</p>
          </div>
          {product.map((data, index) => (
            <div className="product-list" key={index}>
              <p>{index + 1}</p>
              <p>{data.name}</p>
              <p>{data.price}</p>
              <p>{data.qty}</p>
              <p>{data.qty * data.price}</p>
            </div>
          ))}
          <div className="total-wrapper">
            <p>Total: {total}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewInvoice;
