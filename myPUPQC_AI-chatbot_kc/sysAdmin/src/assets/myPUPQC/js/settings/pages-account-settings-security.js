/**
 * Account Settings - Security
 */
'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    // Elements
    const formChangePass = document.querySelector('#formAccountSettings');
    const newPasswordEl = document.getElementById('newPassword');
    const passwordStrengthBar = document.getElementById('passwordStrengthBar');
    const passwordStrengthText = document.getElementById('passwordStrengthText');
    const requirementItems = document.querySelectorAll('#pwdRequirements .requirement-item');

    // Allowed symbol set: !@#$.,&
    // Restricted symbols: ' " % * - ( ) = + ~
    // We use a regex pattern that requires:
    // - 10 to 30 length
    // - at least one uppercase, one lowercase, one digit, one allowed symbol
    // - no restricted symbols
    // Note: We'll also do separate checks to highlight each bullet individually
    const passwordPattern = new RegExp(
      '^(?!.*[\'"%*\\-\\(\\)=\\+~])(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\\$\\.,&])[A-Za-z0-9!@#\\$\\.,&]{10,30}$'
    );

    /**
     * Check each requirement individually
     * and return how many are fulfilled.
     */
    function checkRequirements(password) {
      let passedCount = 0;

      // 1) Length: 10–30
      const lengthItem = document.querySelector('[data-key="length"]');
      const isValidLength = password.length >= 10 && password.length <= 30;
      toggleRequirementColor(lengthItem, isValidLength);
      if (isValidLength) passedCount++;

      // 2) Uppercase
      const uppercaseItem = document.querySelector('[data-key="uppercase"]');
      const hasUppercase = /[A-Z]/.test(password);
      toggleRequirementColor(uppercaseItem, hasUppercase);
      if (hasUppercase) passedCount++;

      // 3) Lowercase
      const lowercaseItem = document.querySelector('[data-key="lowercase"]');
      const hasLowercase = /[a-z]/.test(password);
      toggleRequirementColor(lowercaseItem, hasLowercase);
      if (hasLowercase) passedCount++;

      // 4) Digit
      const digitItem = document.querySelector('[data-key="digit"]');
      const hasDigit = /\d/.test(password);
      toggleRequirementColor(digitItem, hasDigit);
      if (hasDigit) passedCount++;

      // 5) Symbol from (!@#$.,&)
      const symbolItem = document.querySelector('[data-key="symbol"]');
      const hasSymbol = /[!@#$.,&]/.test(password);
      toggleRequirementColor(symbolItem, hasSymbol);
      if (hasSymbol) passedCount++;

      // 6) Restricted symbols
      const restrictedItem = document.querySelector('[data-key="restricted"]');
      const hasRestricted = /['"%*\-\(\)=\+~]/.test(password);
      toggleRequirementColor(restrictedItem, !hasRestricted);
      if (!hasRestricted) passedCount++;

      return passedCount;
    }

    /**
     * Helper to toggle color on each requirement <li>
     */
    function toggleRequirementColor(element, isPassed) {
      if (!element) return;
      element.classList.remove('text-success', 'text-danger');
      if (isPassed) {
        element.classList.add('text-success');
      } else {
        element.classList.add('text-danger');
      }
    }

    /**
     * Update the strength bar and text
     */
    function updateStrengthDisplay(password) {
      // We'll do a simple scoring logic:
      //  - Each requirement is worth 1 point.
      //  - Total of 6 requirements.
      //  - We'll also do a final check if the entire password passes the main regex,
      //    because partial requirement passing might not be a valid password.
      const score = checkRequirements(password);
      const meetsAll = passwordPattern.test(password); // overall pattern match?

      // Basic approach for progress bar:
      // 0–1 of 6 => 0–20%   (Weak)
      // 2–3 of 6 => 40–60% (Weak or Medium)
      // 4–5 of 6 => 80%    (Medium or almost strong)
      // 6 of 6   => 100%   (Strong if length-based also passes)
      let progress = 0;
      let strengthLabel = 'Weak';
      let barClass = 'bg-danger';

      switch (score) {
        case 0:
        case 1:
          progress = 20;
          strengthLabel = 'Very Weak';
          barClass = 'bg-danger';
          break;
        case 2:
        case 3:
          progress = 50;
          strengthLabel = 'Weak';
          barClass = 'bg-danger';
          break;
        case 4:
          progress = 70;
          strengthLabel = 'Medium';
          barClass = 'bg-warning';
          break;
        case 5:
          progress = 85;
          strengthLabel = 'Medium+';
          barClass = 'bg-warning';
          break;
        case 6:
          // If the entire pattern is matched, we say Strong.
          progress = 100;
          strengthLabel = meetsAll ? 'Strong' : 'Almost';
          barClass = meetsAll ? 'bg-success' : 'bg-warning';
          break;
      }

      // Update the progress bar
      passwordStrengthBar.style.width = progress + '%';
      passwordStrengthBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
      passwordStrengthBar.classList.add(barClass);
      passwordStrengthBar.setAttribute('aria-valuenow', progress);

      // Update the text label
      passwordStrengthText.textContent = strengthLabel;
      passwordStrengthText.classList.remove('text-success', 'text-warning', 'text-danger');
      if (barClass === 'bg-success') {
        passwordStrengthText.classList.add('text-success');
      } else if (barClass === 'bg-warning') {
        passwordStrengthText.classList.add('text-warning');
      } else {
        passwordStrengthText.classList.add('text-danger');
      }
    }

    // Listen for input changes on new password
    if (newPasswordEl) {
      newPasswordEl.addEventListener('input', function (e) {
        updateStrengthDisplay(e.target.value);
      });
    }

    // ============== Form Validation (FormValidation.io) ==============
    if (formChangePass) {
      const fv = FormValidation.formValidation(formChangePass, {
        fields: {
          currentPassword: {
            validators: {
              notEmpty: {
                message: 'Please enter your current password'
              }
            }
          },
          newPassword: {
            validators: {
              notEmpty: {
                message: 'Please enter a new password'
              },
              regexp: {
                regexp: passwordPattern,
                message:
                  'Must be 10–30 chars, have uppercase, lowercase, digit, symbol (!@#$.,&) and no restricted characters'
              }
            }
          },
          confirmPassword: {
            validators: {
              notEmpty: {
                message: 'Please confirm your new password'
              },
              identical: {
                compare: function () {
                  return formChangePass.querySelector('[name="newPassword"]').value;
                },
                message: 'The new password and confirm password do not match'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.col-md-6'
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          autoFocus: new FormValidation.plugins.AutoFocus()
        },
        init: instance => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        }
      });
    }

    // =============== Additional Code: API Key form (if any) =================
    // ...
  })();
});
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAccountSettings');
  const saveButton = form.querySelector('button[type="submit"]');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
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

  // Save Changes button click event
  saveButton.addEventListener('click', e => {
    e.preventDefault(); // Prevent form submission

    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

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

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please fill in all the fields.',
        icon: 'error',
        customClass: {
          confirmButton: 'btn btn-danger waves-effect'
        },
        buttonsStyling: false
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch',
        text: 'New password and confirm password do not match.',
        icon: 'error',
        customClass: {
          confirmButton: 'btn btn-danger waves-effect'
        },
        buttonsStyling: false
      });
      return;
    }

    if (currentPassword === newPassword) {
      Swal.fire({
        title: 'No Changes Detected',
        text: 'New password must be different from the current password.',
        icon: 'info',
        customClass: {
          confirmButton: 'btn btn-primary waves-effect'
        },
        buttonsStyling: false
      });
      return;
    }

    // Confirmation dialog if changes are detected
    Swal.fire({
      title: 'Save Changes?',
      text: 'Do you want to save the changes you made?',
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
          text: 'Your password has been successfully updated.',
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

          // Optionally submit the form here
          form.submit();
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
