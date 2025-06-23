/**
 * DataTables Extensions with Bulk Actions for FAQ Management
 */

'use strict';

$(function () {
  // Match the new HTML IDs for the FAQ action bar
  const dt_faq_table = $('#faqTable');
  const actionBar = $('#faq_actionBar');
  const selectedCount = $('#faq_selectedCount');

  let dt_faq;

  // Define status mapping for FAQ using numeric keys
  const statusObj = {
    Active: { title: 'Active', class: 'bg-label-success' },
    Inactive: { title: 'Inactive', class: 'bg-label-secondary' },
    Draft: { title: 'Draft', class: 'bg-label-warning' }
  };

  if (dt_faq_table.length) {
    dt_faq = dt_faq_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: "/sysAdmin/Admin/Content-Management/getFAQs/",
        type: 'GET',
        dataSrc: 'data',
      },
      columns: [
        // 1) Checkbox Column
        {
          data: 'faqID',
          render: function (data) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input faq-checkbox" value="${data}">`;
          }
        },
        // 2) Hidden ID Column
        { data: 'faqID' },
        // 3) Question Column
        {
          data: 'question',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 4) Description Column
        {
          data: 'answer',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 5) Created Date Column with icon
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
        // 6) Status Column as badge (label pill)
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
          data: 'faqID',
          render: function (data) {
            return `
              <div class="d-inline-block" style="font-size: smaller;">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                   data-bs-toggle="dropdown" style="color: black;">
                  <i class="mdi mdi-dots-vertical mdi-20px text-muted"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item faq-edit" data-id="${data}" style="color: black;">
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
          targets: 1, // Hide the ID column
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
        // Add an "Add FAQ" button next to the search field
        $('#faqTable_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#addFaqModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add FAQ</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });
    document.dt_faq = dt_faq;

    // Toggle the action bar whenever row selection changes
    function toggleActionBar() {
      const selectedRows = dt_faq.rows({ selected: true }).count();
      // Show/hide the action bar
      actionBar.toggle(selectedRows > 0);
      // Show how many items are selected
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);
      // Enable "Edit" only if exactly 1 row is selected
      $('#faq_editSelected')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    dt_faq.on('select deselect', toggleActionBar);

    // Close the action bar (deselect all rows)
    $('#faq_closeActionBar').click(() => {
      dt_faq.rows().deselect();
      toggleActionBar();
    });
  }

  // ========== Bulk Action Handlers ==========
  // Edit Selected -> directly open the edit modal (no SweetAlert)
  // $(document).on('click', '#faq_editSelected, .', function() {
  //   $('#editFaqModal').modal('show');
  // });

  // Delete Selected -> confirm with SweetAlert
  $('#faq_deleteSelected').click(() => {
    const selectedIds = getSelectedIds();
    if (!selectedIds.length) return;
    Swal.fire({
      title: 'Delete Selected FAQs',
      text: `Permanently delete ${selectedIds.length} FAQ${selectedIds.length !== 1 ? 's' : ''}?`,
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
        dt_faq.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  });

  // ========== Individual Row Action Handlers ==========
  // Edit (single row) -> open modal directly
  $(document).on('click', '#faq_editSelected, .faq-edit', function () {
    let faqID = null;
    let parent = null;
    if($(this).attr('id') === 'faq_editSelected') {
      faqID = $('.faq-checkbox:checked').val();
      parent = $('.faq-checkbox:checked').closest('tr');
    } else {
      faqID = $(this).data('id');
      parent = $(this).closest('tr');
    }
    $('#editFaqModal').modal('show');


    const question = parent.find('td:eq(1)').text().trim();
    const answer = parent.find('td:eq(2)').text().trim();
    const status = parent.find('td:eq(4)').text().trim();

    $('#submitFaqEdit').attr('data-id', faqID).data('id', faqID);
    $('#faqQuestionEdit').val(question);
    $('#faqAnswerEdit').val(answer);
    $('#faqStatusEdit').val(status);
  });

  // Delete (single row) -> confirm with SweetAlert
  $(document).on('click', '#faqTable .item-delete', function () {
    const faqId = $(this).data('id');
    Swal.fire({
      title: 'Delete FAQ',
      text: 'Are you sure you want to delete this FAQ?',
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
        performSingleDelete(faqId);
      }
    });
  });

  // ========== Deletion Implementations ==========
  // Bulk Delete: Remove selected rows from the DataTable
  function performBulkDelete(ids) {
    console.log('Performing bulk delete on:', ids);
    
    $.ajax({
      url: "/sysAdmin/Admin/Content-Management/bulkDeleteFAQ/",
      type: 'POST',
      data: {
        faqIDList: ids,
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
      },
      success: function(response) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: `Successfully deleted ${ids.length} FAQ${ids.length !== 1 ? 's' : ''}`,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        })
        .then(() => {
          // Reload the DataTable
          dt_faq.ajax.reload();
        });
      }
    })
  }

  // Single Delete: Remove that row from the DataTable
  function performSingleDelete(faqId) {
    console.log('Performing delete on FAQ:', faqId);
    
    $.ajax({
      url: "/sysAdmin/Admin/Content-Management/deleteFAQ/",
      type: 'POST',
      data: {
        faqID: faqId,
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
      },
      success: function(response) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'FAQ has been deleted successfully',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        })
        .then(() => {
          // Reload the DataTable
          dt_faq.ajax.reload();
        });
      },
      error: function(xhr, status, error) {
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while deleting the FAQ',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-danger' },
          buttonsStyling: false
        });
      }
    })
  }

  // ========== Helper: Get All Selected IDs ==========
  function getSelectedIds() {
    return dt_faq
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.faqID);
  }

  // Remove "sm" classes on the filter & length dropdown after a short delay
  setTimeout(() => {
    $('#faqTable_filter .form-control').removeClass('form-control-sm');
    $('#faqTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
