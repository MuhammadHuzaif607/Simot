import React, { useRef } from "react";
import Barcode from "react-barcode";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Logo from "../assets/image.png";
import html2canvas from "html2canvas"; // Import html2canvas

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  padding: 4,
  display: "flex",
  flexDirection: "column",
};

const BarCodeModal = ({
  open,
  handleClose,
  productId,
  imei,
  deviceModal,
  condition,
  grade,
  memory,
}) => {
  const printRef = useRef();

  // Function to remove all non-numeric characters from the productId
  const getNumericProductId = (id) => {
    return id.replace(/\D/g, ""); // Replace all non-digits with an empty string
  };

  // Function to take a screenshot of the specific part (ref) and print it
  const handlePrint = async () => {
    const printContents = printRef.current;

    // Wait for html2canvas to render with adjusted options
    await html2canvas(printContents, {
      scale: 2,
      width: printContents.scrollWidth,
      height: printContents.scrollHeight * 1.1,
      windowWidth: printContents.scrollWidth,
      windowHeight: printContents.scrollHeight,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png"); // Convert canvas to image data
      const newWindow = window.open("", "_blank"); // Open a new window
      newWindow.document.write("<html><head><title>Print</title></head><body>");
      // Embed the captured image in the new window
      newWindow.document.write(
        `<img src="${imgData}" style="width:100%; height:auto;" />`
      );
      newWindow.document.write("</body></html>");
      newWindow.document.close();
      newWindow.focus();

      // Wait for the image to load before printing
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
        }, 1000);
      };
    });
  };

  // Check if IMEI is present
  const hasImei = imei && imei.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="barcode-modal-title"
      aria-describedby="barcode-modal-description"
    >
      <Box sx={modalStyle}>
        <div ref={printRef}>
          <h1 className="heading font-bold text-center">Working</h1>
          <div className="details flex justify-between items-center font-bold">
            <div className="logo-content flex justify-center items-center">
              <img className="w-14 h-14" src={Logo} alt="Logo" />
              <h2>Simotech.IT</h2>
            </div>
            <h2>{condition}</h2>
          </div>

          <div className="barcode-content flex justify-center items-center">
            <p>N ID:</p>
            <Barcode
              className="barcode flex justify-between"
              value={getNumericProductId(productId)}
              width={2}
              // height={100}
            />
          </div>

          {hasImei && (
            <div className="barcode-content flex justify-center items-center ">
              <p>IMEI:</p>
              <Barcode
                className="barcode flex justify-between"
                value={imei}
                width={2}
              />
            </div>
          )}

          <div className="details flex justify-between items-center font-bold">
            <h2>{deviceModal}</h2>
            <h2>Memory:{memory}</h2>
            <h2>Grade: {grade}</h2>
          </div>
        </div>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" color="secondary" onClick={handlePrint}>
            Print
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BarCodeModal;
