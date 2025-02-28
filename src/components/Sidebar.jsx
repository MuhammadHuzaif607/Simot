import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import img from "../assets/unnamed-removebg-preview.png";
import { IoClose } from "react-icons/io5";

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.user.role);
    }
  }, [navigate]);

  return (
    <div
      className={`min-h-screen w-full 2xl:w-[400px] xl:w-[300px] lg:w-[250px] md:w-[200px] flex flex-col justify-between px-4 dark-gray text-white ${
        isSidebarOpen ? "block" : "hidden"
      } md:block`}
    >
      <div>
        <div className="flex">
          <button onClick={toggleSidebar} className="md:hidden p-4 text-white">
            <IoClose />
          </button>
          <img
            className="my-4 mx-auto max-w-[200px] w-full h-auto sm:my-2"
            src={img}
            alt="Logo"
          />
        </div>

        <ul className="flex flex-col">
          {userRole === "technical" ? (
            // If user is "technical", show ONLY the "Technical" menu item
            <li>
              <Link
                to="/technical"
                onClick={() => handleLinkClick("technical")}
                className={`sidebar-link ${
                  activeLink === "technical" ? "button-color" : ""
                }`}
              >
                Technical
              </Link>
            </li>
          ) : (
            // Show other menu items for other roles
            <>
              {userRole === "superadmin" && (
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => handleLinkClick("dashboard")}
                    className={`sidebar-link ${
                      activeLink === "dashboard" ? "button-color" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => handleLinkClick("system-management")}
                  className={`sidebar-link w-full text-left ${
                    activeLink === "system-management" ? "button-color" : ""
                  }`}
                >
                  System Management
                </button>
                {activeLink === "system-management" && (
                  <ul className="pl-4 ml-2 border-l-2">
                    <li>
                      <Link
                        to="/addstock"
                        onClick={() => handleLinkClick("addstock")}
                        className={`sidebar-link ${
                          activeLink === "addstock" ? "button-color" : ""
                        }`}
                      >
                        Add Stock
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/add-high-stock"
                        onClick={() => handleLinkClick("add-high-stock")}
                        className={`sidebar-link ${
                          activeLink === "add-high-stock"
                            ? "button-color"
                            : ""
                        }`}
                      >
                        Add High Stock
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/adddevices"
                        onClick={() => handleLinkClick("adddevices")}
                        className={`sidebar-link ${
                          activeLink === "adddevices" ? "button-color" : ""
                        }`}
                      >
                        Add Devices
                      </Link>
                    </li>
                    {userRole === "superadmin" && (
                      <li>
                        <Link
                          to="/add-user"
                          onClick={() => handleLinkClick("add-employee")}
                          className={`sidebar-link ${
                            activeLink === "add-employee" ? "button-color" : ""
                          }`}
                        >
                          Add Employee
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/addcustomer"
                        onClick={() => handleLinkClick("addcustomer")}
                        className={`sidebar-link ${
                          activeLink === "addcustomer" ? "button-color" : ""
                        }`}
                      >
                        Add Customers
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              {userRole === "superadmin" && (
                <li>
                  <Link
                    to="/user"
                    onClick={() => handleLinkClick("user")}
                    className={`sidebar-link ${
                      activeLink === "user" ? "button-color" : ""
                    }`}
                  >
                    Employees
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/stockpage"
                  onClick={() => handleLinkClick("Stocks")}
                  className={`sidebar-link ${
                    activeLink === "Stocks" ? "button-color" : ""
                  }`}
                >
                  Stocks
                </Link>
              </li>
              {userRole === "superadmin" && (
                <li>
                  <Link
                    to="/customerdata"
                    onClick={() => handleLinkClick("customerdata")}
                    className={`sidebar-link ${
                      activeLink === "customerdata" ? "button-color" : ""
                    }`}
                  >
                    Customers
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/salesdata"
                  onClick={() => handleLinkClick("salesdata")}
                  className={`sidebar-link ${
                    activeLink === "salesdata" ? "button-color" : ""
                  }`}
                >
                  Sales Management
                </Link>
              </li>
              <li>
                <Link
                  to="/devicesdata"
                  onClick={() => handleLinkClick("devicesdata")}
                  className={`sidebar-link ${
                    activeLink === "devicesdata" ? "button-color" : ""
                  }`}
                >
                  Devices
                </Link>
              </li>
              <li>
                <Link
                  to="/salesstatus"
                  onClick={() => handleLinkClick("salesstatus")}
                  className={`sidebar-link ${
                    activeLink === "salesstatus" ? "button-color" : ""
                  }`}
                >
                  Sales Status
                </Link>
              </li>
              <li>
                <Link
                  to="/testdevices"
                  onClick={() => handleLinkClick("testdevices")}
                  className={`sidebar-link ${
                    activeLink === "testdevices" ? "button-color" : ""
                  }`}
                >
                  Devices to Test
                </Link>
              </li>
              <li>
                <Link
                  to="/saleshistory"
                  onClick={() => handleLinkClick("saleshistory")}
                  className={`sidebar-link ${
                    activeLink === "saleshistory" ? "button-color" : ""
                  }`}
                >
                  Sales History
                </Link>
              </li>
              <li>
                <Link
                  to="/return"
                  onClick={() => handleLinkClick("return")}
                  className={`sidebar-link ${
                    activeLink === "return" ? "button-color" : ""
                  }`}
                >
                  Return
                </Link>
              </li>
              <li>
                <Link
                  to="/repair"
                  onClick={() => handleLinkClick("repair")}
                  className={`sidebar-link ${
                    activeLink === "repair" ? "button-color" : ""
                  }`}
                >
                  Repair
                </Link>
              </li>
              <li>
                <Link
                  to="/invoice"
                  onClick={() => handleLinkClick("invoice")}
                  className={`sidebar-link ${
                    activeLink === "invoice" ? "button-color" : ""
                  }`}
                >
                  Invoice
                </Link>
              </li>
              <li>
                <Link
                  to="/technician-salary"
                  onClick={() => handleLinkClick("technician-salary")}
                  className={`sidebar-link ${
                    activeLink === "technician-salary" ? "button-color" : ""
                  }`}
                >
                  Technician Salary
                </Link>
              </li>
             {userRole === "superadmin" && ( <li>
                <Link
                  to="/material-cost"
                  onClick={() => handleLinkClick("material-cost")}
                  className={`sidebar-link ${
                    activeLink === "material-cost" ? "button-color" : ""
                  }`}
                >
                  Cost Table (Material)
                </Link>
              </li>)}
              {userRole === "superadmin" && (<li>
                <Link
                  to="/technician-cost"
                  onClick={() => handleLinkClick("technician-cost")}
                  className={`sidebar-link ${
                    activeLink === "technician-cost" ? "button-color" : ""
                  }`}
                >
                  Cost Table (Techinican)
                </Link>
                {/* {userRole === "superadmin" && (
                <li>
                  <Link
                    to="/deletedata"
                    onClick={() => handleLinkClick("deletedata")}
                    className={`sidebar-link ${
                      activeLink === "customerdata" ? "button-color" : ""
                    }`}
                  >
                    Delete Devices
                  </Link>
                </li>
              )} */}
              </li>)}
            </>
          )}
        </ul>
      </div>
      <button
        onClick={handleLogout}
        className="button-color text-white px-4 py-2 mb-6 rounded-md text-sm md:text-base w-full mt-2"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
