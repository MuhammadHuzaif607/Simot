import Layout from './Layout.jsx';
import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import AddStock from './components/AddStock.jsx';
import UserData from './components/UserData.jsx';
import AddUser from './components/AddUser.jsx';
import Login from './components/Login.jsx';
import CustomerData from './components/CustomerData.jsx';
import AddCustomer from './components/AddCustomer.jsx';
import SalesManagementPage from './components/SalesManagementPage.jsx';
import SalesStatusData from './components/SalesStatusData.jsx';
import SalesHistory from './components/SalesHistory.jsx';
import DevicesData from './components/DevicesData.jsx';
import AddDevices from './components/AddDevices.jsx';
import StockPage from './components/StockPage.jsx';
import Invoice from './components/Invoice.jsx';
import Return from './components/Return.jsx';
import Repair from './components/Repair.jsx';
import AddHighStock from './components/AddHighStock.jsx';
import TechnicalPage from './pages/TechnicalPage.jsx';
import TestDevicesPage from './pages/TestDevicesPage.jsx';
import TechnicalCostPage from './pages/TechnicalCost.jsx';
import MaterialCostPage from './pages/MaterialCostPage.jsx';
import TechnicianSalaryPage from './pages/TechnicianSalaryPage.jsx';
import DeleteDevicePage from './pages/deleteDevicePage.jsx';
import UpdateCommissionPage from './pages/updateCommissionPage.jsx';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/stockpage"
            element={
              <Layout>
                <StockPage />
              </Layout>
            }
          />
          <Route
            path="/addstock"
            element={
              <Layout>
                <AddStock />
              </Layout>
            }
          />
          <Route
            path="/add-high-stock"
            element={
              <Layout>
                <AddHighStock />
              </Layout>
            }
          />
          <Route
            path="/user"
            element={
              <Layout>
                <UserData />
              </Layout>
            }
          />
          <Route
            path="/add-user"
            element={
              <Layout>
                <AddUser />
              </Layout>
            }
          />
          <Route
            path="/technical"
            element={
              <Layout>
                <TechnicalPage />
              </Layout>
            }
          />
          <Route
            path="/technician-salary"
            element={
              <Layout>
                <TechnicianSalaryPage />
              </Layout>
            }
          />
          <Route
            path="/testdevices"
            element={
              <Layout>
                <TestDevicesPage />
              </Layout>
            }
          />
          <Route
            path="/customerdata"
            element={
              <Layout>
                <CustomerData />
              </Layout>
            }
          />
          <Route
            path="/addcustomer"
            element={
              <Layout>
                <AddCustomer />
              </Layout>
            }
          />
          <Route
            path="/salesdata"
            element={
              <Layout>
                <SalesManagementPage />
              </Layout>
            }
          />
          <Route
            path="/salesstatus"
            element={
              <Layout>
                <SalesStatusData />
              </Layout>
            }
          />
          <Route
            path="/saleshistory"
            element={
              <Layout>
                <SalesHistory />
              </Layout>
            }
          />
          <Route
            path="/adddevices"
            element={
              <Layout>
                <AddDevices />
              </Layout>
            }
          />
          <Route
            path="/devicesdata"
            element={
              <Layout>
                <DevicesData />
              </Layout>
            }
          />
          {/* <Route
            path="/stockpage"
            element={
              <Layout>
                <StockPage />
              </Layout>
            }
          /> */}
          <Route
            path="/return"
            element={
              <Layout>
                <Return />
              </Layout>
            }
          />
          <Route
            path="/invoice"
            element={
              <Layout>
                <Invoice />
              </Layout>
            }
          />
          <Route
            path="/technician-cost"
            element={
              <Layout>
                <TechnicalCostPage />
              </Layout>
            }
          />
          <Route
            path="/material-cost"
            element={
              <Layout>
                <MaterialCostPage />
              </Layout>
            }
          />
          <Route
            path="/repair"
            element={
              <Layout>
                <Repair />
              </Layout>
            }
          />
          <Route
            path="/deletedata"
            element={
              <Layout>
                <DeleteDevicePage />
              </Layout>
            }
          />
          <Route
            path="/update-commission"
            element={
              <Layout>
                <UpdateCommissionPage />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
