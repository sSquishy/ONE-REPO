$(document).ready(function () {
  // Disable auto-discovery for all Dropzone instances
  Dropzone.autoDiscover = false;

  /////////////////////////////
  // slide show Modal Script //
  /////////////////////////////
  (function () {
    var currentFile = null;
    var dropzoneElem = document.querySelector('#dropzone-images');
    var uploadSection = document.querySelector('#upload-section');
    var previewContainer = document.querySelector('#upload-preview');
    var submitBtn = document.querySelector('#submit-upload');
    var statusSelect = document.getElementById('slideshowStatus');
    
    // Track file upload status
    let isFileFullyUploaded = false;

    // Remove error styling on change
    statusSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
        validateForm();
      }
    });

    var originalDropzone = new Dropzone(dropzoneElem, {
      url: '/upload',
      maxFiles: 1,
      maxFilesize: 5,
      acceptedFiles: 'image/jpeg,image/png',
      addRemoveLinks: false,
      autoProcessQueue: true,
      dictDefaultMessage: 'Drop image here to upload',
      dictInvalidFileType: 'Invalid file type. Only JPEG/PNG allowed.',
      previewTemplate: '<div style="display:none"></div>',
      init: function () {
        this.on('addedfile', function (file) {
          uploadSection.style.display = 'none';
          previewContainer.style.display = 'block';
          var reader = new FileReader();
          reader.onload = function (e) {
            document.getElementById('uploaded-preview').src = e.target.result;
          };
          reader.readAsDataURL(file);
          document.getElementById('uploaded-filename').textContent = file.name;
          document.getElementById('uploaded-size').textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB';
          currentFile = file;
          isFileFullyUploaded = false;
          
          // Reset progress bar for animation
          const progressBar = previewContainer.querySelector(".upload-progress-bar");
          progressBar.style.width = "0%";
          document.getElementById("upload-percentage").textContent = "0%";
          // Force reflow to enable CSS transition
          void progressBar.offsetWidth;
          
          validateForm();
        });
        
        // Live progress updates
        this.on('uploadprogress', function (file, progress) {
          var progressBar = document.querySelector('#upload-preview .upload-progress-bar');
          const percentage = Math.round(progress);
          if (progressBar) {
            progressBar.style.width = percentage + '%';
            // Add animation during upload
            if (percentage > 0 && percentage < 100) {
              progressBar.style.animation = "pulse 1.5s infinite";
            } else {
              progressBar.style.animation = "none";
            }
          }
          document.getElementById('upload-percentage').textContent = percentage + '%';
        });

        // When upload completes
        this.on('complete', function(file) {
          if (file.status === "success") {
            isFileFullyUploaded = true;
            const progressBar = previewContainer.querySelector(".upload-progress-bar");
            if (progressBar) {
              progressBar.style.animation = "none";
              progressBar.style.background = "#28a745";
              document.getElementById("upload-percentage").style.color = "#28a745";
            }
            validateForm();
          }
        });

        this.on('removedfile', function (file) {
          uploadSection.style.display = 'block';
          previewContainer.style.display = 'none';
          submitBtn.disabled = true;
          currentFile = null;
          isFileFullyUploaded = false;
          validateForm();
        });
      }
    });

    document.getElementById('remove-upload').addEventListener('click', function () {
      if (currentFile) {
        Swal.fire({
          title: 'Remove File?',
          text: 'Are you sure you want to remove this file?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, remove it!',
          customClass: {
            confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
            cancelButton: 'btn btn-outline-secondary waves-effect'
          },
          buttonsStyling: false
        }).then(function (result) {
          if (result.isConfirmed) {
            originalDropzone.removeFile(currentFile);
            Swal.fire({
              title: 'Removed!',
              text: 'The file has been removed.',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success waves-effect'
              },
              buttonsStyling: false
            });
          }
        });
      }
    });

    // Validate form (file uploaded and status selected)
    function validateForm() {
      const isValid = currentFile && isFileFullyUploaded && statusSelect.value;
      submitBtn.disabled = !isValid;
      return isValid;
    }

    document.getElementById('submit-upload').addEventListener('click', function () {
      // STATUS VALIDATION CHECK ADDED
      if (!statusSelect.value) {
        statusSelect.classList.add('is-invalid');
        return;
      } else {
        statusSelect.classList.remove('is-invalid');
      }

      Swal.fire({
        title: 'Confirm Upload',
        text: 'Are you sure you want to upload this file?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, upload it!',
        customClass: {
          confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(function (result) {
        if (result.isConfirmed) {
          // Since we're using autoProcessQueue: true, the file is already uploaded
          // Now we need to submit the form data with status
          
          let formData = new FormData();
          formData.append('status', statusSelect.value);
          formData.append('section', 'main');
          formData.append('slideshowImage', currentFile);
          formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

          // Show processing Swal with progress
          let progressInterval;
          let progress = 0;
          let processingSwal = Swal.fire({
            title: 'Processing...',
            html: `
              <div class="progress mt-3" style="height: 20px; border-radius: 10px;">
                <div id="swal-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" style="width: 0%;"></div>
              </div>
              <p class="mt-3 mb-0" id="swal-progress-text">Starting upload process...</p>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
              progressInterval = setInterval(() => {
                progress += 10;
                if (progress > 90) progress = 90; // Leave room for final step
                const progressBar = document.getElementById('swal-progress-bar');
                const progressText = document.getElementById('swal-progress-text');
                if (progressBar) progressBar.style.width = `${progress}%`;                  if (progressText) progressText.textContent = `Processing: ${progress}%`;
              }, 300);
            },
            willClose: () => {
              clearInterval(progressInterval);
            }
          });

          $.ajax({
            url: "/sysAdmin/Admin/Content-Management/addSlideShow/",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
              clearInterval(progressInterval);
              processingSwal.close();
              
              Swal.fire({
                title: 'Success!',
                text: 'File uploaded successfully!',
                icon: 'success',
                customClass: {
                  confirmButton: 'btn btn-success waves-effect'
                },
                buttonsStyling: false
              }).then(function () {
                $('#imageUploadModal').modal('hide');
                document.dt_select.ajax.reload(null, false);
              });
            },
            error: function (xhr, status, error) {
              console.log(xhr.responseText);
              clearInterval(progressInterval);
              processingSwal.close();
              
              Swal.fire({
                title: 'Error!',
                text: 'Failed to upload file',
                icon: 'error',
                customClass: {
                  confirmButton: 'btn btn-danger waves-effect'
                },
                buttonsStyling: false
              });
            }
          });
        }
      });
    });

    $('#imageUploadModal').on('hidden.bs.modal', function () {
      originalDropzone.removeAllFiles(true);
      uploadSection.style.display = 'block';
      previewContainer.style.display = 'none';
      submitBtn.disabled = true;
      statusSelect.selectedIndex = 0;
      currentFile = null;
      isFileFullyUploaded = false;
    });
    
    // Add pulse animation for progress bar
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.9; }
        50% { opacity: 0.6; }
        100% { opacity: 0.9; }
      }
    `;
    document.head.appendChild(style);
  })();

  ///////////////////////////
  // MyPupQC Modal Script  //
  ///////////////////////////
  (function () {
    var currentFile = null;
    var dropzoneElem = document.querySelector('#mypupqc-dropzone-images');
    var uploadSection = document.querySelector('#mypupqc-upload-section');
    var previewContainer = document.querySelector('#mypupqc-upload-preview');
    var submitBtn = document.querySelector('#mypupqc-submit-upload');
    var statusSelect = document.getElementById('mypupqcStatus');
    
    // Track file upload status
    let isFileFullyUploaded = false;

    // Remove error styling on change
    statusSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
        validateForm();
      }
    });

    var myPupqcDropzone = new Dropzone(dropzoneElem, {
      url: '/upload_mypupqc',
      maxFiles: 1,
      maxFilesize: 5,
      acceptedFiles: 'image/jpeg,image/png',
      addRemoveLinks: false,
      autoProcessQueue: true, // Enable auto upload
      dictDefaultMessage: 'Drop image here to upload',
      dictInvalidFileType: 'Invalid file type. Only JPEG/PNG allowed.',
      previewTemplate: '<div style="display:none"></div>',
      init: function () {
        this.on('addedfile', function (file) {
          uploadSection.style.display = 'none';
          previewContainer.style.display = 'block';
          var reader = new FileReader();
          reader.onload = function (e) {
            document.getElementById('mypupqc-uploaded-preview').src = e.target.result;
          };
          reader.readAsDataURL(file);
          document.getElementById('mypupqc-uploaded-filename').textContent = file.name;
          document.getElementById('mypupqc-uploaded-size').textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB';
          currentFile = file;
          isFileFullyUploaded = false;
          
          // Reset progress bar for animation
          const progressBar = document.querySelector('#mypupqc-upload-preview .upload-progress-bar');
          progressBar.style.width = "0%";
          document.getElementById("mypupqc-upload-percentage").textContent = "0%";
          progressBar.style.background = "#0d6efd"; // Reset color
          document.getElementById("mypupqc-upload-percentage").style.color = "#0d6efd"; // Reset color
          
          // Force reflow to enable CSS transition
          void progressBar.offsetWidth;
          
          validateForm();
        });
        
        // Live progress updates
        this.on('uploadprogress', function (file, progress) {
          var progressBar = document.querySelector('#mypupqc-upload-preview .upload-progress-bar');
          const percentage = Math.round(progress);
          if (progressBar) {
            progressBar.style.width = percentage + '%';
            // Add animation during upload
            if (percentage > 0 && percentage < 100) {
              progressBar.style.animation = "pulse 1.5s infinite";
            } else {
              progressBar.style.animation = "none";
            }
          }
          document.getElementById('mypupqc-upload-percentage').textContent = percentage + '%';
        });
        
        // When upload completes
        this.on('complete', function(file) {
          if (file.status === "success") {
            isFileFullyUploaded = true;
            const progressBar = document.querySelector('#mypupqc-upload-preview .upload-progress-bar');
            if (progressBar) {
              progressBar.style.animation = "none";
              progressBar.style.background = "#28a745"; // Success color
              document.getElementById("mypupqc-upload-percentage").style.color = "#28a745"; // Success color
              
              // Success animation
              progressBar.style.transition = "all 0.5s ease";
              setTimeout(() => {
                progressBar.style.boxShadow = "0 0 0 8px rgba(40, 167, 69, 0.3)";
                setTimeout(() => {
                  progressBar.style.boxShadow = "none";
                }, 500);
              }, 300);
            }
            validateForm();
          }
        });

        this.on('removedfile', function (file) {
          uploadSection.style.display = 'block';
          previewContainer.style.display = 'none';
          submitBtn.disabled = true;
          currentFile = null;
          isFileFullyUploaded = false;
          validateForm();
        });
      }
    });

    // Validate form (file uploaded and status selected)
    function validateForm() {
      const isValid = currentFile && isFileFullyUploaded && statusSelect.value;
      submitBtn.disabled = !isValid;
      return isValid;
    }

    document.getElementById('mypupqc-remove-upload').addEventListener('click', function () {
      if (currentFile) {
        Swal.fire({
          title: 'Remove File?',
          text: 'Are you sure you want to remove this file?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, remove it!',
          customClass: {
            confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
            cancelButton: 'btn btn-outline-secondary waves-effect'
          },
          buttonsStyling: false
        }).then(function (result) {
          if (result.isConfirmed) {
            myPupqcDropzone.removeFile(currentFile);
            Swal.fire({
              title: 'Removed!',
              text: 'The file has been removed.',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success waves-effect'
              },
              buttonsStyling: false
            });
          }
        });
      }
    });

    document.getElementById('mypupqc-submit-upload').addEventListener('click', function () {
      // STATUS VALIDATION CHECK ADDED
      if (!statusSelect.value) {
        statusSelect.classList.add('is-invalid');
        return;
      } else {
        statusSelect.classList.remove('is-invalid');
      }

      Swal.fire({
        title: 'Confirm Upload',
        text: 'Are you sure you want to upload this file?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, upload it!',
        customClass: {
          confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
          cancelButton: 'btn btn-outline-secondary waves-effect'
        },
        buttonsStyling: false
      }).then(function (result) {
        if (result.isConfirmed) {
          // Since the file is already uploaded, we just need to submit the form data
          let progressInterval;
          let progress = 0;
          let processingSwal = Swal.fire({
            title: 'Processing...',
            html: `
              <div class="progress mt-3" style="height: 20px; border-radius: 10px;">
                <div id="swal-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" style="width: 0%; background: #28a745;"></div>
              </div>
              <p class="mt-3 mb-0" id="swal-progress-text">Applying changes...</p>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
              progressInterval = setInterval(() => {
                progress += 10;
                if (progress > 90) progress = 90; // Leave room for final step
                const progressBar = document.getElementById('swal-progress-bar');
                const progressText = document.getElementById('swal-progress-text');
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `Processing: ${progress}%`;
              }, 300);
            },
            willClose: () => {
              clearInterval(progressInterval);
            }
          });

          let formData = new FormData();
          formData.append('status', statusSelect.value);
          formData.append('section', 'mypupqc');
          formData.append('slideshowImage', currentFile);
          formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

          $.ajax({
            url: "/sysAdmin/Admin/Content-Management/addSlideShow/",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
              clearInterval(progressInterval);
              // Complete the progress bar
              const progressBar = document.getElementById('swal-progress-bar');
              const progressText = document.getElementById('swal-progress-text');
              if (progressBar) progressBar.style.width = '100%';
              if (progressText) progressText.textContent = 'Completed!';
              
              setTimeout(() => {
                processingSwal.close();
                
                Swal.fire({
                  title: 'Success!',
                  text: 'File uploaded successfully!',
                  icon: 'success',
                  customClass: {
                    confirmButton: 'btn btn-success waves-effect'
                  },
                  buttonsStyling: false
                }).then(function () {
                  $('#mypupqcImageUploadModal').modal('hide');
                  document.dt_mypupqc.ajax.reload(null, false);
                });
              }, 500);
            },
            error: function (xhr, status, error) {
              console.log(xhr.responseText);
              clearInterval(progressInterval);
              processingSwal.close();
              
              Swal.fire({
                title: 'Error!',
                text: 'Failed to upload file',
                icon: 'error',
                customClass: {
                  confirmButton: 'btn btn-danger waves-effect'
                },
                buttonsStyling: false
              });
            }
          });
        }
      });
    });

    $('#mypupqcImageUploadModal').on('hidden.bs.modal', function () {
      myPupqcDropzone.removeAllFiles(true);
      uploadSection.style.display = 'block';
      previewContainer.style.display = 'none';
      submitBtn.disabled = true;
      statusSelect.value = '';
      currentFile = null;
      isFileFullyUploaded = false;
      
      // Reset progress bar
      const progressBar = document.querySelector('#mypupqc-upload-preview .upload-progress-bar');
      if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.background = "#0d6efd";
        progressBar.style.animation = "none";
        progressBar.style.boxShadow = "none";
      }
      const progressPercent = document.getElementById('mypupqc-upload-percentage');
      if (progressPercent) {
        progressPercent.textContent = '0%';
        progressPercent.style.color = "#0d6efd";
      }
    });
    
    // Add pulse animation for progress bar
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.9; }
        50% { opacity: 0.6; }
        100% { opacity: 0.9; }
      }
    `;
    document.head.appendChild(style);
  })();

  /////////////////////////////
  // Slideshow Edit Modal Script //
  /////////////////////////////
  $(document).ready(function () {
    (function () {
      // "Edit" version for slideshow
      let editCurrentFile = null;
      let isFileFullyUploaded = false; // Track upload completion

      // Matching your HTML IDs exactly:
      const dropzoneElem = document.querySelector('#dropzone-edit-images');
      const uploadSection = document.querySelector('#edit-upload-section');
      const previewContainer = document.querySelector('#edit-upload-preview');
      const previewImg = document.getElementById('edit-uploaded-preview');
      const fileNameSpan = document.getElementById('edit-uploaded-filename');
      const fileSizeSpan = document.getElementById('edit-uploaded-size');
      const progressBar = document.querySelector('#edit-upload-preview .upload-progress-bar');
      const progressPercent = document.getElementById('edit-upload-percentage');
      const removeUploadBtn = document.getElementById('edit-remove-upload');
      const submitBtn = document.getElementById('submit-edit-upload');
      const statusSelect = document.getElementById('editSlideshowStatus');

      // Safety check: If the element doesn't exist, skip
      if (!dropzoneElem) return;

      // If user changes the status dropdown, remove invalid style
      statusSelect.addEventListener('change', function () {
        if (this.value) this.classList.remove('is-invalid');
        validateForm();
      });

      // Create a new Dropzone instance for the edit modal
      const editSlideshowDropzone = new Dropzone(dropzoneElem, {
        url: '/upload_slideshow_edit',
        maxFiles: 1,
        maxFilesize: 5, // in MB
        acceptedFiles: 'image/jpeg,image/png',
        addRemoveLinks: false,
        autoProcessQueue: true, // Enable auto upload
        dictDefaultMessage: 'Drop new image here or click to upload',
        dictInvalidFileType: 'Invalid file type. Only JPEG/PNG allowed.',
        previewTemplate: '<div style="display:none"></div>',
        init: function () {
          this.on('addedfile', function (file) {
            // Hide the upload prompt, show the preview
            uploadSection.style.display = 'none';
            previewContainer.style.display = 'block';

            // Read the file as data URL for preview
            const reader = new FileReader();
            reader.onload = function (e) {
              previewImg.src = e.target.result;
            };
            reader.readAsDataURL(file);

            fileNameSpan.textContent = file.name;
            fileSizeSpan.textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB';
            editCurrentFile = file;
            isFileFullyUploaded = false;
            
            // Reset progress bar for animation
            progressBar.style.width = "0%";
            progressPercent.textContent = "0%";
            progressBar.style.background = "#0d6efd"; // Reset color
            progressPercent.style.color = "#0d6efd"; // Reset color
            
            // Force reflow to enable CSS transition
            void progressBar.offsetWidth;
            
            validateForm();
          });
          
          // Live progress updates
          this.on('uploadprogress', function(file, progress) {
            const percentage = Math.round(progress);
            progressBar.style.width = percentage + '%';
            progressPercent.textContent = percentage + '%';
            
            // Pulse animation effect during upload
            if (percentage > 0 && percentage < 100) {
              progressBar.style.animation = "pulse 1.5s infinite";
            } else {
              progressBar.style.animation = "none";
            }
          });

          // When upload completes
          this.on('complete', function(file) {
            if (file.status === "success") {
              isFileFullyUploaded = true;
              progressBar.style.animation = "none";
              progressBar.style.background = "#28a745"; // Success color
              progressPercent.style.color = "#28a745"; // Success color
              
              // Success animation
              progressBar.style.transition = "all 0.5s ease";
              setTimeout(() => {
                progressBar.style.boxShadow = "0 0 0 8px rgba(40, 167, 69, 0.3)";
                setTimeout(() => {
                  progressBar.style.boxShadow = "none";
                }, 500);
              }, 300);
              
              validateForm();
            }
          });

          this.on('removedfile', function (file) {
            uploadSection.style.display = 'block';
            previewContainer.style.display = 'none';
            submitBtn.disabled = true;
            editCurrentFile = null;
            isFileFullyUploaded = false;
            validateForm();
          });
        }
      });

      // Validate form (file uploaded and status selected)
      function validateForm() {
        const isValid = editCurrentFile && isFileFullyUploaded && statusSelect.value;
        submitBtn.disabled = !isValid;
        return isValid;
      }

      // Remove button logic
      removeUploadBtn.addEventListener('click', function () {
        if (!editCurrentFile) return;
        Swal.fire({
          title: 'Remove File?',
          text: 'Are you sure you want to remove this file?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, remove it!',
          customClass: {
            confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
            cancelButton: 'btn btn-outline-secondary waves-effect'
          },
          buttonsStyling: false
        }).then(function (result) {
          if (result.isConfirmed) {
            editSlideshowDropzone.removeFile(editCurrentFile);
            Swal.fire({
              title: 'Removed!',
              text: 'The file has been removed.',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success waves-effect'
              },
              buttonsStyling: false
            });
          }
        });
      });

      // Submit button logic: Validate status, then upload
      submitBtn.addEventListener('click', function () {
        // Basic status validation
        if (!statusSelect.value) {
          statusSelect.classList.add('is-invalid');
          return;
        }

        Swal.fire({
          title: 'Confirm Update',
          text: 'Are you sure you want to update this slideshow image?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          customClass: {
            confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
            cancelButton: 'btn btn-outline-secondary waves-effect'
          },
          buttonsStyling: false
        }).then(function (result) {
          if (result.isConfirmed) {
            // Since the file is already uploaded, we just need to submit the form data
            let progressInterval;
            let progress = 0;
            let processingSwal = Swal.fire({
              title: 'Processing...',
              html: `
                <div class="progress mt-3" style="height: 20px; border-radius: 10px;">
                  <div id="swal-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" style="width: 0%; background: #28a745;"></div>
                </div>
                <p class="mt-3 mb-0" id="swal-progress-text">Applying changes...</p>
              `,
              showConfirmButton: false,
              allowOutsideClick: false,
              didOpen: () => {
                progressInterval = setInterval(() => {
                  progress += 10;
                  if (progress > 90) progress = 90; // Leave room for final step
                  const progressBar = document.getElementById('swal-progress-bar');
                  const progressText = document.getElementById('swal-progress-text');
                  if (progressBar) progressBar.style.width = `${progress}%`;
                  if (progressText) progressText.textContent = `Processing: ${progress}%`;
                }, 300);
              },
              willClose: () => {
                clearInterval(progressInterval);
              }
            });

            let formData = new FormData();
            formData.append('slideshowID', $('#submit-edit-upload').data('id'));
            formData.append('status', statusSelect.value);
            formData.append('section', 'main');
            formData.append('slideshowImage', editCurrentFile);
            formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

            $.ajax({
              url: "/sysAdmin/Admin/Content-Management/editSlideShow/",
              type: 'POST',
              data: formData,
              processData: false,
              contentType: false,
              success: function () {
                clearInterval(progressInterval);
                // Complete the progress bar
                const progressBar = document.getElementById('swal-progress-bar');
                const progressText = document.getElementById('swal-progress-text');
                if (progressBar) progressBar.style.width = '100%';
                if (progressText) progressText.textContent = 'Completed!';
                
                setTimeout(() => {
                  processingSwal.close();
                  
                  Swal.fire({
                    title: 'Success!',
                    text: 'Image updated successfully!',
                    icon: 'success',
                    customClass: {
                      confirmButton: 'btn btn-success waves-effect'
                    },
                    buttonsStyling: false
                  }).then(function () {
                    document.dt_select.ajax.reload(null, false);
                    $('#editImageUploadModal').modal('hide');
                  });
                }, 500);
              },
              error: function (xhr, status, error) {
                console.log(xhr.responseText);
                clearInterval(progressInterval);
                processingSwal.close();
                
                Swal.fire({
                  title: 'Error!',
                  text: 'Failed to update file',
                  icon: 'error',
                  customClass: {
                    confirmButton: 'btn btn-danger waves-effect'
                  },
                  buttonsStyling: false
                });
              }
            });
          }
        });
      });

      // Reset everything when the modal closes
      $('#editImageUploadModal').on('hidden.bs.modal', function () {
        editSlideshowDropzone.removeAllFiles(true);
        uploadSection.style.display = 'block';
        previewContainer.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        submitBtn.disabled = true;
        editCurrentFile = null;
        isFileFullyUploaded = false;
        statusSelect.classList.remove('is-invalid');
        statusSelect.value = '';
        
        // Reset progress bar styles
        if (progressBar) {
          progressBar.style.background = "#0d6efd";
          progressBar.style.animation = "none";
          progressBar.style.boxShadow = "none";
        }
        if (progressPercent) {
          progressPercent.style.color = "#0d6efd";
        }
      });
      
      // Add pulse animation for progress bar
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0% { opacity: 0.9; }
          50% { opacity: 0.6; }
          100% { opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
    })();
  });

  //////////////////////////////////
  // MyPupQC Edit Modal Script    //
  //////////////////////////////////
  $(document).ready(function () {
    (function () {
      let editCurrentFile = null;
      let isFileFullyUploaded = false; // Track upload completion

      // Match all IDs from your "Edit MyPupQC Image" modal
      const dropzoneElem = document.querySelector('#edit-mypupqc-dropzone-images');
      const uploadSection = document.querySelector('#edit-mypupqc-upload-section');
      const previewContainer = document.querySelector('#edit-mypupqc-upload-preview');
      const previewImg = document.getElementById('edit-mypupqc-uploaded-preview');
      const fileNameSpan = document.getElementById('edit-mypupqc-uploaded-filename');
      const fileSizeSpan = document.getElementById('edit-mypupqc-uploaded-size');
      const progressBar = document.querySelector('#edit-mypupqc-upload-preview .upload-progress-bar');
      const progressPercent = document.getElementById('edit-mypupqc-upload-percentage');
      const removeUploadBtn = document.getElementById('edit-mypupqc-remove-upload');
      const submitBtn = document.getElementById('edit-mypupqc-submit-upload');
      const statusSelect = document.getElementById('edit-mypupqcStatus');

      // If the edit modal isn't in the DOM, skip the setup
      if (!dropzoneElem) return;

      // If user changes the status, remove error styling
      statusSelect.addEventListener('change', function () {
        if (this.value) {
          this.classList.remove('is-invalid');
          validateForm();
        }
      });

      // Create a new Dropzone instance for editing
      const editMypupqcDropzone = new Dropzone(dropzoneElem, {
        url: '/upload_mypupqc_edit',
        maxFiles: 1,
        maxFilesize: 5, // MB
        acceptedFiles: 'image/jpeg,image/png',
        addRemoveLinks: false,
        autoProcessQueue: true, // Enable auto upload
        dictDefaultMessage: 'Drop new image here or click to upload',
        dictInvalidFileType: 'Invalid file type. Only JPEG/PNG allowed.',
        previewTemplate: '<div style="display:none"></div>',
        init: function () {
          // Show preview when a file is added
          this.on('addedfile', function (file) {
            uploadSection.style.display = 'none';
            previewContainer.style.display = 'block';

            const reader = new FileReader();
            reader.onload = function (e) {
              previewImg.src = e.target.result;
            };
            reader.readAsDataURL(file);

            fileNameSpan.textContent = file.name;
            fileSizeSpan.textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB';
            editCurrentFile = file;
            isFileFullyUploaded = false;
            
            // Reset progress bar for animation
            progressBar.style.width = "0%";
            progressPercent.textContent = "0%";
            progressBar.style.background = "#0d6efd"; // Reset color
            progressPercent.style.color = "#0d6efd"; // Reset color
            
            // Force reflow to enable CSS transition
            void progressBar.offsetWidth;
            
            validateForm();
          });

          // Update progress bar
          this.on('uploadprogress', function (file, progress) {
            const percentage = Math.round(progress);
            if (progressBar) progressBar.style.width = percentage + '%';
            if (progressPercent) progressPercent.textContent = percentage + '%';
            
            // Pulse animation effect during upload
            if (percentage > 0 && percentage < 100) {
              progressBar.style.animation = "pulse 1.5s infinite";
            } else {
              progressBar.style.animation = "none";
            }
          });

          // When upload completes
          this.on('complete', function(file) {
            if (file.status === "success") {
              isFileFullyUploaded = true;
              progressBar.style.animation = "none";
              progressBar.style.background = "#28a745"; // Success color
              progressPercent.style.color = "#28a745"; // Success color
              
              // Success animation
              progressBar.style.transition = "all 0.5s ease";
              setTimeout(() => {
                progressBar.style.boxShadow = "0 0 0 8px rgba(40, 167, 69, 0.3)";
                setTimeout(() => {
                  progressBar.style.boxShadow = "none";
                }, 500);
              }, 300);
              
              validateForm();
            }
          });

          // Reset preview if file is removed
          this.on('removedfile', function () {
            uploadSection.style.display = 'block';
            previewContainer.style.display = 'none';
            submitBtn.disabled = true;
            editCurrentFile = null;
            isFileFullyUploaded = false;
            validateForm();
          });
        }
      });
      
      // Validate form (file uploaded and status selected)
      function validateForm() {
        const isValid = editCurrentFile && isFileFullyUploaded && statusSelect.value;
        submitBtn.disabled = !isValid;
        return isValid;
      }

      // Remove file button
      removeUploadBtn.addEventListener('click', function () {
        if (!editCurrentFile) return;
        Swal.fire({
          title: 'Remove File?',
          text: 'Are you sure you want to remove this file?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, remove it!',
          customClass: {
            confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
            cancelButton: 'btn btn-outline-secondary waves-effect'
          },
          buttonsStyling: false
        }).then(result => {
          if (result.isConfirmed) {
            editMypupqcDropzone.removeFile(editCurrentFile);
            Swal.fire({
              title: 'Removed!',
              text: 'The file has been removed.',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success waves-effect'
              },
              buttonsStyling: false
            });
          }
        });
      });

      // Submit (Save Changes) button
      submitBtn.addEventListener('click', function () {
        // Basic status validation
        if (!statusSelect.value) {
          statusSelect.classList.add('is-invalid');
          return;
        }

        Swal.fire({
          title: 'Confirm Update',
          text: 'Are you sure you want to update this MyPupQC image?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          customClass: {
            confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
            cancelButton: 'btn btn-outline-secondary waves-effect'
          },
          buttonsStyling: false
        }).then(result => {
          if (result.isConfirmed) {
            // Since the file is already uploaded, we just need to submit the form data
            let progressInterval;
            let progress = 0;
            let processingSwal = Swal.fire({
              title: 'Processing...',
              html: `
                <div class="progress mt-3" style="height: 20px; border-radius: 10px;">
                  <div id="swal-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" style="width: 0%; background: #28a745;"></div>
                </div>
                <p class="mt-3 mb-0" id="swal-progress-text">Applying changes...</p>
              `,
              showConfirmButton: false,
              allowOutsideClick: false,
              didOpen: () => {
                progressInterval = setInterval(() => {
                  progress += 10;
                  if (progress > 90) progress = 90; // Leave room for final step
                  const progressBar = document.getElementById('swal-progress-bar');
                  const progressText = document.getElementById('swal-progress-text');
                  if (progressBar) progressBar.style.width = `${progress}%`;
                  if (progressText) progressText.textContent = `Processing: ${progress}%`;
                }, 300);
              },
              willClose: () => {
                clearInterval(progressInterval);
              }
            });

            let formData = new FormData();
            formData.append('slideshowID', $('#edit-mypupqc-submit-upload').data('id'));
            formData.append('status', statusSelect.value);
            formData.append('section', 'mypupqc');
            formData.append('slideshowImage', editCurrentFile);
            formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

            $.ajax({
              url: "/sysAdmin/Admin/Content-Management/editSlideShow/",
              type: 'POST',
              data: formData,
              processData: false,
              contentType: false,
              success: function () {
                clearInterval(progressInterval);
                // Complete the progress bar
                const progressBar = document.getElementById('swal-progress-bar');
                const progressText = document.getElementById('swal-progress-text');
                if (progressBar) progressBar.style.width = '100%';
                if (progressText) progressText.textContent = 'Completed!';
                
                setTimeout(() => {
                  processingSwal.close();
                  
                  Swal.fire({
                    title: 'Success!',
                    text: 'Image updated successfully!',
                    icon: 'success',
                    customClass: {
                      confirmButton: 'btn btn-success waves-effect'
                    },
                    buttonsStyling: false
                  }).then(function () {
                    $('#editMypupqcImageUploadModal').modal('hide');
                    document.dt_mypupqc.ajax.reload(null, false);
                  });
                }, 500);
              },
              error: function (xhr, status, error) {
                console.log(xhr.responseText);
                clearInterval(progressInterval);
                processingSwal.close();
                
                Swal.fire({
                  title: 'Error!',
                  text: 'Failed to update file',
                  icon: 'error',
                  customClass: {
                    confirmButton: 'btn btn-danger waves-effect'
                  },
                  buttonsStyling: false
                });
              }
            });
          }
        });
      });

      // Reset everything when modal closes
      $('#editMypupqcImageUploadModal').on('hidden.bs.modal', function () {
        editMypupqcDropzone.removeAllFiles(true);
        uploadSection.style.display = 'block';
        previewContainer.style.display = 'none';
        if (progressBar) {
          progressBar.style.width = '0%';
          progressBar.style.background = "#0d6efd";
          progressBar.style.animation = "none";
          progressBar.style.boxShadow = "none";
        }
        if (progressPercent) {
          progressPercent.textContent = '0%';
          progressPercent.style.color = "#0d6efd";
        }
        submitBtn.disabled = true;
        editCurrentFile = null;
        isFileFullyUploaded = false;
        statusSelect.classList.remove('is-invalid');
        statusSelect.value = '';
      });
      
      // Add pulse animation for progress bar
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0% { opacity: 0.9; }
          50% { opacity: 0.6; }
          100% { opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
    })();
  });
});
