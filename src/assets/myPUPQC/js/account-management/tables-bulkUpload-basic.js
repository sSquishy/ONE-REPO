/**
 * DataTables Extensions with Bulk Actions
 */

'use strict';

$(function () {
  const dt_pending_table = $('.dt-select-table');
  const actionBar = $('#actionBar');
  const selectedCount = $('#selectedCount');
  let dt_pending;

  // Initialize DataTable
  if (dt_pending_table.length) {
    dt_pending = dt_pending_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/getPendingAccounts/",
        type: "GET",
        dataSrc: "data",
      },
      columns: [
        {
          data: 'userID',
          render: function (data, type, row) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input pending-checkbox" value="${data}">`;
          }
        },
        { data: 'userType' },
        { data: 'userNumber' },
        { data: null,
          render: function (data, type, row) {
            return buildFullName(data.firstname, data.middlename, data.lastname, data.suffix);
          }
         },
        { data: 'dateOfBirth' },
        { data: 'programName' },
        { data: 'emailAddress' },
        { data: 'webMail' },
        {
          data: 'userID',
          render: function (data, type, row) {
            return `
              <div class="d-inline-block">
                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="mdi mdi-dots-vertical"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end m-0">
                  <li>
                    <a href="javascript:;" class="dropdown-item item-edit" data-id="${data}">
                      <i class="mdi mdi-pencil-outline me-2"></i>Edit
                    </a>
                  </li>
                  <li>
                    <a href="javascript:;" class="dropdown-item item-activate" data-id="${data}">
                      <i class="mdi mdi-check-circle-outline me-2"></i>Activate
                    </a>
                  </li>
                  <div class="dropdown-divider"></div>
                  <li>
                    <a href="javascript:;" class="dropdown-item text-danger item-delete" data-id="${data}">
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
          '<button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#bulkUploadModal">' +
            '<i class="mdi mdi-plus me-1"></i> Upload Bulk</button>'
        );
      },
      select: {
        style: 'multi'
      }
    });
    document.dt_pending = dt_pending;

    // Update action bar when rows are selected/deselected.
    function toggleActionBar() {
      const selectedRows = dt_pending.rows({ selected: true });
      const count = selectedRows.count();
      actionBar.toggle(count > 0);
      selectedCount.text(`${count} item${count !== 1 ? 's' : ''} selected`);
      $('#bulkEdit')
        .toggle(count === 1)
        .prop('disabled', count !== 1);
    }
    dt_pending.on('select deselect', toggleActionBar);

    // Close Action Bar
    $('#closeActionBar').click(() => {
      dt_pending.rows().deselect();
      toggleActionBar();
    });
  }

  // Bulk Activate
  $('#bulkActivate').click(function () {
    const selectedRows = $('.pending-checkbox:checked').map(function () { return $(this).val() }).get();
    const count = selectedRows.length;
    console.log('Bulk Activate:', selectedRows, count);

    Swal.fire({
      icon: 'question',
      text: `Are you sure you want to activate ${count} item${count !== 1 ? 's' : ''}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
            title: "Activating...",
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
                title: 'Activating...',
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
        }, 120000); // Change 120000 to any delay you want in milliseconds
        
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
        }, 300000); // Change 300000 to any delay you want in milliseconds

        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/bulkActivateUploadedAccount/",
          type: "POST",
          data: {
            userIDList: selectedRows,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            Swal.fire({
              title: 'Activated!',
              text: 'The selected items have been successfully activated.',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success waves-effect' },
              buttonsStyling: false
            })
            .then(() => {
              dt_pending.ajax.reload(null, false);
              toggleActionBar();
            })
          },
          error: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            Swal.fire({
              title: 'Failed to process data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
            })
          }
        })
      }
    })
  });

  $('#bulkDelete').click(function() {
    const selectedRows = $('.pending-checkbox:checked').map(function () { return $(this).val() }).get();
    const count = selectedRows.length;
    console.log('Bulk Delete:', selectedRows, count);

    Swal.fire({
      icon: 'question',
      text: `Are you sure you want to delete ${count} item${count !== 1 ? 's' : ''}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
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

        $.ajax({
          url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/bulkDeleteBulkUploadAccounts/",
          type: "POST",
          data: {
            userIDList: selectedRows,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            Swal.fire({
              title: 'Deleted!',
              text: 'The selected items have been successfully deleted.',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success waves-effect' },
              buttonsStyling: false
            })
            .then(() => {
              dt_pending.ajax.reload(null, false);
              toggleActionBar();
            })
          },
          error: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            Swal.fire({
              title: 'Failed to process data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
            })
          }
        })
      }
    })
  })

  $(document).on('click', '.item-edit', function() {
    const rowData = dt_pending.row($(this).closest('tr')).data();
    const userType = rowData.userType;
    const thisBtn = $(this);
    let userData = {}

    if (userType === 'Student') {
      $('#editStudentModal').modal('show');
    } else if (userType === 'Alumni') {
      $('#editAlumniModal').modal('show');
    } else {
      console.log('Unknown user type:', userType);
    }

    Swal.fire({
        title: "Loading...",
        text: "Retrieving user data...",
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
      url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/getSpecificPendingAccount/",
      type: "GET",
      data: {
        userID: thisBtn.data('id'),
      },
      success: function (response) {
        $('#submitEditAlumni, #updateStudent').data('id', thisBtn.data('id'));
        if (userType === 'Student') {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          userData = response;
          console.log("userData: ", userData);
          // $('#editStudentModal').find('input[name="userID"]').val(userData.userID);
          $('#editStudentModal').find('input[name="studentNumber"]').val(userData.userNumber);
          $('#editStudentModal').find('input[name="firstName"]').val(userData.firstname);
          $('#editStudentModal').find('input[name="middleName"]').val(userData.middlename);
          $('#editStudentModal').find('input[name="lastName"]').val(userData.lastname);
          $('#editStudentModal').find('input[name="suffix"]').val(userData.suffix);
          $('#editStudentModal').find('input[id="editStudentBirthMonth"]').text(userData.dateOfBirth.split('-')[1]);
          $('#editStudentModal').find('input[id="editStudentBirthYear"]').text(userData.dateOfBirth.split('-')[0]);
          $('#editStudentModal').find('input[id="editStudentBirthDay"]').text(userData.dateOfBirth.split('-')[2]);
          $('#editStudentModal').find('input[id="editStudentMobileNumber"]').val(userData.mobileNo);
          $('#editStudentModal').find('input[id="editStudentProgram"]').val(userData.programName);
          $('#editStudentModal').find('input[id="editStudentPersonalEmail"]').val(userData.emailAddress);
          $('#editStudentModal').find('input[id="editStudentPupWebmail"]').val(userData.webMail);
        } else if (userType === 'Alumni') {
          clearTimeout(timeout);
          clearTimeout(timeout2);
          Swal.close();

          userData = response;
          console.log("userData: ", userData);
          // $('#editAlumniModal').find('input[name="userID"]').val(userData.userID);
          $('#editAlumniModal').find('input[name="alumniNumber"]').val(userData.userNumber);
          $('#editAlumniModal').find('input[name="firstName"]').val(userData.firstname);
          $('#editAlumniModal').find('input[name="middleName"]').val(userData.middlename);
          $('#editAlumniModal').find('input[name="lastName"]').val(userData.lastname);
          $('#editAlumniModal').find('input[name="suffix"]').val(userData.suffix);
          $('#editAlumniModal').find('input[name="birthMonth"]').val(userData.dateOfBirth.split('-')[1]);
          $('#editAlumniModal').find('input[name="birthYear"]').val(userData.dateOfBirth.split('-')[0]);
          $('#editAlumniModal').find('input[name="birthDay"]').val(userData.dateOfBirth.split('-')[2]);
          $('#editAlumniModal').find('input[name="mobileNumber"]').val(userData.mobileNo);
          $('#editAlumniModal').find('input[name="program"]').val(userData.programName);
          $('#editAlumniModal').find('input[name="personalEmail"]').val(userData.emailAddress);
          $('#editAlumniModal').find('input[name="pupWebmail"]').val(userData.webMail);
        } else {
          console.log('Unknown user type:', userType);
        }
      },
    })
  });

  $('#submitEditAlumni').off('click').on('click', function() {
    const userID = $(this).data('id');
    const alumniNumber = $('#editAlumniModal').find('input[name="alumniNumber"]').val();
    const firstName = $('#editAlumniModal').find('input[name="firstName"]').val();
    const middleName = $('#editAlumniModal').find('input[name="middleName"]').val();
    const lastName = $('#editAlumniModal').find('input[name="lastName"]').val();
    const suffix = $('#editAlumniModal').find('input[name="suffix"]').val();
    const birthMonth = $('#editAlumniModal').find('select[name="birthMonth"]').val();
    const birthYear = $('#editAlumniModal').find('select[name="birthYear"]').val();
    const birthDay = $('#editAlumniModal').find('select[name="birthDay"]').val();
    const mobileNumber = $('#editAlumniModal').find('input[name="mobileNumber"]').val();
    const program = $('#editAlumniModal').find('input[name="program"]').val();
    const personalEmail = $('#editAlumniModal').find('input[name="personalEmail"]').val();
    const pupWebmail = $('#editAlumniModal').find('input[name="pupWebmail"]').val();
    console.log("userID: ", userID);
    console.log("birthDay: ", birthDay);
    console.log("birthMonth: ", birthMonth);
    console.log("birthYear: ", birthYear);
    
    Swal.fire({
      icon: 'question',
      text: `Are you sure you want to update this alumni account?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel'
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
          url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/editBulkUploadAccount/",
          type: "POST",
          data: {
            userID: userID,
            userNumberEdit: alumniNumber,
            firstNameEdit: firstName,
            middleNameEdit: middleName,
            lastNameEdit: lastName,
            suffixEdit: suffix,
            birthYearEdit: birthYear,
            birthMonthEdit: birthMonth,
            birthDayEdit: birthDay,
            mobileNoEdit: mobileNumber,
            programNameEdit: program,
            emailAddressEdit: personalEmail,
            webMailEdit: pupWebmail,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            Swal.fire({
              title: 'Updated!',
              text: 'The alumni account has been successfully updated.',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success waves-effect' },
              buttonsStyling: false
            })
            .then(() => {
              dt_pending.ajax.reload(null, false);
              toggleActionBar();
              $('#editAlumniModal').modal('hide');
            })
          },
          error: function (xhr, status, error) {
            console.log(xhr.responseText);
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            Swal.fire({
              title: 'Failed to process data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
            })
          }
        })
      }
    })
  });

  $(document).on('click', '.item-activate', function() {
    Swal.fire({
      icon: 'question',
      text: `Are you sure you want to activate this item?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, activate it!',
      customClass: { confirmButton: 'btn btn-success', cancelButton: 'btn btn-outline-danger' },
      buttonsStyling: false
    })
    .then((result) => {
      if(result.isConfirmed) {
        const userID = $(this).data('id');

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
          url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/activateUploadedAccount/",
          type: "POST",
          data: {
            userID: userID,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Activated!',
              text: 'The selected item has been successfully activated.',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success waves-effect' },
              buttonsStyling: false
            })
            .then(() => {
              dt_pending.ajax.reload(null, false);
              toggleActionBar();
            })
          },
          error: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Failed to process data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
            })
          }
        })
      }
    })
  });     

  $(document).on('click', '.item-delete', function() {
    Swal.fire({
      icon: 'question',
      text: `Are you sure you want to delete this item?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-outline-secondary' },
      buttonsStyling: false
    })
    .then((result) => {
      if(result.isConfirmed) {
        const userID = $(this).data('id');

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
          url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/deleteBulkUploadAccount/",
          type: "POST",
          data: {
            userID: userID,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Deleted!',
              text: 'The selected item has been successfully deleted.',
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success waves-effect' },
              buttonsStyling: false
            })
            .then(() => {
              dt_pending.ajax.reload(null, false);
              toggleActionBar();
            })
          },
          error: function (response) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Failed to process data',
              text: 'Please reload the page and try again.',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-danger waves-effect' },
              buttonsStyling: false
            })
          }
        })
      }
    })
  });

  // Additional handleEdit function for differentiating modals based on user type.
  function handleEdit() {
    const rowData = dt_pending.row($(this).closest('tr')).data();
    const userType = rowData.userType;
    if (userType === 'Student') {
      $('#editStudentModal').modal('show');
    } else if (userType === 'Alumni') {
      $('#editAlumniModal').modal('show');
    } else {
      console.log('Unknown user type:', userType);
    }
  }

  // Remove small sizing from DataTables controls
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
