/**
 * Page Alumni List
 */

'use strict';

// Datatable (jquery)
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

  var dt_faculty_table = $('.datatables-faculty'),
  select2 = $('.select2'),
  facultyView = '/app/faculty/view/account/',
  statusObj = {
    Active: { title: 'Active', class: 'bg-label-success' },
    Inactive: { title: 'Inactive', class: 'bg-label-danger' },
    Pending: { title: 'Pending', class: 'bg-label-warning' }
  },
  roleAccessObj = {
    'Faculty': { title: 'Faculty', class: 'bg-label-primary' },
    'Moderator': { title: 'Moderator', class: 'bg-label-warning' },
    'Academic Head': { title: 'Academic Head', class: 'bg-label-info' },
    'Admin': { title: 'Admin', class: 'bg-label-success' },
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
  if (dt_faculty_table.length) {
    var dt_faculty = dt_faculty_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: '/sysAdmin/Admin/Account-Management/getFacultyList/',
        data: function(d) {
          d.role = $('#UserFacultyRole').val();
          d.status = $('#UserFacultyStatus').val();
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
        { data: 'facultyNumber' },
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
        { data: 'role' },
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
          visible: false, // Add this line to hide the column
          render: function (data, type, full, meta) {
            return '';
          }
        },
        {
          // For Checkboxes (now at position 1)
          targets: 1,
          orderable: false,
          visible: true, // Ensure checkboxes column is visible
          render: function (data, type, full, meta) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input faculty-checkbox" value="${full['userID']}">`;
          },
          checkboxes: {
            selectRow: true,
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          // Employee Number Column
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
          // Role Access Column (index 4)
          targets: 4,
          render: function (data, type, full, meta) {
            const roles = Array.isArray(data) ? data : [data];

            return roles.map(role => {
              if (roleAccessObj[role]) {
                return `<span class="badge rounded-pill ${roleAccessObj[role].class} me-1" style="color: black; font-size: smaller;">${roleAccessObj[role].title}</span>`;
              }
              return '-';
            }).join('');
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
          // Alumni Status
          targets: -2,
          render: function (data, type, full, meta) {
            var $status = full['status'];

            return (
              '<span class="badge rounded-pill ' +
              statusObj[$status].class +
              '" text-capitalized style="font-size: smaller;">' +
              statusObj[$status].title +
              '</span>'
            );
          }
        },
        {
          // Actions column configuration
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
                  <a href="javascript:;" class="dropdown-item reset-password-faculty" data-id="${full.userID}">
                    <i class="mdi mdi-lock-reset me-2"></i><span style="font-size: smaller;">Reset Password</span>
                  </a>

                  <a href="javascript:;"
                    class="dropdown-item role-faculty"
                    data-id="${full.userID}"
                    data-bs-toggle="modal"
                    data-bs-target="#addRoleModal">
                    <i class="mdi mdi-account-key me-2"></i>
                    <span style="font-size: smaller;">Role Access</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-record-faculty" data-id="${full.userID}">
                    <i class="mdi mdi-delete-outline me-2"></i><span style="font-size: smaller;">Delete</span>
                  </a>
                </div>
              </div>`;
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
        // Role Access Filter
        this.api()
          .columns(4) // Role column index
          .every(function () {
            var column = this;
            var $container = $('.user_roleAccess').empty();
            var select = $(
              '<select id="UserFacultyRole" class="form-select text-capitalize"><option value="">Select Role</option></select>'
            )
              .appendTo($container)
              .on('change', function () {
                dt_faculty.ajax.reload();
              });

            // Get unique roles
            var roles = ["Faculty", "Moderator", "Academic Head", "Admin"];

            // Populate dropdown
            Array.from(roles).sort().forEach(function (roleKey) {
              var title = roleAccessObj[roleKey] ? roleAccessObj[roleKey].title : roleKey;
              select.append('<option value="' + roleKey + '">' + title + '</option>');
            });
          });

        // Adding status filter once table initialized
        this.api()
          .columns(-2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserFacultyStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.user_facultyStatus')
              .on('change', function () {
                dt_faculty.ajax.reload();
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
    document.dt_faculty = dt_faculty;
  }

  // Reloads the table when their respective tab is selected
  $('[tab-name="faculty"]').on("click", function() {
    document.dt_faculty.ajax.reload(null, false);
  });

function togglefaculty_actionBar() {
  var selectedRows = dt_faculty.rows({ selected: true }).count();
  if (selectedRows > 0) {
    $('#faculty_actionBar').show();
    $('#faculty_selectedCount').text(selectedRows + ' Selected');

    if (selectedRows === 1) {
      $('#faculty_editSelected').show().prop('disabled', false);
    } else {
      $('#faculty_editSelected').hide().prop('disabled', true);
    }
  } else {
    $('#faculty_actionBar').hide();
    $('#faculty_editSelected').prop('disabled', true);
  }
}

// Faculty Action Bar Event Handlers
$(document).on('click', '#faculty_closeActionBar', function() {
  dt_faculty.rows().deselect();
  togglefaculty_actionBar();
});

$(document).on('click', '#faculty_resetPassword', function () {
  const selectedRows = $('.faculty-checkbox:checked').toArray();
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
    text: `Are you sure you want to reset password${count > 1 ? 's' : ''} for selected faculty?`,
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
          role: 'Faculty',
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function(response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          dt_faculty.rows().deselect(); // Deselect selected rows
          togglefaculty_actionBar(); // Hide action bar

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


$(document).on('click', '#faculty_deleteSelected', function() {
  const selectedRows = $('.faculty-checkbox:checked').map(function () { return $(this).val() }).get();
  const count = selectedRows.length;

  Swal.fire({
    title: `Delete ${count} Record${count > 1 ? 's' : ''}?`,
    text: `Are you sure you want to delete selected faculty record${count > 1 ? 's' : ''}?`,
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
        url: "/sysAdmin/Admin/Account-Management/batchDeleteFaculty/",
        type: "POST",
        data: {
          userIDList: selectedRows,
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function(response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          dt_faculty.rows().deselect(); // Deselect rows after action
          togglefaculty_actionBar(); // Hide action bar

          Swal.fire({
            title: 'Deleted!',
            text: `The selected record${count > 1 ? 's have' : ' has'} been deleted.`,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          })
          .then(() => {
            dt_faculty.ajax.reload(null, false );
          })
        }
      });
    }
  });
});

// Selection Management
function togglefaculty_actionBar() {
  const selectedRows = dt_faculty.rows({ selected: true });
  const count = selectedRows.count();

  $('#faculty_actionBar').toggle(count > 0);
  $('#faculty_selectedCount').text(`${count} Selected`);
  $('#faculty_editSelected').toggle(count === 1).prop('disabled', count !== 1);
}

// Initialize DataTable events
dt_faculty.on('select deselect', togglefaculty_actionBar);

    // Reset Password Action
    $(document).on('click', '.reset-password-faculty', function () {
      const row = $(this).closest('tr');
      const email = row.find('td:eq(4)').text().trim();

      Swal.fire({
        title: 'Reset Faculty Password?',
        text: "This will generate a new temporary password.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm Reset',
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
              role: 'Faculty',
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

    // Delete Faculty Action
    $(document).on('click', '.delete-record-faculty', function () {
      Swal.fire({
        title: 'Delete Faculty Member?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete Permanently',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          let facultyID = $(this).data('id');

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
                  title: 'Failed to process data',
                  text: 'Please try reloading the page or try again.',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false
              })
          }, 30000); // Change 5000 to any delay you want in milliseconds

          // Perform delete action
          $.ajax({
            url: "/sysAdmin/Admin/Account-Management/deleteFaculty/",
            type: "POST",
            data: {
              userID: facultyID,
              csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function(response) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Deleted!',
                text: "The faculty's account has been deleted.",
                icon: 'success',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
                buttonsStyling: false
              })
              .then(() => {
                dt_faculty.row($(this).parents('tr')).remove().draw();
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
