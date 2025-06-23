/**
 * DataTables Extensions with Bulk Actions for MyPUPQC Content
 */

'use strict';

$(function () {
  // Match IDs from your HTML snippet
  const dt_mypupqc_table = $('#mypupqcTable');
  const actionBar = $('#mypupqcActionBar');
  const selectedCount = $('#mypupqcSelectedCount');

  let dt_mypupqc;

  // Define status mapping
  const statusObj = {
    Active: { title: 'Active', class: 'bg-label-success' },
    Inactive: { title: 'Inactive', class: 'bg-label-secondary' },
    Draft: { title: 'Draft', class: 'bg-label-warning' }
  };

  if (dt_mypupqc_table.length) {
    dt_mypupqc = dt_mypupqc_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: "/sysAdmin/Admin/Content-Management/getMyPUPQCSlideShows/",
        type: 'GET',
        dataSrc: 'data',
      },
      columns: [
        // 1) Checkbox Column
        {
          data: 'slideshowID',
          render: function (data) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input mypupqc-checkbox" value="${data}">`;
          }
        },
        // 2) Hidden ID
        { data: 'slideshowID' },
        // 3) Image Column
        {
          data: 'image',
          render: function (data) {
            return `<img src="${data}" alt="Content Image" class="img-thumbnail" style="max-width: 100px;">`;
          }
        },
        // 4) Created Date
        {
          data: 'createdTime',
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
          data: 'slideshowID',
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
    document.dt_mypupqc = dt_mypupqc;

    // Show/hide the action bar
    function toggleActionBar() {
      const selectedRows = dt_mypupqc.rows({ selected: true }).count();
      actionBar.toggle(selectedRows > 0);
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);

      // "Edit" only if exactly 1 row selected
      $('#mypupqcBulkEdit')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    dt_mypupqc.on('select deselect', toggleActionBar);

    // Close the action bar (deselect all)
    $('#mypupqcCloseActionBar').click(() => {
      dt_mypupqc.rows().deselect();
      toggleActionBar();
    });
  }

  // ========== Bulk Action Handlers ==========
  // Bulk Edit => Just open the edit modal (no SweetAlert)
  $(document).on('click', '#mypupqcBulkEdit', function() {
    let slideshowID = null;
    $('#editMypupqcImageUploadModal').modal('show');
    if($(this).attr('id') === 'mypupqcBulkEdit') {
      slideshowID = $('.mypupqc-checkbox:checked').val()
    } else {
      slideshowID = $(this).data('id');
    }
    $('#edit-mypupqc-submit-upload').attr('data-id', slideshowID).data('id', slideshowID);
    $('#editMypupqcImageUploadModal').modal('show');
  });

  // Bulk Delete => SweetAlert, remove from DataTable
  $('#mypupqcBulkDelete').click(() => {
    const selectedIds = getSelectedIds();
    console.log("selectedIds: ", selectedIds);
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
        $.ajax({
          url: "/sysAdmin/Admin/Content-Management/bulkDeleteSlideShow/",
          type: 'POST',
          data: {
            slideshowIDList: selectedIds,
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function(response) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Selected content items have been deleted successfully',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success' },
              buttonsStyling: false
            })
            dt_mypupqc.ajax.reload(null, false);
          },
          error: function(xhr, status, error) {
            console.log(xhr.responseText);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while deleting the selected content items',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            })
          }
        })
      }
    });
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
        $.ajax({
          url: "/sysAdmin/Admin/Content-Management/deleteSlideShow/",
          type: 'POST',
          data: {
            slideshowID: contentId,
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function(response) {
            Swal.fire({
              title: 'Deleted!',
              text: 'The content item has been deleted successfully',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success' },
              buttonsStyling: false
            })
            dt_mypupqc.ajax.reload(null, false);
          },
          error: function(xhr, status, error) {
            console.log(xhr.responseText);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while deleting the content item',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            })
          }
        })
      }
    });
  });

  // ========== Helper ==========
  function getSelectedIds() {
    return dt_mypupqc
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.slideshowID);
  }

  setTimeout(() => {
    $('#mypupqcTable_filter .form-control').removeClass('form-control-sm');
    $('#mypupqcTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
