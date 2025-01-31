"use client";
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useForm } from "react-hook-form";

const InvoiceForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: "",
      rate: "",
      totalAmount: "",
      address: "",
      companyName: "",
      contactNumber: "",
      departmentName: "",
      directoryNumber: "",
      invoiceDate: "",
      invoiceNumber: "",
      itemDescription: "",
      recipientName: "",
      reference: "",
      roleName: "",
      uan: "",
    },
  });
  const quantity = Number(watch("quantity")) || 0;
  const rate = Number(watch("rate")) || 0;
  React.useEffect(() => {
    const total = quantity * rate;
    setValue("totalAmount", String(total), { shouldValidate: true });
  }, [quantity, rate, setValue]);
  const onSubmit = (data: any) => {
    console.log(data);
    const formatText = (text: string, wordsPerLine = 5) => {
      const words = text.split(" ");
      const lines = [];

      for (let i = 0; i < words.length; i += wordsPerLine) {
        lines.push(words.slice(i, i + wordsPerLine).join(" "));
      }

      return { text: lines.join("\n"), lines: lines.length };
    };
    const formatDate = (dateString: Date) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();

      const suffix =
        day % 10 === 1 && day !== 11
          ? "st"
          : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

      return `${day}${suffix} ${month}, ${year}`;
    };
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("MUZAMMIL BROTHER", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("THE INNOVATOR AND SUPPLIER", 105, 30, { align: "center" });

    doc.setFontSize(11);
    doc.text("To:", 15, 50);
    doc.text(`${data.companyName}`, 25, 50);
    doc.text(
      `Our Ref: ${data.reference}\n\nKarachi, ${formatDate(
        data.invoiceDate
      )}\n\nOur Invoice #:${data.invoiceNumber}`,
      120,
      50
    );

    doc.text(`Mr ${data.recipientName}`, 15, 60);
    if (data.roleName) {
      doc.text(`${data.roleName}`, 15, 65);
    }
    if (data.departmentName) {
      doc.text(`${data.departmentName}`, 15, data.roleName ? 70 : 65);
    }

    doc.text(
      formatText(`Address: ${data.address}`).text,
      15,
      data.roleName && data.departmentName
        ? 80
        : data.roleName || data.departmentName
        ? 75
        : 70
    );
    if (data.contactNumber) {
      doc.text(
        `Contact: ${data.contactNumber}`,
        15,
        (formatText(`Address: ${data.address}`).lines - 1) * 5 + 85
      );
    }
    if (data.directoryNumber) {
      doc.text(
        `Dir: ${data.directoryNumber}`,
        15,
        data.contactNumber
          ? (formatText(`Address: ${data.address}`).lines - 1) * 5 + 90
          : (formatText(`Address: ${data.address}`).lines - 1) * 5 + 85
      );
    }
    if (data.uan) {
      doc.text(
        `UAN: ${data.uan}`,
        15,
        data.contactNumber && data.directoryNumber
          ? (formatText(`Address: ${data.address}`).lines - 1) * 5 + 95
          : data.contactNumber || data.directoryNumber
          ? (formatText(`Address: ${data.address}`).lines - 1) * 5 + 90
          : (formatText(`Address: ${data.address}`).lines - 1) * 5 + 85
      );
    }
    let startY = (formatText(`Address: ${data.address}`).lines - 1) * 5 + 100;
    autoTable(doc, {
      startY,
      head: [["Item Description", "Qty", "Rates", "Total Amount"]],
      body: [
        [
          `${data.itemDescription}`,
          `${data.quantity} pcs`,
          `Rs. ${data.rate}/=`,
          `Rs. ${data.rate * data.quantity}/=`,
        ],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
    });
    // Total amount
    doc.setFontSize(10);
    doc.text("Total Amount:", 140, doc?.autoTable.previous.finalY + 10);
    doc.text(
      `Rs. ${data.rate * data.quantity}/=`,
      170,
      doc.autoTable.previous.finalY + 10
    );

    // Footer - Contact Details
    doc.text("Muhammad Naeem Babar", 20, doc.autoTable.previous.finalY + 30);
    doc.text(
      "Team Leader At: Muzammil Brother",
      20,
      doc.autoTable.previous.finalY + 35
    );
    doc.text("Karachi, Pakistan", 20, doc.autoTable.previous.finalY + 40);
    doc.text(
      "00903342162720, 03002162720, naeembabar67@yahoo.com",
      20,
      doc.autoTable.previous.finalY + 45
    );

    const pageWidth = doc.internal.pageSize.getWidth();

    const footerText1 =
      "#1025, Block-S, North Nazimabad, behind Usman e Ghani Masjid, Karachi";
    const footerText2 =
      "Contact: 03002162720, 03342162720, email: muzammiltrader@gmail.com";

    const centerX1 = (pageWidth - doc.getTextWidth(footerText1)) / 2;
    const centerX2 = (pageWidth - doc.getTextWidth(footerText2)) / 2;

    doc.text(footerText1, centerX1, doc.autoTable.previous.finalY + 55);
    doc.text(footerText2, centerX2, doc.autoTable.previous.finalY + 60);
    // Save the PDF
    doc.save("invoice.pdf");
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 4, p: 4, bgcolor: "white", boxShadow: 3, borderRadius: 2 }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Generate Invoice PDF
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <TextField
              label="Company Name"
              fullWidth
              {...register("companyName", {
                required: "Company name is required",
              })}
              margin="normal"
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
            />
          </div>

          <div>
            <TextField
              margin="normal"
              label="Recipient Name"
              fullWidth
              {...register("recipientName", {
                required: "Recipient name is required",
              })}
              error={!!errors.recipientName}
              helperText={errors.recipientName?.message}
            />
          </div>
          <div>
            <TextField
              label="Department Name"
              fullWidth
              {...register("departmentName")}
              margin="normal"
              error={!!errors.departmentName}
              helperText={errors.departmentName?.message}
            />
          </div>
          <div>
            <TextField
              label="Role Name"
              fullWidth
              {...register("roleName")}
              margin="normal"
              error={!!errors.roleName}
              helperText={errors.roleName?.message}
            />
          </div>
          <div>
            <TextField
              margin="normal"
              label="Address"
              fullWidth
              {...register("address", {
                required: "Address is required",
              })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </div>
          <div>
            <TextField
              label="Reference"
              fullWidth
              margin="normal"
              {...register("reference", {
                required: "Reference is required",
              })}
              error={!!errors.reference}
              helperText={errors.reference?.message}
            />
          </div>
          <div>
            <TextField
              label="Invoice Number"
              fullWidth
              margin="normal"
              {...register("invoiceNumber", {
                required: "Invoice number is required",
              })}
              error={!!errors.invoiceNumber}
              helperText={errors.invoiceNumber?.message}
            />
          </div>
          <div>
            <TextField
              label="Invoice Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register("invoiceDate", {
                required: "Invoice date is required",
              })}
              error={!!errors.invoiceDate}
              helperText={errors.invoiceDate?.message}
            />
          </div>

          <div>
            <TextField
              label="Item Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              {...register("itemDescription", {
                required: "Description is required",
              })}
              error={!!errors.itemDescription}
              helperText={errors.itemDescription?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Quantity"
              type="number"
              margin="normal"
              fullWidth
              {...register("quantity", {
                required: "Quantity is required",
                valueAsNumber: true,
              })}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
            />
            <TextField
              label="Rate"
              type="number"
              fullWidth
              margin="normal"
              {...register("rate", {
                required: "Rate is required",
                valueAsNumber: true,
              })}
              error={!!errors.rate}
              helperText={errors.rate?.message}
            />
          </div>

          <div>
            <TextField
              label="Total Amount"
              type="number"
              fullWidth
              margin="normal"
              value={quantity * rate || ""}
              disabled
              helperText={errors.totalAmount?.message}
            />
          </div>

          <div>
            <TextField
              label="Contact Number"
              fullWidth
              margin="normal"
              {...register("contactNumber", {
                required: "Contact number is required",
              })}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber?.message}
            />
          </div>
          <div>
            <TextField
              label="Directory Number"
              fullWidth
              margin="normal"
              {...register("directoryNumber")}
              error={!!errors.directoryNumber}
              helperText={errors.directoryNumber?.message}
            />
          </div>
          <div>
            <TextField
              label="UAN"
              fullWidth
              margin="normal"
              {...register("uan")}
              error={!!errors.uan}
              helperText={errors.uan?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: "10px" }}
            >
              Generate PDF
            </Button>
          </div>
        </div>
      </form>
    </Container>
  );
};

export default InvoiceForm;
