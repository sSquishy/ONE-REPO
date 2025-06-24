$(document).ready(function() {
    $('#btnSubmit').on('click', function() {
        const email = $('#email').val();
        if (email === '' || email === null) {
            Swal.fire({
                icon: 'warning',
                title: 'Email Required',
                text: 'Please enter your email address',
                showCancelButton: false,
                confirmButtonText: 'Confirm',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
            })
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                showCancelButton: false,
                confirmButtonText: 'Confirm',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
            })
            return;
        }

        // Pop-up message indicating that the request has been sent (event if the email is not registered or request has an error)
        Swal.fire({
            title: 'Request Sent',
            text: 'Your request has been sent. Please check your email for further instructions.',
            icon: 'success',
            confirmButtonText: 'Confirm',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
        })
        .then((result) => {
            if (result.isConfirmed) {
                $('#email').val('');
            }
        })

        $.ajax({
            url: "/forgotPasswordRequest/",
            type: "POST",
            data: {
                email: email,
                role: 'Faculty',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
            },
            success: function(response) {
                console.log(response);
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            },
        })
    })
});