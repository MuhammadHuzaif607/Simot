import  { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { formatMoney } from "../helper/FormMoney";

// Register components for charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // States for total stock, sold items, and inventories
  const [totalSmartphones, setTotalSmartphones] = useState(0);
  const [totalTablets, setTotalTablets] = useState(0);
  const [totalLaptops, setTotalLaptops] = useState(0);
  const [smartphonesSold, setSmartphonesSold] = useState(0);
  const [tabletsSold, setTabletsSold] = useState(0);
  const [laptopsSold, setLaptopsSold] = useState(0);
  const [totalInventoriesPrice, setTotalInventoriesPrice] = useState(0);
  const [salesThisMonth, setSalesThisMonth] = useState(0);
  const [smartQuantity, setSmartQuantity] = useState(0);
  const [tabletQuantity, setTabletQuantity] = useState(0);
  const [laptopQuantity, setLaptopQuantity] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Add new states for costs and yearly totals
  const [yearlyNetTotal, setYearlyNetTotal] = useState(0);
  const [monthlyNetTotal, setMonthlyNetTotal] = useState(0);
  const [technicianYearlyCost, setTechnicianYearlyCost] = useState(0); // Fixed yearly cost per technician
  const [technicianMonthlyCost, setTechnicianMonthlyCost] = useState(0); // Fixed monthly cost per technician

  useEffect(() => {

    
    const fetchDashboardData = async () => {
      try {
        // Fetch products data
        const stockResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/getallproducts`
        );
        const allProducts = stockResponse.data;
        // Filter products by deviceType
        const smartphones = allProducts.filter(
          (product) => product.deviceType === "Mobile"
        );
        const tablets = allProducts.filter(
          (product) => product.deviceType === "Tablet"
        );
        const laptops = allProducts.filter(
          (product) => product.deviceType === "Laptop"
        );

        // Set total counts
        setTotalSmartphones(smartphones.length);
        setTotalTablets(tablets.length);
        setTotalLaptops(laptops.length);

        // Calculate total inventories price
        const totalInventoriesPrice = allProducts.reduce(
          (total, product) => total + product.price,
          0
        );
        setTotalInventoriesPrice(totalInventoriesPrice);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    const fetchSalesHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sales`
        );

        const allSales = response.data;

        // Filter sales by delivered status
        const deliveredSales = allSales.filter(
          (sale) => sale.status !== "returned"
        );

        // Initialize counters
        let smartphonesSold = 0;
        let tabletsSold = 0;
        let laptopsSold = 0;
        let smartQuantity = 0;
        let tabletQuantity = 0;
        let laptopQuantity = 0;

        // Iterate over each delivered sale
        deliveredSales.forEach((sale) => {
          // Iterate over each product in the sale
          sale.products.forEach((product) => {
            if (product.deviceType === "Mobile") {
              smartphonesSold += 1;
              smartQuantity += product.productPrice;
            } else if (product.deviceType === "Tablet") {
              tabletsSold += 1;
              tabletQuantity += product.productPrice;
            } else if (product.deviceType === "Laptop") {
              laptopsSold += 1;
              laptopQuantity += product.productPrice;
            }
          });
        });

        // Update state
        setSmartphonesSold(smartphonesSold);
        setTabletsSold(tabletsSold);
        setLaptopsSold(laptopsSold);
        setTotalQuantity(smartphonesSold + tabletsSold + laptopsSold);

        // Update quantities in the state
        setSmartQuantity(smartQuantity);
        setTabletQuantity(tabletQuantity);
        setLaptopQuantity(laptopQuantity);

        // Calculate yearly and monthly totals
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const currentDay = currentDate.getDate();

        // Calculate yearly sales
        const yearSales = deliveredSales.filter((sale) => {
          const saleDate = new Date(sale.time);
          return saleDate.getFullYear() === currentYear;
        });

        const totalYearlySales = yearSales.reduce(
          (total, sale) => total + sale.totalPrice,
          0
        );

        // Calculate monthly sales (existing logic)
        const monthSales = deliveredSales.filter((sale) => {
          const saleDate = new Date(sale.time);
          return (
            saleDate.getMonth() === currentMonth &&
            saleDate.getFullYear() === currentYear
          );
        });

        const totalMonthlySales = monthSales.reduce(
          (total, sale) => total + sale.totalPrice,
          0
        );

        // Calculate net totals (sales minus technician costs)
        setYearlyNetTotal(totalYearlySales - technicianYearlyCost);
        setMonthlyNetTotal(totalMonthlySales - technicianMonthlyCost);
        setSalesThisMonth(smartQuantity + tabletQuantity + laptopQuantity);
      } catch (error) {
        console.error("Failed to fetch sales history", error);
      }
    };

    const fetchTechnicianCost = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/technical/technician-sales`
        );
        const technicianCost = response.data;
        setTechnicianYearlyCost(technicianCost.yearly?.totalTechnicianCosts);
        setTechnicianMonthlyCost(technicianCost.monthly?.totalTechnicianCosts);
        setYearlyNetTotal(technicianCost.yearly?.netProfit);
        setMonthlyNetTotal(technicianCost.monthly?.netProfit);
      } catch (error) {
        console.error("Failed to fetch technician cost", error);
      }
    };

    fetchTechnicianCost();
    fetchDashboardData();
    fetchSalesHistory();
  }, [technicianYearlyCost, technicianMonthlyCost]);

  // Data for Income Comparison (Bar Chart)
  const incomeComparisonData = {
    labels: ["Smartphones", "Tablets", "Laptops"],
    datasets: [
      {
        label: "Items Sold",
        data: [smartphonesSold, tabletsSold, laptopsSold],
        backgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0"],
        borderWidth: 1,
      },
    ],
  };

  // Data for Sales Percentage (Pie Chart)
  const salesPercentageData = {
    labels: ["Smartphones", "Tablets", "Laptops"],
    datasets: [
      {
        data: [smartphonesSold, tabletsSold, laptopsSold],
        backgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div className="flex-col text-white text-center">
      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Total Inventories</p>
            <h3 className="text-2xl font-bold">
              {formatMoney(totalInventoriesPrice)}
            </h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Total Smartphones</p>
            <h3 className="text-2xl font-bold">{totalSmartphones}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Total Tablets</p>
            <h3 className="text-2xl font-bold">{totalTablets}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Total Laptops</p>
            <h3 className="text-2xl font-bold">{totalLaptops}</h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Cost of the technician of the year</p>
            <h3 className="text-2xl font-bold">
              {formatMoney(technicianYearlyCost)}
            </h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>technician cost of the month</p>
            <h3 className="text-2xl font-bold">
              {formatMoney(technicianMonthlyCost)}
            </h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>net total for the year</p>
            <h3 className="text-2xl font-bold">
              {formatMoney(yearlyNetTotal) ? formatMoney(yearlyNetTotal) : '' }
            </h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>net total for the month</p>
            <h3 className="text-2xl font-bold">
              {formatMoney(monthlyNetTotal)}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Smartphones Sold</p>
            <h3 className="text-2xl font-bold">{smartphonesSold}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Tablets Sold</p>
            <h3 className="text-2xl font-bold">{tabletsSold}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Laptops Sold</p>
            <h3 className="text-2xl font-bold">{laptopsSold}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Quantity of Sales this year</p>
            <h3 className="text-2xl font-bold">{totalQuantity}</h3>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Smartphones Sold in price</p>
            <h3 className="text-2xl font-bold">€ {smartQuantity}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Tablets Sold in price</p>
            <h3 className="text-2xl font-bold">€ {tabletQuantity}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Laptops Sold in price</p>
            <h3 className="text-2xl font-bold">€ {laptopQuantity}</h3>
          </div>
        </div>
        <div className="dashboard-box p-4 flex items-center justify-center">
          <div>
            <p>Quantity of Sales this year</p>
            <h3 className="text-2xl font-bold">
              {formatMoney(salesThisMonth)}
            </h3>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {/* Income Comparison Bar Chart */}
        <div className="flex flex-col items-center justify-center dashboard-box p-6 col-span-2 h-80">
          <h2 className="text-lg font-bold mb-4">Income Comparison</h2>
          <div className="w-full h-full flex flex-col justify-between">
            <Bar data={incomeComparisonData} />
          </div>
        </div>

        {/* Sales Percentage Pie Chart */}
        <div className="flex items-center justify-center dashboard-box p-6 h-80">
          <Doughnut data={salesPercentageData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
