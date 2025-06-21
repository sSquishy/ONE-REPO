/**
 * DataTables Extensions with Bulk Actions
 */

'use strict';

$(function () {
  const dt_select_table = $('.dt-select-table');
  const actionBar = $('#actionBar');
  const selectedCount = $('#selectedCount');
  let dt_select;

  // Initialize DataTable
  if (dt_select_table.length) {
    dt_select = dt_select_table.DataTable({
      ajax: assetsPath + 'myPUPQC/json/datatable-bulkUpload-list.json',
      columns: [
        {
          data: 'id',
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          }
        },
        { data: 'user_type' },
        { data: 'user_number' },
        { data: 'name' },
        { data: 'date_of_birth' },
        { data: 'program' },
        { data: 'email' },
        { data: 'webmail' },
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
                  <li>
                    <a href="javascript:;" class="dropdown-item item-activate" data-id="${data}">
                      <i class="mdi mdi-check-circle-outline me-2"></i>Activate
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
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#bulkUploadModal">' +
            '<i class="mdi mdi-plus me-1"></i> Upload Bulk</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });

    // Update action bar when rows are selected/deselected.
    function toggleActionBar() {
      const selectedRows = dt_select.rows({ selected: true });
      const count = selectedRows.count();
      actionBar.toggle(count > 0);
      selectedCount.text(`${count} item${count !== 1 ? 's' : ''} selected`);
      $('#bulkEdit')
        .toggle(count === 1)
        .prop('disabled', count !== 1);
    }
    dt_select.on('select deselect', toggleActionBar);

    // Close Action Bar
    $('#closeActionBar').click(() => {
      dt_select.rows().deselect();
      toggleActionBar();
    });
  }

  // Bulk Action Handlers
  $('#bulkEdit').click(handleBulkEdit);
  $('#bulkActivate').click(handleBulkActivate);
  $('#bulkDelete').click(handleBulkDelete);

  // Individual Action Handlers
  $(document).on('click', '.item-activate', handleActivate);
  $(document).on('click', '.item-delete', handleDelete);
  $(document).on('click', '.item-edit', handleEdit);

  // Bulk Action Functions
  function handleBulkEdit() {
    const selectedIds = getSelectedIds();
    showBulkAlert({
      action: 'edit',
      title: 'Edit Selected Items',
      text: `Edit settings for ${selectedIds.length} items`,
      icon: 'info',
      confirmText: 'Open Editor'
    });
  }

  function handleBulkActivate() {
    const selectedIds = getSelectedIds();
    showBulkAlert({
      action: 'activate',
      title: 'Activate Selected',
      text: `Activate ${selectedIds.length} user${selectedIds.length !== 1 ? 's' : ''}`,
      icon: 'warning',
      confirmText: 'Confirm Activation'
    });
  }

  function handleBulkDelete() {
    const selectedIds = getSelectedIds();
    showBulkAlert({
      action: 'delete',
      title: 'Delete Selected',
      text: `Permanently delete ${selectedIds.length} user${selectedIds.length !== 1 ? 's' : ''}`,
      icon: 'error',
      confirmText: 'Confirm Delete'
    });
  }

  // Individual Action Functions
  function handleActivate() {
    const userId = $(this).data('id');
    showSingleAlert(
      {
        action: 'activate',
        title: 'Activate User',
        text: 'Are you sure you want to activate this user?',
        icon: 'warning',
        confirmText: 'Yes, activate'
      },
      userId
    );
  }

  function handleDelete() {
    const userId = $(this).data('id');
    showSingleAlert(
      {
        action: 'delete',
        title: 'Delete User',
        text: 'Are you sure you want to delete this user?',
        icon: 'error',
        confirmText: 'Yes, delete'
      },
      userId
    );
  }

  function handleEdit() {
    const userId = $(this).data('id');
    console.log('Editing user:', userId);
    $('#editUserModal').modal('show');
  }

  // Alert Handlers using Swal
  function showBulkAlert(config) {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonText: config.confirmText,
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: `btn btn-${config.action === 'delete' ? 'danger' : 'primary'} me-3 waves-effect waves-light`,
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        console.log(`Bulk ${config.action} confirmed for IDs:`, selectedIds);
        performBulkOperation(config.action, selectedIds);
        dt_select.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  }

  function showSingleAlert(config, userId) {
    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonText: config.confirmText,
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: `btn btn-${config.action === 'delete' ? 'danger' : 'success'} me-3 waves-effect waves-light`,
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        console.log(`Single ${config.action} confirmed for ID:`, userId);
        performSingleOperation(config.action, userId);
      }
    });
  }

  // Operation Handlers - Remove rows for "activate" and "delete" actions.
  function performBulkOperation(action, ids) {
    console.log(`Performing bulk ${action} on:`, ids);
    // Simulate an API call and show a success alert.
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
        dt_select
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
    // Simulate an API call and show a success alert.
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Successful!`,
      text: `User has been ${action}d successfully`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    }).then(() => {
      if (action === 'delete' || action === 'activate') {
        console.log(`Removing row for ${action} of ID:`, id);
        dt_select
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
    return dt_select
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }

  // Additional handleEdit function for differentiating modals based on user type.
  function handleEdit() {
    const rowData = dt_select.row($(this).closest('tr')).data();
    const userType = rowData.user_type;
    if (userType === 'Student') {
      $('#editStudentModal').modal('show');
    } else if (userType === 'Alumni') {
      $('#editAlumniModal').modal('show');
    } else {
      console.log('Unknown user type:', userType);
    }
  }

  // Remove small sizing from DataTables controls
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
