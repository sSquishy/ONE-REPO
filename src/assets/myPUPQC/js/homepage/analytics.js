document.addEventListener('DOMContentLoaded', function () {
  // Get the chart canvas
  var ctx = document.getElementById('accountCreationChart').getContext('2d');

  // Data for the bar chart
  var data = {
    labels: ['2020', '2021', '2022', '2023', '2024'], // Years (Can be changed to months)
    datasets: [
      {
        label: 'Students',
        data: [500, 600, 750, 820, 900], // Replace with actual data
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Alumni',
        data: [200, 250, 300, 400, 450], // Replace with actual data
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      },
      {
        label: 'Faculty',
        data: [100, 120, 150, 180, 200], // Replace with actual data
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Personnel',
        data: [50, 70, 90, 110, 130], // Replace with actual data
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Bar Chart Config
  var config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  };

  // Render the chart
  new Chart(ctx, config);
});

document.addEventListener('DOMContentLoaded', function () {
  console.log('📊 Chart script loaded!'); // Debugging log

  const newUsersCategoryChartEl = document.querySelector('#newUsersCategoryChart');

  if (!newUsersCategoryChartEl) {
    console.error('❌ Element #newUsersCategoryChart not found!');
    return;
  }

  const newUsersCategoryChart = new ApexCharts(newUsersCategoryChartEl, {
    chart: {
      type: 'line',
      height: 400,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    series: [
      { name: 'Students', data: [120, 150, 180, 220, 300, 350, 400, 450, 480, 500, 530, 600] },
      { name: 'Alumni', data: [30, 50, 70, 90, 110, 130, 160, 180, 200, 220, 250, 280] },
      { name: 'Faculty', data: [10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120] },
      { name: 'Personnel', data: [5, 10, 15, 20, 25, 30, 35, 40, 50, 55, 60, 70] }
    ],
    colors: ['#ff5733', '#33c3ff', '#33ff57', '#f5a623'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yaxis: { labels: { formatter: val => Math.round(val) } },
    legend: { position: 'top', horizontalAlign: 'right' }
  });

  newUsersCategoryChart.render();
  console.log('✅ Chart successfully rendered!');
});

// Donut Chart
// Donut Chart for Students per Program
const donutChartEl = document.querySelector('#donutChart'),
  donutChartConfig = {
    chart: {
      height: 390,
      fontFamily: 'Inter',
      type: 'donut'
    },
    labels: ['BSIT', 'BSCS', 'BSECE', 'BSEd', 'BSBA'],
    series: [40, 25, 15, 10, 10], // Percentage distribution
    colors: [
      '#ff7675', // BSIT
      '#74b9ff', // BSCS
      '#55efc4', // BSECE
      '#fdcb6e', // BSEd
      '#e17055' // BSBA
    ],
    stroke: {
      show: false,
      curve: 'straight'
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return parseInt(val, 10) + '%';
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      markers: { offsetX: -3 },
      itemMargin: {
        vertical: 3,
        horizontal: 10
      },
      labels: {
        colors: '#666',
        useSeriesColors: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              fontSize: '1.5rem'
            },
            value: {
              fontSize: '1.2rem',
              color: '#333',
              formatter: function (val) {
                return parseInt(val, 10) + '%';
              }
            },
            total: {
              show: true,
              fontSize: '1.5rem',
              color: '#000',
              label: 'Total Students',
              formatter: function (w) {
                return '100%';
              }
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 380
          },
          legend: {
            position: 'bottom',
            labels: {
              colors: '#666',
              useSeriesColors: false
            }
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 320
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    fontSize: '1.2rem'
                  },
                  value: {
                    fontSize: '1rem'
                  },
                  total: {
                    fontSize: '1.5rem'
                  }
                }
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              colors: '#666',
              useSeriesColors: false
            }
          }
        }
      },
      {
        breakpoint: 420,
        options: {
          chart: {
            height: 280
          },
          legend: {
            show: false
          }
        }
      },
      {
        breakpoint: 360,
        options: {
          chart: {
            height: 250
          },
          legend: {
            show: false
          }
        }
      }
    ]
  };

if (donutChartEl !== null) {
  const donutChart = new ApexCharts(donutChartEl, donutChartConfig);
  donutChart.render();
}
