'use strict';

$(function () {
  const dt_reported_table = $('#reportedTable');
  const reportedActionBar = $('#reported_actionBar');
  const reportedSelectedCount = $('#reported_selectedCount');

  let dt_reported;

  // let dt_published = ...
  // let dt_rejected = ...

  function deactivateAllActionBars() {
    $('#publish_actionBar').hide();
    $('#reject_actionBar').hide();
    $('#reported_actionBar').hide();
  }

  if (dt_reported_table.length) {
    dt_reported = dt_reported_table.DataTable({
      ajax: assetsPath + 'myClient/json/moderator/table/datatable-report-list.json',
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
          data: 'date_reported',
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
                  <a href="javascript:;" class="dropdown-item item-edit" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-pencil-outline me-2 text-muted"></i>
                    <span style="color: black;">Edit</span>
                  </a>
                </li>
                <li>
                  <a href="javascript:;" class="dropdown-item item-published" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-check-outline me-2 text-muted"></i>
                    <span style="color: black;">Published</span>
                  </a>
                </li>
                <li>
                  <a href="javascript:;" class="dropdown-item item-rejected" data-id="${data}" style="color: black;">
                    <i class="mdi mdi-close-outline me-2 text-muted"></i>
                    <span style="color: black;">Rejected</span>
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
      const selectedRows = dt_reported.rows({ selected: true }).count();
      if (selectedRows > 0) {
        deactivateAllActionBars();
        reportedActionBar.show();
      } else {
        reportedActionBar.hide();
      }
      reportedSelectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);

      // Disable "Edit" if more than 1 row selected
      if (selectedRows > 1) {
        $('#reported_edit').prop('disabled', true);
      } else {
        $('#reported_edit').prop('disabled', false);
      }
    }
    dt_reported.on('select deselect', toggleActionBar);

    // Row-level actions
    $(document).on('click', '#reportedTable .item-edit', function () {
      const reportedId = $(this).data('id');
      $('#editReportModal').modal('show');
    });

    $(document).on('click', '#reportedTable .item-published', function () {
      const reportedId = $(this).data('id');
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
          const rowData = dt_reported.rows((idx, data) => data.id === reportedId).data()[0];
          dt_reported.rows((idx, data) => data.id === reportedId).remove().draw();
          if (typeof dt_published !== 'undefined') {
            dt_published.row.add(rowData).draw();
          }
          Swal.fire({
            title: 'Published Successful!',
            text: 'Item has been marked as published successfully',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
        }
      });
    });

    $(document).on('click', '#reportedTable .item-rejected', function () {
      const reportedId = $(this).data('id');
      Swal.fire({
        title: 'Unreport Item',
        text: 'Are you sure you want to unreport (reject) this item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unreport',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-warning me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          const rowData = dt_reported.rows((idx, data) => data.id === reportedId).data()[0];
          dt_reported.rows((idx, data) => data.id === reportedId).remove().draw();
          if (typeof dt_rejected !== 'undefined') {
            dt_rejected.row.add(rowData).draw();
          }
          Swal.fire({
            title: 'Unreport Successful!',
            text: 'Item has been unreported (rejected) successfully',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
        }
      });
    });

    // Action Bar Buttons
    // Edit (bulk) - but only if 1 row is selected
    $('#reported_edit').on('click', function () {
      const selectedRows = dt_reported.rows({ selected: true }).count();
      if (selectedRows === 1) {
        $('#editReportModal').modal('show');
      }
    });

    // Published (bulk)
    $('#reported_published').on('click', function () {
      const selectedData = dt_reported.rows({ selected: true }).data().toArray();
      if (!selectedData.length) return;
      Swal.fire({
        title: `Publish ${selectedData.length} item(s)?`,
        text: 'Are you sure you want to mark all selected items as published?',
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
          dt_reported.rows({ selected: true }).remove().draw();

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

    // Rejected (bulk => unreport)
    $('#reported_rejected').on('click', function () {
      const selectedData = dt_reported.rows({ selected: true }).data().toArray();
      if (!selectedData.length) return;

      Swal.fire({
        title: `Unreport ${selectedData.length} item(s)?`,
        text: 'Are you sure you want to unreport all selected items?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unreport',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-warning me-3 waves-effect waves-light',
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
          dt_reported.rows({ selected: true }).remove().draw();

          Swal.fire({
            title: 'Unreport Successful!',
            text: 'Selected items have been unreported (rejected).',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          });
        }
      });
    });

    // Close bar
    $('#reported_closeActionBar').on('click', function () {
      reportedActionBar.hide();
      dt_reported.rows().deselect();
    });

    // Cleanup
    setTimeout(() => {
      $('#reportedTable_filter .form-control').removeClass('form-control-sm');
      $('#reportedTable_length .form-select').removeClass('form-select-sm');
    }, 300);
  }
});
