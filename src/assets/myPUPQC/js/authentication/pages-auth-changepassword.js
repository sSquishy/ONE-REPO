$(document).ready(function() {
    $('#btnSubmit').on('click', function() {
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        if (newPassword === '' || newPassword === null) {
            Swal.fire({
                icon: 'warning',
                title: 'New Password Required',
                text: 'Please enter your new password',
                showCancelButton: false,
                confirmButtonText: 'Confirm',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
            })
            return;
        }

        let swalTimeouts = (
            "Changing your password...",
            "Processing your request...",
            "Change Password Failed",
            5000, 30000
        );

        $.ajax({
            url: `/forgotPassword/${uidb64}/${token}/`,
            type: "POST",
            data: {
                password: newPassword,
                confirm_password: confirmPassword,
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
            },
            success: function(response) {
                stopProcessingSwal(swalTimeouts);
                console.log(response);
                
                Swal.fire({
                    title: 'Password Changed',
                    text: 'Your password has been changed. You can now login with your new password.',
                    icon: 'success',
                    confirmButtonText: 'Confirm',
                    customClass: { confirmButton: 'btn btn-primary' },
                    buttonsStyling: false
                })
                .then(() => {
                    window.location.href = '/guest/';
                })
            },
            error: function(xhr, status, error) {
                stopProcessingSwal(swalTimeouts);
                console.log(xhr.responseText);
                
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'Confirm',
                    customClass: { confirmButton: 'btn btn-primary' },
                    buttonsStyling: false
                })
            },
        })
    })
})