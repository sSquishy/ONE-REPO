'use strict';

// Recycle Table with Action Bar for Bulk Reactivate & Delete
$(function () {
  var dt_recycle_table = $('.datatables-recycle'),
    dt_recycle;

  // Cache references for the recycle action bar elements
  var actionBarRecycle = $('#actionBarRecycle');
  var selectedCountRecycle = $('#selectedCountRecycle');

  if (dt_recycle_table.length) {
    dt_recycle = dt_recycle_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: "/sysAdmin/Admin/Account-Management/Manage-Recycle-Account/getRetainedAccounts/",
        type: 'GET',
        dataSrc: 'data'
      },
      columns: [
        { data: null, title: '' },
        { data: 'userID', title: 'ID' },
        { data: 'userType', title: 'User Type' },
        { data: 'userNumber', title: 'User Number' },
        { data: null, title: 'Name',
          render: function (data, type, row) {
            return buildFullName(row.firstname, row.middlename, row.lastname, row.suffix);
          }
         },
        { data: 'dateOfBirth', title: 'Date of Birth' },
        { data: 'emailAddress', title: 'Email' },
        { data: 'webMail', title: 'Webmail' },
        { data: null, title: 'Actions' }
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
          targets: 1,
          orderable: false,
          render: function (data, type, full, meta) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input recycle-checkbox" value="${full.userID}">`;
          },
          checkboxes: {
            selectRow: true,
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          targets: -1,
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            return (
              '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">' +
              '<i class="mdi mdi-dots-vertical"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              '<li><a href="javascript:;" class="dropdown-item text-success reactivate-record" data-id="' +
              row.userID +
              '">Reactivate</a></li>' +
              '<li><a href="javascript:;" class="dropdown-item text-danger delete-record" data-id="' +
              row.userID +
              '">Delete</a></li>' +
              '</ul>' +
              '</div>'
            );
          }
        }
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details of ' + buildFullName(data.firstname, data.middlename, data.lastname, data.suffix);
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col) {
              return col.title !== ''
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '">' +
                    '<td>' +
                    col.title +
                    ':</td>' +
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
        style: 'multi'
      }
    });

    $('div.head-label').html('<h5 class="card-title mb-0">List of Recycle Accounts</h5>');

    // Update the action bar whenever rows are selected or deselected.
    dt_recycle.on('select deselect', function () {
      var count = dt_recycle.rows({ selected: true }).count();
      if (count > 0) {
        actionBarRecycle.show();
        selectedCountRecycle.text(count + ' item' + (count > 1 ? 's' : '') + ' selected');
      } else {
        actionBarRecycle.hide();
      }
    });
  }

  // Helper: Get IDs of selected recycle table rows.
  function getSelectedRecycleIds() {
    return dt_recycle
      .rows({ selected: true })
      .data()
      .toArray()
      .map(function (item) {
        return item.id;
      });
  }

  // Bulk Delete using the recycle action bar.
  $('#bulkDeleteRecycle').on('click', function () {
    const selectedRows = $('.recycle-checkbox:checked').map(function () { 
      const userType = $(this).closest('tr').find('td:eq(1)').text();
      return JSON.stringify({
        "userID": $(this).val(),
        "userType": userType
      });
    }).get();
    const count = selectedRows.length;

    if (count > 0) {
      Swal.fire({
        title: 'Delete Selected?',
        text:
          'Confirm to permanently delete ' +
          count +
          ' record' +
          (count !== 1 ? 's' : '') +
          '.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then(function (result) {
        if (result.isConfirmed) {
          Swal.fire({
              title: "Deleting...",
              text: "Processing data...",
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
                  title: 'Deleting...',
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
                  text: 'Please reload the page and try again.',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false
              })
              .then(() => {
                  location.reload();
              })
          }, 30000); // Change 5000 to any delay you want in milliseconds

          $.ajax({
            url: "/sysAdmin/Admin/Account-Management/Manage-Recycle-Account/bulkDeleteRetainedAccounts/",
            type: 'POST',
            data: {
              retainedAccounts: selectedRows,
              csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (response) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Deleted!',
                text: 'The selected accounts have been deleted.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              }).then(function () {
                dt_recycle.ajax.reload(null, false);
                actionBarRecycle.hide();
              });
            },
            error: function(xhr, status, error) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              console.log(xhr.responseText);
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred while deleting the selected accounts.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger' },
                buttonsStyling: false
              })
            }
          })
        }
      });
    }
  });

  // Bulk Reactivate using the recycle action bar.
  $('#bulkReactivate').on('click', function () {
    const selectedRows = $('.recycle-checkbox:checked').map(function () { 
      const userType = $(this).closest('tr').find('td:eq(1)').text();
      return JSON.stringify({
        "userID": $(this).val(),
        "userType": userType
      });
    }).get();
    const count = selectedRows.length;

    if (count > 0) {
      Swal.fire({
        title: 'Reactivate Selected?',
        text: 'Confirm to reactivate ' + count + ' account' + (count !== 1 ? 's' : '') + '.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes, Reactivate!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-success me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then(function (result) {
        if (result.isConfirmed) {
          Swal.fire({
              title: "Loading...",
              text: "Processing data...",
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
                  text: 'Please reload the page and try again.',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false
              })
              .then(() => {
                  location.reload();
              })
          }, 30000); // Change 5000 to any delay you want in milliseconds

          $.ajax({
            url: "/sysAdmin/Admin/Account-Management/Manage-Recycle-Account/bulkReactivateRetainedAccounts/",
            type: 'POST',
            data: {
              retainedAccounts: selectedRows,
              csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (response) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Reactivated!',
                text: 'The selected accounts have been reactivated.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              }).then(function () {
                dt_recycle.ajax.reload(null, false);
                actionBarRecycle.hide();
              });
            },
            error: function(xhr, status, error) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              console.log(xhr.responseText);
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred while reactivating the selected accounts.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger' },
                buttonsStyling: false
              })
            }
          })
        }
      });
    }
  });

  // Close the recycle action bar: deselect all rows and hide the bar.
  $('#closeActionBarRecycle').on('click', function () {
    dt_recycle.rows().deselect();
    actionBarRecycle.hide();
  });

  // Individual Delete Record (dropdown action)
  $('.datatables-recycle tbody').on('click', '.delete-record', function () {
    var deleteButton = $(this);
    var recordId = deleteButton.attr('data-id');

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        Swal.fire({
            title: "Deleting...",
            text: "Processing data...",
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
                title: 'Deleting...',
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
                text: 'Please reload the page and try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            })
            .then(() => {
                location.reload();
            })
        }, 30000); // Change 5000 to any delay you want in milliseconds

        console.log("Deleting record with ID: " + recordId);
        console.log("User Type: " + deleteButton.closest('tr').find('td:eq(1)').text());
        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/Manage-Recycle-Account/deleteRetainedAccount/",
          type: 'POST',
          data: {
            userID: recordId,
            userType: deleteButton.closest('tr').find('td:eq(1)').text(),
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Deleted!',
              text: 'The account has been deleted.',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success' },
              buttonsStyling: false
            }).then(function () {
              dt_recycle.ajax.reload(null, false);
            });
          },
          error: function(xhr, status, error) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            console.log(xhr.responseText);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while deleting the account.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            })
          }
        })
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'The account is safe :)',
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        })
      }
    });
  });

  // Individual Reactivate Record (dropdown action)
  $('.datatables-recycle tbody').on('click', '.reactivate-record', function () {
    var reactivateButton = $(this);
    var recordId = reactivateButton.attr('data-id');

    Swal.fire({
      title: 'Reactivate Account?',
      text: 'This account will be restored.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes, reactivate it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-success me-3',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        Swal.fire({
            title: "Retrieving...",
            text: "Processing data...",
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
                title: 'Retrieving...',
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
                text: 'Please reload the page and try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            })
            .then(() => {
                location.reload();
            })
        }, 30000); // Change 5000 to any delay you want in milliseconds
          $.ajax({
            url: "/sysAdmin/Admin/Account-Management/Manage-Recycle-Account/reactivateRetainedAccount/",
            type: 'POST',
            data: {
              userID: recordId,
              userType: reactivateButton.closest('tr').find('td:eq(1)').text(),
              csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (response) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Reactivated!',
                text: 'The account has been reactivated.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              }).then(function () {
                dt_recycle.ajax.reload(null, false);
              });
            },
            error: function(xhr, status, error) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              console.log(xhr.responseText);
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred while reactivating the account.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger' },
                buttonsStyling: false
              })
            }
          })
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'The account remains deactivated.',
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        })
      }
    });
  });
});
