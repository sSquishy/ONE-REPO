/**
 * File Upload with Preview
 */

'use strict';

(function () {
  const previewTemplate = `<div class="dz-preview dz-file-preview">
    <div class="dz-details">
      <div class="dz-thumbnail">
        <img data-dz-thumbnail>
        <span class="dz-nopreview">No preview</span>
        <div class="dz-success-mark"></div>
        <div class="dz-error-mark"></div>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
        <div class="progress">
          <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
        </div>
      </div>
      <div class="dz-filename" data-dz-name></div>
      <div class="dz-size" data-dz-size></div>
    </div>
  </div>`;

  let currentFile = null;
  let totalRows = 0;
  const confirmUploadBtn = $('#confirmUpload');
  let myDropzone; // Make Dropzone instance accessible

  // Initialize Dropzone
  const dropzoneBasic = $('#dropzone-basic');
  if (dropzoneBasic.length) {
    myDropzone = new Dropzone(dropzoneBasic[0], {
      url: "/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/processBulkUploads/",
      previewTemplate: previewTemplate,
      parallelUploads: 1,
      maxFilesize: 5,
      addRemoveLinks: true,
      maxFiles: 1,
      autoProcessQueue: false, // Disable auto-upload
      acceptedFiles: '.csv,.xls,.xlsx',
      dictInvalidFileType: 'Only CSV and Excel files are allowed!',
      init: function() {
        this.on('addedfile', function(file) {
          currentFile = file;
          confirmUploadBtn.show();
          showPreview(file);
        });

        this.on('removedfile', function() {
          currentFile = null;
          confirmUploadBtn.hide();
          hidePreview();
        });
      }
    });

    // Confirm Upload Handler
    confirmUploadBtn.on('click', function() {
      if (!currentFile) return;

      Swal.fire({
        title: 'Confirm Bulk Upload?',
        html: `<div class="text-start">
                <p class="mb-2">You are about to upload:</p>
                <ul class="list-unstyled">
                  <li><strong>File:</strong> ${currentFile.name}</li>
                  <li><strong>Records:</strong> ${totalRows}</li>
                </ul>
              </div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm Upload',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          let swalTimeouts = showProcessingSwal(
            "Processing Bulk Upload",
            "Please wait while we process your bulk upload...",
            "Failed to process bulk upload. Please try again.",
            120000, 300000
          );

          const formData = new FormData();
          formData.append('csvFile', currentFile);
          formData.append('csrfmiddlewaretoken', $('input[name="csrfmiddlewaretoken"]').val());

          $.ajax({
            url: '/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/processBulkUploads/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
              console.log('Response: ', response);
              stopProcessingSwal(swalTimeouts);

              if(response.status === "Partial") {
                Swal.fire({
                  title: "Partial Upload",
                  html: `<div class="text-start">
                          <p class="mb-2">Bulk upload was successful but with some failed items.</p>
                          <ul class="list-unstyled">
                            <li><strong>Failed Items:</strong> ${response.failed_rows}</li>
                          </ul>
                          <p class="mb-2">Reason given:</p>
                          <ul class="list-unstyled">
                            <li>${response.message}</li>
                          </ul>
                        </div>`,
                  icon: 'warning',
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'btn btn-primary waves-effect waves-light'
                  },
                  buttonsStyling: false
                })
              } else if(response.status === "Duplicates") {
                Swal.fire({
                  icon: "success",
                  title: "Success",
                  text: "Your file was processed and it looks like all the records are already in the system.",
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'btn btn-primary waves-effect waves-light'
                  },
                  buttonsStyling: false
                })
              } else {
                Swal.fire({
                  title: "Success",
                  text: "Bulk upload was successful!",
                  icon: 'success',
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'btn btn-primary waves-effect waves-light'
                  },
                  buttonsStyling: false
                });
              }

              document.dt_pending.ajax.reload(null, false);
              $('#bulkUploadModal').modal('hide');
              myDropzone.removeAllFiles(true);
              totalRows = 0; // Reset counter
            },
            error: function(xhr, status, error) {
              console.log('Error: ', xhr.responseText);
              stopProcessingSwal(swalTimeouts);

              Swal.fire({
                title: 'Error',
                text: 'An error occurred while processing the bulk upload. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                  confirmButton: 'btn btn-primary waves-effect waves-light'
                },
                buttonsStyling: false
              })
            }
          })
        }
      });
    });
  }

  function showPreview(file) {
    const reader = new FileReader();
    const previewSection = $('.preview-section');
    const previewTable = $('#previewTable');

    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1, defval: " "});

      // Set total rows
      totalRows = jsonData.length - 1;

      // Clear existing content
      previewTable.find('thead').empty();
      previewTable.find('tbody').empty();

      // Create headers
      const headers = jsonData[0];
      const headerRow = $('<tr></tr>');
      headers.forEach(header => {
        headerRow.append(`<th>${header || 'Untitled Column'}</th>`);
      });
      previewTable.find('thead').append(headerRow);

      // Create body (show all rows with scroll)
      const tbody = previewTable.find('tbody');
      for(let i = 1; i < jsonData.length; i++) {
        const row = $('<tr></tr>');
        jsonData[i].forEach((cell, index) => {
          const cellValue = cell === undefined || cell === '' ?
            '<span class="empty-cell">(blank)</span>' :
            cell;
          row.append(`<td>${cellValue}</td>`);
        });
        tbody.append(row);
      }

      previewSection.removeClass('d-none');
    };

    reader.readAsArrayBuffer(file);
  }

  // Hide preview function
  function hidePreview() {
    const previewSection = $('.preview-section');
    previewSection.addClass('d-none');
    $('#previewTable thead').empty();
    $('#previewTable tbody').empty();
  }

  $('#cancelUpload').on('click', function() {
    if(currentFile) {
      myDropzone.removeFile(currentFile);
    }
    hidePreview();
  });
})();
