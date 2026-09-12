"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);


const BalanceChart = ({ accounts } : {accounts: Account[]}) => {

    const data = {
    datasets: [
      {
        label: 'Balance',
        data: accounts.map((account) => account.balance),
        backgroundColor: ['#0747b6', '#2265d8', '#2f91fa'] 
      }
    ],
    labels: accounts.map((account) => account.bankName)
  }

  return <Doughnut 
    data={data} 
    options={{
      cutout: '60%',
      plugins: {
        legend: {
          display: false
        }
      }
    }}
  />
}

export default BalanceChart
