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
                text: 'Tickets/Estado'
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
                text: 'Tickets sin resolver'
            }
        }
      }
    }
  );
})();