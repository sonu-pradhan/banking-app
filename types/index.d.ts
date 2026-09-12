declare type Account = {
  id: string;
  accountNumber: number;
  balance: number;
  bankName: string;
}  

declare type User = {
  id: string;
  email: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  dateOfBirth: string;
  primary_account_id: string | null;
}

declare type Bank = {
  id: string;
  userId: string;
};

declare type Transaction = {
  id: string;
  amount: number;
  pending: boolean;
  category: string;
  senderBankId: string;
  receiverBankId: string;
};