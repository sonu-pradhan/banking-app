declare type Account = {
  id: string;
  availableBalance: number;
  currentBalance: number;
  officialName: string;
  mask: string;
  institutionId: string;
  name: string;
  type: string;
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