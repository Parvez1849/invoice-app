import { Chart } from "chart.js/auto"; 
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
    const [total, setTotal] = useState(0);
    const [totalMonthCollection, setTotalMonthCollection] = useState(0);
    const [invoices, setInvoices] = useState([]);
    const chartRef = useRef(null);
    const navigate = useNavigate();

    const createChart = useCallback((chartData) => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }
        const ctx = document.getElementById('myChart');
        if (ctx) {
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(chartData),
                    datasets: [{
                        label: 'Month Wise Collection',
                        data: Object.values(chartData),
                        borderWidth: 1,
                        backgroundColor: "rgba(33, 33, 33, 0.5)",
                        borderColor: 'rgba(55, 55, 55, 0.5)',
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true } },
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        }
    }, []);

    const getData = useCallback(async () => {
        try {
            const uid = localStorage.getItem("uid");
            if (!uid) return;

            const q = query(collection(db, "invoices"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sortedData = data.sort((a, b) => b.date.seconds - a.date.seconds);
            
            setInvoices(sortedData);

            // Calculate Totals
            const totalAmount = sortedData.reduce((acc, d) => acc + (d.total || 0), 0);
            setTotal(totalAmount);

            const currentMonth = new Date().getMonth();
            const monthlyTotal = sortedData.reduce((acc, d) => {
                const invoiceDate = new Date(d.date.seconds * 1000);
                if (invoiceDate.getMonth() === currentMonth) {
                    return acc + (d.total || 0);
                }
                return acc;
            }, 0);
            setTotalMonthCollection(monthlyTotal);

            // Prepare Chart Data
            const chartData = {
                "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0,
                "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0
            };
            
            sortedData.forEach(d => {
                const date = new Date(d.date.seconds * 1000);
                if (date.getFullYear() === new Date().getFullYear()) {
                    const month = date.toLocaleDateString("default", { month: "short" });
                    chartData[month] += (d.total || 0);
                }
            });

            createChart(chartData);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    }, [createChart]);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div>
            <div className="home-first-row">
                <div className="home-box box-1" onClick={() => navigate("/dashboard/invoices")}>
                    <h1 className="box-header">Rs {total}</h1>
                    <p className="box-title">Overall</p>
                </div>
                <div className="home-box box-2" onClick={() => navigate("/dashboard/invoices")}>
                    <h1 className="box-header">{invoices.length}</h1>
                    <p className="box-title">Invoices</p>
                </div>
                <div className="home-box box-3" onClick={() => navigate("/dashboard/monthlyinvoice")}>
                    <h1 className="box-header">Rs {totalMonthCollection}</h1>
                    <p className="box-title">This Month</p>
                </div>
            </div>
            
            <div className="home-second-row">
                <div className="chart-box">
                    <canvas id="myChart"></canvas>
                </div>
                <div className="recent-invoice-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <h1>Recent Invoice List</h1>
                    <div className="invoice-list-header">
                        <p><b>Customer Name</b></p>
                        <p><b>Date</b></p>
                        <p><b>Total</b></p>
                    </div>
                    {invoices.slice(0, 6).map(data => (
                        <div 
                            onClick={() => navigate("/dashboard/invoiceDetail", { state: data })} 
                            key={data.id} 
                            className="invoice-item"
                        >
                            <p>{data.to}</p>
                            <p>{new Date(data.date.seconds * 1000).toLocaleDateString()}</p>
                            <p><b>Rs</b> {data.total}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;





