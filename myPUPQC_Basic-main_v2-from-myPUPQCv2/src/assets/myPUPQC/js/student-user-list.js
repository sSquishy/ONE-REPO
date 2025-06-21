$(function () {
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
  var dt_user_table = $('.datatables-users'),
    select2 = $('.select2'),
    // userView = '/app/user/view/account/',
    statusObj = {
      Pending: { title: 'Pending', class: 'bg-label-warning' },
      Active: { title: 'Active', class: 'bg-label-success' },
      Inactive: { title: 'Inactive', class: 'bg-label-secondary' }
    };

  if (select2.length) {
    var $this = select2;
    select2Focus($this);
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Country',
      dropdownParent: $this.parent()
    });
  }

  // Users datatable
  if (dt_user_table.length) {
    var dt_user = dt_user_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: '/sysAdmin/Admin/Account-Management/getStudentList/',
        data: function(d) {
          d.year = $('#UserYear').val();
          d.program = $('#UserProgram').val();
          d.status = $('#UserStatus').val();
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
          // Hidden control column for responsive
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
          // For Checkboxes
          targets: 1,
          orderable: false,
          render: function (data, type, full, meta) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input student-checkbox" value="${full.userID}">`;
          },
          checkboxes: {
            selectRow: true,
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          // Student Number (student_id) Column
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
          // Program
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
          // Email
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
          // Created Date
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
          // User Status
          targets: -2,
          render: function (data, type, full, meta) {
            var $status = full['status'];
            return (
              '<span class="badge rounded-pill ' +
              statusObj[$status].class +
              '" text-capitalized>' +
              statusObj[$status].title +
              '</span>'
            );
          }
        },
        {
          // Actions
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
                  <a href="javascript:;" class="dropdown-item reset-password-student" data-id="${full.userID}" style="color: black !important; font-size: smaller;">
                    <i class="mdi mdi-lock-reset me-2"></i><span>Reset Password</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item graduate-student" data-id="${full.userID}" style="color: black !important; font-size: smaller;">
                    <i class="mdi mdi-school-outline me-2"></i><span>Graduate</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item edit-student" data-id="${full.userID}" data-bs-toggle="modal" data-bs-target="#editStudentModal" style="color: black !important; font-size: smaller;">
                    <i class="mdi mdi-pencil-outline me-2"></i><span>Edit</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-record-student" data-id="${full.userID}" style="color: black !important; font-size: smaller;">
                    <i class="mdi mdi-delete-outline me-2"></i><span>Delete</span>
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
          text: '<i class="mdi mdi-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Student</span>',
          className: 'add-new btn btn-primary waves-effect waves-light',
          attr: {
            'data-bs-toggle': 'modal',
            'data-bs-target': '#addStudentModal'
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

        // Adding year filter once table is initialized
        this.api()
          .columns(2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserYear" class="form-select text-capitalize"><option value=""> Select Year </option></select>'
            )
              .appendTo('.user_role') // Ensure this container exists in your HTML
              .on('change', function () {
                dt_user.ajax.reload();
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

        // Adding plan filter once table initialized
        this.api()
          .columns(4)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserProgram" class="form-select text-capitalize"><option value=""> Select Program </option></select>'
            )
              .appendTo('.user_plan')
              .on('change', function () {
                dt_user.ajax.reload();
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
              '<select id="UserStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.user_status')
              .on('change', function () {
                dt_user.ajax.reload();
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
    document.dt_user = dt_user;
  }

  function toggleActionBar() {
    var selectedRows = dt_user.rows({ selected: true }).count();
    if (selectedRows > 0) {
      $('#actionBar').show();
      $('#selectedCount').text(selectedRows + ' Selected');

      // Handle Edit button
      if (selectedRows === 1) {
        $('#editSelected').show().prop('disabled', false); // Show & enable
      } else {
        $('#editSelected').hide().prop('disabled', true); // Hide & disable
      }
    } else {
      $('#actionBar').hide();
      $('#editSelected').prop('disabled', true); // Optional: Ensure disabled when hidden
    }
  }

  // Event listener for checkbox selection
  dt_user.on('select deselect', function () {
    toggleActionBar();
  });

// Add close button handler
$('#actionBar').on('click', '#closeActionBar', function() {
  // Deselect all rows using DataTables API
  dt_user.rows().deselect();

  // Hide action bar through the existing toggle function
  toggleActionBar();
});

// Reset Password for selected records
$('#resetPassword').on('click', function () {
  const selectedRows = $('.student-checkbox:checked').toArray();
  const emailList = selectedRows.map(row => $(row).closest('tr').find('td:eq(4)').text().trim());
  console.log("emailList", emailList);
  const count = selectedRows.length;

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
    text: `Are you sure you want to reset password${count > 1 ? 's' : ''} for the selected records?`,
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
          role: 'Student',
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function(response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          dt_user.rows().deselect(); // Deselect selected rows
          toggleActionBar(); // Hide action bar

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
      })
    }
  });
});

// Graduate selected records
$('#graduateSelected').on('click', function () {
  const selectedRows = $('.student-checkbox:checked').map(function () { return $(this).val() }).get();
  const count = selectedRows.length;

  if (count === 0) {
    Swal.fire({
      title: 'No Records Selected',
      text: 'Please select at least one record to graduate.',
      icon: 'info',
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
    return;
  }

  Swal.fire({
    title: `Graduate ${count} Selected Record${count > 1 ? 's' : ''}?`,
    text: `Are you sure you want to move the selected record${count > 1 ? 's' : ''} to the alumni list?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Yes, graduate ${count > 1 ? 'them' : 'it'}!`,
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'btn btn-success me-3',
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
        url: "/sysAdmin/Admin/Account-Management/batchTransferStudent/",
        type: "POST",
        data: {
          userIDList: selectedRows,
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function(response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          dt_user.rows().deselect(); // Deselect rows after action
          toggleActionBar(); // Hide action bar

          Swal.fire({
            title: 'Students Graduated!',
            text: `The selected record${count > 1 ? 's have' : ' has'} been moved to the alumni list.`,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          })
          .then(() => {
            dt_user.ajax.reload(null, false );
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
            customClass: { confirmButton: 'btn btn-danger' },
            buttonsStyling: false
          });
        }
      })
    }
  });
});

// Delete selected records
$('#deleteSelected').on('click', function () {
  const selectedRows = $('.student-checkbox:checked').map(function () { return $(this).val() }).get();
  const count = selectedRows.length;

  if (count === 0) {
    Swal.fire({
      title: 'No Records Selected',
      text: 'Please select at least one record to delete.',
      icon: 'info',
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
    return;
  }

  Swal.fire({
    title: `Delete ${count} Selected Record${count > 1 ? 's' : ''}?`,
    text: `Are you sure you want to delete the selected record${count > 1 ? 's' : ''}?`,
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
              title: 'Deletion failed',
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

          dt_user.rows().deselect(); // Deselect rows after action
          toggleActionBar(); // Hide action bar

          Swal.fire({
            title: 'Deleted!',
            text: `The selected record${count > 1 ? 's have' : ' has'} been deleted.`,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          })
          .then(() => {
            dt_user.ajax.reload(null, false );
          })
        }
      });
    }
  });
});

    // Add SweetAlert2 to dropdown actions
    $(document).on('click', '.reset-password-student', function () {
      const row = $(this).closest('tr');
      const email = row.find('td:eq(4)').text().trim();

      Swal.fire({
        title: 'Reset Password?',
        text: "Are you sure you want to reset the password for this student?",
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
              role: 'Student',
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
          })
        }
      });
    });

    $(document).on('click', '.graduate-student', function () {
      const thisBtn = $(this);
      Swal.fire({
        title: 'Graduate Student?',
        text: "Are you sure you want to move this student to the alumni list?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, graduate!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-success me-3',
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
                  title: 'Promotion failed',
                  text: 'Please try reloading the page or try again.',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false
              })
          }, 30000); // Change 5000 to any delay you want in milliseconds

          // Perform graduate action
          $.ajax({
            url: "/sysAdmin/Admin/Account-Management/transferStudent/",
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
                title: 'Student Graduated!',
                text: "The student has been moved to the alumni list.",
                icon: 'success',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
                buttonsStyling: false
              })
              .then(() => {
                // Reload the table after successful graduate while maintaining pagination
                const row = thisBtn.closest('tr');
                dt_user.row(row).remove().draw();
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
          })
        }
      });
    });

    $(document).on('click', '.delete-record-student', function () {
      Swal.fire({
        title: 'Delete Student?',
        text: "Are you sure you want to delete this student?",
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
                text: "The student's account has been deleted.",
                icon: 'success',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
                buttonsStyling: false
              })
              .then(() => {
                dt_user.row($(this).parents('tr')).remove().draw();
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
          })
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