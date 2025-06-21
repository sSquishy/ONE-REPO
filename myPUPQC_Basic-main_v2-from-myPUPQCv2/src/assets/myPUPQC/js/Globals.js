const baseUrl = 'http://127.0.0.1:8000/';

// Usage: timeSince()
// Use to get the seconds/ minutes/ hours/ days/ months/ years since the date
// Parameter:
// date (datatime): the date to be processed
function timeSince(dateString) {
    const now = new Date();
    const createdTime = new Date(dateString);

    const seconds = Math.floor((now - createdTime) / 1000);

    if (seconds < 0) return "Just now";

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? "" : "s"} ago`;

    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
}


// Usage: buildFullName()
// Use to build the full name of the user from firstname, middlename, lastname, suffix
// Parameter:
// firstname (string): the firstname of the user
// middlename (string): the middlename of the user
// lastname (string): the lastname of the user
// suffix (string): the suffix of the user
function buildFullName(firstname, middlename, lastname, suffix) {
    return `
        ${firstname} 
        ${middlename ? middlename[0]+'. ' : ''} 
        ${lastname} 
        ${suffix ? suffix : ''}
    `;
}


// Usage: reloadTable()
// Use to reload the datatable without refreshing the pagination
// Parameter:
// table (datatable): the datatable instance to be reloaded
// page (int): the page before the table was reloaded
// Reload the DataTable with the new data
function reloadTable(table, page) {
    // Reload the DataTable with the new data
    table.ajax.reload(function() {
        // After reloading, restore the current page
        table.page(page).draw('page');
    });
}


// Usage: showProcessingSwal()
// Use to show a Swal popup with a loading spinner
// Parameter:
// title (string): the title of the Swal popup
// text (string): the text of the Swal popup
// failedText (string): the text of the Swal popup if the request failed
// wTime (int): the time before showing a warning message
// fTime (int): the time before showing a failed message
// Return: Returns two Swal popups, one for loading and one for failed request
function showProcessingSwal(title, text, failedText, wTime=5000, fTime=30000) {
    Swal.fire({
        title: title,
        text: text,
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
            title: title,
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
    }, wTime);
    
      // Set a timeout to show a warning message if the process takes too long
    let timeout2 = setTimeout(() => {
        Swal.close();
        Swal.fire({
            title: failedText,
            text: 'Please reload the page and try again.',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-danger waves-effect' },
            buttonsStyling: false
        })
        .then(() => {
            location.reload();
        })
    }, fTime);

    return { timeout, timeout2 };
}

// Usage: stopProcessingSwal()
// Use to stop the Swal popup with a loading spinner
// Parameter:
// timeout (int): the timeout of the Swal popup
// timeout2 (int): the timeout of the Swal popup
function stopProcessingSwal(swalTimeouts) {
    if(swalTimeouts) {
        clearTimeout(swalTimeouts.timeout);
        clearTimeout(swalTimeouts.timeout2);
    }
    Swal.close();
}