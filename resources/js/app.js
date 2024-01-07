// app entrypoint
import Swup from "swup";
import SwupHeadPlugin from '@swup/head-plugin';
import SwupFormsPlugin from '@swup/forms-plugin';
import Chart from 'chart.js/auto';
const swup = new Swup({
    plugins: [
        new SwupHeadPlugin(),
        new SwupFormsPlugin()
    ]
});

(async function() {
   new Chart(
     document.getElementById('statusTickets'),
     {
       type: 'doughnut',
       data: statusTickets
     }
   );
   new Chart(
    document.getElementById('asignedTickets'),
    {
      type: 'doughnut',
      data: asignedTickets
    }
  );
})();