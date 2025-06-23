$(document).ready(function() {
    // Total Active Uers
    $.ajax({
        url: "/sysAdmin/Admin/Dashboard/getCardsInformation/",
        type: "GET",
        success: function(data) {
            $('#totalActiveUsers').text(data.totalActiveUsers);
            $('#pendingApprovals').text(data.pendingApprovals);
            $('#recentLogs').html(`${data.recentLogs}<span class="text-body"> Logs Recorded</span>`)
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    })

    const statusMap = {
        Active: 'bg-success',
        Inactive: 'bg-secondary',
        Pending: 'bg-warning',
    }

    // Recently Registered Users
    $.ajax({
        url: "/sysAdmin/Admin/Dashboard/getLatestRegisteredUsers/",
        type: "GET",
        success: function(data) {
            // Show the message if no recently registered user found
            if(data.latestUsers.length === 0) {
                $('#recentlyRegisteredUsers').html(`
                    <li class="d-flex align-items-center p-3 border rounded shadow-sm mb-3 bg-white">
                        <div class="flex justify-center items-center h-screen">
                            No recently registered user found.
                        </div>
                    </li>    
                `);
                return;
            }

            const ulRecentlyRegisteredUsers = $('#recentlyRegisteredUsers');
            ulRecentlyRegisteredUsers.html('');
            data.latestUsers.forEach(user => {
                ulRecentlyRegisteredUsers.append(`
                    <li class="d-flex align-items-center p-3 border rounded shadow-sm mb-3 bg-white">
                        <div class="avatar avatar-md flex-shrink-0 me-3">
                            <div class="avatar-initial bg-light rounded-circle d-flex align-items-center justify-content-center">
                            <i class="mdi mdi-account-circle mdi-36px text-secondary"></i>
                            </div>
                        </div>
                        <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-3">
                            <div class="me-2">
                            <h6 class="mb-1 fw-semibold text-dark">${user.fullname}</h6>
                            <small class="text-muted">${user.type} • ${timeSince(user.createdTime)}</small>
                            </div>
                            <div class="badge ${statusMap[user.status]} text-white px-3 py-1 rounded-pill shadow-sm">${user.status}</div>
                        </div>
                    </li>    
                `)
            })
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    })
})