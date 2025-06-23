$(document).ready(function() {
  $('#btnSubmit').on('click', function() {
      const username = $('#username').val();
      const password = $('#password').val();

      Swal.fire({
          title: "Logging you in",
          text: "Please wait...",
          didOpen: () => {
              Swal.showLoading()
          },
          allowOutsideClick: false,
          showConfirmButton: false,
          showCancelButton: false,
          customClass: {  },
          buttonsStyling: false
      })

      $.ajax({
          url: '/sysAdmin/authentication/Login/LoginSysAdmin/',
          method: 'POST',
          data: {
              username: username,
              password: password,
              csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function(response) {
              Swal.close();
              if(response.status === 'Failed') {
                  Swal.fire({
                      title: 'Login Failed',
                      text: 'Invalid username or password',
                      icon: 'error',
                      customClass: { confirmButton: 'btn btn-danger waves-effect' },
                      buttonsStyling: false,
                  })
                  return;
              }
              // Login successful
              Swal.fire({
                  title: 'Success',
                  text: 'Login Successful',
                  icon: 'success',
                  customClass: { confirmButton: 'btn btn-success waves-effect' },
                  buttonsStyling: false,
              })
              // Redirect to homepage automatically
              setTimeout(() => {
                  window.location.href = "/sysAdmin/Admin/Homepage/";
              }, 1000);
          },
          error: function(xhr, status, error) {
              console.log(xhr.responseText);
              // Error message for too many login requests
              if(xhr.status === 429) {
                  Swal.fire({
                      title: 'Too many login requests',
                      text: 'Please wait for a moment before trying again',
                      icon: 'error',
                      customClass: { confirmButton: 'btn btn-danger waves-effect' },
                      buttonsStyling: false,
                  })
                  return;
              }

              // Fall back error message
              Swal.fire({
                  title: 'Login Failed',
                  text: 'An error occurred while logging in',
                  icon: 'error',
                  customClass: { confirmButton: 'btn btn-danger waves-effect' },
                  buttonsStyling: false,
              })
          }
      })
  })
});
