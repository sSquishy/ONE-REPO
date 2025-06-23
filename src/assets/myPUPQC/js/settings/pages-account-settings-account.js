document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAccountSettings');
  const saveButton = form.querySelector('button[type="submit"]');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const employeeNumberInput = document.getElementById('employeeNumber'); // Employee Number Field
  const originalData = {};

  // =============================== Get the initial values of the form fields ===============================
  Swal.fire({
      title: "Loading...",
      text: "Retrieving admin data...",
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
    url: "/sysAdmin/Admin/Account-Management/getSpecificUser/",
    type: "POST",
    data: {
      userID: userID,
      userRole: "Faculty",
      csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
    },
    success: function(response) {
      console.log("Response: ", response);
      clearTimeout(timeout);
      clearTimeout(timeout2);
      Swal.close();

      $('#employeeNumber').val(response.facultyNumber);
      $('#firstName').val(response.firstname);
      $('#middleName').val(response.middlename);
      $('#lastName').val(response.lastname);
      $('#suffixName').val(response.suffix);
      $('#phoneNumber').val(response.mobileNo);
      $('#email').val(response.emailAddress);
      $('#webmail').val(response.webMail);  
    },
    error: function(xhr, status, error) {
      console.log(xhr.responseText);
      clearTimeout(timeout);
      clearTimeout(timeout2);
      Swal.close();
    }
  })

  // =========================================================================================================

  // Capture initial values of all form fields
  form.querySelectorAll('input').forEach(input => {
    originalData[input.id] = input.value.trim();
  });

  // Function to check if there are any changes in the form
  function hasChanges() {
    let changed = false;
    form.querySelectorAll('input').forEach(input => {
      if (input.value.trim() !== originalData[input.id]) {
        changed = true;
      }
    });
    return changed;
  }

  // Format the phone number in real-time
  phoneNumberInput.addEventListener('input', function (e) {
    let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters

    // Apply spacing: "9XXX XXX XXXX"
    if (input.length > 4 && input.length <= 7) {
      input = input.replace(/(\d{4})(\d{1,3})/, '$1 $2'); // Add space after 4th digit
    } else if (input.length > 7) {
      input = input.replace(/(\d{4})(\d{3})(\d{1,4})/, '$1 $2 $3'); // Add spaces after 4th and 7th digits
    }
    e.target.value = input; // Update the input value
  });

  // Validate the phone number on blur
  phoneNumberInput.addEventListener('blur', function (e) {
    const regex = /^\d{4}\s\d{3}\s\d{4}$/; // Format: 9XXX XXX XXXX
    if (!regex.test(e.target.value)) {
      e.target.setCustomValidity('Please enter a valid phone number in the format 9XXX XXX XXXX.');
      e.target.reportValidity();
    } else {
      e.target.setCustomValidity(''); // Clear any previous errors
    }
  });

  // Save Changes button click event
  saveButton.addEventListener('click', e => {
    e.preventDefault(); // Prevent form submission

    const phoneNumber = phoneNumberInput.value;
    const employeeNumber = employeeNumberInput.value.trim(); // Get Employee Number
    const regex = /^\d{4}\s\d{3}\s\d{4}$/; // Format: 9XXX XXX XXXX

    if (!hasChanges()) {
      Swal.fire({
        title: 'No Changes Detected',
        text: 'You have not made any changes to save.',
        icon: 'info',
        customClass: {
          confirmButton: 'btn btn-primary waves-effect'
        },
        buttonsStyling: false
      });
      return;
    }

    if (!regex.test(phoneNumber)) {
      Swal.fire({
        title: 'Invalid Phone Number',
        text: 'Please enter a complete and valid phone number in the format 9XXX XXX XXXX.',
        icon: 'error',
        customClass: {
          confirmButton: 'btn btn-danger waves-effect'
        },
        buttonsStyling: false
      });
      return;
    }

    // Confirmation dialog if changes are detected
    Swal.fire({
      title: 'Save Changes?',
      html: `
        <p>Do you want to save the changes you made?</p>
        <p><strong>Employee Number:</strong> ${employeeNumber || 'Not Provided'}</p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
            title: "Saving...",
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
                title: 'Failed to save data',
                text: 'Please reload the page and try again.',
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
            })
            .then(() => {
                location.reload();
            })
        }, 30000); // Change 5000 to any delay you want in milliseconds

        const formData = new FormData(form);
        formData.append('csrfmiddlewaretoken', $('input[name="csrfmiddlewaretoken"]').val());
        formData.append('userID', userID);
        formData.append('userRole', "Admin");
        formData.append('firstname', $('#firstName').val());
        formData.append('middlename', $('#middleName').val());
        formData.append('lastname', $('#lastName').val());
        formData.append('suffix', $('#suffixName').val());
        formData.append('mobileNo', $('#phoneNumber').val());
        formData.append('emailAddress', $('#email').val());
        formData.append('webMail', $('#webmail').val());
        formData.append('facultyNumber', $('#employeeNumber').val());

        $.ajax({
          url: "/sysAdmin/Admin/editSysAdminProfile/",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function(response) {
            console.log("Response: ", response);
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();

            Swal.fire({
              title: 'Changes Saved!',
              text: 'Your changes have been successfully saved.',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-success waves-effect'
              },
              buttonsStyling: false
            }).then(() => {
              // Update original data to current values
              form.querySelectorAll('input').forEach(input => {
                originalData[input.id] = input.value.trim();
              });
            });
          },
          error: function(xhr, status, error) {
            console.log(xhr.responseText);
            clearTimeout(timeout);
            clearTimeout(timeout2);
            Swal.close();
            
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while saving your changes. Please try again later.',
              icon: 'error',
              customClass: {
                confirmButton: 'btn btn-danger waves-effect'
              },
              buttonsStyling: false
            })
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cancelled',
          text: 'Your changes have not been saved.',
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-danger waves-effect'
          },
          buttonsStyling: false
        });
      }
    });
  });

  // Optional: Real-time feedback for changes
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      if (hasChanges()) {
        saveButton.disabled = false;
      } else {
        saveButton.disabled = true;
      }
    });
  });
});
