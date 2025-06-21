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
    1: { title: 'Active', class: 'bg-label-success' },
    2: { title: 'Inactive', class: 'bg-label-secondary' },
    3: { title: 'Pending', class: 'bg-label-primary' }
  },
  roleAccessObj = {
    'system admin': { title: 'System Admin', class: 'bg-label-primary' },
    'moderator': { title: 'Moderator', class: 'bg-label-info' }
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
      ajax: assetsPath + 'myPUPQC/json/user-faculty-list.json', // JSON file to add data
      columns: [
        // columns according to JSON
        { data: '' },
        { data: 'id' },
        { data: 'employee_id' },
        { data: 'full_name' },
        { data: 'role_access' },
        { data: 'email' },
        { data: 'created_date' },
        { data: 'status' },
        { data: 'action' }
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
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
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
          // Alumni full name
          targets: 3,
          responsivePriority: 4,
          render: function (data, type, full, meta) {
            var $full_name = full['full_name'];

            return `
              <div class="d-flex justify-content-start align-items-center user-name">
                <div class="d-flex flex-column">
                  <span class="fw-medium" style="color: black !important; font-size: smaller;">${$full_name}</span>
                </div>
              </div>
            `;
          }
        },
        {
          // Role Access Column (index 4)
          targets: 4,
          render: function (data, type, full, meta) {
            const roleAccessObj = {
              'system admin': { title: 'System Admin', class: 'bg-label-primary' },
              'moderator': { title: 'Moderator', class: 'bg-label-info' }
            };

            const roles = Array.isArray(data) ? data : [data];

            return roles.map(role => {
              const roleKey = role.toLowerCase();
              if (roleAccessObj[roleKey]) {
                return `<span class="badge rounded-pill ${roleAccessObj[roleKey].class} me-1" style="color: black; font-size: smaller;">${roleAccessObj[roleKey].title}</span>`;
              }
              return '';
            }).join('');
          }
        },
        {
          // Email
          targets: 5,
          responsivePriority: 6,
          render: function (data, type, full, meta) {
            var $email = full['email'];
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
            var $created_date = full['created_date'];
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
                  <a href="javascript:;" class="dropdown-item reset-password" data-id="${full.faculty_id}">
                    <i class="mdi mdi-lock-reset me-2"></i><span style="font-size: smaller;">Reset Password</span>
                  </a>

                  <a href="javascript:;"
                    class="dropdown-item role-faculty"
                    data-id="${full.faculty_id}"
                    data-bs-toggle="modal"
                    data-bs-target="#addRoleModal">
                    <i class="mdi mdi-account-key me-2"></i>
                    <span style="font-size: smaller;">Role Access</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-record" data-id="${full.faculty_id}">
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
                columns: [1, 2, 3, 4, 5],
                // prevent avatar to be print
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
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
                columns: [1, 2, 3, 4, 5],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
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
                columns: [1, 2, 3, 4, 5],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
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
                columns: [1, 2, 3, 4, 5],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
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
                columns: [1, 2, 3, 4, 5],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
                    });
                    return result;
                  }
                }
              }
            }
          ]
        }
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
              '<select class="form-select text-capitalize"><option value="">Select Role</option></select>'
            )
              .appendTo($container)
              .on('change', function () {
                var val = $(this).val();
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            // Get unique roles
            var roles = column.data().reduce(function (acc, d) {
              if (Array.isArray(d)) d.forEach(role => acc.add(role.toLowerCase()));
              else if (d) acc.add(d.toLowerCase());
              return acc;
            }, new Set());

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
              '<select id="facultyStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.user_facultyStatus')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
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
  }

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
  const selectedRows = dt_faculty.rows({ selected: true });
  const count = selectedRows.count();

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
      selectedRows.every(function () {
        const rowData = this.data();
        console.log('Resetting password for:', rowData.id);
        return true;
      });

      // Deselect selected rows after successful reset
      dt_faculty.rows().deselect();

      Swal.fire({
        title: 'Passwords Reset!',
        text: `Successfully reset ${count} password${count > 1 ? 's' : ''}.`,
        icon: 'success',
        customClass: { confirmButton: 'btn btn-success' },
        buttonsStyling: false
      });
    }
  });
});


$(document).on('click', '#faculty_deleteSelected', function() {
  const selectedRows = dt_faculty.rows({ selected: true });
  const count = selectedRows.count();

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
      selectedRows.remove().draw();
      togglefaculty_actionBar();

      Swal.fire({
        title: 'Deleted!',
        text: `Successfully deleted ${count} record${count > 1 ? 's' : ''}.`,
        icon: 'success',
        customClass: { confirmButton: 'btn btn-success' },
        buttonsStyling: false
      });
    }
  });
});

$(document).on('click', '#faculty_editSelected', function() {
  const selectedRow = dt_faculty.row({ selected: true });
  if (selectedRow.any()) {
    const rowData = selectedRow.data();
    $('#editFacultyModal').data('facultyId', rowData.id).modal('show');

    // Populate modal fields example:
    // $('#edit_faculty_id').val(rowData.faculty_id);
    // $('#edit_full_name').val(rowData.full_name);
    // $('#edit_department').val(rowData.department);

    console.log('Editing faculty:', rowData.id);
  }
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
    $(document).on('click', '.reset-password', function () {
      const facultyId = $(this).data('id');
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
          // Add actual password reset logic here
          Swal.fire({
            title: 'Password Reset!',
            text: "New temporary password: 123456", // Replace with actual generated password
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' }
          });
        }
      });
    });

    // Delete Faculty Action
    $(document).on('click', '.delete-record', function () {
      const facultyId = $(this).data('id');
      const row = $(this).closest('tr');

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
          // Actual delete API call should go here
          dt_faculty.row(row).remove().draw();
          Swal.fire({
            title: 'Deleted!',
            text: "Faculty member removed from system",
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' }
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
