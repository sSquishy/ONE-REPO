$(function () {
  // Adjust color and style variables as needed
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

  // Variable declaration for the assignments table
  var dt_assignment_table = $('.datatables-assignments'),
      // Object to map status values (example mapping)
      statusObj = {
        'To-Do': { title: 'To-Do', class: 'bg-label-warning' },
        'In Progress': { title: 'In Progress', class: 'bg-label-info' },
        'Done': { title: 'Done', class: 'bg-label-success' }
      };

  // ---------------------------------------------------------------------
  // Function to remove an event from currentEvents and refresh calendar
  // ---------------------------------------------------------------------
  function removeEvent(eventId) {
    currentEvents = currentEvents.filter(evt => evt.id != eventId);
    if (typeof calendar !== "undefined" && calendar.refetchEvents) {
      calendar.refetchEvents();
    }
  }

  // ---------------------------------------------------------------------
  // Function to populate and show the offcanvas for editing a calendar event
  // ---------------------------------------------------------------------
  function editCalendarEvent(eventData) {
    bsAddEventSidebar.show(); // bsAddEventSidebar is linked to "#kanban-update-item-sidebar"
    if (offcanvasTitle) offcanvasTitle.innerHTML = 'Update Event';
    btnSubmit.innerHTML = 'Update';
    btnSubmit.classList.add('btn-update-event');
    btnSubmit.classList.remove('btn-add-event');
    btnDeleteEvent.classList.remove('d-none');

    eventTitle.value = eventData.title;
    startPicker.setDate(eventData.start, true, 'Y-m-d');
    if (eventData.end) {
      endPicker.setDate(eventData.end, true, 'Y-m-d');
    } else {
      endPicker.setDate(eventData.start, true, 'Y-m-d');
    }
    calendarEventLabel.val(eventData.extendedProps.calendar).trigger('change');
    eventDescription.value = eventData.extendedProps.description || '';

    eventToUpdate = eventData;
  }

  // ---------------------------------------------------------------------
  // Table Edit Handler: When the dropdown "Edit" link is clicked
  // ---------------------------------------------------------------------
  $(document).on('click', '.edit-assignment', function () {
    var assignmentId = $(this).data('id');
    console.log('Editing assignment with ID:', assignmentId);
    var eventData = currentEvents.find(e => e.id == assignmentId);
    if (eventData) {
      editCalendarEvent(eventData);
    } else {
      console.error('Event not found for assignment ID:', assignmentId);
    }
  });

  // ---------------------------------------------------------------------
  // Table Delete Handler (Dropdown Delete): For single row deletion
  // ---------------------------------------------------------------------
  $(document).on('click', '.delete-assignment', function () {
    var assignmentId = $(this).data('id');
    console.log('Deleting assignment with ID:', assignmentId);

    Swal.fire({
      title: 'Delete Assignment?',
      text: "Are you sure you want to delete this assignment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        var rowData = dt_assignment.rows((idx, data) => data.id == assignmentId).data()[0];
        removeEvent(assignmentId);
        dt_assignment.rows((idx, data) => data.id == assignmentId).remove().draw();
        if (typeof dt_rejected !== "undefined") {
          dt_rejected.row.add(rowData).draw();
        }
        Swal.fire({
          title: 'Deleted!',
          text: "The assignment has been deleted.",
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        });
      }
    });
  });

  // ---------------------------------------------------------------------
  // Action Bar Delete Handler: For bulk deletion
  // ---------------------------------------------------------------------
  $(document).on('click', '#assignment_delete', function() {
    const selectedRows = dt_assignment.rows({ selected: true });
    const count = selectedRows.count();

    Swal.fire({
      title: `Delete ${count} Record${count > 1 ? 's' : ''}?`,
      text: `Are you sure you want to delete selected assignment record${count > 1 ? 's' : ''}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, delete ${count > 1 ? 'them' : 'it'}!`,
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3',
        cancelButton: 'btn btn-outline-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        selectedRows.data().toArray().forEach(rowData => {
          removeEvent(rowData.id);
          if (typeof dt_rejected !== "undefined") {
            dt_rejected.row.add(rowData).draw();
          }
        });
        selectedRows.remove().draw();
        toggleAssignmentActionBar();

        Swal.fire({
          title: 'Deleted!',
          text: `Successfully deleted ${count} record${count > 1 ? 's' : ''}.`,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        });
      }
    });
  });

  // ---------------------------------------------------------------------
  // Action Bar Edit Handler: When the action bar "Edit" button is clicked
  // ---------------------------------------------------------------------
  $('#assignment_edit').on('click', function () {
    var selectedData = dt_assignment.rows({ selected: true }).data();
    if (selectedData.length === 1) {
      var assignmentId = selectedData[0].id;
      var eventData = currentEvents.find(e => e.id == assignmentId);
      if (eventData) {
        editCalendarEvent(eventData);
      } else {
        console.error('Event not found for assignment ID:', assignmentId);
      }
    } else {
      Swal.fire({
        title: 'Select Exactly One!',
        text: 'Please select exactly one assignment to edit.',
        icon: 'warning',
        customClass: {
          confirmButton: 'btn btn-primary waves-effect'
        },
        buttonsStyling: false
      });
    }
  });

  // ---------------------------------------------------------------------
  // Initialize the assignments DataTable
  // ---------------------------------------------------------------------
  if (dt_assignment_table.length) {
    var dt_assignment = dt_assignment_table.DataTable({
      ajax: assetsPath + "myClient/json/student/datatable-assignment-list.json",
      columns: [
        { data: '' },   // Responsive control column
        { data: 'id' }, // Checkbox column
        { data: 'id' }, // Assignment ID
        { data: 'title' },     // Task Name
        { data: 'description' },
        { data: 'due_date' },  // Estimation
        { data: 'label_category' },
        { data: 'status' },
        { data: 'attachment' },
        { data: 'created_date' },
        { data: 'last_updated' },
        { data: 'action' }
      ],
      columnDefs: [
        {
          className: 'control',
          orderable: false,
          searchable: false,
          responsivePriority: 1,
          targets: 0,
          visible: false,
          render: function () { return ''; }
        },
        {
          targets: 1,
          orderable: false,
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
          responsivePriority: 2,
          render: function (data, type) {
            if (type === 'display') {
              return `<span style="font-size: smaller; color: black !important;">${data}</span>`;
            }
            return data;
          }
        },
        {
          targets: 3,
          responsivePriority: 3,
          render: function (data) {
            return `<span style="font-size: smaller; color: black !important;">${data}</span>`;
          }
        },
        {
          targets: 4,
          responsivePriority: 4,
          render: function (data) {
            return `<span style="font-size: smaller; color: black !important;">${data}</span>`;
          }
        },
        {
          targets: 5,
          responsivePriority: 5,
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
                <span style="font-size: smaller; color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        {
          targets: 6,
          responsivePriority: 6,
          render: function (data, type, row, meta) {
            if (type === 'filter' || type === 'sort') {
              // Return the plain text for filtering and sorting
              return data;
            }
            // For display, include the icon and styling
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-tag-outline me-2 text-muted"></i>
                <span style="font-size: smaller; color: black !important;">${data}</span>
              </div>
            `;
          }
        },

        {
          targets: 7,
          render: function (data) {
            return `<span class="badge rounded-pill ${statusObj[data].class}">${statusObj[data].title}</span>`;
          }
        },
        {
          targets: 8,
          render: function (data) {
            return `<span style="font-size: smaller; color: black !important;">${data}</span>`;
          }
        },
        {
          targets: 9,
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-calendar-check-outline me-2 text-muted"></i>
                <span style="font-size: smaller; color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        {
          targets: 10,
          render: function (data) {
            return `
              <div class="d-flex align-items-center">
                <i class="mdi mdi-update me-2 text-muted"></i>
                <span style="font-size: smaller; color: black !important;">${data}</span>
              </div>
            `;
          }
        },
        {
          targets: 11,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: function (data, type, full) {
            return `
              <div class="d-inline-block text-nowrap">
                <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                        data-bs-toggle="dropdown">
                  <i class="mdi mdi-dots-vertical mdi-20px"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end m-0">
                  <a href="javascript:;"
                     class="dropdown-item edit-assignment"
                     data-id="${full.id}"
                     data-bs-toggle="offcanvas"
                     data-bs-target="#kanban-update-item-sidebar">
                    <i class="mdi mdi-pencil-outline me-2"></i><span>Edit</span>
                  </a>
                  <a href="javascript:;" class="dropdown-item delete-assignment" data-id="${full.id}">
                    <i class="mdi mdi-delete-outline me-2"></i><span>Delete</span>
                  </a>
                </div>
              </div>
            `;
          }
        }
      ],
      order: [[2, 'desc']],
      dom:
        '<"row mx-2"<"col-md-2"<"me-3"l>>' +
        '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-3 mb-md-0 gap-3"fB>>' +
        '>t' +
        '<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      language: {
        sLengthMenu: 'Show _MENU_',
        search: '',
        searchPlaceholder: 'Search..'
      },
      buttons: [
        {
          text: '<i class="mdi mdi-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Task</span>',
          className: 'add-new btn btn-primary',
          attr: { 'data-bs-toggle': 'offcanvas', 'data-bs-target': '#addEventSidebar' }
        }
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details for Assignment ' + data['title'];
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            return $('<table class="table"/>').append(
              $.map(columns, function (col) {
                return col.title !== ''
                  ? `<tr><td>${col.title}:</td><td>${col.data}</td></tr>`
                  : '';
              }).join('')
            );
          }
        }
      },
      select: {
        style: 'multi'
      },
      initComplete: function () {
        var api = this.api();
        // Assignment Category Filter - column index 6
        api.column(6).every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value="">Select Label</option></select>')
            .appendTo('.assignment_category_filter')
            .on('change', function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? '^' + val + '$' : '', true, false).draw();
            });
          column.data().unique().sort().each(function (d) {
            select.append('<option value="' + d + '">' + d + '</option>');
          });
        });

        // Assignment Status Filter - column index 7
        api.column(7).every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value="">Select Status</option></select>')
            .appendTo('.assignment_status_filter')
            .on('change', function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? '^' + val + '$' : '', true, false).draw();
            });
          column.data().unique().sort().each(function (d) {
            select.append('<option value="' + d + '">' + statusObj[d].title + '</option>');
          });
        });

      }
    });
  }

  // ---------------------------------------------------------------------
  // Action Bar Integration
  // ---------------------------------------------------------------------
  function toggleAssignmentActionBar() {
    var countSelected = dt_assignment.rows({ selected: true }).count();
    if (countSelected > 0) {
      $('#assignment_selectedCount').text(countSelected + ' Selected');
      $('#assignment_actionBar').fadeIn();
      // Disable edit button if more than one selected
      $('#assignment_edit').prop('disabled', countSelected > 1);
    } else {
      $('#assignment_actionBar').fadeOut();
    }
  }

  dt_assignment.on('select deselect', function () {
    toggleAssignmentActionBar();
  });

  $('#assignment_closeActionBar').on('click', function () {
    dt_assignment.rows().deselect();
    toggleAssignmentActionBar();
  });

  $('#assignment_markDone').on('click', function () {
    var selectedData = dt_assignment.rows({ selected: true }).data();
    console.log('Mark as Done for assignment(s):', selectedData);
    // Add your mark as done functionality here
  });
});
