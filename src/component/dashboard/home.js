
import { Chart, registerables } from "chart.js/auto";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
    const [total, setTotal] = useState(0);
    const [totalMonthCollection, setTotalMonthCollection] = useState(0);
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const chartRef = useRef(null); // Reference to the chart
    const navigate = useNavigate();

    // Function to fetch data from Firestore
    const getData = async () => {
        try {
            const q = query(collection(db, "invoices"), where("uid", "==", localStorage.getItem("uid")));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort the invoices by date (from most recent to oldest)
            const sortedData = data.sort((a, b) => b.date.seconds - a.date.seconds);

            setInvoices(sortedData);
            calculateTotals(sortedData);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        finally {
            setIsLoading(false); // Stop showing the spinner once data is fetched
        }
    };

    // Calculate overall total and monthly total
    const calculateTotals = (invoiceList) => {
        getOverAllTotal(invoiceList);
        getOverMonthsTotal(invoiceList);
        generateMonthWiseCollectionData(invoiceList);
    };

    // Calculate overall total
    const getOverAllTotal = (invoiceList) => {
        const totalAmount = invoiceList.reduce((acc, data) => acc + data.total, 0);
        setTotal(totalAmount);
    };

    // Calculate total collection for the current month
    const getOverMonthsTotal = (invoiceList) => {
        const currentMonth = new Date().getMonth();
        const monthlyTotal = invoiceList.reduce((acc, data) => {
            if (new Date(data.date.seconds * 1000).getMonth() === currentMonth) {
                return acc + data.total;
            }
            return acc;
        }, 0);
        setTotalMonthCollection(monthlyTotal);
    };

    // Generate month-wise data for chart
    const generateMonthWiseCollectionData = (data) => {
        const chartData = {
            "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0,
            "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0
        };

        data.forEach(d => {
            const date = new Date(d.date.seconds * 1000);
            if (date.getFullYear() === new Date().getFullYear()) {
                const month = date.toLocaleDateString("default", { month: "short" });
                chartData[month] += d.total;
            }
        });

        createChart(chartData);
    };

    // Create or update chart with new data
    const createChart = (chartData) => {
        // Destroy the existing chart if it exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = document.getElementById('myChart');
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
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    };

    useEffect(() => {
        getData();
    }, []);

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
                <div className="recent-invoice-list" style={{ maxHeight: "400px", overflowY: "scroll" }}>
                    <h1>Recent Invoice List</h1>
                    <div className="invoice-list-header">
                        <p><b>Customer Name</b></p>
                        <p><b>Date</b></p>
                        <p><b>Total</b></p>
                    </div>
                    {invoices.slice(0, 6).map(data => (
                        <div onClick={() => navigate("/dashboard/invoiceDetail", { state: data })} key={data.id} className="invoice-item">
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





