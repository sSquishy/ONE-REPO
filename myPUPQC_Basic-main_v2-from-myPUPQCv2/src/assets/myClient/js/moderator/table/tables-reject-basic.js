'use strict';

$(function () {
  const dt_reject_table = $('#rejectTable');
  const actionBar = $('#reject_actionBar');
  const selectedCount = $('#reject_selectedCount');

  let dt_reject;
  // Assume dt_published and dt_reported are defined elsewhere

  if (dt_reject_table.length) {
    dt_reject = dt_reject_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: getRejectedPosts,
        dataSrc: 'data',
        type: 'GET',
        error: function(xhr, status, error) {
          console.log(xhr.responseText);
        }
      },
      columns: [
        {
          data: 'postID',
          render: (data) => `<input type="checkbox" class="dt-checkboxes form-check-input declined-checkbox" value="${data}">`
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
                  <a href="javascript:;" class="dropdown-item item-published" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-check-outline me-2 text-muted"></i>
                    <span style="color: black;">Published</span>
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
        { targets: -1, orderable: false, searchable: false }
      ],
      order: [[1, 'desc']],
      dom:
        '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-end"f>>' +
        '<"table-responsive"t>' +
        '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      select: { style: 'multi' },
      createdRow: row => $(row).css('font-size', 'smaller'),

    });

    function toggleActionBar() {
      const selectedRows = dt_reject.rows({ selected: true }).count();
      if (selectedRows > 0) {
        deactivateAllActionBars();
        $('#reject_actionBar').show();
      } else {
        $('#reject_actionBar').hide();
      }
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);
      // Disable Report button if more than one row is selected
      if (selectedRows > 1) {
        $('#reject_report').prop('disabled', true);
      } else {
        $('#reject_report').prop('disabled', false);
      }
    }
    dt_reject.on('select deselect', toggleActionBar);

    // Row-level Report: open add report modal
    $(document).on('click', '#rejectTable .item-report', function () {
      $('#addReportModal').modal('show');
    });

    // Row-level Published action
    $(document).on('click', '#rejectTable .item-published', function () {
      const rejectId = $(this).data('id');
      Swal.fire({
        title: 'Publish Post',
        text: 'Are you sure you want to mark this post as published?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, publish',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-warning me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          const postID = rejectId;
          document.moderatePostFunc('Approved', postID, null)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Publish Successful!',
                text: 'Rejected post has been published successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_reject.ajax.reload(null, false);
            }
          })
        }
      });
    });

    // ACTION BAR BUTTONS (Bulk)

    // Report (bulk): works only if exactly one row is selected
    $('#reject_report').on('click', function () {
      const selectedData = dt_reject.rows({ selected: true }).data().toArray();
      const selectedIds = dt_reject.rows({ selected: true }).data().pluck('postID').toArray();
      
      $('#submitNewReport').data('id', selectedIds[0]).data('type', 'Flagged').data('table', 'rejectTable');
      if (selectedData.length === 1) {
        $('#addReportModal').modal('show');
      }
    });

    // Published (bulk)
    $('#reject_published').on('click', function () {
      const selectedData = dt_reject.rows({ selected: true }).data().toArray();
      if (!selectedData.length) return;
      Swal.fire({
        title: `Publish ${selectedData.length} item(s)?`,
        text: 'Are you sure you want to publish all selected items?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, publish',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-warning me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          const postIDList = selectedData.map(item => item.postID);
          console.log(postIDList);
          document.moderatePostFunc('Approved', postIDList, null, true)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Publish Successful!',
                text: 'Rejected post has been published successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_reject.ajax.reload(null, false);
            }
          })
        }
      });
    });

    // Close action bar
    $('#reject_closeActionBar').on('click', function () {
      $('#reject_actionBar').hide();
      dt_reject.rows().deselect();
    });

    setTimeout(() => {
      $('#rejectTable_filter .form-control').removeClass('form-control-sm');
      $('#rejectTable_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
