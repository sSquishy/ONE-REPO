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

    // Remove error styling on change
    statusSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
      }
    });

    var originalDropzone = new Dropzone(dropzoneElem, {
      url: '/upload',
      maxFiles: 1,
      maxFilesize: 5,
      acceptedFiles: 'image/jpeg,image/png',
      addRemoveLinks: false,
      autoProcessQueue: false,
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
          submitBtn.disabled = false;
        });
        this.on('uploadprogress', function (file, progress) {
          var progressBar = document.querySelector('#upload-preview .upload-progress-bar');
          if (progressBar) progressBar.style.width = progress + '%';
          document.getElementById('upload-percentage').textContent = Math.round(progress) + '%';
        });
        this.on('removedfile', function (file) {
          uploadSection.style.display = 'block';
          previewContainer.style.display = 'none';
          submitBtn.disabled = true;
          currentFile = null;
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
          originalDropzone.processQueue();
          
          let swalTimeouts = showProcessingSwal(
            "Uploading Slideshow Image",
            "Please wait while we upload the slideshow image.",
            "Failed to upload the slideshow image. Please try again later."
          )

          let formData = new FormData();
          formData.append('status', statusSelect.value);
          formData.append('section', 'main');
          formData.append('slideshowImage', currentFile);
          formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

          $.ajax({
            url: "/sysAdmin/Admin/Content-Management/addSlideShow/",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
              stopProcessingSwal(swalTimeouts);

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
              stopProcessingSwal(swalTimeouts);
              
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
          })
        }
      });
    });

    $('#imageUploadModal').on('hidden.bs.modal', function () {
      originalDropzone.removeAllFiles(true);
      uploadSection.style.display = 'block';
      previewContainer.style.display = 'none';
      submitBtn.disabled = true;
    });
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

    // Remove error styling on change
    statusSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
      }
    });

    var myPupqcDropzone = new Dropzone(dropzoneElem, {
      url: '/upload_mypupqc',
      maxFiles: 1,
      maxFilesize: 5,
      acceptedFiles: 'image/jpeg,image/png',
      addRemoveLinks: false,
      autoProcessQueue: false,
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
          submitBtn.disabled = false;
        });
        this.on('uploadprogress', function (file, progress) {
          var progressBar = document.querySelector('#mypupqc-upload-preview .upload-progress-bar');
          if (progressBar) progressBar.style.width = progress + '%';
          document.getElementById('mypupqc-upload-percentage').textContent = Math.round(progress) + '%';
        });
        this.on('removedfile', function (file) {
          uploadSection.style.display = 'block';
          previewContainer.style.display = 'none';
          submitBtn.disabled = true;
          currentFile = null;
        });
      }
    });

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
          myPupqcDropzone.processQueue();
          Swal.fire({
            title: 'Uploading...',
            text: 'Please wait while we upload your file',
            allowOutsideClick: false,
            didOpen: function () {
              Swal.showLoading();
            },
            customClass: {
              confirmButton: 'btn btn-primary waves-effect waves-light'
            },
            buttonsStyling: false
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
            },
            error: function (xhr, status, error) {
              console.log(xhr.responseText);
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
          })
        }
      });
    });

    $('#mypupqcImageUploadModal').on('hidden.bs.modal', function () {
      myPupqcDropzone.removeAllFiles(true);
      uploadSection.style.display = 'block';
      previewContainer.style.display = 'none';
      submitBtn.disabled = true;
    });
  })();

  /////////////////////////////////
  // Slideshow Edit Modal Script //
  /////////////////////////////////
  $(document).ready(function () {
    (function () {
      // "Edit" version for slideshow
      let editCurrentFile = null;

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
      });

      // Create a new Dropzone instance for the edit modal
      const editSlideshowDropzone = new Dropzone(dropzoneElem, {
        url: '/upload_slideshow_edit', // Adjust to your "edit" endpoint if needed
        maxFiles: 1,
        maxFilesize: 5, // in MB
        acceptedFiles: 'image/jpeg,image/png',
        addRemoveLinks: false,
        autoProcessQueue: false,
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
            submitBtn.disabled = false;
          });
        }
      });

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
            // Start the upload
            editSlideshowDropzone.processQueue();

            Swal.fire({
              title: 'Updating...',
              text: 'Please wait while we update the file',
              allowOutsideClick: false,
              didOpen: function () {
                Swal.showLoading();
              },
              customClass: {
                confirmButton: 'btn btn-primary waves-effect waves-light'
              },
              buttonsStyling: false
            });

            let formData = new FormData();
            console.log("slideshowID: ", $('#submit-edit-upload').data('id'));
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
              },
              error: function (xhr, status, error) {
                console.log(xhr.responseText);
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

      // Reset everything when the modal closes
      $('#editImageUploadModal').on('hidden.bs.modal', function () {
        editSlideshowDropzone.removeAllFiles(true);
        uploadSection.style.display = 'block';
        previewContainer.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        submitBtn.disabled = true;
        editCurrentFile = null;
        statusSelect.classList.remove('is-invalid');
        statusSelect.value = '';
      });
    })();
  });

  //////////////////////////////////
  // MyPupQC Edit Modal Script    //
  //////////////////////////////////
  $(document).ready(function () {
    (function () {
      let editCurrentFile = null;

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
        }
      });

      // Create a new Dropzone instance for editing
      const editMypupqcDropzone = new Dropzone(dropzoneElem, {
        url: '/upload_mypupqc_edit', // or '/upload_mypupqc' if your backend doesn't separate "edit"
        maxFiles: 1,
        maxFilesize: 5, // MB
        acceptedFiles: 'image/jpeg,image/png',
        addRemoveLinks: false,
        autoProcessQueue: false,
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
            submitBtn.disabled = false;
          });

          // Update progress bar
          this.on('uploadprogress', function (file, progress) {
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
          });

          // Reset preview if file is removed
          this.on('removedfile', function () {
            uploadSection.style.display = 'block';
            previewContainer.style.display = 'none';
            submitBtn.disabled = true;
            editCurrentFile = null;
          });
        }
      });

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
            editMypupqcDropzone.processQueue();

            Swal.fire({
              title: 'Updating...',
              text: 'Please wait while we update your file',
              allowOutsideClick: false,
              didOpen: function () {
                Swal.showLoading();
              },
              customClass: {
                confirmButton: 'btn btn-primary waves-effect waves-light'
              },
              buttonsStyling: false
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
              },
              error: function (xhr, status, error) {
                console.log(xhr.responseText);
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
            })
          }
        });
      });

      // Reset everything when modal closes
      $('#editMypupqcImageUploadModal').on('hidden.bs.modal', function () {
        editMypupqcDropzone.removeAllFiles(true);
        uploadSection.style.display = 'block';
        previewContainer.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        submitBtn.disabled = true;
        editCurrentFile = null;
        statusSelect.classList.remove('is-invalid');
        statusSelect.value = '';
      });
    })();
  });
});
