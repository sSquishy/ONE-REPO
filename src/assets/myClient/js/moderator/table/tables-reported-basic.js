'use strict';
let dt_reported;

$(function () {
  const dt_reported_table = $('#reportedTable');
  const reportedActionBar = $('#reported_actionBar');
  const reportedSelectedCount = $('#reported_selectedCount');


  // let dt_published = ...
  // let dt_rejected = ...

  function deactivateAllActionBars() {
    $('#publish_actionBar').hide();
    $('#reject_actionBar').hide();
    $('#reported_actionBar').hide();
  }

  if (dt_reported_table.length) {
    dt_reported = dt_reported_table.DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
      ajax: {
        url: getFlaggedPosts,
        dataSrc: 'data',
        type: 'GET',
        error: function(xhr, status, error) {
          console.log(xhr.responseText);
        }
      },
      columns: [
        {
          data: 'postID',
          render: (data) => `<input type="checkbox" class="dt-checkboxes form-check-input declined-checkbox" value="${data}">`
        },
        { data: 'postID' },
        {
          data: 'postImage',
          render: data => `<img src="${data}" alt="Image" style="max-height:50px;">`
        },
        {
          data: 'postContent',
          render: data => `<span style="color: black !important;">${data}</span>`
        },
        {
          data: null,
          render: data => `
            <div>
              <div style="color: black !important;">${data.postAuthor}</div>
              <div style="color: black !important; font-size: smaller;">${data.postAuthorID}</div>
            </div>
          `
        },
        {
          data: 'postID',
          render: data => `<span class="badge rounded-pill bg-secondary" style="font-weight:bold;">${data}</span>`
        },
        {
          data: 'createdTime',
          render: data => `
            <div class="d-flex align-items-center">
              <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
              <span style="color: black !important;">${data}</span>
            </div>
          `
        },
        {
          data: 'evaluatedTime',
          render: data => `
            <div class="d-flex align-items-center">
              <i class="mdi mdi-calendar-clock-outline me-2 text-muted"></i>
              <span style="color: black !important;">${data}</span>
            </div>
          `
        },
        {
          data: 'postID',
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

    // Relaod table when the tab is clicked
    $('[data-bs-target="#reported"]').on('click', function() {
      dt_reported.ajax.reload();
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
          const postID = reportedId;
          console.log('Publishing post with ID:', postID);
          document.moderatePostFunc('Approved', postID, null)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Publish Successful!',
                text: 'Rejected post has been published successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_reported.ajax.reload(null, false);
            }
          })
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
          const postID = reportedId;
          document.moderatePostFunc('Declined', postID, null)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Reject Successful!',
                text: 'Publish item has been rejected successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_reported.ajax.reload(null, false);
            }
          })
        }
      });
    });

       
    $(document).on('click', '#reported_edit, #reportedTable .item-edit', function () {
      let selectedId = null;
      let selectedRows = 0;

      if($(this).attr('id') === 'reported_edit') {
        // Action Bar Buttons
        // Edit (bulk) - but only if 1 row is selected
        selectedRows = dt_reported.rows({ selected: true }).count();
        selectedId = dt_reported.rows({ selected: true }).data()[0].postID;
      } else {
        // Row-level actions
        selectedRows = 1;
        selectedId = $(this).data('id');
      }

      if (selectedRows === 1) {
        $('#editReportModal').modal('show');

        Swal.fire({
            title: "Loading...",
            text: "Retrieving report details...",
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
                title: 'Failed to load flag details',
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
          url: getFlagDetails,
          type: 'GET',
          data: { postID: selectedId },
          success: function (data) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            // Populate modal with data
            $('#reportTitle').val(data.reportTitle);
            $('#reportDescription').val(data.reportDescription);
            $('#reportCategory').val(data.reportCategory);
            $('#submitReport').attr('data-id', selectedId).data('id', selectedId);
          },
          error: function (xhr, status, error) {
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            console.log(xhr.responseText);
          }
        })
      }
    });

    $('#submitReport').on('click', function() {
      const postID = $(this).data('id');
      const reportTitle = $('#reportTitle').val();
      const reportDescription = $('#reportDescription').val();
      const reportCategory = $('#reportCategory').val();

      if(reportTitle === '' || reportDescription === '' || reportCategory === '') {
        Swal.fire({
          title: 'Incomplete Form',
          text: 'Please fill in all fields before submitting the report.',
          icon: 'warning',
          customClass: { confirmButton: 'btn btn-warning' },
          buttonsStyling: false
        });
        return;
      }

      Swal.fire({
        title: 'Update Report',
        text: 'Are you sure you want to update this report?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-warning me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      })
      .then(result => {
        if(result.isConfirmed) {
          Swal.fire({
              title: "Saving...",
              text: "Updating the report...",
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
                  title: 'Saving...',
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
                  title: 'Failed to update report',
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
            url: editFlag,
            type: 'POST',
            data: {
              postID: postID,
              reportTitle: reportTitle,
              reportDescription: reportDescription,
              reportCategory: reportCategory,
              csrfmiddlewaretoken: csrf
            },
            success: function(data) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              Swal.fire({
                title: 'Report Updated',
                text: 'The report has been updated successfully.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              })
              .then(() => {
                $('#editReportModal').modal('hide');
                dt_reported.ajax.reload(null, false);
              });
            },
            error: function(xhr, status, error) {
              clearTimeout(timeout);
              clearTimeout(timeout2);
              Swal.close();

              console.log(xhr.responseText);
              Swal.fire({
                title: 'Failed to update report',
                text: 'Please try again later.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger' },
                buttonsStyling: false
              })
            }
          })
        }
      });
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
          const postIDList = selectedData.map(item => item.postID);
          console.log(postIDList);
          document.moderatePostFunc('Approved', postIDList, null, true)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Publish Successful!',
                text: 'Reported post has been published successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_reported.ajax.reload(null, false);
            }
          })
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
          const postIDList = selectedData.map(item => item.postID);
          console.log(postIDList);
          document.moderatePostFunc('Declined', postIDList, null, true)
          .then(response => {
            if(response) {
              Swal.fire({
                title: 'Reject Successful!',
                text: 'Reported post has been rejected successfully',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' },
                buttonsStyling: false
              });
              dt_reported.ajax.reload(null, false);
            }
          })
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
