"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);


const BalanceChart = ({ accounts } : {accounts: Account[]}) => {

    const data = {
    datasets: [
      {
        label: 'Banks',
        data: [3874, 3979, 9734],
        backgroundColor: ['#0747b6', '#2265d8', '#2f91fa'] 
      }
    ],
    labels: ['bank 1', 'bank 2']
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
