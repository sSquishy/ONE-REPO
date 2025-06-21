'use strict';

$(function () {
  const dt_reject_table = $('#rejectTable');
  const actionBar = $('#reject_actionBar');
  const selectedCount = $('#reject_selectedCount');

  let dt_reject;
  // Assume dt_published and dt_reported are defined elsewhere

  if (dt_reject_table.length) {
    dt_reject = dt_reject_table.DataTable({
      ajax: assetsPath + 'myClient/json/moderator/table/datatable-reject-list.json',
      columns: [
        { data: 'id', render: () => '<input type="checkbox" class="dt-checkboxes form-check-input">' },
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
          data: 'date_rejected',
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
                  <a href="javascript:;" class="dropdown-item item-published" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-check-outline me-2 text-muted"></i>
                    <span style="color: black;">Published</span>
                  </a>
                </li>
                <li>
                  <a href="javascript:;" class="dropdown-item item-report" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-alert-outline me-2 text-muted"></i>
                    <span style="color: black;">Report</span>
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
        title: 'Publish Item',
        text: 'Are you sure you want to mark this item as published?',
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
          const rowData = dt_reject.rows((idx, data) => data.id === rejectId).data()[0];
          dt_reject.rows((idx, data) => data.id === rejectId).remove().draw();
          if (typeof dt_published !== 'undefined') {
            dt_published.row.add(rowData).draw();
          }
          Swal.fire({
            title: 'Published Successful!',
            text: 'Item has been marked as published successfully.',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
        }
      });
    });

    // ACTION BAR BUTTONS (Bulk)

    // Report (bulk): works only if exactly one row is selected
    $('#reject_report').on('click', function () {
      const selectedData = dt_reject.rows({ selected: true }).data().toArray();
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
          selectedData.forEach(rowData => {
            if (typeof dt_published !== 'undefined') {
              dt_published.row.add(rowData).draw();
            }
          });
          dt_reject.rows({ selected: true }).remove().draw();
          Swal.fire({
            title: 'Published Successful!',
            text: 'Selected items have been published successfully.',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
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
