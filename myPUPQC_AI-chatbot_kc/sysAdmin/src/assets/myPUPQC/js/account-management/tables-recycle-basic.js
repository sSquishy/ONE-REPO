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
      ajax: assetsPath + 'myPUPQC/json/datatable-recycle-list.json',
      columns: [
        { data: null, title: '' },
        { data: 'id', title: 'ID' },
        { data: 'user_type', title: 'User Type' },
        { data: 'user_number', title: 'User Number' },
        { data: 'name', title: 'Name' },
        { data: 'dob', title: 'Date of Birth' },
        { data: 'email', title: 'Email' },
        { data: 'webmail', title: 'Webmail' },
        { data: null, title: 'Actions' }
      ],
      columnDefs: [
        {
          className: 'control',
          searchable: false,
          orderable: false,
          responsivePriority: 2,
          targets: 0,
          render: function () {
            return '';
          }
        },
        {
          targets: 1,
          orderable: false,
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
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
              row.id +
              '">Reactivate</a></li>' +
              '<li><a href="javascript:;" class="dropdown-item text-danger delete-record" data-id="' +
              row.id +
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
              return 'Details of ' + data['program_name'];
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
    var selectedIds = getSelectedRecycleIds();
    if (selectedIds.length > 0) {
      Swal.fire({
        title: 'Delete Selected?',
        text:
          'Confirm to permanently delete ' +
          selectedIds.length +
          ' record' +
          (selectedIds.length !== 1 ? 's' : '') +
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
            title: 'Deleted!',
            text: 'The selected accounts have been deleted.',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          }).then(function () {
            dt_recycle.rows({ selected: true }).remove().draw();
            actionBarRecycle.hide();
          });
        }
      });
    }
  });

  // Bulk Reactivate using the recycle action bar.
  $('#bulkReactivate').on('click', function () {
    var selectedIds = getSelectedRecycleIds();
    if (selectedIds.length > 0) {
      Swal.fire({
        title: 'Reactivate Selected?',
        text: 'Confirm to reactivate ' + selectedIds.length + ' account' + (selectedIds.length !== 1 ? 's' : '') + '.',
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
            title: 'Reactivated!',
            text: 'The selected accounts have been reactivated.',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
          // Optionally add an AJAX call here to update the backend.
          // Optionally remove reactivated rows from the table:
          dt_recycle.rows({ selected: true }).remove().draw();
          actionBarRecycle.hide();
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
        console.log('Record with ID ' + recordId + ' deleted.');
        Swal.fire({
          title: 'Deleted!',
          text: 'The account has been deleted.',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        }).then(function () {
          dt_recycle.row(deleteButton.parents('tr')).remove().draw();
        });
      } else {
        console.log('Deletion canceled for record ID ' + recordId);
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
        console.log('Record with ID ' + recordId + ' reactivated.');
        Swal.fire({
          title: 'Reactivated!',
          text: 'The account has been reactivated.',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        });
        // Optionally add an AJAX call here to update the backend.
      } else {
        console.log('Reactivation canceled for record ID ' + recordId);
      }
    });
  });
});
