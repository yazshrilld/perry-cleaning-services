

export type SeederResponse = {
  status: boolean;
  statusCode: number;
  message: string;
  payload:any
//   payload: {
//     updatedWallets: number;
//     updatedUserWallets: number;
//     createdWallets: number;
//     skippedWallets: number;
//     errors: string[];
//   } | null;
};

export type ToggleWalletStatusInput ={
  walletIds: string[]; // Array of wallet _id values to toggle
  status: "active" | "inactive"; // Target status for the wallets
}
