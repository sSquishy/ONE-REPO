/**
 * DataTables Extensions with Bulk Actions for How To Management
 */

'use strict';

$(function () {
  // Match the new IDs from your How To action bar
  const dt_select_table = $('#howtoTable');
  const actionBar = $('#howto_actionBar');
  const selectedCount = $('#howto_selectedCount');

  let dt_select;

  // Define status mapping using numeric keys
  const statusObj = {
    1: { title: 'Active', class: 'bg-label-success' },
    2: { title: 'Inactive', class: 'bg-label-secondary' },
    3: { title: 'Draft', class: 'bg-label-warning' }
  };

  if (dt_select_table.length) {
    dt_select = dt_select_table.DataTable({
      ajax: assetsPath + 'myPUPQC/json/howto-list.json',
      columns: [
        // 1) Checkbox Column
        {
          data: 'id',
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          }
        },
        // 2) Hidden ID Column
        { data: 'id' },
        // 3) Title Column
        {
          data: 'title',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 4) Link Column (clickable, new tab)
        {
          data: 'link',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <a href="${data}" target="_blank" style="color: black !important;">${data}</a>
              </div>
            `;
          }
        },
        // 5) Created Date Column
        {
          data: 'created_date',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 6) Status Column (badge)
        {
          data: 'status',
          render: function (data) {
            let statusData = statusObj[data] || { title: 'Unknown', class: 'bg-label-secondary' };
            return `
              <span class="badge rounded-pill ${statusData.class}" style="font-size: smaller;">
                ${statusData.title}
              </span>
            `;
          }
        },
        // 7) Action Column (individual edit/delete)
        {
          data: 'id',
          render: function (data) {
            return `
              <div class="d-inline-block" style="font-size: smaller;">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                   data-bs-toggle="dropdown" style="color: black;">
                  <i class="mdi mdi-dots-vertical mdi-20px text-muted"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item item-edit" data-id="${data}" style="color: black;">
                      <i class="mdi mdi-pencil-outline me-2 text-muted"></i>
                      <span style="color: black;">Edit</span>
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger item-delete" data-id="${data}" style="color: black;">
                      <i class="mdi mdi-delete-outline me-2 text-muted"></i>
                      <span style="color: black;">Delete</span>
                    </a>
                  </li>
                </ul>
              </div>
            `;
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
          targets: 1,
          visible: false,
          searchable: false
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
      createdRow: function (row) {
        // Make the row text smaller
        $(row).css('font-size', 'smaller');
      },
      initComplete: function () {
        // Add an "Add How To" button next to the search field
        $('#howtoTable_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#addHowToModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add How To</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });

    // Toggle the action bar whenever row selection changes
    function toggleActionBar() {
      const selectedRows = dt_select.rows({ selected: true }).count();
      // Show/hide the action bar
      actionBar.toggle(selectedRows > 0);
      // Show how many items are selected
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);
      // Enable "Edit" only if exactly 1 row is selected
      $('#howto_editSelected')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    dt_select.on('select deselect', toggleActionBar);

    // Close the action bar (deselect all rows)
    $('#howto_closeActionBar').click(() => {
      dt_select.rows().deselect();
      toggleActionBar();
    });
  }

  // ========== Bulk Action Handlers ==========
  // Edit Selected -> directly open the edit modal (no SweetAlert)
  $('#howto_editSelected').click(() => {
    $('#editHowToModal').modal('show');
  });

  // Delete Selected -> confirm with SweetAlert, then remove from DataTable
  $('#howto_deleteSelected').click(() => {
    const selectedIds = getSelectedIds();
    if (!selectedIds.length) return;
    Swal.fire({
      title: 'Delete Selected How Tos',
      text: `Permanently delete ${selectedIds.length} item${selectedIds.length !== 1 ? 's' : ''}?`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Confirm Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect waves-light',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performBulkDelete(selectedIds);
        // Deselect rows and hide the action bar
        dt_select.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  });

  // ========== Individual Row Action Handlers ==========
  // Edit (single row) -> open modal directly
  $(document).on('click', '#howtoTable .item-edit', function () {
    const howtoId = $(this).data('id');
    console.log('Editing How To:', howtoId);
    // Show the edit modal
    $('#editHowToModal').modal('show');
  });

  // Delete (single row) -> SweetAlert, then remove from DataTable
  $(document).on('click', '#howtoTable .item-delete', function () {
    const howtoId = $(this).data('id');
    Swal.fire({
      title: 'Delete How To',
      text: 'Are you sure you want to delete this item?',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect waves-light',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performSingleDelete(howtoId);
      }
    });
  });

  // ========== Deletion Implementations ==========
  // Bulk Delete: Remove the selected rows from the DataTable
  function performBulkDelete(ids) {
    console.log('Performing bulk delete on:', ids);
    dt_select
      .rows((idx, data) => ids.includes(data.id))
      .remove()
      .draw();
    Swal.fire({
      title: 'Success!',
      text: `Successfully deleted ${ids.length} item${ids.length !== 1 ? 's' : ''}`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    });
  }

  // Single Delete: Remove that row from the DataTable
  function performSingleDelete(howtoId) {
    console.log('Performing delete on How To:', howtoId);
    dt_select
      .rows((idx, data) => data.id === howtoId)
      .remove()
      .draw();
    Swal.fire({
      title: 'Delete Successful!',
      text: 'How To has been deleted successfully',
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    });
  }

  // ========== Helper: Get All Selected IDs ==========
  function getSelectedIds() {
    return dt_select
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }

  // Remove "sm" classes on the filter & length dropdown after a short delay
  setTimeout(() => {
    $('#howtoTable_filter .form-control').removeClass('form-control-sm');
    $('#howtoTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
