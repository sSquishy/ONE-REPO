/**
 * DataTables Extensions with Bulk Actions for Program List
 */
'use strict';

$(function () {
  // Cache references to Action Bar and Selected Count elements
  const actionBar = $('#actionBar');
  const selectedCount = $('#selectedCount');

  const dt_program_table = $('.dt-basic-table'); // Ensure your table has this class
  let dt_program;

  // Initialize DataTable if the table element exists
  if (dt_program_table.length) {
    dt_program = dt_program_table.DataTable({
      ajax: {
        url: "/sysAdmin/Admin/Account-Management/Manage-Programs/getActiveProgram/",
        type: 'GET',
        dataSrc: '',
      },
      columns: [
        {
          data: 'programID',
          render: function (data, type, row) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input program-checkbox" value="${data}">`;
          }
        },
        { data: 'programName' }, // Program Name column
        { data: 'programShortName' }, // Acronym column
        { data: 'createdTime' }, // Created Date column
        {
          data: 'programID',
          render: function (data, type, row) {
            return `
              <div class="d-inline-block">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="mdi mdi-dots-vertical"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item edit-program" data-id="${data}">
                      <i class="mdi mdi-pencil-outline me-2"></i>Edit
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger delete-program" data-id="${data}">
                      <i class="mdi mdi-delete-outline me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>`;
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
      initComplete: function () {
        $('.dataTables_filter').append(
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#addProgramModal">' +
            '<i class="mdi mdi-plus me-1"></i> Add Program</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });
    document.dt_program = dt_program;

    // Update the Action Bar when rows are selected or deselected.
    dt_program.on('select deselect', function () {
      const count = dt_program.rows({ selected: true }).count();
      if (count > 0) {
        actionBar.show();
        selectedCount.text(count + ' item' + (count > 1 ? 's' : '') + ' selected');
      } else {
        actionBar.hide();
      }
      // Disable bulk Edit button if not exactly one row is selected.
      $('#programEdit').prop('disabled', count !== 1);
    });
  }

  // Helper function to get selected row IDs
  function getSelectedIds() {
    return dt_program
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }

  // Bulk Edit: Directly open edit modal if exactly one record is selected.
  $('#programEdit').on('click', function () {
    const selectedRows = $('.program-checkbox:checked').val();
    console.log(selectedRows);
    const count = selectedRows.length;

    if(count == 1) {
      Swal.fire({
          title: "Loading...",
          text: "Retrieving program data...",
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          },
          showCancelButton: false,
          confirmButtonText: '',
          customClass: { confirmButton: '', cancelButton: '' },
          buttonsStyling: false
      });
      
      // Set a timeout to show a warning message if the process takes too long
      let timeout = setTimeout(() => {
          Swal.update({
              title: 'Loading...',
              text: 'This is taking longer than expected. Please wait or check your internet connection.',
              icon: 'warning',
              showConfirmButton: false,
              showCancelButton: false,
              confirmButtonText: '',
              customClass: { confirmButton: '', cancelButton: '' },
              buttonsStyling: false,
              allowOutsideClick: false,
          });
          Swal.showLoading();
      }, 5000); // Change 5000 to any delay you want in milliseconds
      
        // Set a timeout to show a warning message if the process takes too long
      let timeout2 = setTimeout(() => {
          Swal.close();
          Swal.fire({
              title: 'Failed to load data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
          })
          .then(() => {
              location.reload();
          })
      }, 30000); // Change 5000 to any delay you want in milliseconds

      $.ajax({
        url: "/sysAdmin/Admin/Account-Management/Manage-Programs/getSpecificProgram/",
        type: 'GET',
        data: {
          programID: selectedRows
        },
        success: function (response) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          $('#editProgramModal').find('input[name="programID"]').val(response.programID);
          $('#editProgramModal').find('input[name="programName"]').val(response.programName);
          $('#editProgramModal').find('input[name="programAcronym"]').val(response.programShortName);
          $('#editProgramModal').find('button[id="updateProgram"]').data('id', response.programID);
        },
        error: function (xhr, status, error) {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          console.log(xhr.responseText);
          Swal.fire({
            title: 'Error!',
            text: 'An error occurred. Please try again.',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-danger' },
            buttonsStyling: false
          });
        }
      });
    }
    
    var modal = new bootstrap.Modal(document.getElementById('editProgramModal'));
    modal.show();
  });

  // Bulk Delete: Confirm and perform deletion for selected records.
  $('#programDelete').on('click', function () {
    const selectedRows = $('.program-checkbox:checked').map(function () { return $(this).val() }).get();
    const count = selectedRows.length;

    if(count == 0) {
      Swal.fire({
        title: 'No record selected',
        text: 'Please select at least one record to delete.',
        icon: 'warning',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false
      });
      return;
    }

    Swal.fire({
      title: 'Delete Selected?',
      text:
        'Confirm to permanently delete ' +
        selectedRows.length +
        ' record' +
        (selectedRows.length !== 1 ? 's' : '') +
        '. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
            title: "Loading...",
            text: "Processing data...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            showCancelButton: false,
            confirmButtonText: '',
            customClass: { confirmButton: '', cancelButton: '' },
            buttonsStyling: false
        });
        
        // Set a timeout to show a warning message if the process takes too long
        let timeout = setTimeout(() => {
            Swal.update({
                title: 'Loading...',
                text: 'This is taking longer than expected. Please wait or check your internet connection.',
                icon: 'warning',
                showConfirmButton: false,
                showCancelButton: false,
                confirmButtonText: '',
                customClass: { confirmButton: '', cancelButton: '' },
                buttonsStyling: false,
                allowOutsideClick: false,
            });
            Swal.showLoading();
        }, 5000); // Change 5000 to any delay you want in milliseconds
        
          // Set a timeout to show a warning message if the process takes too long
        let timeout2 = setTimeout(() => {
            Swal.close();
            Swal.fire({
                title: 'Failed to process data',
                text: 'Please reload the page and try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            })
            .then(() => {
                location.reload();
            })
        }, 30000); // Change 5000 to any delay you want in milliseconds

        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/Manage-Programs/bulkDeleteProgram/",
          type: 'POST',
          data: {
            programIDList: selectedRows,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            if(response.status === 'Success') {
              Swal.fire({
                title: 'Success!',
                text: 'The selected programs have been deleted.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              }).then(() => {
                dt_program.rows({ selected: true }).deselect();
                actionBar.hide();
                dt_program.ajax.reload(null, false);
              });
            }
            else {
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred. Please try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger' },
                buttonsStyling: false
              });
            }
          },
          error: function (xhr, status, error) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            console.log(xhr.responseText);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred. Please try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            });
          }
        })
      }
    });
  });

  // Bulk Activate: Confirm and perform activation for selected records.
  $('#programActivate').on('click', function () {
    var selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      alert('Please select at least one record to activate.');
      return;
    }
    Swal.fire({
      title: 'Activate Selected?',
      text: 'Confirm to activate ' + selectedIds.length + ' record' + (selectedIds.length !== 1 ? 's' : '') + '.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-success me-3 waves-effect',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        performBulkOperation('activate', selectedIds);
        dt_program.rows({ selected: true }).deselect();
        actionBar.hide();
      }
    });
  });

  // Close Action Bar: Deselect all rows and hide the action bar.
  $('#closeActionBar').on('click', function () {
    dt_program.rows().deselect();
    actionBar.hide();
  });

  // Individual Delete Action (from dropdown)
  $(document).on('click', '.delete-program', function () {
    const programID = $(this).data('id');
    Swal.fire({
      title: 'Delete Program?',
      text: 'Confirm to delete this program. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      Swal.fire({
          title: "Deleting...",
          text: "Processing data...",
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          },
          showCancelButton: false,
          confirmButtonText: '',
          customClass: { confirmButton: '', cancelButton: '' },
          buttonsStyling: false
      });
      
      // Set a timeout to show a warning message if the process takes too long
      let timeout = setTimeout(() => {
          Swal.update({
              title: 'Deleting...',
              text: 'This is taking longer than expected. Please wait or check your internet connection.',
              icon: 'warning',
              showConfirmButton: false,
              showCancelButton: false,
              confirmButtonText: '',
              customClass: { confirmButton: '', cancelButton: '' },
              buttonsStyling: false,
              allowOutsideClick: false,
          });
          Swal.showLoading();
      }, 5000); // Change 5000 to any delay you want in milliseconds
      
        // Set a timeout to show a warning message if the process takes too long
      let timeout2 = setTimeout(() => {
          Swal.close();
          Swal.fire({
              title: 'Failed to process data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
          })
          .then(() => {
              location.reload();
          })
      }, 30000); // Change 5000 to any delay you want in milliseconds
      
      if (result.isConfirmed) {
        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/Manage-Programs/deleteProgram/",
          type: 'POST',
          data: {
            programID: programID,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            if (response.status === 'Success') {
              Swal.fire({
                title: 'Success!',
                text: 'The program has been deleted.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              }).then(() => {
                dt_program.ajax.reload(null, false);
              });
            } else {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Error!',
                text: 'An error occurred. Please try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger' },
                buttonsStyling: false
              });
            }
          },
          error: function (xhr, status, error) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            console.log(xhr.responseText);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred. Please try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger' },
              buttonsStyling: false
            });
          }
        })
      }
    });
  });

  // Alert Handlers using Swal
  function performBulkOperation(action, ids) {
    console.log(`Performing bulk ${action} on:`, ids);
    // Simulate API call and show a success alert.
    Swal.fire({
      title: 'Success!',
      text: `Successfully ${action}d ${ids.length} item${ids.length !== 1 ? 's' : ''}`,
      icon: 'success',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    }).then(() => {
      if (action === 'delete' || action === 'activate') {
        console.log(`Removing rows for bulk ${action}`);
        // Remove rows that match any ID in the ids array.
        dt_program
          .rows(function (idx, data, node) {
            return ids.includes(data.id);
          })
          .remove()
          .draw();
      }
    });
  }

  // Helper Function: Get selected IDs
  function getSelectedIds() {
    return dt_program
      .rows({ selected: true })
      .data()
      .toArray()
      .map(item => item.id);
  }
});
