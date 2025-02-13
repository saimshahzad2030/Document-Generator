"use client";
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TextField,
  Button,
  Container,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { AddIcon, DeleteIcon } from "@/constants/svgs";
const label = { inputProps: { "aria-label": "Checkbox demo" } };

interface Item {
  image: string;
  itemDescription: string;
  quantity: string;
  rate: string;
  total: string;
}

const InvoiceForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      totalAmount: "",
      totalAmountNonGst: "",
      address: "",
      companyName: "",
      contactNumber: "",
      departmentName: "",
      directoryNumber: "",
      items: [
        { image: "", itemDescription: "", quantity: "", rate: "", total: "" },
      ],

      invoiceDate: "",
      invoiceNumber: "",
      recipientName: "",
      reference: "",
      roleName: "",
      timeOfSupply: "",
      dateOfSupply: "",
      supplierSTReg: "",
      buyerSTReg: "",
      supplierNTN: "",
      buyerNTN: "",
      customerId: "",
      uan: "",
    },
  });
  const resetForm = () => {
    reset({
      totalAmount: "",
      totalAmountNonGst: "",
      address: "",
      companyName: "",
      contactNumber: "",
      departmentName: "",
      directoryNumber: "",
      items: [
        { image: "", itemDescription: "", quantity: "", rate: "", total: "" },
      ],
      invoiceDate: "",
      invoiceNumber: "",
      recipientName: "",
      reference: "",
      roleName: "",
      timeOfSupply: "",
      dateOfSupply: "",
      supplierSTReg: "",
      buyerSTReg: "",
      supplierNTN: "",
      buyerNTN: "",
      customerId: "",
      uan: "",
    });
  };
  const items = watch("items") as Item[];
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [selectedInvoice, setSelectedInvoice] = React.useState("");
  const [salesTaxRecieptChecked, setSalesTaxRecieptChecked] =
    React.useState(false);

  const invoiceOptions = [
    { code: "mbi", value: "Muzammil Brothers Invoice" },
    { code: "mti", value: "Muzammil Traders Invoice" },
    { code: "mbq", value: "Muzammil Brothers Quotation" },
    { code: "mtq", value: "Muzammil Traders Quotation" },
    { code: "mbd", value: "Muzammil Brothers DC" },
    { code: "mtd", value: "Muzammil Traders DC" },
  ];
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(`items.${index}.image`, reader.result as string, {
          shouldValidate: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuantityRateChange = (
    index: number,
    field: "quantity" | "rate",
    value: string
  ) => {
    setValue(`items.${index}.${field}`, value); // Update the form field value
    trigger(`items.${index}.${field}`);
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      total: (
        Number(updatedItems[index].quantity) * Number(updatedItems[index].rate)
      ).toFixed(2),
    };

    setValue(`items`, updatedItems, { shouldValidate: true });

    const updatedTotal = updatedItems.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      return sum + quantity * rate;
    }, 0);
    const updatedTotalWithTax = updatedTotal + (updatedTotal * 18) / 100;
    setValue("totalAmountNonGst", updatedTotal.toFixed(2), {
      shouldValidate: true,
    });

    setValue("totalAmount", updatedTotalWithTax.toFixed(2), {
      shouldValidate: true,
    });
  };
  type InvoiceItem = {
    image: string;
    itemDescription: string;
    quantity: string;
    rate: string;
    total: string;
  };

  type InvoiceData = {
    totalAmount: string;
    totalAmountNonGst: string;
    address: string;
    companyName: string;
    contactNumber: string;
    departmentName: string;
    directoryNumber: string;
    items: InvoiceItem[];
    invoiceDate: Date;
    customerId: string;
    invoiceNumber: string;
    recipientName: string;
    supplierSTReg: string;
    reference: string;
    roleName: string;
    timeOfSupply: string;
    dateOfSupply: string;
    buyerSTReg: string;
    supplierNTN: string;
    buyerNTN: string;
    uan: string;
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
  const generateSalesDoc = (data: InvoiceData) => {
    const salesDoc = new jsPDF();

    salesDoc.setFontSize(12);
    salesDoc.text(
      `${selectedInvoice == "mti" ? "Muzammil Traders" : "Muzammil Brothers"}`,
      15,
      35
    );
    salesDoc.setFontSize(11);

    salesDoc.text(`#1025, Block-S, North Nazimabad, Karachi`, 15, 40);
    salesDoc.setFontSize(24);
    salesDoc.text("Invoice", 190, 25, { align: "right", maxWidth: 200 });
    salesDoc.setFontSize(11);

    salesDoc.text(`${formatDate(data?.invoiceDate)}`, 190, 35, {
      align: "right",
      maxWidth: 200,
    });
    salesDoc.text(`Invoice#: ${data.invoiceNumber}`, 190, 40, {
      align: "right",
      maxWidth: 200,
    });
    salesDoc.text(`Customer Id: ${data.customerId}`, 190, 45, {
      align: "right",
      maxWidth: 200,
    });
    salesDoc.setFont("helvetica", "normal");

    salesDoc.text(
      `Contact: ${data.contactNumber ? data.contactNumber : "-"}`,
      15,
      45
    );
    salesDoc.text(
      `Dir: ${data.directoryNumber ? data.directoryNumber : "-"}`,
      15,
      50
    );
    salesDoc.text(`UAN: ${data.uan ? data.uan : "-"}`, 15, 55);
    autoTable(salesDoc, {
      startY: 65, // Left position of the first table
      tableWidth: 80,
      head: [["Supplier Name"]],
      body: [
        [
          `${
            selectedInvoice == "mti" ? "Muzammil Traders" : "Muzammil Brothers"
          }`,
        ],
        [`#1025, Block-S North Nazimabad, Karachi`],
        [`ST registration#: ${data.supplierSTReg}`],
        [`NTN#: ${data.supplierNTN}`],

        [
          `${
            data.contactNumber
              ? data.contactNumber
              : data.uan
              ? data.uan
              : data.directoryNumber
          }`,
        ],
      ],
      columnStyles: {
        0: {
          minCellHeight: 5,
          halign: "left",
          valign: "middle",
        },
      },
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      pageBreak: "auto",
    });
    autoTable(salesDoc, {
      startY: 65,
      tableWidth: 80,
      margin: { left: 115 },

      head: [["Buyer Name"]],
      body: [
        [`${data.companyName}`],
        [`${data.address}`],
        [`ST registration#: ${data.supplierSTReg}`],
        [`NTN#: ${data.buyerNTN}`],

        [
          `${
            data.contactNumber
              ? data.contactNumber
              : data.uan
              ? data.uan
              : data.directoryNumber
          }`,
        ],
      ],
      columnStyles: {
        0: {
          minCellHeight: 5,
          halign: "left",
          valign: "middle",
        },
      },
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      pageBreak: "auto",
    });
    let nextY = salesDoc.autoTable.previous.finalY + 10;
    autoTable(salesDoc, {
      startY: nextY,
      head: [
        [
          "Item Description",
          "Qty",
          "Unit Price",
          "Tax/\nunit",
          "Tax Rate",
          "Total Tax Amount",
          "Total Amount",
        ],
      ],
      body: items.map((item: any) => [
        item.itemDescription,
        `${item.quantity} pcs`,
        `Rs. ${item.rate}/=`,
        // `Rs. ${item.quantity * item.rate}/=`,
        `Rs. ${item.rate * 0.18}/=`,
        `18%`,
        `Rs. ${Math.floor(item.quantity * item.rate * 0.18)}/=`,
        `Rs. ${Math.floor(
          item.quantity * item.rate + item.quantity * item.rate * (18 / 100)
        )}/=`,
      ]),
      columnStyles: {
        0: {
          minCellHeight: 10,
          cellWidth: 45,
          halign: "center",
          valign: "middle",
        },
        1: { cellWidth: 20, halign: "center", valign: "middle" },
        2: { cellWidth: 20, halign: "center", valign: "middle" },
        3: { cellWidth: 20, halign: "center", valign: "middle" },
        4: { cellWidth: 20, halign: "center", valign: "middle" },
        5: { cellWidth: 28, halign: "center", valign: "middle" },
        6: { cellWidth: 28, halign: "center", valign: "middle" },
      },
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      pageBreak: "auto",
    });
    let nextY2 = salesDoc.autoTable.previous.finalY + 10;

    if (nextY2 + 30 > salesDoc.internal.pageSize.height - 10) {
      salesDoc.addPage();
      nextY2 = 20;
    }

    salesDoc.setFontSize(10);
    salesDoc.text("Total Amount (No GST):", 120, nextY2);
    salesDoc.text(`Rs. ${data.totalAmountNonGst}/=`, 170, nextY2);

    nextY2 += 5;
    salesDoc.text("Total Amount (+18% GST):", 120, nextY2);
    salesDoc.text(`Rs. ${data.totalAmount}/=`, 170, nextY2);

    nextY2 += 15;

    if (nextY2 + 30 > salesDoc.internal.pageSize.height - 10) {
      salesDoc.addPage();
      nextY2 = 20;
    }

    salesDoc.text("Muhammad Naeem Babar", 20, nextY2);
    salesDoc.text("Team Leader At: Muzammil Brother", 20, nextY2 + 5);
    salesDoc.text("Karachi, Pakistan", 20, nextY2 + 10);
    salesDoc.text(
      "00903342162720, 03002162720, naeembabar67@yahoo.com",
      20,
      nextY2 + 15
    );

    const pageWidth = salesDoc.internal.pageSize.getWidth();
    const footerText1 =
      "#1025, Block-S, North Nazimabad, behind Usman e Ghani Masjid, Karachi";
    const footerText2 =
      "Contact: 03002162720, 03342162720, email: muzammiltrader@gmail.com";

    const centerX1 = (pageWidth - salesDoc.getTextWidth(footerText1)) / 2;
    const centerX2 = (pageWidth - salesDoc.getTextWidth(footerText2)) / 2;

    salesDoc.text(footerText1, centerX1, nextY2 + 25);
    salesDoc.text(footerText2, centerX2, nextY2 + 30);

    salesDoc.save(`sales.pdf`);
  };
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

    const doc = new jsPDF();
    if (salesTaxRecieptChecked) {
      generateSalesDoc(data);
    }
    doc.addImage(
      selectedInvoice == "mti" ||
        selectedInvoice == "mtd" ||
        selectedInvoice == "mtq"
        ? "/mtl.png"
        : "/mbl.png",
      "PNG",
      9,
      0,
      190,
      60
    );

    doc.setFontSize(11);
    doc.text("To:", 15, 60);
    doc.text(`Mr ${data.recipientName}`, 25, 60);
    doc.text(
      `Our Ref: ${data.reference}\n\nKarachi, ${formatDate(
        data.invoiceDate
      )}\n\n ${
        selectedInvoice == "mti" || selectedInvoice == "mbi"
          ? "Invoice"
          : selectedInvoice == "mtd" || selectedInvoice == "mbd"
          ? "DC"
          : "Quotation"
      } #:${data.invoiceNumber}`,
      190,
      60,
      { align: "right", maxWidth: 200 }
    );
    doc.setFont("helvetica", "bold");
    doc.text(`${data.companyName}`, 15, 70);
    doc.setFont("helvetica", "normal");

    if (data.roleName) {
      doc.text(`${data.roleName}`, 15, 75);
    }
    if (data.departmentName) {
      doc.text(`${data.departmentName}`, 15, data.roleName ? 80 : 75);
    }

    doc.text(
      formatText(`Address: ${data.address}`).text,
      15,
      data.roleName && data.departmentName
        ? 90
        : data.roleName || data.departmentName
        ? 85
        : 80
    );
    if (data.contactNumber) {
      doc.text(
        `Contact: ${data.contactNumber}`,
        15,
        (formatText(`Address: ${data.address}`).lines - 1) * 5 + 95
      );
    }
    if (data.directoryNumber) {
      doc.text(
        `Dir: ${data.directoryNumber}`,
        15,
        data.contactNumber
          ? (formatText(`Address: ${data.address}`).lines - 1) * 5 + 100
          : (formatText(`Address: ${data.address}`).lines - 1) * 5 + 95
      );
    }
    if (data.uan) {
      doc.text(
        `UAN: ${data.uan}`,
        15,
        data.contactNumber && data.directoryNumber
          ? (formatText(`Address: ${data.address}`).lines - 1) * 5 + 105
          : data.contactNumber || data.directoryNumber
          ? (formatText(`Address: ${data.address}`).lines - 1) * 5 + 100
          : (formatText(`Address: ${data.address}`).lines - 1) * 5 + 95
      );
    }
    let startY = (formatText(`Address: ${data.address}`).lines - 1) * 5 + 110;
    autoTable(doc, {
      startY,
      head: [
        [
          "Item Image",
          "Item Description",
          "Qty (Pcs)",
          "Rate (Rs)",
          "Total (Rs)",
          "Item Total( +18% GST)",
        ],
      ],
      body: items.map((item: any) => [
        { image: item.image || null },
        item.itemDescription,
        `${item.quantity} pcs`,
        `Rs. ${item.rate}/=`,
        `Rs. ${item.quantity * item.rate}/=`,
        `Rs. ${Math.floor(
          item.quantity * item.rate + item.quantity * item.rate * (18 / 100)
        )}/=`,
      ]),
      didDrawCell: (data: any) => {
        if (
          data.section === "body" &&
          data.column.index === 0 &&
          data.cell.raw.image !== "no image"
        ) {
          const image = data.cell.raw.image;

          if (typeof image === "string" && image.startsWith("data:image")) {
            doc.addImage(
              image,
              "PNG",
              data.cell.x + 2,
              data.cell.y + 2,
              30,
              30
            );
          }
        }
      },
      columnStyles: {
        0: {
          minCellHeight: 35,
          cellWidth: 35,
          halign: "center",
          valign: "middle",
        },
        1: { cellWidth: 45, halign: "left", valign: "middle" },
        2: { cellWidth: 20, halign: "left", valign: "middle" },
        3: { cellWidth: 20, halign: "left", valign: "middle" },
        4: { cellWidth: 20, halign: "left", valign: "middle" },
        5: { cellWidth: 35, halign: "left", valign: "middle" },
      },
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      pageBreak: "auto",
    });

    let nextY = doc.autoTable.previous.finalY + 10;

    if (nextY + 30 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      nextY = 20;
    }

    doc.setFontSize(10);
    doc.text("Total Amount (No GST):", 120, nextY);
    doc.text(`Rs. ${data.totalAmountNonGst}/=`, 170, nextY);

    nextY += 5;
    doc.text("Total Amount (+18% GST):", 120, nextY);
    doc.text(`Rs. ${data.totalAmount}/=`, 170, nextY);

    nextY += 15;

    if (nextY + 30 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      nextY = 20;
    }

    doc.text("Muhammad Naeem Babar", 20, nextY);
    doc.text("Team Leader At: Muzammil Brother", 20, nextY + 5);
    doc.text("Karachi, Pakistan", 20, nextY + 10);
    doc.text(
      "00903342162720, 03002162720, naeembabar67@yahoo.com",
      20,
      nextY + 15
    );

    const pageWidth = doc.internal.pageSize.getWidth();
    const footerText1 =
      "#1025, Block-S, North Nazimabad, behind Usman e Ghani Masjid, Karachi";
    const footerText2 =
      "Contact: 03002162720, 03342162720, email: muzammiltrader@gmail.com";

    const centerX1 = (pageWidth - doc.getTextWidth(footerText1)) / 2;
    const centerX2 = (pageWidth - doc.getTextWidth(footerText2)) / 2;

    doc.text(footerText1, centerX1, nextY + 25);
    doc.text(footerText2, centerX2, nextY + 30);

    doc.save(
      selectedInvoice == "mti" || selectedInvoice == "mbi"
        ? `Invoice${
            selectedInvoice.includes("t")
              ? "(Muzammil Traders)"
              : "(Muzammil Brothers)"
          }.pdf`
        : `Delivery-Challan${
            selectedInvoice.includes("t")
              ? "(Muzammil Traders)"
              : "(Muzammil Brothers)"
          }.pdf`
    );
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 4, p: 4, bgcolor: "white", boxShadow: 3, borderRadius: 2 }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Select Document Type
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Select Document Type</InputLabel>
        <Select
          value={selectedInvoice}
          onChange={(e) => {
            if (selectedInvoice !== e.target.value) {
              resetForm();
            }
            setSelectedInvoice(e.target.value);
          }}
          label="Select Document Type"
        >
          {invoiceOptions.map((option, index) => (
            <MenuItem key={index} value={option.code}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {(selectedInvoice == "mbi" ||
        selectedInvoice == "mti" ||
        selectedInvoice == "mtq" ||
        selectedInvoice == "mbq" ||
        selectedInvoice == "mtd" ||
        selectedInvoice == "mbd") && (
        <>
          <Typography
            sx={{ marginTop: "20px" }}
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            {selectedInvoice == "mbi"
              ? "Muzammil Brothers Invoice"
              : selectedInvoice == "mti"
              ? "Muzammil Traders Invoice"
              : selectedInvoice == "mbd"
              ? "Muzammil Brothers Delivery Challan"
              : selectedInvoice == "mtd"
              ? "Muzammil Traders Delivery Challan"
              : selectedInvoice == "mtq"
              ? "Muzammil Traders Quotaion"
              : "Muzammil Brothers Quotaion"}
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <TextField
                  label="Company Name"
                  fullWidth
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                />
              </div>

              <div>
                <TextField
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
                  error={!!errors.departmentName}
                  helperText={errors.departmentName?.message}
                />
              </div>
              <div>
                <TextField
                  label="Role Name"
                  fullWidth
                  {...register("roleName")}
                  error={!!errors.roleName}
                  helperText={errors.roleName?.message}
                />
              </div>
              <div>
                <TextField
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
                  {...register("reference", {
                    required: "Reference is required",
                  })}
                  error={!!errors.reference}
                  helperText={errors.reference?.message}
                />
              </div>
              <div>
                <TextField
                  label={
                    selectedInvoice == "mbi" || selectedInvoice == "mti"
                      ? "Invoice Number"
                      : selectedInvoice == "mbd" || selectedInvoice == "mtd"
                      ? "DC Number"
                      : "Quotation"
                  }
                  fullWidth
                  {...register("invoiceNumber", {
                    required:
                      selectedInvoice == "mbi" || selectedInvoice == "mti"
                        ? "Invoice number is required"
                        : selectedInvoice == "mbd" || selectedInvoice == "mtd"
                        ? "DC number is required"
                        : "Quotation number is required",
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
                  InputLabelProps={{ shrink: true }}
                  {...register("invoiceDate", {
                    required: "Invoice date is required",
                  })}
                  error={!!errors.invoiceDate}
                  helperText={errors.invoiceDate?.message}
                />
              </div>

              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-3 border p-3 rounded-lg mb-2"
                >
                  <h1>Item {index + 1}</h1>

                  <div
                    className="w-24 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded-lg"
                    onClick={() =>
                      document.getElementById(`fileInput-${index}`)?.click()
                    }
                  >
                    {watch(`items.${index}.image`) ? (
                      <img
                        src={watch(`items.${index}.image`)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-center">
                        Upload Image
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id={`fileInput-${index}`}
                    onChange={(e) => handleImageUpload(e, index)}
                    className="hidden"
                  />

                  <TextField
                    label="Item Description"
                    fullWidth
                    multiline
                    {...register(`items.${index}.itemDescription`, {
                      required: "Description is required",
                    })}
                    error={!!errors?.items?.[index]?.itemDescription}
                    helperText={
                      errors?.items?.[index]?.itemDescription?.message
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <TextField
                      label="Quantity"
                      type="number"
                      fullWidth
                      {...register(`items.${index}.quantity`, {
                        required: "Quantity is required",
                        onChange: (e) =>
                          handleQuantityRateChange(
                            index,
                            "quantity",
                            e.target.value
                          ),
                      })}
                      error={!!errors?.items?.[index]?.quantity}
                      helperText={errors?.items?.[index]?.quantity?.message}
                    />
                    <TextField
                      label="Rate"
                      type="number"
                      fullWidth
                      {...register(`items.${index}.rate`, {
                        required: "Rate is required",
                        onChange: (e) =>
                          handleQuantityRateChange(
                            index,
                            "rate",
                            e.target.value
                          ),
                      })}
                      error={!!errors?.items?.[index]?.rate}
                      helperText={errors?.items?.[index]?.rate?.message}
                    />
                  </div>

                  <button
                    className="w-full flex flex-col items-center justify-center p-2"
                    onClick={() => remove(index)}
                  >
                    <DeleteIcon className={"w-4 h-4"} />
                  </button>
                </div>
              ))}

              <div className="w-full col-span-1 flex flex-row items-center justify-end">
                <Button
                  variant="outlined"
                  // startIcon={<AddIcon className={"w-4 h-auto"} />}
                  fullWidth
                  onClick={() =>
                    append({
                      image: "",
                      itemDescription: "",
                      quantity: "",
                      rate: "",
                      total: "",
                    })
                  }
                >
                  Add Another Item
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Total Amount"
                  type="number"
                  fullWidth
                  value={watch("totalAmountNonGst")}
                  // value={}
                  disabled
                  helperText={errors.totalAmountNonGst?.message}
                />
                <TextField
                  label="Total Amount (18% GST)"
                  type="number"
                  fullWidth
                  value={watch("totalAmount")}
                  // value={}
                  disabled
                  helperText={errors.totalAmount?.message}
                />
              </div>

              <div>
                <TextField
                  label="Contact Number"
                  fullWidth
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
                  {...register("directoryNumber")}
                  error={!!errors.directoryNumber}
                  helperText={errors.directoryNumber?.message}
                />
              </div>
              <div>
                <TextField
                  label="UAN"
                  fullWidth
                  {...register("uan")}
                  error={!!errors.uan}
                  helperText={errors.uan?.message}
                />
              </div>
              {(selectedInvoice == "mbi" || selectedInvoice == "mti") && (
                <div>
                  <div className="w-full flex flex-row items-center">
                    <Checkbox
                      {...label}
                      checked={salesTaxRecieptChecked}
                      onChange={() => {
                        setSalesTaxRecieptChecked(!salesTaxRecieptChecked);
                      }}
                    />
                    <p
                      className={`${
                        salesTaxRecieptChecked
                          ? "text-gray-900 "
                          : "text-gray-400"
                      }`}
                    >
                      Generate Sales Tax
                    </p>
                  </div>
                </div>
              )}

              {salesTaxRecieptChecked && (
                <>
                  <div>
                    <TextField
                      label="Customer Id"
                      fullWidth
                      {...register("customerId", {
                        required: salesTaxRecieptChecked
                          ? "Customer Id is required"
                          : false,
                      })}
                      error={!!errors.customerId}
                      helperText={errors.customerId?.message}
                    />
                  </div>
                  <div>
                    <TextField
                      label="Time of Supply"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      {...register("timeOfSupply", {
                        required: salesTaxRecieptChecked
                          ? "Time of supply is required"
                          : false,
                      })}
                      error={!!errors.timeOfSupply}
                      helperText={errors.timeOfSupply?.message}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Date of Supply"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      {...register("dateOfSupply", {
                        required: salesTaxRecieptChecked
                          ? "Supply date is required"
                          : false,
                      })}
                      error={!!errors.dateOfSupply}
                      helperText={errors.dateOfSupply?.message}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Supplier ST Registration #"
                      fullWidth
                      {...register("supplierSTReg", {
                        required: salesTaxRecieptChecked
                          ? "Supplier ST Reg is required"
                          : false,
                      })}
                      error={!!errors.supplierSTReg}
                      helperText={errors.supplierSTReg?.message}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Buyer ST Registration #"
                      fullWidth
                      {...register("buyerSTReg", {
                        required: salesTaxRecieptChecked
                          ? "Buyer ST Reg is required"
                          : false,
                      })}
                      error={!!errors.buyerSTReg}
                      helperText={errors.buyerSTReg?.message}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Supplier NTN Number"
                      fullWidth
                      {...register("supplierNTN", {
                        required: salesTaxRecieptChecked
                          ? "Supplier NTN Reg is required"
                          : false,
                      })}
                      error={!!errors.supplierNTN}
                      helperText={errors.supplierNTN?.message}
                    />
                  </div>

                  <div>
                    <TextField
                      label="Buyer NTN Number"
                      fullWidth
                      {...register("buyerNTN", {
                        required: salesTaxRecieptChecked
                          ? "Buyer NTN Reg is required"
                          : false,
                      })}
                      error={!!errors.buyerNTN}
                      helperText={errors.buyerNTN?.message}
                    />
                  </div>
                </>
              )}
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
        </>
      )}
    </Container>
  );
};

export default InvoiceForm;
