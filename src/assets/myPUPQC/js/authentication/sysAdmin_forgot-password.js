$(document).ready(function() {
    $('#btnSubmit').on('click', function() {
        const $email = $('#email');
        const email = $email.val() ? $email.val().trim() : '';

        // Clear any previous inline feedback
        $email.removeClass('is-invalid');
        $email.next('.invalid-feedback').remove();

        // Empty -> only mark field red (no feedback label)
        if (email === '') {
            $email.addClass('is-invalid');
            return;
        }

        // Validate email pattern; if invalid, mark red and show message below
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            $email.addClass('is-invalid');
            // add feedback if not present
            if ($email.next('.invalid-feedback').length === 0) {
                $('<div class="invalid-feedback">Please enter valid email address</div>').insertAfter($email);
            } else {
                $email.next('.invalid-feedback').text('Please enter valid email address');
            }
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

    // Clear error state as the user types
    $('#email').on('input', function() {
        $(this).removeClass('is-invalid');
        $(this).next('.invalid-feedback').remove();
    });

    // Trigger send when Enter key is pressed in the email field
    $('#email').on('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            $('#btnSubmit').trigger('click');
        }
    })
});
