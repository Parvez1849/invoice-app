import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import './invoicedetail.css';

const InvoiceDetail = () => {
    const location = useLocation();
    // Destructuring state directly to avoid 'data' being re-assigned
    const [data] = useState(location.state);
    const [isLoading, setIsLoading] = useState(true);

    const printInvoice = () => {
        const input = document.getElementById("invoice");
        
        // Quality improve karne ke liye scale use kiya hai
        html2canvas(input, { 
            useCORS: true, 
            scale: 2, 
            logging: false 
        }).then((canvas) => {
            const imageData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: [612, 792],
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice_${data?.to || 'download'}_${new Date().getTime()}.pdf`);
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Check if data exists to prevent crashes
    if (!data) {
        return <div className="error-container">No Invoice Data Found</div>;
    }

    return (
        <div>
            {isLoading ? (
                <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
                    <i style={{ fontSize: "24px", marginRight: "10px" }} className="fa-solid fa-spinner fa-spin-pulse"></i> 
                    Loading...
                </div>
            ) : (
                <div>
                    <div className="invoice-top-header">
                        <h1>Invoice Detail</h1>
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
                                <h1>INVOICE</h1>
                                <div className="customer">
                                    <p><strong>To:</strong> {data.to}</p>
                                    <p><strong>Phone:</strong> {data.phone}</p>
                                    <p><strong>Address:</strong> {data.address}</p>
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
                                {data.product && data.product.map((product, index) => (
                                    <tr key={product.id || index}>
                                        <td>{index + 1}</td>
                                        <td>{product.name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.qty}</td>
                                        <td>{Number(product.qty) * Number(product.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>Grand Total</td>
                                    <td style={{ fontWeight: "bold" }}>{data.total}</td>
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
