/**
 * DataTables Extensions with Bulk Actions for Program List
 */
'use strict';

$(function () {
  // Cache references to Action Bar and Selected Count elements
  const actionBar = $('#actionBar');
  const selectedCount = $('#selectedCount');

  const dt_basic_table = $('.dt-basic-table'); // Ensure your table has this class
  let dt_basic;

  // Initialize DataTable if the table element exists
  if (dt_basic_table.length) {
    dt_basic = dt_basic_table.DataTable({
      ajax: assetsPath + 'myPUPQC/json/datatable-program-list.json', // JSON data source for programs
      columns: [
        {
          data: 'id',
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          }
        },
        { data: 'program_name' }, // Program Name column
        { data: 'acronym' }, // Acronym column
        { data: 'created_date' }, // Created Date column
        {
          data: 'id',
          render: function (data, type, row) {
            return `
              <div class="d-inline-block">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="mdi mdi-dots-vertical"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item item-edit" data-id="${data}">
                      <i class="mdi mdi-pencil-outline me-2"></i>Edit
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger item-delete" data-id="${data}">
                      <i class="mdi mdi-delete-outline me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>`;
          }
        }
      ],
      columnDefs: [
        {
          targets: 0,
          searchable: false,
          orderable: false,
          checkboxes: {
            selectRow: true,
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          targets: -1,
          orderable: false,
          searchable: false
        }
      ],
      order: [[1, 'desc']],
      dom:
        '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-end"f>>' +
        '<"table-responsive"t>' +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      initComplete: function () {
        $('.dataTables_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#addProgramModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add Program</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });

    // Update the Action Bar when rows are selected or deselected.
    dt_basic.on('select deselect', function () {
      const count = dt_basic.rows({ selected: true }).count();
      if (count > 0) {
        actionBar.show();
        selectedCount.text(count + ' item' + (count > 1 ? 's' : '') + ' selected');
      } else {
        actionBar.hide();
      }
      // Disable bulk Edit button if not exactly one row is selected.
      $('#programEdit').prop('disabled', count !== 1);
    });
  }

  // Helper function to get selected row IDs
  function getSelectedIds() {
    return dt_basic
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }

  // Bulk Edit: Directly open edit modal if exactly one record is selected.
  $('#programEdit').on('click', function () {
    var selectedData = dt_basic.rows({ selected: true }).data();
    if (selectedData.length === 1) {
      var recordId = selectedData[0].id;
      // Set the id in the edit modal as needed
      $('#editProgramModal').find('input[name="id"]').val(recordId);
      // Open the edit modal
      var modal = new bootstrap.Modal(document.getElementById('editProgramModal'));
      modal.show();
    } else if (selectedData.length > 1) {
      alert('Please select only one record to edit.');
    }
  });

  // Bulk Delete: Confirm and perform deletion for selected records.
  $('#programDelete').on('click', function () {
    var selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      alert('Please select at least one record to delete.');
      return;
    }
    Swal.fire({
      title: 'Delete Selected?',
      text:
        'Confirm to permanently delete ' +
        selectedIds.length +
        ' record' +
        (selectedIds.length !== 1 ? 's' : '') +
        '. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performBulkOperation('delete', selectedIds);
        dt_basic.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  });

  // Bulk Activate: Confirm and perform activation for selected records.
  $('#programActivate').on('click', function () {
    var selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      alert('Please select at least one record to activate.');
      return;
    }
    Swal.fire({
      title: 'Activate Selected?',
      text: 'Confirm to activate ' + selectedIds.length + ' record' + (selectedIds.length !== 1 ? 's' : '') + '.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-success me-3 waves-effect',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performBulkOperation('activate', selectedIds);
        dt_basic.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  });

  // Close Action Bar: Deselect all rows and hide the action bar.
  $('#closeActionBar').on('click', function () {
    dt_basic.rows().deselect();
    actionBar.hide();
  });

  // Individual Delete Action (from dropdown)
  $(document).on('click', '.item-delete', function () {
    const programId = $(this).data('id');
    Swal.fire({
      title: 'Delete Program?',
      text: 'Confirm to delete this program. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performSingleOperation('delete', programId);
      }
    });
  });

  // Individual Edit Action (from dropdown)
  $(document).on('click', '.item-edit', function () {
    const programId = $(this).data('id');
    $('#editProgramModal').modal('show');
  });

  // Alert Handlers using Swal
  function performBulkOperation(action, ids) {
    console.log(`Performing bulk ${action} on:`, ids);
    // Simulate API call and show a success alert.
    Swal.fire({
      title: 'Success!',
      text: `Successfully ${action}d ${ids.length} item${ids.length !== 1 ? 's' : ''}`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    }).then(() => {
      if (action === 'delete' || action === 'activate') {
        console.log(`Removing rows for bulk ${action}`);
        // Remove rows that match any ID in the ids array.
        dt_basic
          .rows(function (idx, data, node) {
            return ids.includes(data.id);
          })
          .remove()
          .draw();
      }
    });
  }

  function performSingleOperation(action, id) {
    console.log(`Performing ${action} on user:`, id);
    // Simulate API call and show a success alert.
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Successful!`,
      text: `User has been ${action}d successfully`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    }).then(() => {
      if (action === 'delete' || action === 'activate') {
        console.log(`Removing row for ${action} of ID:`, id);
        dt_basic
          .rows(function (idx, data, node) {
            return data.id == id;
          })
          .remove()
          .draw();
      }
    });
  }

  // Helper Function: Get selected IDs
  function getSelectedIds() {
    return dt_basic
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }
});
