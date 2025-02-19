import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const BillModal = ({
  isOpen,
  onRequestClose,
  sales,
  formData,
  totalPrice,
  customTotalPrice,
}) => {
  const currentDate = new Date();
  const formattedDateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
  const finalTotalPrice = parseFloat(totalPrice) || 0;
  customTotalPrice =
    customTotalPrice - (formData.commission / 100) * customTotalPrice;
  const handlePrint = () => {
    const printContents = document.getElementById("printableArea").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  };

  return (
    <Dialog open={isOpen} onClose={onRequestClose} fullWidth maxWidth="md">
      <DialogContent>
        <div id="printableArea">
          <DialogTitle>Customer Invoice</DialogTitle>
          <div>
            <p>Customer Name: {formData.customerName}</p>
            <p>Shipment Number: {formData.shipmentNumber}</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device Type</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Memory</TableCell>
                  <TableCell>IMEI</TableCell>
                  <TableCell>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>{sale.deviceType}</TableCell>
                    <TableCell>{sale.condition}</TableCell>
                    <TableCell>{sale.grade}</TableCell>
                    <TableCell>{sale.model}</TableCell>
                    <TableCell>{sale.brand}</TableCell>
                    <TableCell>{sale.color}</TableCell>
                    <TableCell>{sale.memory}</TableCell>
                    <TableCell>{sale.imei || "N/A"}</TableCell>
                    <TableCell>
                      $
                      {customTotalPrice
                        ? customTotalPrice
                        : finalTotalPrice
                            // (customTotalPrice ? parseFloat(customTotalPrice) : 0)
                            .toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePrint} variant="contained" color="primary">
          Print
        </Button>
        <Button onClick={onRequestClose} variant="outlined" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillModal;
