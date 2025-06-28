// $(document).ready(function() {
//     $('#btnSubmit').on('click', function() {
//         const newPassword = $('#newPassword').val();
//         const confirmPassword = $('#confirmPassword').val();

//         if (newPassword === '' || newPassword === null) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'New Password Required',
//                 text: 'Please enter your new password',
//                 showCancelButton: false,
//                 confirmButtonText: 'Confirm',
//                 customClass: { confirmButton: 'btn btn-primary' },
//                 buttonsStyling: false
//             })
//             return;
//         }

//         let swalTimeouts = (
//             "Changing your password...",
//             "Processing your request...",
//             "Change Password Failed",
//             5000, 30000
//         );

//         $.ajax({
//             url: `/forgotPassword/${uidb64}/${token}/`,
//             type: "POST",
//             data: {
//                 password: newPassword,
//                 confirm_password: confirmPassword,
//                 csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
//             },
//             success: function(response) {
//                 stopProcessingSwal(swalTimeouts);
//                 console.log(response);

//                 Swal.fire({
//                     title: 'Password Changed',
//                     text: 'Your password has been changed. You can now login with your new password.',
//                     icon: 'success',
//                     confirmButtonText: 'Confirm',
//                     customClass: { confirmButton: 'btn btn-primary' },
//                     buttonsStyling: false
//                 })
//                 .then(() => {
//                     window.location.href = '/guest/';
//                 })
//             },
//             error: function(xhr, status, error) {
//                 stopProcessingSwal(swalTimeouts);
//                 console.log(xhr.responseText);

//                 Swal.fire({
//                     title: 'Error',
//                     text: 'An error occurred. Please try again.',
//                     icon: 'error',
//                     confirmButtonText: 'Confirm',
//                     customClass: { confirmButton: 'btn btn-primary' },
//                     buttonsStyling: false
//                 })
//             },
//         })
//     })
// })

// Path: src/assets/js/academic-head-js/pages-auth.js
// Change Password
document.addEventListener('DOMContentLoaded', function () {
  const formResetPassword = document.querySelector('#formResetPassword');
  const btnSubmit = document.getElementById('btnSubmit');
  const newPasswordEl = document.getElementById('newPassword');
  const confirmPasswordEl = document.getElementById('confirmPassword');
  const passwordStrengthBar = document.getElementById('passwordStrengthBar');
  const passwordStrengthText = document.getElementById('passwordStrengthText');
  const requirementItems = document.querySelectorAll('#pwdRequirements .requirement-item');

  const passwordPattern = new RegExp(
    '^(?!.*[\'"%*\\-\\(\\)=\\+~])(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\\$\\.,&])[A-Za-z0-9!@#\\$\\.,&]{10,30}$'
  );

  function checkRequirements(password) {
    let passedCount = 0;

    const requirements = [
      { key: '[data-key="length"]', condition: password.length >= 10 && password.length <= 30 },
      { key: '[data-key="uppercase"]', condition: /[A-Z]/.test(password) },
      { key: '[data-key="lowercase"]', condition: /[a-z]/.test(password) },
      { key: '[data-key="digit"]', condition: /\d/.test(password) },
      { key: '[data-key="symbol"]', condition: /[!@#$.,&]/.test(password) },
      { key: '[data-key="restricted"]', condition: !/['"%*\-\(\)=\+~]/.test(password) }
    ];

    requirements.forEach(req => {
      const item = document.querySelector(req.key);
      toggleRequirementColor(item, req.condition);
      if (req.condition) passedCount++;
    });

    return passedCount;
  }

  function toggleRequirementColor(element, isPassed) {
    if (!element) return;
    element.classList.remove('text-success', 'text-danger');
    if (isPassed) {
      element.classList.add('text-success');
    } else {
      element.classList.add('text-danger');
    }
  }

  function updateStrengthDisplay(password) {
    const score = checkRequirements(password);
    const meetsAll = passwordPattern.test(password);

    let progress = 0;
    let strengthLabel = 'Weak';
    let barClass = 'bg-danger';

    if (score === 6 && meetsAll) {
      progress = 100;
      strengthLabel = 'Strong';
      barClass = 'bg-success';
    } else if (score >= 5) {
      progress = 85;
      strengthLabel = 'Almost';
      barClass = 'bg-warning';
    } else if (score >= 4) {
      progress = 70;
      strengthLabel = 'Medium';
      barClass = 'bg-warning';
    } else if (score >= 2) {
      progress = 50;
      strengthLabel = 'Weak';
      barClass = 'bg-danger';
    } else {
      progress = 20;
      strengthLabel = 'Very Weak';
      barClass = 'bg-danger';
    }

    passwordStrengthBar.style.width = progress + '%';
    passwordStrengthBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
    passwordStrengthBar.classList.add(barClass);
    passwordStrengthBar.setAttribute('aria-valuenow', progress);

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

  // Function to check if the passwords match in real time.
  function checkPasswordMatch() {
    const newPassword = newPasswordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    if (confirmPassword && newPassword !== confirmPassword) {
      confirmPasswordEl.classList.add('is-invalid');
    } else {
      confirmPasswordEl.classList.remove('is-invalid');
    }
  }

  // Update password strength and check password match on new password input.
  newPasswordEl.addEventListener('input', function (e) {
    updateStrengthDisplay(e.target.value);
    checkPasswordMatch();
  });

  // Check password match on confirm password input.
  confirmPasswordEl.addEventListener('input', checkPasswordMatch);

  // Combined submit handler with AJAX functionality
  btnSubmit.addEventListener('click', function (e) {
    e.preventDefault();

    const newPassword = newPasswordEl.value.trim();
    const confirmPassword = confirmPasswordEl.value.trim();

    // Client-side validation
    if (!newPassword || !confirmPassword) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please fill in both password fields.',
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

    if (!passwordPattern.test(newPassword)) {
      Swal.fire({
        title: 'Invalid Password',
        text: 'Your password does not meet the required criteria.',
        icon: 'error',
        customClass: {
          confirmButton: 'btn btn-danger waves-effect'
        },
        buttonsStyling: false
      });
      return;
    }

    // Confirmation dialog
    Swal.fire({
      title: 'Reset Password?',
      text: 'Are you sure you want to reset your password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        // UI Loading state
        btnSubmit.disabled = true;
        document.getElementById('btnText').classList.add('d-none');
        document.getElementById('btnSpinner').classList.remove('d-none');

        // AJAX request
        $.ajax({
          url: `/forgotPassword/${uidb64}/${token}/`,
          type: "POST",
          data: {
            password: newPassword,
            confirm_password: confirmPassword,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
          },
          success: function(response) {
            // Success handling
            Swal.fire({
              title: 'Password Changed',
              text: 'Your password has been changed. You can now login with your new password.',
              icon: 'success',
              confirmButtonText: 'Confirm',
              customClass: { confirmButton: 'btn btn-primary' },
              buttonsStyling: false
            }).then(() => {
              window.location.href = '/guest/';
            });
          },
          error: function(xhr, status, error) {
            // Error handling
            Swal.fire({
              title: 'Error',
              text: 'An error occurred. Please try again.',
              icon: 'error',
              confirmButtonText: 'Confirm',
              customClass: { confirmButton: 'btn btn-primary' },
              buttonsStyling: false
            });

            // Reset UI state
            btnSubmit.disabled = false;
            document.getElementById('btnText').classList.remove('d-none');
            document.getElementById('btnSpinner').classList.add('d-none');
          }
        });
      }
    });
  });
});
