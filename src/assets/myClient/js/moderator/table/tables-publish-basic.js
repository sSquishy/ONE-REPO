'use strict';
let dt_publish;

$(function () {
  const dt_publish_table = $('#publishTable');
  const actionBar = $('#publish_actionBar');
  const selectedCount = $('#publish_selectedCount');

  // Assume dt_reported and dt_rejected are defined elsewhere

  if (dt_publish_table.length) {
    dt_publish = dt_publish_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: getApprovedPosts,
        dataSrc: 'data',
        type: 'GET',
        error: function(xhr, status, error) {
          console.log(xhr.responseText);
        }
      },
      columns: [
        {
          data: 'postID',
          render: (data) => `<input type="checkbox" class="dt-checkboxes form-check-input approved-checkbox" value="${data}">`
        },
        { data: 'postID' },
        {
          data: 'postImage',
          render: data => `<img src="${data}" alt="Image" style="max-height:50px;">`
        },
        {
          data: 'postContent',
          render: data => `<span style="color: black !important;">${data}</span>`
        },
        {
          data: null,
          render: data => `
            <div>
              <div style="color: black !important;">${data.postAuthor}</div>
              <div style="color: black !important; font-size: smaller;">${data.postAuthorID}</div>
            </div>
          `
        },
        {
          data: 'postID',
          render: data => `<span class="badge rounded-pill bg-secondary" style="font-weight:bold;">${data}</span>`
        },
        {
          data: 'createdTime',
          render: data => `
            <div class="d-flex align-items-center">
              <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
              <span style="color: black !important;">${data}</span>
            </div>
          `
        },
        {
          data: 'evaluatedTime',
          render: data => `
            <div class="d-flex align-items-center">
              <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
              <span style="color: black !important;">${data}</span>
            </div>
          `
        },
        {
          data: 'postID',
          render: data => `
            <div class="d-inline-block" style="font-size: smaller;">
              <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                 data-bs-toggle="dropdown" style="color: black;">
                <i class="mdi mdi-dots-vertical mdi-20px text-muted"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end m-0">
                <li>
                  <a href="javascript:;" class="dropdown-item item-report" data-id="${data}" data-type="Flagged" data-loc="table" style="color: black;">
                    <i class="mdi mdi-alert-outline me-2 text-muted"></i>
                    <span style="color: black;">Report</span>
                  </a>
                </li>
                <div class="dropdown-divider"></div>
                <li>
                  <a href="javascript:;" class="dropdown-item text-danger item-delete" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-delete-outline me-2 text-muted"></i>
                    <span style="color: black;">Reject</span>
                  </a>
                </li>
              </ul>
            </div>
          `
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
        { targets: 1, visible: false, searchable: false },
        { targets: -1, orderable: false, searchable: false },
      ],
      order: [[1, 'desc']],
      dom:
        '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-end"f>>' +
        '<"table-responsive"t>' +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      select: { style: 'multi' },
      createdRow: row => $(row).css('font-size', 'smaller'),

    });

    // Reload the table when the tab is clicked
    $('[data-bs-target="#published"]').on('click', function() {
      dt_publish.ajax.reload();
    });

    // Use the same logic as in reported table to toggle the action bar
    function toggleActionBar() {
      const selectedRows = dt_publish.rows({ selected: true }).count();
      if (selectedRows > 0) {
        deactivateAllActionBars();
        $('#publish_actionBar').show();
      } else {
        $('#publish_actionBar').hide();
      }
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);
      // Disable Report button if more than one row is selected
      if (selectedRows > 1) {
        $('#publish_report').prop('disabled', true);
      } else {
        $('#publish_report').prop('disabled', false);
      }
    }
    dt_publish.on('select deselect', toggleActionBar);

    // Row-level Report: open Add Report modal
    $(document).on('click', '#publishTable .item-report', function () {
      $('#addReportModal').modal('show');
    });

    // Row-level Reject action
    $(document).on('click', '#publishTable .item-delete', function () {
      const publishId = $(this).data('id');
      Swal.fire({
        title: 'Reject Publish',
        text: 'Are you sure you want to reject this item?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes, reject',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          const postID = publishId;
          document.moderatePostFunc('Declined', postID, null)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Reject Successful!',
                text: 'Publish item has been rejected successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_publish.ajax.reload(null, false);
            }
          })
        }
      });
    });

    // ACTION BAR BUTTONS (Bulk)

    // Report (bulk): works only if exactly one row is selected
    $('#publish_report').on('click', function () {
      const selectedData = dt_publish.rows({ selected: true }).data().toArray();
      const selectedIds = dt_publish.rows({ selected: true }).data().pluck('postID').toArray();
      
      $('#submitNewReport').data('id', selectedIds[0]).data('type', 'Flagged').data('table', 'publishTable');
      if (selectedData.length === 1) {
        $('#addReportModal').modal('show');
      }
    });

    // Reject (bulk)
    $('#publish_reject').on('click', function () {
      const selectedData = dt_publish.rows({ selected: true }).data().toArray();
      if (!selectedData.length) return;
      Swal.fire({
        title: `Reject ${selectedData.length} item(s)?`,
        text: 'Are you sure you want to reject all selected items?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes, reject',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          const postIDList = selectedData.map(item => item.postID);
          console.log(postIDList);
          document.moderatePostFunc('Declined', postIDList, null, true)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Reject Successful!',
                text: 'Publish item has been rejected successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_publish.ajax.reload(null, false);
            }
          })
        }
      });
    });

    // Close action bar
    $('#publish_closeActionBar').on('click', function () {
      $('#publish_actionBar').hide();
      dt_publish.rows().deselect();
    });

    setTimeout(() => {
      $('#publishTable_filter .form-control').removeClass('form-control-sm');
      $('#publishTable_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
