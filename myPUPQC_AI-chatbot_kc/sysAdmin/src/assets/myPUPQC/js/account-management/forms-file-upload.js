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
  const confirmUploadBtn = document.getElementById('confirmUpload');
  let myDropzone; // Make Dropzone instance accessible

  // Initialize Dropzone
  const dropzoneBasic = document.querySelector('#dropzone-basic');
  if (dropzoneBasic) {
    myDropzone = new Dropzone(dropzoneBasic, {
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
          confirmUploadBtn.style.display = 'inline-block';
          showPreview(file);
        });

        this.on('removedfile', function() {
          currentFile = null;
          confirmUploadBtn.style.display = 'none';
          hidePreview();
        });
      }
    });

    // Confirm Upload Handler
    confirmUploadBtn.addEventListener('click', function() {
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
          const processingAlert = Swal.fire({
            title: 'Processing...',
            html: '<div class="spinner-border text-primary" role="status"></div>',
            showConfirmButton: false,
            allowOutsideClick: false
          });

          // In the success handler
          myDropzone.on('success', function(file, response) {
            processingAlert.close();
            Swal.fire({
              title: 'Upload Successful!',
              text: `${totalRows} records imported successfully`, // Changed from response.processed
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success waves-effect'
              }
            }).then(() => {
              $('#bulkUploadModal').modal('hide');
              myDropzone.removeAllFiles(true);
              totalRows = 0; // Reset counter
            });
          });

          // Handle upload errors
          myDropzone.on('error', function(file, error) {
            processingAlert.close();
            Swal.fire({
              title: 'Upload Failed',
              text: error.message || 'An error occurred during upload',
              icon: 'error',
              customClass: {
                confirmButton: 'btn btn-danger waves-effect'
              }
            });
          });

          // Start manual processing
          myDropzone.processQueue();
        }
      });
    });
  }

  function showPreview(file) {
    const reader = new FileReader();
    const previewSection = document.querySelector('.preview-section');
    const previewTable = document.querySelector('#previewTable');

    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1, defval: " "});

      // Set total rows
      totalRows = jsonData.length - 1;

      // Clear existing content
      previewTable.querySelector('thead').innerHTML = '';
      previewTable.querySelector('tbody').innerHTML = '';

      // Create headers
      const headers = jsonData[0];
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        headerRow.innerHTML += `<th>${header || 'Untitled Column'}</th>`;
      });
      previewTable.querySelector('thead').appendChild(headerRow);

      // Create body (show all rows with scroll)
      const tbody = previewTable.querySelector('tbody');
      for(let i = 1; i < jsonData.length; i++) {
        const row = document.createElement('tr');
        jsonData[i].forEach((cell, index) => {
          const cellValue = cell === undefined || cell === '' ?
            '<span class="empty-cell">(blank)</span>' :
            cell;
          row.innerHTML += `<td>${cellValue}</td>`;
        });
        tbody.appendChild(row);
      }

      previewSection.classList.remove('d-none');
    };

    reader.readAsArrayBuffer(file);
  }

  // Hide preview function
  function hidePreview() {
    const previewSection = document.querySelector('.preview-section');
    previewSection.classList.add('d-none');
    document.querySelector('#previewTable thead').innerHTML = '';
    document.querySelector('#previewTable tbody').innerHTML = '';
  }

  function showPreview(file) {
    const reader = new FileReader();
    const previewSection = document.querySelector('.preview-section');
    const previewTable = document.querySelector('#previewTable');

    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1, defval: " "});

      totalRows = jsonData.length - 1;

      // Clear existing content
      previewTable.querySelector('thead').innerHTML = '';
      previewTable.querySelector('tbody').innerHTML = '';

      // Create headers
      const headers = jsonData[0];
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        headerRow.innerHTML += `<th>${header || 'Untitled Column'}</th>`;
      });
      previewTable.querySelector('thead').appendChild(headerRow);

      // Create body (show all rows with scroll)
      const tbody = previewTable.querySelector('tbody');
      for(let i = 1; i < jsonData.length; i++) {
        const row = document.createElement('tr');
        jsonData[i].forEach((cell, index) => {
          const cellValue = cell === undefined || cell === '' ?
            '<span class="empty-cell">(blank)</span>' :
            cell;
          row.innerHTML += `<td>${cellValue}</td>`;
        });
        tbody.appendChild(row);
      }

      previewSection.classList.remove('d-none');
    };

    reader.readAsArrayBuffer(file);
  }

  function hidePreview() {
    const previewSection = document.querySelector('.preview-section');
    previewSection.classList.add('d-none');
    document.querySelector('#previewTable thead').innerHTML = '';
    document.querySelector('#previewTable tbody').innerHTML = '';
  }

  document.querySelector('#cancelUpload').addEventListener('click', function() {
    if(currentFile) {
      myDropzone.removeFile(currentFile);
    }
    hidePreview();
  });
})();
