import Chart from 'chart.js/auto';

(async function() {
   new Chart(
     document.getElementById('statusTickets'),
     {
       type: 'doughnut',
       data: statusTickets,
       options: {
        plugins: {
            title: {
                display: true,
                text: statusTicketsTitle
            },
        }
      }
     }
   );
   new Chart(
    document.getElementById('asignedTickets'),
    {
      type: 'doughnut',
      data: asignedTickets,
      options: {
        plugins: {
            title: {
                display: true,
                text: asignedTicketsTitle
            }
        }
      }
    }
  );
})();