$(document).ready(function() {
    const profileDetails = $('#profileDetails');

    let userNumber = null;
    if(role === 'Student') { userNumber = $('#studentNumber'); }
    else if(role === 'Faculty') { userNumber = $('#facultyNumber'); }
    else if(role === 'Alumni') { userNumber = $('#alumniId'); }

    if(profileDetails.length == 1) {
        Swal.fire({
            title: "Loading...",
            text: `Retrieving ${role.toLowerCase()} data...`,
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
            url: getUserProfile,
            type: 'GET',
            success: function(response) {
                clearTimeout(timeout);
                clearTimeout(timeout2);
                Swal.close();

                let userNumberResponse = null;
                if(role === 'Student') { userNumberResponse = response.studentNumber; }
                else if(role === 'Faculty') { userNumberResponse = response.facultyNumber; }
                else if(role === 'Alumni') { userNumberResponse = response.alumniNumber; }

                $('#name').val(response.fullname);
                userNumber.val(userNumberResponse);
                $('#program').val(response.program);
                $('#dob').val(response.dateOfBirth);
                $('#mobile').val(response.mobileNumber);
                $('#emailAddress').val(response.emailAddress);
                $('#webmail').val(response.webMail);
            },
            error: function(xhr, status, error) {
                clearTimeout(timeout);
                clearTimeout(timeout2);
                Swal.close();

                console.log(xhr.responseText);
            }
        })
    }

    const changePassword = $('#changePassword');
    if(changePassword.length == 1) {
        $('#changePasswordBtn').on('click', function() {
            const currentPassword = $('#currentPassword').val();
            const newPassword = $('#newPassword').val();
            const confirmPassword = $('#confirmPassword').val();

            if(currentPassword === '' || newPassword === '' || confirmPassword === '') {
                Swal.fire({
                    title: 'Failed to change password',
                    text: 'Please fill up all the fields.',
                    icon: 'error',
                    customClass: { confirmButton: 'btn btn-danger' },
                    buttonsStyling: false
                })
                return;
            }

            if(newPassword !== confirmPassword) {
                Swal.fire({
                    title: 'Failed to change password',
                    text: 'New password and confirm password does not match.',
                    icon: 'error',
                    customClass: { confirmButton: 'btn btn-danger' },
                    buttonsStyling: false  
                })
                return;
            }

            Swal.fire({
                title: 'Change Password',
                text: 'Are you sure you want to change your password?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change it!',
                customClass: { confirmButton: 'btn btn-primary', cancelButton: 'btn btn-outline-secondary' },
                buttonsStyling: false
            })
            .then((result) => {
                if(result.isConfirmed) {
                    Swal.fire({
                        title: "Loading...",
                        text: "Changing your password...",
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
                            title: 'Failed to change password',
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
                        url: changeUserPassword,
                        type: 'POST',
                        data: {
                            oldPassword: currentPassword,
                            newPassword: newPassword,
                            confirmPassword: confirmPassword,
                            csrfmiddlewaretoken: csrf
                        },
                        success: function(response) {
                            clearTimeout(timeout);
                            clearTimeout(timeout2);
                            Swal.close();

                            if(response.status === 'Failed') {
                                Swal.fire({
                                    title: 'Failed to change password',
                                    text: 'Please try again.',
                                    icon: 'error',
                                    customClass: { confirmButton: 'btn btn-danger' },
                                    buttonsStyling: false
                                })
                                return;
                            }

                            console.log(response);
                            Swal.fire({
                                title: 'Password Changed',
                                text: 'Your password has been successfully changed.',
                                icon: 'success',
                                customClass: { confirmButton: 'btn btn-primary' },
                                buttonsStyling: false
                            })
                        },
                        error: function(xhr, status, error) {
                            clearTimeout(timeout);
                            clearTimeout(timeout2);
                            Swal.close();

                            console.log(xhr.responseText);
                            Swal.fire({
                                title: 'Failed to change password',
                                text: 'Please try again.',
                                icon: 'error',
                                customClass: { confirmButton: 'btn btn-danger' },
                                buttonsStyling: false
                            })
                        }
                    })
                }
            })
        })
    }


});