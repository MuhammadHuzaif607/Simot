import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import img from "../assets/unnamed-removebg-preview.png";
import { url } from "../url";
// import { image } from "html2canvas/dist/types/css/types/image";

const Invoice = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientCountry, setClientCountry] = useState("");
  const [Customers, setCustomers] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [articleCost, setArticleCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [items, setItems] = useState([
    { description: "", quantity: 0, unitPrice: 0, vat: 0 },
  ]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [vatNumber, setVatNumber] = useState("");
  const [errors, setErrors] = useState({});

  // const [customers, setCustomers] = useState([]);
  // const [data, setData] = useState([]);
  console.log("first", Customers);
  useEffect(() => {
    const fetchInvoiceNumber = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/invoices/next-invoice-number`
        );
        setInvoiceNumber(response.data.invoiceNumber);
      } catch (error) {
        console.error("Error fetching invoice number:", error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/customers`
        );
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    const currentDate = new Date().toISOString().split("T")[0];
    setDate(currentDate);
    fetchCustomers();
    fetchInvoiceNumber();
  }, []);

  // useEffect(() => {
  //   // Calculate articleCost and totalCost whenever quantity, unitPrice, vat, or shippingCost change
  //   const calculatedArticleCost =
  //     quantity && unitPrice ? parseFloat(quantity) * parseFloat(unitPrice) : 0;
  //   const calculatedVatAmount =
  //     calculatedArticleCost * (parseFloat(vat) / 100 || 0);
  //   const calculatedTotalCost =
  //     calculatedArticleCost +
  //     calculatedVatAmount +
  //     (parseFloat(shippingCost) || 0);

  //   setArticleCost(calculatedArticleCost);
  //   setTotalCost(calculatedTotalCost);
  // }, [quantity, unitPrice, vat, shippingCost]);

  useEffect(() => {
    // Calculate total cost whenever items or shipping cost changes
    const calculatedTotalCost =
      items.reduce((total, item) => {
        const itemCost = item.quantity * item.unitPrice;
        const vatAmount = itemCost * (item.vat / 100);
        return total + itemCost + vatAmount;
      }, 0) + parseFloat(shippingCost || 0);

    setTotalCost(calculatedTotalCost);
  }, [items, shippingCost]);

  const handleClientCodeChange = (e) => {
    const userInput = e.target.value;
    setClientCode(userInput);
    setErrors((prevErrors) => ({ ...prevErrors, clientCode: "" }));
    if (userInput) {
      const filtered = Customers.filter((customer) =>
        customer._id.toLowerCase().includes(userInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (code) => {
    setClientCode(code);
    setShowSuggestions(false);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 0, unitPrice: 0, vat: 0 },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "quantity" || field === "unitPrice" || field === "vat"
        ? parseFloat(value) || 0
        : value;
    setItems(updatedItems);

    // Clear errors when a field is updated
    if (field === "description") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`item${index}_description`]: "",
      }));
    }
    if (field === "quantity" && value > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`item${index}_quantity`]: "",
      }));
    }
    if (field === "unitPrice" && value > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`item${index}_unitPrice`]: "",
      }));
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGenerateInvoice = async () => {
    // Validation logic
    const newErrors = {};
    if (!clientCode) newErrors.clientCode = "Client Code is required";
    if (!clientName) newErrors.clientName = "Client Name is required";
    if (!clientAddress) newErrors.clientAddress = "Client Address is required";
    if (!clientCity) newErrors.clientCity = "Client City is required";
    if (!clientCountry) newErrors.clientCountry = "Client Country is required";
    if (!shippingCost) newErrors.shippingCost = "Shipping Cost is required";

    if (
      items.some(
        (item) => !item.description || !item.quantity || !item.unitPrice
      )
    ) {
      newErrors.items =
        "Each item must have a description, quantity and unit price";
      items.forEach((item, index) => {
        if (!item.description)
          newErrors[`item${index}_description`] = "Description is required";
        if (item.quantity <= 0)
          newErrors[`item${index}_quantity`] =
            "Quantity must be greater than 0";
        if (item.unitPrice <= 0)
          newErrors[`item${index}_unitPrice`] =
            "Unit Price must be greater than 0";
      });
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const invoiceData = {
        invoiceNumber,
        date,
        clientCode,
        clientName,
        clientAddress,
        clientCity,
        clientCountry,
        vatNumber,
        items, // Send items directly without any other variable
        shippingCost: parseFloat(shippingCost),
        totalAmount: parseFloat(totalCost),
      };

      // Send the invoice data to the backend
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/invoices/create`,
        invoiceData
      );

      // const imageBase64 = url;

      // Generate PDF after saving to backend
      const pdfContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; border: 1px solid #ddd;">
           <div style="display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Commercial Invoice</h2>
          </div>
        </div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h3 style="margin: 0;">Simotech_IT</h3>
              <p style="margin: 5px 0;">piazza della vittora 4/H, 23017 Morbegno,Sondrio Italy</p>
              <p style="margin: 5px 0;">Phone: +39 351 347 7470</p>
              <p style="margin: 5px 0;">Partita Iva 01076000148</p>
              <p style="margin: 5px 0;">Email: simotech.it@gmail.com</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Invoice No.:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Client Code:</strong> ${clientCode}</p>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <p><strong>Client Name:</strong> ${clientName}</p>
            <p><strong>Address:</strong> ${clientAddress}</p>
            <p><strong>City:</strong> ${clientCity}</p>
            <p><strong>Country:</strong> ${clientCountry}</p>
            <p><strong>VAT Number:</strong> ${vatNumber || "N/A"}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Description</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Quantity</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Unit Price (€)</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">VAT (%)</th>
              </tr>
            </thead>
           <tbody>
      ${items
        .map(
          (item) => `
        <tr>
          <td style="border: 1px solid black; padding: 10px;">${
            item.description
          }</td>
          <td style="border: 1px solid black; padding: 10px; text-align: center;">${
            item.quantity
          }</td>
          <td style="border: 1px solid black; padding: 10px; text-align: right;">${item.unitPrice.toFixed(
            2
          )}</td>
          <td style="border: 1px solid black; padding: 10px; text-align: right;">${
            item.vat
          }</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
          </table>
          <div style="margin-top: 20px;">
            <p><strong>Article Cost:</strong> €${articleCost.toFixed(2)}</p>
            <p><strong>Shipping Cost:</strong> €${
              shippingCost ? parseFloat(shippingCost).toFixed(2) : "0.00"
            }</p>
            <p style="font-size: 18px; font-weight: bold;">Total: €${totalCost.toFixed(
              2
            )}</p>
          </div>
          <div style="margin-top: 40px; text-align: center; border-top: 2px solid #000; padding-top: 10px;">
            <p style="margin: 0;">Thank you for your trust!</p>
            <p style="font-size: 12px; color: grey; margin-top: 10px;">
             Prestazione svolta in regime fiscale di vantaggio ex art. 1, commi 96-117, legge 24/12/2007 n° 244 del 2007 come modificata dall'art. 27, DL 98/2011 e pertanto non soggetta a IVA ai sensi del provvedimento n. 185820/2011 dell'Agenzia delle Entrate
             Documento privo di valenza fiscale ai sensi dell'art. 21 Dpr 633/72. L'originale è disponibile all'indirizzo telematico da Lei fornito oppure nella Sua area riservata dell'Agenzia delle Entrate.
            </p>
          </div>
        </div>
      `;

      const options = {
        margin: 0.5,
        filename: `Invoice_${invoiceNumber}.pdf`,
        // image: { type: "png", quality: 0.98 },
        html2canvas: {
          scale: 2,
          dpi: 300,
          letterRendering: true,
          useCORS: true,
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      html2pdf().set(options).from(pdfContent).save();

      // Fetch the next invoice number after creating one
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invoices/next-invoice-number`
      );
      setInvoiceNumber(response.data.invoiceNumber);

      // Clear form fields
      setClientName("");
      setClientAddress("");
      setClientCity("");
      setClientCountry("");
      setVatNumber("");
      setItems([{ description: "", quantity: 0, unitPrice: 0, vat: 0 }]); // Clear items array properly
      setShippingCost("");
      setClientCode("");
      setTotalCost(0);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <div className="text-white p-6 dark-gray rounded-lg">
      <div id="invoice">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Simotech_IT</h2>
            <p>Victory Square 4/H, 23017 Morbegno</p>
            <p>Italy</p>
            <p>Phone: +39 361 347 7470</p>
            <p>Email: simotech.it@gmail.com</p>
          </div>
          <div className="text-right w-[20.5%]">
            <h2 className="md:text-2xl font-bold text-sm">
              Commercial Invoice
            </h2>
            <div>
              <input
                placeholder="Invoice No."
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
              />
            </div>
            <div>
              <input
                placeholder="Date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
              />
            </div>
            <div>
              <input
                placeholder="Client Code"
                type="text"
                value={clientCode}
                onChange={handleClientCodeChange}
                className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Keeps this for hiding suggestions after blur
              />
              {errors.clientCode && (
                <p className="text-red-500">{errors.clientCode}</p>
              )}
              {showSuggestions && (
                <div className="suggestions-dropdown bg-gray-700 text-white p-2 rounded">
                  {filteredSuggestions.map((customer) => (
                    <div
                      key={customer._id}
                      onMouseDown={() => handleSuggestionClick(customer._id)} // Use onMouseDown instead of onClick
                      className="cursor-pointer p-2 hover:bg-gray-600"
                    >
                      {customer._id} - {customer.customerName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-4 p-4 dark-gray rounded-lg">
          <div>
            <input
              placeholder="Client Name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
            />
            {errors.clientName && (
              <p className="text-red-500">{errors.clientName}</p>
            )}
          </div>
          <div>
            <input
              placeholder="Address"
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
            />
            {errors.clientAddress && (
              <p className="text-red-500">{errors.clientAddress}</p>
            )}
          </div>
          <div>
            <input
              placeholder="City"
              type="text"
              value={clientCity}
              onChange={(e) => setClientCity(e.target.value)}
              className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
            />
            {errors.clientCity && (
              <p className="text-red-500">{errors.clientCity}</p>
            )}
          </div>
          <div>
            <input
              placeholder="Country"
              type="text"
              value={clientCountry}
              onChange={(e) => setClientCountry(e.target.value)}
              className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
            />
            {errors.clientCountry && (
              <p className="text-red-500">{errors.clientCountry}</p>
            )}
          </div>
          <div>
            <input
              placeholder="VAT Number (optional)"
              type="text"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              className="main-bg border border-gray-600 p-2 rounded text-white w-full mb-2"
            />
          </div>
        </div>
        <button
          onClick={addItem}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded block ms-auto me-2 mb-2"
        >
          Add Item
        </button>

        {/* Table Section */}
        <table className="w-full mb-4 dark-gray rounded-lg text-center">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2">Description</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Unit Price (€)</th>
              <th className="py-2">VAT (%)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="py-2">
                  <input
                    placeholder="Description"
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="main-bg border border-gray-600 p-2 rounded text-white w-full"
                  />
                  {errors[`item${index}_description`] && (
                    <p className="text-red-500 text-[12px]">
                      {errors[`item${index}_description`]}
                    </p>
                  )}
                </td>
                <td className="py-2">
                  <input
                    placeholder="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    className="main-bg border border-gray-600 p-2 rounded text-white w-full"
                  />
                  {errors[`item${index}_quantity`] && (
                    <p className="text-red-500 text-[12px]">
                      {errors[`item${index}_quantity`]}
                    </p>
                  )}
                </td>
                <td className="py-2">
                  <input
                    placeholder="Unit Price (€)"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(index, "unitPrice", e.target.value)
                    }
                    className="main-bg border border-gray-600 p-2 rounded text-white w-full"
                  />
                  {errors[`item${index}_unitPrice`] && (
                    <p className="text-red-500 text-[12px]">
                      {errors[`item${index}_unitPrice`]}
                    </p>
                  )}
                </td>
                <td className="py-2 mb-2">
                  <input
                    placeholder="VAT (%)"
                    type="number"
                    value={item.vat}
                    onChange={(e) => updateItem(index, "vat", e.target.value)}
                    className="main-bg border border-gray-600 p-2 rounded text-white w-full  "
                  />
                </td>
                <td>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div className="mb-4">
          <p>Article Cost: €{articleCost.toFixed(2)}</p>
          <p>
            {/* VAT (€): €{(articleCost * (parseFloat(vat) / 100 || 0)).toFixed(2)} */}
          </p>
          <div>
            <input
              placeholder="Shipping Cost"
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="main-bg border border-gray-600 p-2 rounded text-white w-full"
            />
            {errors.shippingCost && (
              <p className="text-red-500">{errors.shippingCost}</p>
            )}
          </div>
          <p className="text-lg font-bold">TOTAL: €{totalCost.toFixed(2)}</p>
        </div>

        {/* Footer Section */}
        <p className="mt-6 text-sm text-gray-400">Thank you for your trust!</p>
        <p className="mt-1 text-xs text-gray-500">
          -Inversione contabile ai sensi dell'art.7 ter D.P.R. 633/72 . <br />
          -Documento privo di valenza fiscale ai sensi dell'art. 21 Dpr 633/72.
          L'originale è disponibile all'indirizzo telematico da Lei fornito
          oppure nella Sua area riservata dell'Agenzia delle Entrate. <br />
           -per
          qualsiasi chiarimento contattateci 
        </p>
      </div>

      {/* Generate Invoice Button */}
      <button
        onClick={handleGenerateInvoice}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate Invoice
      </button>
    </div>
  );
};

export default Invoice;
