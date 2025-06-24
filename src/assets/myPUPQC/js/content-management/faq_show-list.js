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

  // FAQ Table variables
  var dt_faq_table = $('.datatables-faq'),
    statusObj = {
      1: { title: 'Active', class: 'bg-label-success' },
      2: { title: 'Inactive', class: 'bg-label-secondary' }
    };

  // FAQ Datatable
  if (dt_faq_table.length) {
    var dt_faq = dt_faq_table.DataTable({
      ajax: assetsPath + 'mypupqc/json/faq-list.json',
      columns: [
        { data: '' }, // Checkbox
        { data: 'id' }, // Responsive control
        { data: 'question' },
        { data: 'answer' },
        { data: 'created_date' },
        { data: 'status' },
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
          targets: 3,
          render: function (data, type, full, meta) {
            return data.length > 100 ? data.substring(0, 100) + '...' : data;
          }
        },
        {
          targets: 4,
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
          targets: 5,
          render: function (data, type, full, meta) {
            return (
              '<span class="badge rounded-pill ' +
              statusObj[data].class +
              '" text-capitalized>' +
              statusObj[data].title +
              '</span>'
            );
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
                  <a href="javascript:;" class="dropdown-item edit-faq" data-id="${full.id}" data-bs-toggle="modal" data-bs-target="#editFaqModal">
                    <i class="mdi mdi-pencil-outline me-2"></i><span>Edit</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-faq text-danger" data-id="${full.id}">
                    <i class="mdi mdi-delete-outline me-2"></i><span>Delete</span>
                  </a>
                </div>
              </div>
            `;
          }
        }
      ],
      order: [[4, 'desc']],
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
        searchPlaceholder: 'Search questions...'
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
                columns: [2, 3, 4, 5],
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
              exportOptions: { columns: [2, 3, 4, 5] }
            },
            {
              extend: 'excel',
              text: '<i class="mdi mdi-file-excel-outline me-1"></i>Excel',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3, 4, 5] }
            },
            {
              extend: 'pdf',
              text: '<i class="mdi mdi-file-pdf-box me-1"></i>Pdf',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3, 4, 5] }
            },
            {
              extend: 'copy',
              text: '<i class="mdi mdi-content-copy me-1"></i>Copy',
              className: 'dropdown-item',
              exportOptions: { columns: [2, 3, 4, 5] }
            }
          ]
        },
        {
          text: '<i class="mdi mdi-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add FAQ</span>',
          className: 'add-new btn btn-primary waves-effect waves-light',
          attr: {
            'data-bs-toggle': 'modal',
            'data-bs-target': '#addFaqModal'
          }
        }
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              return 'FAQ Details';
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
      },
      initComplete: function () {
        this.api()
          .columns(5)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="FilterStatus" class="form-select"><option value="">All Status</option></select>'
            )
              .appendTo('.faq_status')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append('<option value="' + statusObj[d].title + '">' + statusObj[d].title + '</option>');
              });
          });
      }
    });

    // Reloads the table when their respective tab is selected
    $('[tab-name="faq"]').on("click", function() {
      dt_faq.ajax.reload(null, false);
    });

    // FAQ Action Handlers
    $(document).on('click', '.edit-faq', function () {
      var faqId = $(this).data('id');
      console.log('Editing FAQ:', faqId);
    });

    $(document).on('click', '.toggle-status', function () {
      var faqId = $(this).data('id');
      Swal.fire({
        title: 'Change FAQ Status?',
        text: 'Are you sure you want to update the visibility of this FAQ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, change it!',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-primary me-3',
          cancelButton: 'btn btn-outline-secondary'
        },
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          console.log('Toggling status for FAQ:', faqId);
        }
      });
    });

    $(document).on('click', '.delete-faq', function () {
      var faqId = $(this).data('id');
      Swal.fire({
        title: 'Delete FAQ?',
        text: 'This will permanently remove the FAQ entry!',
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
          dt_faq.row($(this).parents('tr')).remove().draw();
          Swal.fire({
            title: 'Deleted!',
            text: 'FAQ has been removed.',
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
