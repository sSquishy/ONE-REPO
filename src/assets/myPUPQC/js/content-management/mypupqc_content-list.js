$(function () {
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // MyPUPQC Content Table variables
  var dt_mypupqc_table = $('.datatables-mypupqc'),
    statusObj = {
      1: { title: 'Published', class: 'bg-label-success' },
      2: { title: 'Draft', class: 'bg-label-warning' }
    };

  // MyPUPQC Content Datatable
  if (dt_mypupqc_table.length) {
    var dt_mypupqc = dt_mypupqc_table.DataTable({
      ajax: assetsPath + 'mypupqc/json/mypupqc-content-list.json',
      columns: [
        { data: '' }, // Checkbox
        { data: 'id' }, // Responsive control
        { data: 'information' },
        { data: 'created_date' },
        { data: 'action' }
      ],
      columnDefs: [
        {
          // Hidden control column for responsive
          className: 'control',
          orderable: false,
          searchable: false,
          responsivePriority: 2,
          targets: 0,
          visible: false, // Add this line to hide the column
          render: function (data, type, full, meta) {
            return '';
          }
        },
        {
          // For Checkboxes (now at position 1)
          targets: 1,
          orderable: false,
          visible: true, // Ensure checkboxes column is visible
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          },
          checkboxes: {
            selectRow: true,
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          targets: 2,
          responsivePriority: 1,
          render: function (data, type, full, meta) {
            return `
              <div class="d-flex align-items-center">
                <div class="d-flex flex-column">
                  <span class="fw-semibold">${data.title}</span>
                  <small class="text-muted">${data.description}</small>
                </div>
              </div>
            `;
          }
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
                <span>${data}</span>
              </div>
            `;
          }
        },
        {
          targets: -1,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            return `
              <div class="d-inline-block text-nowrap">
                <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                        data-bs-toggle="dropdown">
                  <i class="mdi mdi-dots-vertical mdi-20px"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  <a href="javascript:;" class="dropdown-item edit-content" data-id="${full.id}" data-bs-toggle="modal" data-bs-target="#editMypupqcImageUploadModal">
                    <i class="mdi mdi-pencil-outline me-2"></i><span>Edit</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item toggle-status" data-id="${full.id}">
                    <i class="mdi mdi-toggle-switch-outline me-2"></i><span>Toggle Status</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-content text-danger" data-id="${full.id}">
                    <i class="mdi mdi-delete-outline me-2"></i><span>Delete</span>
                  </a>
                </div>
              </div>
            `;
          }
        }
      ],
      order: [[3, 'desc']],
      dom:
        '<"row mx-2"' +
        '<"col-md-2"<"me-3"l>>' +
        '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-3 mb-md-0 gap-3"fB>>' +
        '>t' +
        '<"row mx-2"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6"p>' +
        '>',
      language: {
        sLengthMenu: 'Show _MENU_',
        search: '',
        searchPlaceholder: 'Search content...'
      },
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle me-3 waves-effect waves-light',
          text: '<i class="mdi mdi-export-variant me-1"></i> <span class="d-none d-sm-inline-block">Export</span>',
          buttons: [
            {
              extend: 'print',
              text: '<i class="mdi mdi-printer-outline me-1"></i>Print',
              className: 'dropdown-item',
              exportOptions: {
                columns: [2, 3],
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      result += item.innerText || item.textContent;
                    });
                    return result;
                  }
                }
              },
              customize: function (win) {
                $(win.document.body)
                  .css('color', headingColor)
                  .css('border-color', borderColor)
                  .css('background-color', bodyBg);
                $(win.document.body)
                  .find('table')
                  .addClass('compact')
                  .css('color', 'inherit')
                  .css('border-color', 'inherit')
                  .css('background-color', 'inherit');
              }
            },
            {
              extend: 'csv',
              text: '<i class="mdi mdi-file-document-outline me-1"></i>Csv',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3] }
            },
            {
              extend: 'excel',
              text: '<i class="mdi mdi-file-excel-outline me-1"></i>Excel',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3] }
            },
            {
              extend: 'pdf',
              text: '<i class="mdi mdi-file-pdf-box me-1"></i>Pdf',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3] }
            },
            {
              extend: 'copy',
              text: '<i class="mdi mdi-content-copy me-1"></i>Copy',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3] }
            }
          ]
        },
        {
          text: '<i class="mdi mdi-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Content</span>',
          className: 'add-new btn btn-primary waves-effect waves-light',
          attr: {
            'data-bs-toggle': 'modal',
            'data-bs-target': '#mypupqcImageUploadModal'
          }
        }
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              return 'Content Details';
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title !== ''
                ? `
                <tr data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}">
                  <td>${col.title}:</td>
                  <td>${col.data}</td>
                </tr>
              `
                : '';
            }).join('');
            return data ? $('<table class="table"/><tbody />').append(data) : false;
          }
        }
      }
    });

    // Reloads the table when their respective tab is selected
    $('[tab-name="content"]').on("click", function() {
      dt_mypupqc.ajax.reload(null, false);
    });

    // Content Action Handlers
    $(document).on('click', '.edit-content', function () {
      var contentId = $(this).data('id');
      console.log('Editing content:', contentId);
    });

    $(document).on('click', '.toggle-status', function () {
      var contentId = $(this).data('id');
      Swal.fire({
        title: 'Change Content Status?',
        text: 'Are you sure you want to update the visibility of this content?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-primary me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          console.log('Toggling status for content:', contentId);
        }
      });
    });

    $(document).on('click', '.delete-content', function () {
      var contentId = $(this).data('id');
      Swal.fire({
        title: 'Delete Content?',
        text: 'This will permanently remove the content!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          dt_mypupqc.row($(this).parents('tr')).remove().draw();
          Swal.fire({
            title: 'Deleted!',
            text: 'Content has been removed successfully.',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-success'
            },
            buttonsStyling: false
          });
        }
      });
    });
  }

  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
