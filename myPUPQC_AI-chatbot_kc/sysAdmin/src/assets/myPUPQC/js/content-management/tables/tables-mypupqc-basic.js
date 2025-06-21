/**
 * DataTables Extensions with Bulk Actions for MyPUPQC Content
 */

'use strict';

$(function () {
  // Match IDs from your HTML snippet
  const dt_select_table = $('#mypupqcTable');
  const actionBar = $('#mypupqcActionBar');
  const selectedCount = $('#mypupqcSelectedCount');

  let dt_select;

  // Define status mapping
  const statusObj = {
    1: { title: 'Active', class: 'bg-label-success' },
    2: { title: 'Inactive', class: 'bg-label-secondary' },
    3: { title: 'Draft', class: 'bg-label-warning' }
  };

  if (dt_select_table.length) {
    dt_select = dt_select_table.DataTable({
      ajax: assetsPath + 'myPUPQC/json/mypupqc-content-list.json',
      columns: [
        // 1) Checkbox Column
        {
          data: 'id',
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          }
        },
        // 2) Hidden ID
        { data: 'id' },
        // 3) Image Column
        {
          data: 'image',
          render: function (data) {
            return `<img src="${data}" alt="Content Image" class="img-thumbnail" style="max-width: 100px;">`;
          }
        },
        // 4) Created Date
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
        // 5) Status as badge
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
        // 6) Action Column
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
                      <i class="mdi mdi-pencil-outline me-2 text-muted"></i> <span style="color: black;">Edit</span>
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger item-delete" data-id="${data}" style="color: black;">
                      <i class="mdi mdi-delete-outline me-2 text-muted"></i> <span style="color: black;">Delete</span>
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
        // Smaller font for each row
        $(row).css('font-size', 'smaller');
      },
      initComplete: function () {
        // "Add Mypupqc Content" button near search
        $('#mypupqcTable_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#mypupqcImageUploadModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add Mypupqc Content</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });

    // Show/hide the action bar
    function toggleActionBar() {
      const selectedRows = dt_select.rows({ selected: true }).count();
      actionBar.toggle(selectedRows > 0);
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);

      // "Edit" only if exactly 1 row selected
      $('#mypupqcBulkEdit')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    dt_select.on('select deselect', toggleActionBar);

    // Close the action bar (deselect all)
    $('#mypupqcCloseActionBar').click(() => {
      dt_select.rows().deselect();
      toggleActionBar();
    });
  }

  // ========== Bulk Action Handlers ==========
  // Bulk Edit => Just open the edit modal (no SweetAlert)
  $('#mypupqcBulkEdit').click(() => {
    $('#editMypupqcImageUploadModal').modal('show');
  });

  // Bulk Delete => SweetAlert, remove from DataTable
  $('#mypupqcBulkDelete').click(() => {
    const selectedIds = getSelectedIds();
    if (!selectedIds.length) return;
    Swal.fire({
      title: 'Delete Selected Mypupqc Contents',
      text: `Permanently delete ${selectedIds.length} content item${selectedIds.length !== 1 ? 's' : ''}?`,
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

  // ========== Single Row Handlers ==========
  // Single Edit => open modal
  $(document).on('click', '#mypupqcTable .item-edit', function () {
    const contentId = $(this).data('id');
    console.log('Editing content:', contentId);
    $('#editMypupqcImageUploadModal').modal('show');
  });

  // Single Delete => SweetAlert, remove from DataTable
  $(document).on('click', '#mypupqcTable .item-delete', function () {
    const contentId = $(this).data('id');
    Swal.fire({
      title: 'Delete Content',
      text: 'Are you sure you want to delete this content item?',
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
        performSingleDelete(contentId);
      }
    });
  });

  // ========== Deletion Logic ==========
  // Bulk Delete
  function performBulkDelete(ids) {
    console.log('Bulk deleting:', ids);
    // Remove those rows from DataTables
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

  // Single Delete
  function performSingleDelete(contentId) {
    console.log('Deleting content:', contentId);
    dt_select
      .rows((idx, data) => data.id === contentId)
      .remove()
      .draw();

    Swal.fire({
      title: 'Delete Successful!',
      text: 'Content item has been deleted successfully',
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    });
  }

  // ========== Helper ==========
  function getSelectedIds() {
    return dt_select
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }

  setTimeout(() => {
    $('#mypupqcTable_filter .form-control').removeClass('form-control-sm');
    $('#mypupqcTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
