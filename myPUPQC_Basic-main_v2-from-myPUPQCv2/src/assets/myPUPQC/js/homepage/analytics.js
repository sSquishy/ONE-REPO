$(document).ready(function () {
  let studentCounts = [];
  let alumniCounts = [];
  let facultyCounts = [];
  let personnelCounts = [];
  let years = [];

  function createAccountCreationChart() {
    // Remove the loading message
    $('#accountCreationChart').siblings('h2').remove();

    // Get the chart canvas
    var ctx = $('#accountCreationChart')[0].getContext('2d');

    // Account Creation Statistics Data
    let data = {
      labels: years, // Years (Can be changed to months)
      datasets: [
        {
          label: 'Students',
          data: studentCounts, // Replace with actual data
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Alumni',
          data: alumniCounts, // Replace with actual data
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        },
        {
          label: 'Faculty',
          data: facultyCounts, // Replace with actual data
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Personnel',
          data: personnelCounts, // Replace with actual data
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    // Account Creation Statistics Config
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

    // Render the Account Creation Statistics
    new Chart(ctx, config);
  }

  $.ajax({
    url: "/sysAdmin/Admin/Dashboard/getTotalRegisteredUsersPerYear/",
    type: "GET",
    success: function(data) {
      studentCounts = data.students;
      alumniCounts = data.alumni;
      facultyCounts = data.faculties;
      personnelCounts = data.personnel;
      years = data.xLabel;

      createAccountCreationChart();
    }
  })
});

// New Registered Users Chart
$(document).ready(function () {
  const newUsersCategoryChartEl = $('#newUsersCategoryChart');

  // Checks if the chart element exists to avoid runtime errors
  if (!newUsersCategoryChartEl.length) {
    console.error('❌ New Registered Users Chart cannot be found!');
    return;
  }

  // Chart Data
  let studentCounts = [];
  let alumniCounts = [];
  let facultyCounts = [];
  let personnelCounts = [];
  let months = [];

  function createChart() {
    // Remove the loading message
    newUsersCategoryChartEl.html('');

    // Create the chart instance
    const newUsersCategoryChart = new ApexCharts(newUsersCategoryChartEl[0], {
      chart: {
        type: 'line',
        height: 400,
        zoom: { enabled: false },
        toolbar: { show: false }
      },
      series: [
        { name: 'Students', data: studentCounts },
        { name: 'Alumni', data: alumniCounts },
        { name: 'Faculty', data: facultyCounts },
        { name: 'Personnel', data: personnelCounts }
      ],
      colors: ['#ff5733', '#33c3ff', '#33ff57', '#f5a623'],
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: months,
      },
      yaxis: { labels: { formatter: val => Math.round(val) } },
      legend: { position: 'top', horizontalAlign: 'right' }
    });

    newUsersCategoryChart.render();
    console.log('✅ Chart successfully rendered!');
  }

  // Get the data from the server
  $.ajax({
    url: '/sysAdmin/Admin/Dashboard/getTotalRegisteredUsers/',
    type: 'GET',
    success: function (data) {
      // console.log("Data: ", data);
      studentCounts = data.students;
      alumniCounts = data.alumni;
      facultyCounts = data.faculties;
      personnelCounts = data.personnel;
      months = data.xLabel;

      createChart();
    },
    error: function (xhr, status, error) {
      console.error(xhr.responseText);
    }
  });
});

// Students Per Program Chart
let programs = [];
let studentCounts = [];

function createStudentsPerProgramChart() {
  // Remove the loading message
  $('#donutChart').html('');

  const donutChartEl = $('#donutChart')[0],
  donutChartConfig = {
    chart: {
      height: 390,
      fontFamily: 'Inter',
      type: 'donut'
    },
    labels: programs,
    series: studentCounts, // Percentage distribution
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
}

$.ajax({
  url: "/sysAdmin/Admin/Dashboard/getTotalStudentsPerProgram/",
  type: "GET",
  success: function(data) {
    programs = data.programs;
    studentCounts = data.students;

    createStudentsPerProgramChart();
  }
})