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
} from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { AddIcon, DeleteIcon } from "@/constants/svgs";
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
      uan: "",
    });
  };
  const [image, setImage] = React.useState<string | null>(null);
  const items = watch("items") as Item[];
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [selectedInvoice, setSelectedInvoice] = React.useState("");

  const invoiceOptions = [
    { code: "mbi", value: "Muzammil Brothers Invoice" },
    { code: "mti", value: "Muzammil Traders Invoice" },
    { code: "mbq", value: "Muzammil Brothers Quotation" },
    { code: "mtq", value: "Muzammil Traders Quotation" },
    { code: "mbd", value: "Muzammil Brothers DC" },
    { code: "mtd", value: "Muzammil Traders DC" },
  ];
  const fileInputRef = React.useState<HTMLInputElement | null>(null);
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
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      total: (
        Number(updatedItems[index].quantity) * Number(updatedItems[index].rate)
      ).toFixed(2),
    };

    // Update the item at the given index
    setValue(`items`, updatedItems, { shouldValidate: true });

    // Recalculate the total amount for the entire invoice
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

    // doc.setFontSize(18);
    // doc.text("MUZAMMIL BROTHER", 105, 20, { align: "center" });
    // doc.setFontSize(12);
    // doc.text("THE INNOVATOR AND SUPPLIER", 105, 30, { align: "center" });
    doc.addImage(
      selectedInvoice == "mti" ? "/mtl.png" : "/mbl.png",
      "PNG",
      9,
      0,
      190,
      60
    ); // Adjust x, y, width, height

    doc.setFontSize(11);
    doc.text("To:", 15, 60);
    doc.text(`Mr ${data.recipientName}`, 25, 60);
    doc.text(
      `Our Ref: ${data.reference}\n\nKarachi, ${formatDate(
        data.invoiceDate
      )}\n\n ${
        selectedInvoice == "mti" || selectedInvoice == "mbi" ? "Invoice" : "DC"
      } #:${data.invoiceNumber}`,
      190, // Start closer to the right side
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
          minCellHeight: 30,
          cellWidth: 30,
          halign: "center",
          valign: "middle",
        }, // Image Column
        1: { cellWidth: 55, halign: "left", valign: "middle" },
        2: { cellWidth: 20, halign: "left", valign: "middle" },
        3: { cellWidth: 20, halign: "left", valign: "middle" },
        4: { cellWidth: 20, halign: "left", valign: "middle" },
        5: { cellWidth: 35, halign: "left", valign: "middle" },
      },
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: {
        fillColor: [0, 0, 0], // Black header background
        textColor: [255, 255, 255], // White text color for contrast
        fontStyle: "bold",
        halign: "center", // Center headers
        valign: "middle",
      },
      pageBreak: "auto", // Automatically add a page if content overflows
    });

    let nextY = doc.autoTable.previous.finalY + 10;

    // **Ensure new content fits in the page**
    if (nextY + 30 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      nextY = 20; // Reset position for the new page
    }

    doc.setFontSize(10);
    doc.text("Total Amount (No GST):", 120, nextY);
    doc.text(`Rs. ${data.totalAmountNonGst}/=`, 170, nextY);

    nextY += 5;
    doc.text("Total Amount (+18% GST):", 120, nextY);
    doc.text(`Rs. ${data.totalAmount}/=`, 170, nextY);

    nextY += 15;

    // **Ensure Footer does not overlap**
    if (nextY + 30 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      nextY = 20;
    }

    // Footer - Contact Details
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
              : "Muzammil Traders Delivery Challan"}
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
                      : "DC Number"
                  }
                  fullWidth
                  {...register("invoiceNumber", {
                    required:
                      selectedInvoice == "mbi" || selectedInvoice == "mti"
                        ? "Invoice number is required"
                        : "DC number is required",
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
                      value={watch(`items.${index}.quantity`)}
                      onChange={(e) =>
                        handleQuantityRateChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      error={!!errors?.items?.[index]?.quantity}
                      helperText={errors?.items?.[index]?.quantity?.message}
                    />
                    <TextField
                      label="Rate"
                      type="number"
                      fullWidth
                      value={watch(`items.${index}.rate`)}
                      onChange={(e) =>
                        handleQuantityRateChange(index, "rate", e.target.value)
                      }
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
