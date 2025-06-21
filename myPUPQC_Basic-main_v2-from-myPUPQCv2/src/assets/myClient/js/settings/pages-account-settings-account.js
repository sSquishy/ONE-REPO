document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAccountSettings');
  const saveButton = form.querySelector('button[type="submit"]');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const employeeNumberInput = document.getElementById('employeeNumber'); // Employee Number Field
  const originalData = {};

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
