$(document).ready(function() {
  $('#btnSubmit').on('click', function() {
    const $btn = $(this);
    const $btnText = $btn.find('.btn-text');
    const $spinner = $btn.find('.spinner-border');
    const username = $('#username').val();
    const password = $('#password').val();

    // Show spinner and hide text
    $btnText.hide();
    $spinner.show();
    $btn.prop('disabled', true);

    $.ajax({
      url: '/sysAdmin/authentication/Login/LoginSysAdmin/',
      method: 'POST',
      data: {
        username: username,
        password: password,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
      },
      success: function(response) {
        if(response.status === 'Failed') {
          // Show error message
          Swal.fire({
            title: 'Login Failed',
            text: 'Invalid username or password',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-danger waves-effect' },
            buttonsStyling: false,
          });

          // Reset button state
          resetButton($btn, $btnText, $spinner);
          return;
        }

        // Redirect to homepage on success
        window.location.href = "/sysAdmin/Admin/Homepage/";
      },
      error: function(xhr, status, error) {
        // Error message for too many login requests
        if(xhr.status === 429) {
          Swal.fire({
            title: 'Too many login requests',
            text: 'Please wait for a moment before trying again',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-danger waves-effect' },
            buttonsStyling: false,
          });
        } else {
          // Fall back error message
          Swal.fire({
            title: 'Login Failed',
            text: 'An error occurred while logging in',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-danger waves-effect' },
            buttonsStyling: false,
          });
        }

        // Reset button state
        resetButton($btn, $btnText, $spinner);
      }
    });
  });

  // Function to reset button state
  function resetButton($btn, $btnText, $spinner) {
    $btnText.show();
    $spinner.hide();
    $btn.prop('disabled', false);
  }
});
