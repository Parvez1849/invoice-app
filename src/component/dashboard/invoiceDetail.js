import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import './invoicedetail.css';

const InvoiceDetail = () => {
    const location = useLocation();
    const [data, setData] = useState(location.state);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // Function to generate PDF
    const printInvoice = () => {
        const input = document.getElementById("invoice");
        html2canvas(input, { useCORS: true })
            .then((canvas) => {
                const imageData = canvas.toDataURL("image/png", 1.0);
                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "pt",
                    format: [612, 792],
                });
                pdf.internal.scaleFactor = 1;
                const imageProps = pdf.getImageProperties(imageData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imageProps.height * pdfWidth) / imageProps.width;

                pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save("invoice_" + new Date());
            });
    };

    // Simulating loading completion
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false); // Stop loading after some time (simulated)
        }, 1000); // Adjust time as necessary
        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);

    return (
        <div>
            {isLoading ? ( // Conditional rendering for spinner
               <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
               <i style={{ fontSize: "24px" }} className="fa-solid fa-spinner fa-spin-pulse"></i> Loading...
             </div>
            ) : (
                <div>
                    <div className="invoice-top-header">
                        <h1>Invoice</h1>
                        <button onClick={printInvoice} className="print-btn">
                            Print Invoice
                        </button>
                    </div>
                    <div id="invoice" className="invoice-wrapper">
                        <div className="invoice-header">
                            <div className="company-detail">
                                <img
                                    className="company-logo"
                                    alt="logo"
                                    src={localStorage.getItem("photoURL")}
                                />
                                <p className="cName">{localStorage.getItem("cName")}</p>
                                <p>{localStorage.getItem("email")}</p>
                            </div>
                            <div className="customer-detail">
                                <h1>Invoice</h1>
                                <div className="customer">
                                    <p>To :- {data.to}</p>
                                    <p>Phone :- {data.phone}</p>
                                    <p>Address :- {data.address}</p>
                                </div>
                            </div>
                        </div>
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.product.map((product, index) => (
                                    <tr key={product.id}>
                                        <td>{index + 1}</td>
                                        <td>{product.name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.qty}</td>
                                        <td>{product.qty * product.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4}>Total</td>
                                    <td>{data.total}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetail;
