import Chart from 'chart.js/auto';

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