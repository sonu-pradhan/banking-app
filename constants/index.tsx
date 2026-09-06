import { BanknoteArrowUp, CreditCardPlus, House, ReceiptIndianRupee } from "lucide-react";

export const sidebarLinks = [
  {
    imgURL: House,
    route: "/",
    label: "Home",
  },
  {
    imgURL: CreditCardPlus,
    route: "/my-banks",
    label: "My Banks",
  },
  {
    imgURL: ReceiptIndianRupee,
    route: "/transaction-history",
    label: "Transaction History",
  },
  {
    imgURL: BanknoteArrowUp,
    route: "/payment-transfer",
    label: "Transfer Funds",
  },
];