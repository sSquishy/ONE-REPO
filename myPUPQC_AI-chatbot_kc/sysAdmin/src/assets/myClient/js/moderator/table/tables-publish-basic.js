'use strict';

$(function () {
  const dt_publish_table = $('#publishTable');
  const actionBar = $('#publish_actionBar');
  const selectedCount = $('#publish_selectedCount');

  let dt_publish;
  // Assume dt_reported and dt_rejected are defined elsewhere

  if (dt_publish_table.length) {
    dt_publish = dt_publish_table.DataTable({
      ajax: assetsPath + 'myClient/json/moderator/table/datatable-publish-list.json',
      columns: [
        {
          data: 'id',
          render: () => '<input type="checkbox" class="dt-checkboxes form-check-input">'
        },
        { data: 'id' },
        {
          data: 'image',
          render: data => `<img src="${data}" alt="Image" style="max-height:50px;">`
        },
        {
          data: 'caption',
          render: data => `<span style="color: black !important;">${data}</span>`
        },
        {
          data: null,
          render: data => `
            <div>
              <div style="color: black !important;">${data.posted_by_name}</div>
              <div style="color: black !important; font-size: smaller;">${data.posted_by_id}</div>
            </div>
          `
        },
        {
          data: 'entity_id',
          render: data => `<span class="badge rounded-pill bg-secondary" style="font-weight:bold;">${data}</span>`
        },
        {
          data: 'date_submitted',
          render: data => `
            <div class="d-flex align-items-center">
              <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
              <span style="color: black !important;">${data}</span>
            </div>
          `
        },
        {
          data: 'date_publish',
          render: data => `
            <div class="d-flex align-items-center">
              <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
              <span style="color: black !important;">${data}</span>
            </div>
          `
        },
        {
          data: 'id',
          render: data => `
            <div class="d-inline-block" style="font-size: smaller;">
              <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                 data-bs-toggle="dropdown" style="color: black;">
                <i class="mdi mdi-dots-vertical mdi-20px text-muted"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end m-0">
                <li>
                  <a href="javascript:;" class="dropdown-item item-report" data-id="${data}" style="color: black;">
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
          const rowData = dt_publish.rows((idx, data) => data.id === publishId).data()[0];
          dt_publish.rows((idx, data) => data.id === publishId).remove().draw();
          if (typeof dt_rejected !== 'undefined') {
            dt_rejected.row.add(rowData).draw();
          }
          Swal.fire({
            title: 'Reject Successful!',
            text: 'Publish item has been rejected successfully',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
        }
      });
    });

    // ACTION BAR BUTTONS (Bulk)

    // Report (bulk): works only if exactly one row is selected
    $('#publish_report').on('click', function () {
      const selectedData = dt_publish.rows({ selected: true }).data().toArray();
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
          selectedData.forEach(rowData => {
            if (typeof dt_rejected !== 'undefined') {
              dt_rejected.row.add(rowData).draw();
            }
          });
          dt_publish.rows({ selected: true }).remove().draw();
          Swal.fire({
            title: 'Reject Successful!',
            text: 'Selected items have been rejected.',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
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
