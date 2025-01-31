import InvoiceForm from "@/conponents/MainPage/Invoice";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto w-full">
      <div className="flex flex-col items-center w-full">
        <InvoiceForm />
      </div>
    </div>
  );
}
