import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Login from './component/login/login';
import Register from './component/register/register';
import Dashboard from './component/dashboard/dashboard';
import Invoices from './component/dashboard/invoices';
import Home from './component/dashboard/home';
import NewInvoice from './component/dashboard/newinvoice';
import Setting from './component/dashboard/setting';
import InvoiceDetail from './component/dashboard/invoiceDetail';
import ForgotPassword from './component/forgetpass/forgetpass';
import MonthlyInvoices from './component/dashboard/monthlyinvoice';

function App() {
  const Myrouter = createBrowserRouter([
    { path: "", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/forgetpass", element: <ForgotPassword /> },
    { path: "/dashboard", element: <Dashboard />, children: [
        { path: "", element: <Home /> },
        { path: "home", element: <Home /> },
        { path: "invoices", element: <Invoices /> },
        { path: "newinvoice", element: <NewInvoice /> },
        { path: "setting", element: <Setting /> },
        { path: "invoiceDetail", element: <InvoiceDetail /> },
        { path: "monthlyinvoice", element: <MonthlyInvoices /> }
      ]
    }
  ]);

  return (
    <div>
      <RouterProvider router={Myrouter}></RouterProvider>
    </div>
  );
}

export default App;
