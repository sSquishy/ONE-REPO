/**
 * File Upload with Preview
 */

'use strict';

(function () {
  const previewTemplate = `
  <div class="dz-preview dz-file-preview">
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
      url: '/sysAdmin/Admin/Account-Management/Manage-Bulk-Upload/processBulkUploads/',
      previewTemplate: previewTemplate,
      parallelUploads: 1,
      maxFilesize: 5,
      addRemoveLinks: true,
      maxFiles: 1,
      autoProcessQueue: false, // Disable auto-upload
      acceptedFiles: '.csv,.xls,.xlsx',
      dictInvalidFileType: 'Only CSV and Excel files are allowed!',
      init: function () {
        this.on('addedfile', function (file) {
          currentFile = file;
          confirmUploadBtn.show();
          showPreview(file);
        });

        this.on('removedfile', function () {
          currentFile = null;
          confirmUploadBtn.hide();
          hidePreview();
        });
      }
    });

    // Confirm Upload Handler
    confirmUploadBtn.on('click', function () {
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
            'Processing Bulk Upload',
            'Please wait while we process your bulk upload...',
            'Failed to process bulk upload. Please try again.',
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
            success: function (response) {
              console.log('Response: ', response);
              stopProcessingSwal(swalTimeouts);

              if (response.status === 'Partial') {
                Swal.fire({
                  title: 'Partial Upload',
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
                });
              } else if (response.status === 'Duplicates') {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Your file was processed and it looks like all the records are already in the system.',
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'btn btn-primary waves-effect waves-light'
                  },
                  buttonsStyling: false
                });
              } else {
                Swal.fire({
                  title: 'Success',
                  text: 'Bulk upload was successful!',
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
            error: function (xhr, status, error) {
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
              });
            }
          });
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

      // Ensure invalid-cell styles exist
      if ($('#preview-validation-styles').length === 0) {
        $('head').append('<style id="preview-validation-styles">#previewTable td.invalid-cell{background-color:#ffe6e6;color:#b30000;}#previewTable td .empty-cell{color:#b30000;font-style:italic;}#previewTable td.suggest-cell{background-color:#fff4cc;color:#9a6b00;}</style>');
      }

  let anyInvalid = false;
  const reUserNumber = /^\d{4}-\d{5}-[A-Z]+-\d$/; // ####-#####-LETTERS-# (letters can be 1+)
      const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // common domains to check for typos
      const commonDomains = ['gmail.com','googlemail.com','yahoo.com','outlook.com','hotmail.com','example.com','icloud.com','live.com','msn.com'];

      // simple Levenshtein distance
      function levenshtein(a,b){
        if(!a||!b) return (a||'').length + (b||'').length;
        const m=a.length, n=b.length; const d = Array(m+1).fill(null).map(()=>Array(n+1).fill(0));
        for(let i=0;i<=m;i++) d[i][0]=i;
        for(let j=0;j<=n;j++) d[0][j]=j;
        for(let i=1;i<=m;i++){
          for(let j=1;j<=n;j++){
            const cost = a[i-1]===b[j-1]?0:1;
            d[i][j]=Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+cost);
          }
        }
        return d[m][n];
      }

      // helpers for date validation
      function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }
      function daysInMonth(y,m) { return [31, (isLeapYear(y)?29:28),31,30,31,30,31,31,30,31,30,31][m-1]; }
      const currentYear = new Date().getFullYear();

      const rowsRaw = [];
      for(let i = 1; i < jsonData.length; i++) {
        const row = $('<tr></tr>');
        const rowValues = [];
        jsonData[i].forEach((cell, index) => {
          const isBlank = cell === undefined || cell === '';
          const rawVal = (cell || '').toString();
          rowValues.push(rawVal.toString().trim());
          const cellValue = rawVal.trim() === '' ? '<span class="empty-cell"></span>' : $('<div>').text(rawVal).html();
          const td = $(`<td>${cellValue}</td>`);

          // First-column user_type checker (index 0) - only Student or Alumni; also mark blank
          if (index === 0) {
            const raw = rawVal.toString().trim();
            if (raw === '' || (raw !== 'Student' && raw !== 'Alumni')) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'user_type must be exactly "Student" or "Alumni" and cannot be blank');
            }
          }

          // Second-column user_number checker (index 1)
          if (index === 1) {
            const raw = rawVal.toString().trim();
            if (raw === '' || !reUserNumber.test(raw)) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'Invalid user_number format. Expected ####-#####-XX-# (e.g., 1955-00300-CM-0); letters must be uppercase');
            }
          }

          // Mobile number checker (column index 5) - Philippine formats: 10 digits starting with 9 OR 11 digits starting with 0 followed by 10-digit starting with 9
          if (index === 5) {
            const raw = (rawVal || '').toString().trim();
            const digits = raw.replace(/\D/g, '');
            let ok = false;
            if (digits.length === 10 && digits.startsWith('9')) ok = true;
            if (digits.length === 11 && digits.startsWith('0') && digits.slice(1).startsWith('9')) ok = true;
            if (!ok) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'mobileNo must be 10–11 digits (e.g., 9384990901 or 09384990901). 10-digit numbers should start with 9.');
            }
          }

          // Email address checker (column index 6)
          if (index === 6) {
            const raw = (rawVal || '').toString().trim();
            if (raw === '' || !reEmail.test(raw)) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'emailAddress must be a valid email (local@domain.tld) and cannot be blank');
            } else {
              // Suggest likely domain typos (e.g., gmai.com)
              const parts = raw.split('@');
              if (parts.length === 2) {
                const domain = parts[1].toLowerCase();
                let best = null; let bestDist = 999;
                commonDomains.forEach(d => {
                  const dist = levenshtein(domain, d);
                  if (dist < bestDist) { bestDist = dist; best = d; }
                });
                // if close match but not exact, show suggestion (do not block upload)
                if (best && bestDist > 0 && bestDist <= 2 && best !== domain) {
                  td.addClass('suggest-cell').attr('title', `Did you mean ${parts[0]}@${best}?`);
                }
              }
            }
          }

          // webMail checker (column index 7) - must be local@iskolarngbayan.pup.edu.ph with non-empty local part
          if (index === 7) {
            const raw = (rawVal || '').toString().trim();
            const domain = '@iskolarngbayan.pup.edu.ph';
            const lower = raw.toLowerCase();
            const atPos = raw.indexOf('@');
            // require non-empty local part and correct domain
            if (!raw || atPos <= 0 || lower.indexOf(domain, raw.length - domain.length) === -1) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', `webMail must be in the form local${domain} (local part required)`);
            } else {
              const local = raw.substring(0, atPos);
              // allow letters, digits, dot, underscore, percent, plus, hyphen
              if (!/^[A-Za-z0-9._%+-]+$/.test(local)) {
                anyInvalid = true;
                td.addClass('invalid-cell').attr('title', 'webMail local part contains invalid characters');
              }
            }
          }

          // Birth fields basic format checks at cell-level (we'll do cross-field checks after row built)
          if (index === 2) { // birthYear
            const raw = rawVal.toString().trim();
            if (!/^\d{4}$/.test(raw)) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'birthYear must be 4 digits (YYYY)');
            } else {
              const y = parseInt(raw,10);
              if (y < 1900 || y > currentYear) {
                anyInvalid = true;
                td.addClass('invalid-cell').attr('title', `birthYear must be between 1900 and ${currentYear}`);
              }
            }
          }

          // Required non-blank checks:
          // 9th column (index 8) programShortName, 10th (index 9) programName,
          // 11th (index 10) firstname, 13th (index 12) lastname
          if (index === 8 || index === 9 || index === 10 || index === 12) {
            const raw = (rawVal || '').toString().trim();
            if (!raw) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'This field is required and cannot be blank');
            }
          }
          if (index === 3) { // birthMonth
            const raw = rawVal.toString().trim();
            if (!/^(?:0?[1-9]|1[0-2])$/.test(raw)) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'birthMonth must be 1-12 (mm or m)');
            }
          }
          if (index === 4) { // birthDay
            const raw = rawVal.toString().trim();
            if (!/^(?:0?[1-9]|[12][0-9]|3[01])$/.test(raw)) {
              anyInvalid = true;
              td.addClass('invalid-cell').attr('title', 'birthDay must be 1-31 (dd or d)');
            }
          }

          row.append(td);
        });
        tbody.append(row);
        rowsRaw.push(rowValues);
      }

      // Cross-field validation: check day validity with month/year
      rowsRaw.forEach((vals, rowIdx) => {
        const yRaw = vals[2] || '';
        const mRaw = vals[3] || '';
        const dRaw = vals[4] || '';
        const y = parseInt(yRaw,10);
        const m = parseInt(mRaw,10);
        const d = parseInt(dRaw,10);
        const tr = tbody.find('tr').eq(rowIdx);
        // only perform if numeric
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          if (m < 1 || m > 12) {
            anyInvalid = true;
            tr.find('td').eq(3).addClass('invalid-cell').attr('title','Invalid month (1-12)');
          } else {
            const dim = daysInMonth(y,m);
            if (d < 1 || d > dim) {
              anyInvalid = true;
              tr.find('td').eq(4).addClass('invalid-cell').attr('title', `Invalid day for ${m}/${y}`);
            }
          }
        } else {
          // If any part is non-numeric but non-empty, mark appropriate cells (if they aren't already marked)
          if (yRaw && !/^\d{4}$/.test(yRaw)) { anyInvalid = true; tr.find('td').eq(2).addClass('invalid-cell').attr('title','birthYear must be 4 digits (YYYY)'); }
          if (mRaw && !/^(?:0?[1-9]|1[0-2])$/.test(mRaw)) { anyInvalid = true; tr.find('td').eq(3).addClass('invalid-cell').attr('title','birthMonth must be 1-12 (mm or m)'); }
          if (dRaw && !/^(?:0?[1-9]|[12][0-9]|3[01])$/.test(dRaw)) { anyInvalid = true; tr.find('td').eq(4).addClass('invalid-cell').attr('title','birthDay must be 1-31 (dd or d)'); }
        }
      });

      // Toggle confirm button and warnings based on validation
      previewSection.find('.preview-warning').remove();
      if (anyInvalid) {
        confirmUploadBtn.prop('disabled', true).hide();
        previewSection.prepend(`<div class="alert alert-danger preview-warning">One or more rows have invalid values. Please correct highlighted cells </div>`);
      } else {
        confirmUploadBtn.prop('disabled', false).show();
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
