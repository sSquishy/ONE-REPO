/**
 * Page Alumni List
 */

'use strict';

// Datatable (jquery)
$(function () {
  let dt_alumni = null;
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  var dt_alumni_table = $('.datatables-alumni'),
    select2 = $('.select2'),
    // alumniView = '/app/alumni/view/account/',
    statusObj = {
      Active: { title: 'Active', class: 'bg-label-success' },
      Inactive: { title: 'Inactive', class: 'bg-label-danger' },
      Pending: { title: 'Pending', class: 'bg-label-warning' }
    };

  if (select2.length) {
    var $this = select2;
    select2Focus($this);
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Country',
      dropdownParent: $this.parent()
    });
  }

  // Alumni datatable
  if (dt_alumni_table.length) {
    dt_alumni = dt_alumni_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: '/sysAdmin/Admin/Account-Management/getStudentList/',
        data: function(d) {
          d.year = $('#UserAlumniYear').val();
          d.program = $('#UserAlumniProgram').val();
          d.status = $('#UserAlumniStatus').val();
          d.isAlumni = 1;
        },
        dataSrc: 'data',
        type: 'GET',
        error: function(xhr, status, error) {
          console.log(xhr.responseText);
        }
      },
      columns: [
        // columns according to JSON
        { data: '' },
        { data: 'userID' },
        { data: 'studentNumber' },
        { data: null,
          render: function (data, type, full, meta) {
            return `
              <div class="d-flex justify-content-start align-items-center user-name">
                <div class="d-flex flex-column">
                  <span class="fw-medium" style="color: black !important; font-size: smaller;">${
                    buildFullName(full['firstname'], full['middlename'], full['lastname'], full['suffix'])
                  }</span>
                </div>
              </div>
            `;
          }
         },
        { data: 'program' },
        { data: 'emailAddress' },
        { data: 'createdTime' },
        { data: 'status' },
        { data: null }
      ],
      columnDefs: [
        {
          className: 'control',
          orderable: false,
          searchable: false,
          responsivePriority: 2,
          targets: 0,
          visible: false,
          render: function (data, type, full, meta) {
            return '';
          }
        },
        {
          // For Chechboxes
          targets: 1,
          orderable: false,
          visible: true,
          render: function (data, type, full, meta) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input alumni-checkbox" value="${full.userID}">`;
          },
          checkboxes: {
            selectRow: true,
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          targets: 2,
          responsivePriority: 3,
          render: function (data, type, full, meta) {
            if (type === 'display') {
              return `
                <div class="d-flex align-items-center">
                  <span style="color: black !important; font-size: smaller;">${data}</span>
                </div>
              `;
            }
            return data;
          }
        },
        {
          targets: 4,
          responsivePriority: 5,
          render: function (data, type, full, meta) {
            var $program = full['program'];
            if (type === 'display') {
              return `
                <div class="d-flex align-items-center">
                  <i class="mdi mdi-book-education-outline me-2 text-muted"></i>
                  <span style="color: black !important; font-size: smaller;">${$program}</span>
                </div>
              `;
            }
            return $program;
          }
        },
        {
          targets: 5,
          responsivePriority: 6,
          render: function (data, type, full, meta) {
            var $email = full['emailAddress'];
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-email-outline me-2 text-muted"></i>
                <span style="color: black !important; font-size: smaller;">${$email}</span>
              </div>
            `;
          }
        },
        {
          targets: 6,
          responsivePriority: 7,
          render: function (data, type, full, meta) {
            var $created_date = full['createdTime'];
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
                <span style="color: black !important; font-size: smaller;">${$created_date}</span>
              </div>
            `;
          }
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            var $status = full['status'];
            return (
              '<span class="badge rounded-pill ' +
              statusObj[$status].class +
              ' text-capitalized" style="font-size: smaller;">' +
              statusObj[$status].title +
              '</span>'
            );
          }
        },
        {
          targets: -1,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <div class="d-inline-block text-nowrap">
                <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                        data-bs-toggle="dropdown">
                  <i class="mdi mdi-dots-vertical mdi-20px"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  <a href="javascript:;" class="dropdown-item reset-password-alumni" data-id="${full.userID}">
                    <i class="mdi mdi-lock-reset me-2"></i><span style="font-size: smaller;">Reset Password</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item edit-alumni" data-id="${full.userID}" data-bs-toggle="modal" data-bs-target="#editAlumniModal">
                    <i class="mdi mdi-pencil-outline me-2"></i><span style="font-size: smaller;">Edit</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-record-alumni" data-id="${full.userID}">
                    <i class="mdi mdi-delete-outline me-2"></i><span style="font-size: smaller;">Delete</span>
                  </a>
                </div>
              </div>
            `;
          }
        }
      ],
      order: [[2, 'desc']],
      dom:
        '<"row mx-2"' +
        '<"col-md-2"<"me-3"l>>' +
        '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-3 mb-md-0 gap-3"fB>>' +
        '>t' +
        '<"row mx-2"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6"p>' +
        '>',
      language: {
        sLengthMenu: 'Show _MENU_',
        search: '',
        searchPlaceholder: 'Search..'
      },
      // Buttons with Dropdown
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle me-3 waves-effect waves-light',
          text: '<i class="mdi mdi-export-variant me-1"></i> <span class="d-none d-sm-inline-block">Export</span>',
          buttons: [
            {
              extend: 'print',
              text: '<i class="mdi mdi-printer-outline me-1" ></i>Print',
              className: 'dropdown-item',
              exportOptions: {
                columns: [2, 3, 4, 5, 6, 7],
                // prevent avatar to be print
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        if (item.lastChild && item.lastChild.firstChild) {
                          result += item.lastChild.firstChild.textContent;
                        } else {
                          result += item.textContent || '';
                        }
                      } else if (item.innerText === undefined) {
                        result += item.textContent || '';
                      } else {
                        result += item.innerText;
                      }
                    });
                
                    return result;
                  }
                }
              },
              customize: function (win) {
                //customize print view for dark
                $(win.document.body)
                  .css('color', headingColor)
                  .css('border-color', borderColor)
                  .css('background-color', bodyBg);
                $(win.document.body)
                  .find('table')
                  .addClass('compact')
                  .css('color', 'inherit')
                  .css('border-color', 'inherit')
                  .css('background-color', 'inherit');
              }
            },
            {
              extend: 'csv',
              text: '<i class="mdi mdi-file-document-outline me-1" ></i>Csv',
              className: 'dropdown-item',
              exportOptions: {
                columns: [2, 3, 4, 5, 6, 7],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        if (item.lastChild && item.lastChild.firstChild) {
                          result += item.lastChild.firstChild.textContent;
                        } else {
                          result += item.textContent || '';
                        }
                      } else if (item.innerText === undefined) {
                        result += item.textContent || '';
                      } else {
                        result += item.innerText;
                      }
                    });
                
                    return result;
                  }
                }
              }
            },
            {
              extend: 'excel',
              text: '<i class="mdi mdi-file-excel-outline me-1"></i>Excel',
              className: 'dropdown-item',
              exportOptions: {
                columns: [2, 3, 4, 5, 6, 7],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        if (item.lastChild && item.lastChild.firstChild) {
                          result += item.lastChild.firstChild.textContent;
                        } else {
                          result += item.textContent || '';
                        }
                      } else if (item.innerText === undefined) {
                        result += item.textContent || '';
                      } else {
                        result += item.innerText;
                      }
                    });
                
                    return result;
                  }
                }
              }
            },
            {
              extend: 'pdf',
              text: '<i class="mdi mdi-file-pdf-box me-1"></i>Pdf',
              className: 'dropdown-item',
              exportOptions: {
                columns: [2, 3, 4, 5, 6, 7],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        if (item.lastChild && item.lastChild.firstChild) {
                          result += item.lastChild.firstChild.textContent;
                        } else {
                          result += item.textContent || '';
                        }
                      } else if (item.innerText === undefined) {
                        result += item.textContent || '';
                      } else {
                        result += item.innerText;
                      }
                    });
                
                    return result;
                  }
                }
              }
            },
            {
              extend: 'copy',
              text: '<i class="mdi mdi-content-copy me-1"></i>Copy',
              className: 'dropdown-item',
              exportOptions: {
                columns: [2, 3, 4, 5, 6, 7],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        if (item.lastChild && item.lastChild.firstChild) {
                          result += item.lastChild.firstChild.textContent;
                        } else {
                          result += item.textContent || '';
                        }
                      } else if (item.innerText === undefined) {
                        result += item.textContent || '';
                      } else {
                        result += item.innerText;
                      }
                    });
                
                    return result;
                  }
                }
              }
            }
          ]
        },
        {
          text: '<i class="mdi mdi-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Alumni</span>',
          className: 'add-new btn btn-primary waves-effect waves-light',
          attr: {
            'data-bs-toggle': 'modal',
            'data-bs-target': '#addAlumniModal'
          }
        },
      ],
      // For responsive popup
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details of ' + data['full_name'];
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '">' +
                    '<td>' +
                    col.title +
                    ':' +
                    '</td> ' +
                    '<td>' +
                    col.data +
                    '</td>' +
                    '</tr>'
                : '';
            }).join('');

            return data ? $('<table class="table"/><tbody />').append(data) : false;
          }
        }
      },
      select: {
        // Select style
        style: 'multi'
      },
      initComplete: function () {
        // Adding graduation year filter once table is initialized
        // Adding year filter once table is initialized
        this.api()
          .columns(2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserAlumniYear" class="form-select text-capitalize"><option value=""> Select Year </option></select>'
            )
              .appendTo('.UserAlumniYear') // Ensure this container exists in your HTML
              .on('change', function () {
                dt_alumni.ajax.reload();
              });

            var uniqueYears = new Set();

            column
              .data()
              .each(function (d) {
                // Extract first 4 characters and validate
                if (typeof d === 'string' && d.length >= 4) {
                  const yearCandidate = d.substring(0, 4);
                  if (/^\d{4}$/.test(yearCandidate)) {
                    uniqueYears.add(yearCandidate);
                  }
                }
              });

            // Populate dropdown with sorted years
            Array.from(uniqueYears)
              .sort((a, b) => b - a) // Descending numerical order
              .forEach(year => {
                select.append(new Option(year, year));
              });
          });

        // Adding program filter once table initialized
        this.api()
          .columns(4)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserAlumniProgram" class="form-select text-capitalize"><option value=""> Select Program </option></select>'
            )
              .appendTo('.UserAlumniProgram')
              .on('change', function () {
                dt_alumni.ajax.reload();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append('<option value="' + d + '">' + d + '</option>');
              });
          });
        // Adding status filter once table initialized
        this.api()
          .columns(-2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserAlumniStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.UserAlumniStatus')
              .on('change', function () {
                dt_alumni.ajax.reload();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append(
                  '<option value="' +
                    statusObj[d].title +
                    '" class="text-capitalize">' +
                    statusObj[d].title +
                    '</option>'
                );
              });
          });
      }
    });
    document.dt_alumni = dt_alumni;
  }

  // Reloads the table when their respective tab is selected
  $('[tab-name="alumni"]').on("click", function() {
    dt_alumni.ajax.reload(null, false);
  });

  function togglealumni_actionBar() {
    var selectedRows = dt_alumni.rows({ selected: true }).count(); // Changed to dt_alumni
    if (selectedRows > 0) {
      $('#alumni_actionBar').show();
      $('#alumni_selectedCount').text(selectedRows + ' Selected'); // Corrected ID

      // Handle Edit button
      if (selectedRows === 1) {
        $('#alumni_editSelected').show().prop('disabled', false); // Show & enable
      } else {
        $('#alumni_editSelected').hide().prop('disabled', true); // Hide & disable
      }
    } else {
      $('#alumni_actionBar').hide();
      $('#alumni_editSelected').prop('disabled', true); // Optional: Ensure disabled when hidden
    }
  }

  // Event listener for checkbox selection
  dt_alumni.on('select deselect', function () {
    togglealumni_actionBar();
  });


// Action Bar Event Handlers
$(document).on('click', '#alumni_closeActionBar', function() {
  dt_alumni.rows().deselect();
  togglealumni_actionBar();
});

$(document).on('click', '#alumni_resetPassword', function () {
  const selectedRows = $('.alumni-checkbox:checked').toArray();
  const emailList = selectedRows.map(row => $(row).closest('tr').find('td:eq(4)').text().trim());
  console.log("emailList", emailList);
  const count = selectedRows.length;

  // Check if any rows are selected
  if (count === 0) {
    Swal.fire({
      title: 'No Records Selected',
      text: 'Please select at least one record to reset the password.',
      icon: 'info',
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
    return;
  }

  Swal.fire({
    title: `Reset ${count} Password${count > 1 ? 's' : ''}?`,
    text: `Are you sure you want to reset password${count > 1 ? 's' : ''} for selected alumni?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Yes, reset ${count > 1 ? 'them' : 'it'}!`,
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'btn btn-primary me-3',
      cancelButton: 'btn btn-outline-secondary'
    },
    buttonsStyling: false
  }).then(result => {
    if (result.isConfirmed) {
      // Perform reset password action
      Swal.fire({
          title: "Please wait...",
          text: "Requesting for password reset link.",
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          },
          showCancelButton: false,
          confirmButtonText: '',
          customClass: { confirmButton: '', cancelButton: '' },
          buttonsStyling: false
      });
      
      // Set a timeout to show a warning message if the process takes too long
      let timeout = setTimeout(() => {
          Swal.update({
              title: 'Please wait...',
              text: 'This is taking longer than expected. Please wait or check your internet connection.',
              icon: 'warning',
              showConfirmButton: false,
              showCancelButton: false,
              confirmButtonText: '',
              customClass: { confirmButton: '', cancelButton: '' },
              buttonsStyling: false,
              allowOutsideClick: false,
          });
          Swal.showLoading();
      }, 60000); // Change 5000 to any delay you want in milliseconds
      
        // Set a timeout to show a warning message if the process takes too long
      let timeout2 = setTimeout(() => {
          Swal.close();
          Swal.fire({
              title: 'Failed to request reset link',
              text: 'Please try reloading the page or try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
          })
      }, 120000); // Change 5000 to any delay you want in milliseconds

      $.ajax({
        url: "/batchForgotPasswordRequest/",
        type: "POST",
        data: {
          emailList: emailList,
          role: 'Alumni',
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function(response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          dt_alumni.rows().deselect(); // Deselect selected rows
          togglealumni_actionBar(); // Hide action bar

          Swal.fire({
            title: 'Passwords Reset!',
            text: `Successfully sent a reset link to ${count} email${count > 1 ? 's' : ''}.`,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
        },
        error: function(xhr, status, error) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();
          
          console.log(xhr.responseText);
          Swal.fire({
            title: 'Error!',
            text: "Something went wrong. Please try again.",
            icon: 'error',
            customClass: { confirmButton: 'btn btn-danger' },
            buttonsStyling: false
          });
        }
      });
    }
  });
});

$(document).on('click', '#alumni_deleteSelected', function() {
  const selectedRows = $('.alumni-checkbox:checked').map(function () { return $(this).val() }).get();
  const count = selectedRows.length;

  Swal.fire({
    title: `Delete ${count} Record${count > 1 ? 's' : ''}?`,
    text: `Are you sure you want to delete selected alumni record${count > 1 ? 's' : ''}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Yes, delete ${count > 1 ? 'them' : 'it'}!`,
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'btn btn-danger me-3',
      cancelButton: 'btn btn-outline-secondary'
    },
    buttonsStyling: false
  }).then(result => {
    if (result.isConfirmed) {
      Swal.fire({
          title: "Loading...",
          text: "Processing your request...",
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          },
          showCancelButton: false,
          confirmButtonText: '',
          customClass: { confirmButton: '', cancelButton: '' },
          buttonsStyling: false
      });
      
      // Set a timeout to show a warning message if the process takes too long
      let timeout = setTimeout(() => {
          Swal.update({
              title: 'Loading...',
              text: 'This is taking longer than expected. Please wait or check your internet connection.',
              icon: 'warning',
              showConfirmButton: false,
              showCancelButton: false,
              confirmButtonText: '',
              customClass: { confirmButton: '', cancelButton: '' },
              buttonsStyling: false,
              allowOutsideClick: false,
          });
          Swal.showLoading();
      }, 5000); // Change 5000 to any delay you want in milliseconds
      
        // Set a timeout to show a warning message if the process takes too long
      let timeout2 = setTimeout(() => {
          Swal.close();
          Swal.fire({
              title: 'Promotion failed',
              text: 'Please try reloading the page or try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
          })
      }, 30000); // Change 5000 to any delay you want in milliseconds

      // Perform graduate action
      $.ajax({
        url: "/sysAdmin/Admin/Account-Management/batchDeleteStudent/",
        type: "POST",
        data: {
          userIDList: selectedRows,
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function(response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          dt_alumni.rows().deselect(); // Deselect rows after action
          togglealumni_actionBar(); // Hide action bar

          Swal.fire({
            title: 'Deleted!',
            text: `The selected record${count > 1 ? 's have' : ' has'} been deleted.`,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          })
          .then(() => {
            dt_alumni.ajax.reload(null, false );
          })
        }
      });
    }
  });
});


    // Add SweetAlert2 to alumni dropdown actions
    $(document).on('click', '.reset-password-alumni', function () {
      const row = $(this).closest('tr');
      const email = row.find('td:eq(4)').text().trim();

      Swal.fire({
        title: 'Reset Password?',
        text: "Are you sure you want to reset the password for this alumni?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset it!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-primary me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          // Perform reset password action
          Swal.fire({
              title: "Please wait...",
              text: "Requesting for password reset link.",
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading();
              },
              showCancelButton: false,
              confirmButtonText: '',
              customClass: { confirmButton: '', cancelButton: '' },
              buttonsStyling: false
          });
          
          // Set a timeout to show a warning message if the process takes too long
          let timeout = setTimeout(() => {
              Swal.update({
                  title: 'Please wait...',
                  text: 'This is taking longer than expected. Please wait or check your internet connection.',
                  icon: 'warning',
                  showConfirmButton: false,
                  showCancelButton: false,
                  confirmButtonText: '',
                  customClass: { confirmButton: '', cancelButton: '' },
                  buttonsStyling: false,
                  allowOutsideClick: false,
              });
              Swal.showLoading();
          }, 5000); // Change 5000 to any delay you want in milliseconds
          
            // Set a timeout to show a warning message if the process takes too long
          let timeout2 = setTimeout(() => {
              Swal.close();
              Swal.fire({
                  title: 'Failed to request reset link',
                  text: 'Please try reloading the page or try again.',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false
              })
          }, 30000); // Change 5000 to any delay you want in milliseconds

          $.ajax({
            url: "/forgotPasswordRequest/",
            type: "POST",
            data: {
              email: email,
              role: 'Alumni',
              csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (response) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Password Reset!',
                text: "The reset link for the password has been sent",
                icon: 'success',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
                buttonsStyling: false
              });
            },
            error: function (xhr, status, error) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();
              
              console.log(xhr.responseText);
              Swal.fire({
                title: 'Error!',
                text: "Something went wrong. Please try again.",
                icon: 'error',
                customClass: {
                  confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
              })
            }
          });
        }
      });
    });

    $(document).on('click', '.delete-record-alumni', function () {
      Swal.fire({
        title: 'Delete Alumni?',
        text: "Are you sure you want to delete this alumni record?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          let studentID = $(this).data('id');

          Swal.fire({
              title: "Loading...",
              text: "Processing your request...",
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading();
              },
              showCancelButton: false,
              confirmButtonText: '',
              customClass: { confirmButton: '', cancelButton: '' },
              buttonsStyling: false
          });
          
          // Set a timeout to show a warning message if the process takes too long
          let timeout = setTimeout(() => {
              Swal.update({
                  title: 'Loading...',
                  text: 'This is taking longer than expected. Please wait or check your internet connection.',
                  icon: 'warning',
                  showConfirmButton: false,
                  showCancelButton: false,
                  confirmButtonText: '',
                  customClass: { confirmButton: '', cancelButton: '' },
                  buttonsStyling: false,
                  allowOutsideClick: false,
              });
              Swal.showLoading();
          }, 5000); // Change 5000 to any delay you want in milliseconds
          
            // Set a timeout to show a warning message if the process takes too long
          let timeout2 = setTimeout(() => {
              Swal.close();
              Swal.fire({
                  title: 'Failed to load data',
                  text: 'Please try reloading the page or try again.',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false
              })
          }, 30000); // Change 5000 to any delay you want in milliseconds

          // Perform delete action
          $.ajax({
            url: "/sysAdmin/Admin/Account-Management/deleteStudent/",
            type: "POST",
            data: {
              userID: studentID,
              csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function(response) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Deleted!',
                text: "The alumni's account has been deleted.",
                icon: 'success',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
                buttonsStyling: false
              })
              .then(() => {
                dt_alumni.row($(this).parents('tr')).remove().draw();
              })
            },
            error: function(xhr, status, error) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();
              
              console.log(xhr.responseText);
              Swal.fire({
                title: 'Error!',
                text: "Something went wrong. Please try again.",
                icon: 'error',
                customClass: {
                  confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
              })
            }
          });
        }
      });
    });

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
