/**
 * DataTables Extensions with Bulk Actions for Article Management
 */

'use strict';

$(function () {
  // Ensure the table ID matches your HTML (e.g., <table id="articleTable"> ...)
  const dt_article_table = $('#articleTable');

  // Match the action bar HTML IDs
  const actionBar = $('#article_actionBar');
  const selectedCount = $('#article_selectedCount');

  let dt_article;

  // Define status mapping using numeric keys
  const statusObj = {
    Active: { title: 'Active', class: 'bg-label-success' },
    Inactive: { title: 'Inactive', class: 'bg-label-secondary' },
    Draft: { title: 'Draft', class: 'bg-label-warning' }
  };

  // Initialize DataTable only if articleTable exists in the DOM
  if (dt_article_table.length) {
    dt_article = dt_article_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: "/sysAdmin/Admin/Content-Management/getArticles/",
        type: 'GET',
        dataSrc: 'data',
        error: function(xhr, status, error) {
          console.error('Error loading data:', xhr.responseText);
        }
      },
      columns: [
        // 1) Checkbox Column
        {
          data: 'articleID',
          render: function (data) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input article-checkbox" value="${data}">`;
          }
        },
        // 2) Hidden ID Column
        { data: 'articleID' },
        // 3) Image Column
        {
          data: 'image',
          render: function (data) {
            return `<img src="${data}" alt="Article Image" class="img-thumbnail" style="max-width: 100px;">`;
          }
        },
        // 4) Event Title (black text)
        {
          data: 'title',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 5) Description (black text)
        {
          data: 'description',
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <span style="color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        // 6) Started Date (icon + black text)
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
        // 7) End Date (icon + black text)
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
        // 8) Created Date (icon + black text)
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
        // 9) Status (badge label)
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
        // 10) Action Column (dropdown + black text)
        {
          data: 'articleID',
          render: function (data) {
            return `
              <div class="d-inline-block" style="font-size: smaller;">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                   data-bs-toggle="dropdown" style="color: black;">
                  <i class="mdi mdi-dots-vertical mdi-20px text-muted"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item article-edit" data-id="${data}" style="color: black;">
                      <i class="mdi mdi-pencil-outline me-2 text-muted"></i>
                      <span style="color: black;">Edit</span>
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger article-delete" data-id="${data}"
                       style="color: black;">
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
        // Apply smaller font size to the entire row
        $(row).css('font-size', 'smaller');
      },
      initComplete: function () {
        // Append "Add Article" button to the table's filter area
        $('#articleTable_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#articleUploadModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add Article</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });
    document.dt_article = dt_article;

    // Toggles the action bar based on row selection
    function toggleActionBar() {
      const selectedRows = dt_article.rows({ selected: true }).count();
      actionBar.toggle(selectedRows > 0);
      selectedCount.text(`${selectedRows} item${selectedRows !== 1 ? 's' : ''} selected`);
      $('#article_editSelected')
        .toggle(selectedRows === 1)
        .prop('disabled', selectedRows !== 1);
    }

    // Listen for row selection/deselection
    dt_article.on('select deselect', toggleActionBar);

    // Close the action bar (deselect all rows)
    $('#article_closeActionBar').click(() => {
      dt_article.rows().deselect();
      toggleActionBar();
    });
  }

  // Reloads the table when their respective tab is selected
  $('[tab-name="article"]').on("click", function() {
    dt_article.ajax.reload(null, false);
  });

  // Bulk Action Handlers
  // -- Removed SweetAlert for Edit; open the modal directly instead.
  $('#article_editSelected').click(handleBulkEdit);
  $('#article_deleteSelected').click(handleBulkDelete);

  // Individual Row Action Handlers
  $(document).on('click', '#articleTable .article-edit', handleEdit);
  $(document).on('click', '#articleTable .article-delete', handleDelete);

  // ========= Bulk Action Functions =========
  function handleBulkEdit() {
    // Just open the modal directly, no SweetAlert.
    $('#articleEditModal').modal('show');
  }

  function handleBulkDelete() {
    const selectedIds = getSelectedIds();
    console.log("Deleting selected articles:", selectedIds);
    showBulkAlert({
      action: 'delete',
      title: 'Delete Selected Articles',
      text: `Permanently delete ${selectedIds.length} article${selectedIds.length !== 1 ? 's' : ''}`,
      icon: 'error',
      confirmText: 'Confirm Delete'
    });
  }

  // ========= Individual Row Action Functions =========
  function handleEdit() {
    const articleId = $(this).data('id');
    console.log('Editing article:', articleId);
    $('#articleEditModal').modal('show');
  }

  function handleDelete() {
    const articleId = $(this).data('id');
    showSingleAlert(
      {
        action: 'delete',
        title: 'Delete Article',
        text: 'Are you sure you want to delete this article?',
        icon: 'error',
        confirmText: 'Yes, delete'
      },
      articleId
    );
  }

  // ========= Alert Handlers =========
  function showBulkAlert(config) {
    const selectedIds = getSelectedIds();
    console.log('Selected IDs:', selectedIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonText: config.confirmText,
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: `btn btn-${config.action === 'delete' ? 'danger' : 'primary'} me-3 waves-effect waves-light`,
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performBulkOperation(config.action, selectedIds);
        dt_article.rows({ selected: true }).deselect();
        // Hide the action bar
        $('#article_actionBar').hide();
      }
    });
  }

  function showSingleAlert(config, articleId) {
    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonText: config.confirmText,
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: `btn btn-${config.action === 'delete' ? 'danger' : 'success'} me-3 waves-effect waves-light`,
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performSingleOperation(config.action, articleId);
      }
    });
  }

  // ========= Operation Handlers =========
  function performBulkOperation(action, ids) {
    console.log(`Performing bulk ${action} on:`, ids);

    if (action === 'delete') {
      $.ajax({
        url: "/sysAdmin/Admin/Content-Management/bulkDeleteArticle/",
        type: 'POST',
        data: {
          articleIDList: ids,
          csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(response) {
          console.log('Response:', response);
          Swal.fire({
            title: 'Delete Successful!',
            text: 'Articles have been deleted successfully',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          })
          .then(() => {
            dt_article.ajax.reload(null, false);
            actionBar.hide();
          })
        },
        error: function(xhr, status, error) {
          console.error('Error deleting articles:', xhr.responseText);
        }
      })
    }
  }

  function performSingleOperation(action, id) {
    console.log(`Performing ${action} on article:`, id);

    if (action === 'delete') {
      $.ajax({
        url: "/sysAdmin/Admin/Content-Management/deleteArticle/",
        type: 'POST',
        data: {
          articleID: id,
          csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(response) {
          console.log('Response:', response);
          Swal.fire({
            title: 'Delete Successful!',
            text: 'Article has been deleted successfully',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-success' },
            buttonsStyling: false
          })
          .then(() => {
            dt_article.ajax.reload(null, false);
            actionBar.hide();
          })
        },
        error: function(xhr, status, error) {
          console.error('Error deleting articles:', xhr.responseText);
        }
      })
    }
  }

  // Helper function to get selected IDs
  function getSelectedIds() {
    return dt_article
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.articleID);
  }

  // Remove small form-control classes for the article table only
  setTimeout(() => {
    $('#articleTable_filter .form-control').removeClass('form-control-sm');
    $('#articleTable_length .form-select').removeClass('form-select-sm');
  }, 300);
});
