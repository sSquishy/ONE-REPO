/**
 * DataTables Extensions with Bulk Actions for Slide Show Management
 */

'use strict';

$(function () {
  const dt_select_table = $('#slideshowTable');
  const actionBar = $('#actionBar');
  const selectedCount = $('#selectedCount');

  let dt_select;

  // Define status mapping
  const statusObj = {
    Active: { title: 'Active', class: 'bg-label-success' },
    Inactive: { title: 'Inactive', class: 'bg-label-danger' },
    Draft: { title: 'Draft', class: 'bg-label-warning' }
  };

  if (dt_select_table.length) {
    dt_select = dt_select_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: "/sysAdmin/Admin/Content-Management/getMainSlideShows/",
        type: 'GET',
        dataSrc: 'data',
      },
      columns: [
        // 1) Checkbox Column
        {
          data: 'slideshowID',
          render: function (data) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input edit-slideshow" value="${data}">`;
          }
        },
        // 2) Hidden ID
        { data: 'slideshowID' },
        // 3) Image
        {
          data: 'image',
          render: function (data) {
            return `<img src="${data}" alt="Slide Image" class="img-thumbnail" style="max-width: 100px;">`;
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
        // 5) Status (badge)
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
              <div class="d-flex align-items-center" style="font-size: smaller;">
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
        // smaller font size
        $(row).css('font-size', 'smaller');
      },
      initComplete: function () {
        // "Add Slide Show" button near search
        $('#slideshowTable_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#imageUploadModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add Slide Show</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });

    // Toggle the action bar
    function toggleActionBar() {
      const selectedRows = dt_select.rows({ selected: true }).count();
      actionBar.toggle(selectedRows > 0);
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);

      // Only enable "Edit" if exactly 1 row is selected
      $('#bulkEdit')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    dt_select.on('select deselect', toggleActionBar);

    // Close the action bar => deselect all
    $('#closeActionBar').click(() => {
      dt_select.rows().deselect();
      toggleActionBar();
    });
    document.dt_select = dt_select;
  }

  // Reloads the table when their respective tab is selected
  $('[tab-name="slideshow"]').on("click", function() {
    dt_select.ajax.reload(null, false);
  });

  // ========== Bulk Handlers ==========
  // Bulk Edit => open modal, no SweetAlert
  $(document).on('click', '#bulkEdit, .item-edit', function () {
    let slideshowID = null;
    if($(this).attr('id') === 'bulkEdit'){
      slideshowID = $('.edit-slideshow:checked').val()
    } else {
      slideshowID = $(this).data('id');
    }
    $('#submit-edit-upload').attr('data-id', slideshowID).data('id', slideshowID);
    $('#editImageUploadModal').modal('show');
  });

  // Bulk Delete => SweetAlert, remove from DataTable
  $('#bulkDelete').click(() => {
    const selectedIds = getSelectedIds();
    console.log('Bulk deleting slide shows:', selectedIds);

    if (!selectedIds.length) return;
    Swal.fire({
      title: 'Delete Selected Slide Shows',
      text: `Permanently delete ${selectedIds.length} slide show${selectedIds.length !== 1 ? 's' : ''}?`,
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
          data: { slideshowIDList: selectedIds, csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val() },
          success: function (response) {
            console.log("response: ", response)

            Swal.fire({
              title: 'Delete Successful!',
              text: 'Slide show has been deleted successfully',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success' },
              buttonsStyling: false
            })
            .then(() => {
              dt_select.ajax.reload(null, false);
              actionBar.hide();
            })
          },
          error: function (xhr, status, error) {
            console.error('Error:', xhr.responseText);
            Swal.fire({
              title: 'Error',
              text: 'An error occurred while deleting the slide show',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            });
          }
        })
      }
    });
  });

  // ========== Single Row Handlers ==========
  // Single Edit => open modal directly
  $(document).on('click', '#bulkEdit .item-edit', function () {
    console.log('Edit clickedddd');
    let slideshowID = null;
    if($(this).attr('id') == 'bulkEdit'){
      slideshowID = $('.edit-slideshow:checked').val()
    } else {
      slideshowID = $(this).data('id');
    }
    $('#submit-edit-upload').attr('data-id', slideshowID).data('id', slideshowID);
    $('#editImageUploadModal').modal('show');
  });

  // Single Delete => SweetAlert, then remove from DataTable
  $(document).on('click', '.item-delete', function () {
    const slideshowID = $(this).data('id');
    Swal.fire({
      title: 'Delete Slide Show',
      text: 'Are you sure you want to delete this slide show?',
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
          data: { slideshowID: slideshowID, csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val() },
          success: function (response) {
            console.log("response: ", response)

            Swal.fire({
              title: 'Delete Successful!',
              text: 'Slide show has been deleted successfully',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success' },
              buttonsStyling: false
            })
            .then(() => {
              dt_select.ajax.reload(null, false);
              actionBar.hide();
            })
          },
          error: function (xhr, status, error) {
            console.error('Error:', xhr.responseText);
            Swal.fire({
              title: 'Error',
              text: 'An error occurred while deleting the slide show',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            });
          }
        })
      }
    });
  });

  // ========== Deletion Logic ==========
  // Bulk Delete
  function performBulkDelete(ids) {
    console.log('Bulk deleting slideshows:', ids);
    dt_select
      .rows((idx, data) => ids.includes(data.id))
      .remove()
      .draw();

    Swal.fire({
      title: 'Success!',
      text: `Successfully deleted ${ids.length} slide show${ids.length !== 1 ? 's' : ''}`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    });
  }

  // Single Delete
  function performSingleDelete(slideShowId) {
    console.log('Deleting slide show:', slideShowId);
    dt_select
      .rows((idx, data) => data.id === slideShowId)
      .remove()
      .draw();

    Swal.fire({
      title: 'Delete Successful!',
      text: 'Slide show has been deleted successfully',
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
      .map(item => item.slideshowID);
  }

  setTimeout(() => {
    $('#slideshowTable_filter .form-control').removeClass('form-control-sm');
    $('#slideshowTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
