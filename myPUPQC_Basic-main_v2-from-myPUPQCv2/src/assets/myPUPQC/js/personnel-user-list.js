'use strict';

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

  var dt_personnel_table = $('.datatables-personnel'),
    select2 = $('.select2'),
    personnelView = '/app/personnel/view/account/',
    statusObj = {
      Active: { title: 'Active', class: 'bg-label-success' },
      Inactive: { title: 'Inactive', class: 'bg-label-danger' },
      Pending: { title: 'Pending', class: 'bg-label-warning' }
    },
    roleAccessObj = {
      'Faculty': { title: 'Faculty', class: 'bg-label-primary' },
      'Moderator': { title: 'Moderator', class: 'bg-label-warning' },
      'Academic Head': { title: 'Academic Head', class: 'bg-label-info' },
      'Academic Staff': { title: 'Academic Staff', class: 'bg-label-secondary' },
      'Admin': { title: 'Admin', class: 'bg-label-success' },
    };

  if (select2.length) {
    var $this = select2;
    select2Focus($this);
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Role',
      dropdownParent: $this.parent()
    });
  }

  // Personnel datatable
  if (dt_personnel_table.length) {
    var dt_personnel = dt_personnel_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: '/sysAdmin/Admin/Account-Management/getPersonnelList/',
        data: function(d) {
          d.role = $('#UserPersonnelRole').val();
          d.status = $('#UserPersonnelStatus').val();
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
        { data: 'personnelNumber' },
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
          className: 'control',
          orderable: false,
          searchable: false,
          responsivePriority: 2,
          targets: 0,
          visible: false,
          render: function () { return ''; }
        },
        {
          targets: 1,
          orderable: false,
          visible: true,
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input personnel-checkbox">';
          },
          checkboxes: { selectRow: true, selectAllRender: '<input type="checkbox" class="form-check-input">' }
        },
        {
          targets: 2,
          responsivePriority: 3,
          render: function (data, type) {
            return type === 'display' ? `<div class="d-flex align-items-center"><span style="color: black !important; font-size: smaller;">${data}</span></div>` : data;
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
          targets: -2,
          render: function (data, type, full) {
            return `<span class="badge rounded-pill ${statusObj[full['status']].class}" style="font-size: smaller;">${statusObj[full['status']].title}</span>`;
          }
        },
        {
          targets: -1,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full) {
            return `<div class="d-inline-block text-nowrap">
              <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                <i class="mdi mdi-dots-vertical mdi-20px"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end m-0">
                <a href="javascript:;" class="dropdown-item reset-password-personnel" data-id="${full.userID}" style="font-size: smaller;">
                  <i class="mdi mdi-lock-reset me-2"></i><span>Reset Password</span>
                </a>
                <a href="javascript:;" class="dropdown-item role-personnel" data-id="${full.userID}" data-bs-toggle="modal" data-bs-target="#addPersonnelRoleModal" style="font-size: smaller;">
                  <i class="mdi mdi-account-key me-2"></i><span>Role Access</span>
                </a>
                <a href="javascript:;" class="dropdown-item edit-personnel" data-id="${full.userID}" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" style="font-size: smaller;">
                    <i class="mdi mdi-pencil-outline me-2"></i><span>Edit</span>
                  </a>
                <a href="javascript:;" class="dropdown-item delete-record-personnel" data-id="${full.userID}" style="font-size: smaller;">
                  <i class="mdi mdi-delete-outline me-2"></i><span>Delete</span>
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
                // Customize print view for dark
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
          text: '<i class="mdi mdi-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Personnel</span>',
          className: 'add-new btn btn-primary waves-effect waves-light',
          attr: {
            'data-bs-toggle': 'modal',
            'data-bs-target': '#addPersonnelModal'
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
              return col.title !== ''
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '"><td>' +
                    col.title +
                    ':</td> <td>' +
                    col.data +
                    '</td></tr>'
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
          .columns(4)
          .every(function () {
            var column = this;
            var $container = $('.user_personnelRole').empty();
            var select = $(
              '<select id="UserPersonnelRole" class="form-select text-capitalize"><option value="">Select Role</option></select>'
            )
              .appendTo($container)
              .on('change', function () {
                dt_personnel.ajax.reload();
              });

            // Get unique roles
            var roles = ["Admin", "Academic Head", "Academic Staff"];

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
              '<select id="UserPersonnelStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.user_personnelStatus')
              .on('change', function () {
                dt_personnel.ajax.reload();
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
    document.dt_personnel = dt_personnel;

    // Bind selection event to toggle personnel action bar
    dt_personnel.on('select deselect', function () {
      togglepersonnel_actionBar();
    });
  }

  function togglepersonnel_actionBar() {
    var selectedRows = dt_personnel.rows({ selected: true }).count();
    if (selectedRows > 0) {
      $('#personnel_actionBar').show();
      $('#personnel_selectedCount').text(selectedRows + ' Selected');

      if (selectedRows === 1) {
        $('#personnel_editSelected').show().prop('disabled', false);
      } else {
        $('#personnel_editSelected').hide().prop('disabled', true);
      }
    } else {
      $('#personnel_actionBar').hide();
      $('#personnel_editSelected').prop('disabled', true);
    }
  }

  // Personnel Action Bar Event Handlers
  $(document).on('click', '#personnel_closeActionBar', function() {
    dt_personnel.rows().deselect();
    togglepersonnel_actionBar();
  });

  $(document).on('click', '#personnel_resetPassword', function() {
    // Use the correct selector for personnel checkboxes
    const selectedRows = $('.personnel-checkbox:checked').toArray();
    const emailList = selectedRows.map(row => $(row).closest('tr').find('td:eq(4)').text().trim());
    const count = selectedRows.length;

    Swal.fire({
      title: `Reset ${count} Password${count > 1 ? 's' : ''}?`,
      text: `Are you sure you want to reset password${count > 1 ? 's' : ''} for selected personnel?`,
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
        }, 60000);

        let timeout2 = setTimeout(() => {
            Swal.close();
            Swal.fire({
                title: 'Failed to request reset link',
                text: 'Please try reloading the page or try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            });
        }, 120000);

        $.ajax({
          url: "/batchForgotPasswordRequest/",
          type: "POST",
          data: {
            emailList: emailList,
            role: 'Personnel',
            csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
          },
          success: function(response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            dt_personnel.rows().deselect();
            togglepersonnel_actionBar();

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

  $(document).on('click', '#personnel_deleteSelected', function() {
    const selectedRows = $('.personnel-checkbox:checked').map(function () { return $(this).val() }).get();
    const count = selectedRows.length;

    Swal.fire({
      title: `Delete ${count} Record${count > 1 ? 's' : ''}?`,
      text: `Are you sure you want to delete selected personnel record${count > 1 ? 's' : ''}?`,
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
        }, 5000);

        let timeout2 = setTimeout(() => {
            Swal.close();
            Swal.fire({
                title: 'Deletion failed',
                text: 'Please try reloading the page or try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            });
        }, 30000);

        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/batchDeletePersonnel/",
          type: "POST",
          data: {
            userIDList: selectedRows,
            csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
          },
          success: function(response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            dt_personnel.rows().deselect();
            togglepersonnel_actionBar();

            Swal.fire({
              title: 'Deleted!',
              text: `The selected record${count > 1 ? 's have' : ' has'} been deleted.`,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success' },
              buttonsStyling: false
            })
            .then(() => {
              dt_personnel.ajax.reload(null, false );
            });
          }
        });
      }
    });
  });

  // Reset Password Action for individual personnel
  $(document).on('click', '.reset-password-personnel', function () {
    const row = $(this).closest('tr');
    const email = row.find('td:eq(4)').text().trim();

    Swal.fire({
      title: 'Reset Personnel Password?',
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
        }, 5000);

        let timeout2 = setTimeout(() => {
            Swal.close();
            Swal.fire({
                title: 'Failed to request reset link',
                text: 'Please try reloading the page or try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            });
        }, 30000);

        $.ajax({
          url: "/forgotPasswordRequest/",
          type: "POST",
          data: {
            email: email,
            role: 'Personnel',
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
            });
          }
        });
      }
    });
  });

  // Delete Personnel Action for individual personnel
  $(document).on('click', '.delete-record-personnel', function () {
    Swal.fire({
      title: 'Delete Personnel Member?',
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
        let personnelID = $(this).data('id');

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
        }, 5000);

        let timeout2 = setTimeout(() => {
            Swal.close();
            Swal.fire({
                title: 'Failed to process data',
                text: 'Please try reloading the page or try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            });
        }, 30000);

        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/deletePersonnel/",
          type: "POST",
          data: {
            userID: personnelID,
            csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
          },
          success: function(response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Deleted!',
              text: "The personnel's account has been deleted.",
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success'
              },
              buttonsStyling: false
            })
            .then(() => {
              dt_personnel.row($(this).parents('tr')).remove().draw();
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
              customClass: {
                confirmButton: 'btn btn-danger'
              },
              buttonsStyling: false
            });
          }
        });
      }
    });
  });

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
