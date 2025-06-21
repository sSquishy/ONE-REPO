'use strict';

$(function () {
  const dt_chika_table = $('#chikaTable');
  // The main action bar for the "Add Chika" table
  const actionBar = $('#actionBar');
  const selectedCount = $('#selectedCount');

  let dt_chika;

  // Define status mapping
  const statusObj = {
    Active: { title: 'Active', class: 'bg-label-success' },
    Inactive: { title: 'Inactive', class: 'bg-label-secondary' },
    Draft: { title: 'Draft', class: 'bg-label-warning' }
  };

  // Only initialize if #chikaTable exists
  if (dt_chika_table.length) {
    dt_chika = dt_chika_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'All']],
      ajax: {
        url: getChikasModerator, // make sure this variable is defined
        dataSrc: 'data',
        type: 'GET',
        error: function (xhr, status, error) {
          console.log(xhr.responseText);
        }
      },
      columns: [
        // 1) Checkbox
        {
          data: 'chikaID',
          render: function (data) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input chika-checkbox" value="${data}">`;
          }
        },
        // 2) Hidden ID
        { data: 'chikaID' },
        // 3) Image
        {
          data: 'chikaImage',
          render: function (data) {
            return `<img src="${data}" alt="Chika Image" class="img-thumbnail" style="max-width: 100px;">`;
          }
        },
        // 4) Title
        {
          data: 'chikaTitle',
          render: function (data) {
            return `<span style="color: black !important;">${data}</span>`;
          }
        },
        // 5) Description
        {
          data: 'chikaDescription',
          render: function (data) {
            return `<span style="color: black !important; min-width: 200px;">${data}</span>`;
          }
        },
        // 6) Created Date
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
        // 7) Start Date
        {
          data: 'startDate',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 8) End Date
        {
          data: 'endDate',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 9) Status (badge)
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
        // 10) Action Column
        {
          data: 'chikaID',
          render: function (data) {
            return `
              <div class="d-flex align-items-center" style="font-size: smaller;">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                   data-bs-toggle="dropdown" style="color: black;">
                  <i class="mdi mdi-dots-vertical mdi-20px text-muted"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item chika-edit" data-id="${data}" style="color: black;">
                      <i class="mdi mdi-pencil-outline me-2 text-muted"></i>
                      <span style="color: black;">Edit</span>
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger chika-delete" data-id="${data}" style="color: black;">
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
        $(row).css('font-size', 'smaller');
      },
      initComplete: function () {
        // Add "Add Chika" button next to search
        $('#chikaTable_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#addChikaModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add Chika</button>'
        );
      },
      // Enable DataTables row selection extension
      select: {
        style: 'multi'
      }
    });

    // Expose dt_chika globally if needed
    document.dt_chika = dt_chika;

    // ========== Show/hide the action bar based on row selection ==========
    function toggleActionBar() {
      const selectedRows = dt_chika.rows({ selected: true }).count();
      actionBar.toggle(selectedRows > 0); // Show if at least one row is selected
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);

      // Only enable "Edit" if exactly 1 row is selected
      // IMPORTANT: we now target "#editChikaActionBtn" (the button), not "#editChikaModal" (the modal).
      $('#editChikaActionBtn')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    // Trigger toggles
    dt_chika.on('select deselect', toggleActionBar);

    // Close button on action bar => deselect all
    $('#closeActionBar').click(() => {
      dt_chika.rows().deselect();
      toggleActionBar();
    });

    // ========== Bulk Edit Button in Action Bar ==========
    // Clicking on the "Edit" button in the action bar => open the modal
    // typically you'd get the ID of the single selected row, fetch data, etc.
    $('#editChikaActionBtn').click(() => {
      // Example: If exactly 1 row is selected, we can open the modal
      // Possibly fill the form with row data here if needed
      $('#editChikaModal').modal('show');
    });
  }

  // ========== Bulk Handlers ==========
  // Bulk Delete example
  $('#deleteChikaBulk').click(() => {
    const selectedIds = getSelectedIds();
    if (!selectedIds.length) return;
    Swal.fire({
      title: 'Delete Selected Chika',
      text: `Permanently delete ${selectedIds.length} chika${selectedIds.length !== 1 ? 's' : ''}?`,
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
        // Deselect rows + hide the action bar
        document.dt_chika.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  });

  // ========== Single Row Handlers ==========
  // Single Edit => triggered by the "Edit" link in the Action Column dropdown
  $(document).on('click', '#chikaTable .chika-edit', function () {
    const chikaId = $(this).data('id');
    console.log('Editing chika:', chikaId);

    // If you want to open the same modal, do so here:
    $('#editChikaModal').modal('show');

    // You can also populate the modal with AJAX or from the row:
    // e.g. fill input fields with row data
  });

  // Single Delete => triggered by the "Delete" link
  $(document).on('click', '#chikaTable .chika-delete', function () {
    const chikaId = $(this).data('id');
    Swal.fire({
      title: 'Delete Chika',
      text: 'Are you sure you want to delete this chika?',
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
        performSingleDelete(chikaId);
      }
    });
  });

  // ========== Deletion Logic ==========
  function performBulkDelete(ids) {
    console.log('Bulk deleting chika:', ids);
    document.dt_chika
      .rows((idx, data) => ids.includes(data.chikaID))
      .remove()
      .draw();

    Swal.fire({
      title: 'Success!',
      text: `Successfully deleted ${ids.length} chika${ids.length !== 1 ? 's' : ''}`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    });
  }

  function performSingleDelete(chikaId) {
    console.log('Deleting chika:', chikaId);

    Swal.fire({
      title: "Deleting...",
      text: "Processing your request...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showCancelButton: false,
      confirmButtonText: '',
      customClass: { confirmButton: '', cancelButton: '' },
      buttonsStyling: false
    });

    let timeout = setTimeout(() => {
      Swal.update({
        title: 'Deleting...',
        text: 'This is taking longer than expected. Please wait or check your internet connection.',
        icon: 'warning',
        showConfirmButton: false,
        showCancelButton: false,
        customClass: { confirmButton: '', cancelButton: '' },
        buttonsStyling: false,
        allowOutsideClick: false
      });
      Swal.showLoading();
    }, 5000);

    let timeout2 = setTimeout(() => {
      Swal.close();
      Swal.fire({
        title: 'Failed to delete chika',
        text: 'Please reload the page and try again.',
        icon: 'error',
        customClass: { confirmButton: 'btn btn-danger waves-effect' },
        buttonsStyling: false
      }).then(() => {
        location.reload();
      });
    }, 30000);

    $.ajax({
      url: deleteChika,
      type: 'POST',
      data: {
        chikaID: chikaId,
        csrfmiddlewaretoken: csrf
      },
      success: function(response) {
        clearTimeout(timeout);
        clearTimeout(timeout2);
        Swal.close();

        Swal.fire({
          title: 'Delete Successful!',
          text: 'Chika has been deleted successfully',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        });

        document.dt_chika.ajax.reload(null, false);
      },
      error: function(xhr, status, error) {
        clearTimeout(timeout);
        clearTimeout(timeout2);
        Swal.close();

        Swal.fire({
          title: 'Failed to delete chika',
          text: 'Please reload the page and try again.',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-danger waves-effect' },
          buttonsStyling: false
        });
      }
    });
  }

  // ========== Helper ==========
  // Helper to get array of selected IDs
  function getSelectedIds() {
    return document.dt_chika
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.chikaID);
  }

  // (Optional) Remove small form classes in DataTable controls
  setTimeout(() => {
    $('#chikaTable_filter .form-control').removeClass('form-control-sm');
    $('#chikaTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
