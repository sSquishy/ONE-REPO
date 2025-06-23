$(document).ready(function() {
  let currentPage = 1;
  const feedContainter = $('#feedContainer');
  const loadingTrigger = $('#loadingTrigger');
  let search = null;
  let isLoading = false;
  const seeMoreThreshold = 200; // characters

    function loadPosts() {
      if (isLoading) return;
      isLoading = true;
      $.ajax({
        url: getPendingPosts,
        type: 'GET',
        data: { page: currentPage, search: search },
        beforeSend: function() { loadingTrigger.show(); },
        success: function (response) {
          if (response.posts.length > 0) {
            response.posts.forEach(post => {
              // Trim the content and generate HTML with "See More" if needed.
              let trimmedContent = post.postContent.trim();
              let contentHtml = "";
              if (trimmedContent.length > seeMoreThreshold) {
                let shortContent = trimmedContent.substring(0, seeMoreThreshold);
                contentHtml = `<span class="short-text">${shortContent}</span><span class="full-text" style="display:none;">${trimmedContent}</span> <a href="#" class="see-more" style="color:black; font-weight: bold;"> ... See More</a>`;
              } else {
                contentHtml = trimmedContent;
              }
              const postCard = `
                <div class="card border rounded-3 p-3 mb-3 shadow-sm mx-auto" style="background: #fff; width: 730px;">
                  <div class="card-header bg-transparent border-bottom-0 p-2 d-flex align-items-center w-100" style="width: 700px; margin: 0 auto;">
                    <div class="d-flex align-items-center flex-grow-1">
                      <img src="{% static 'img/elements/2.jpg' %}" alt="User Avatar" class="rounded-circle me-2"
                          style="width: 45px; height: 45px; object-fit: cover;" />
                      <div>
                        <h6 class="mb-0 fw-semibold text-dark" style="font-size: 15px;">${post.postAuthor}</h6>
                        <small class="text-muted" style="font-size: 12px;">${timeSince(post.createdTime)}</small>
                      </div>
                    </div>
                    <div class="dropdown">
                      <button class="btn btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown"
                              aria-expanded="false" style="background: transparent; border: none; color: #6C757D; font-size: 20px;">
                        <i class="mdi mdi-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                        <li>
                          <a class="dropdown-item text-danger" href="#">
                            <i class="mdi mdi-trash-can me-2"></i> Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="card-body p-2" style="width: 700px; margin: 0 auto;">
                    <p class="mb-0 text-dark" style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${contentHtml}</p>
                  </div>

                  ${ post.postImage.length > 0 ? `
                    <div style="position: relative; width: 700px; height: 300px; overflow: hidden;">
                      <!-- Blurred background layer -->
                      <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: url('${post.postImage[0]}') center center no-repeat;
                        background-size: cover;
                        filter: blur(20px);
                        transform: scale(1.1);
                        z-index: 1;
                      "></div>

                      <!-- Foreground image -->
                      <a href="#" class="postImage" data-bs-toggle="modal" data-bs-target="#imageModal" style="position: relative; z-index: 2;">
                        <img src="${post.postImage[0]}" alt="Post Image" class="card-img-top rounded-3 img-fluid"
                             style="width: 100%; height: 100%; object-fit: contain; display: block; cursor: pointer;" />
                      </a>
                    </div>
                    ` : '' }
                  <div class="card-footer bg-transparent border-top-0 p-2 d-flex left-0"></div>
                  <div class="d-flex justify-content-around mt-3">
                    <button type="button" data-id="${post.postID}" data-type="Approved" class="btn btn-success btn-publish">Publish</button>
                    <button type="button" data-id="${post.postID}" data-type="Declined" class="btn btn-danger btn-reject">Reject</button>
                    <button type="button" data-id="${post.postID}" data-type="Flagged" class="btn btn-warning btn-report">Report</button>
                  </div>
                </div>
              `;
              feedContainter.append(postCard);
            });
            currentPage++;
          }
          if (!response.hasMore) {
            observer.unobserve(loadingTrigger[0]);
            loadingTrigger.hide();
          }
        },
        error: function(xhr, status, error) { console.log(xhr.responseText); },
        complete: function() { isLoading = false; }
      });
    }

    $(document).on('click', '.postImage', function() {
      const image = $(this).find('img').attr('src');
      $('#postImage').attr('src', image).attr('alt', 'Post Image');
    });

    // Delegate event for See More / See Less toggle.
    $(document).on('click', '.see-more', function(e) {
      e.preventDefault();
      let $link = $(this);
      let $p = $link.closest('p');
      let $short = $p.find('.short-text');
      let $full = $p.find('.full-text');
      if ($full.is(':visible')) {
        $full.hide();
        $short.show();
        $link.text('See More');
      } else {
        $full.show();
        $short.hide();
        $link.text('See Less');
      }
    });

    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
              loadPosts();
        }
    }, { rootMargin: "100px"});


    observer.observe(loadingTrigger[0]);
    loadPosts();

    // =============================================================

    // =====================     Post Moderation Search     =========================
    function searchPendingPost() {
        search = $('#searchInput').val();
        feedContainter.empty();
        currentPage = 1;

        loadPosts();
    }

    $('#searchButton').on('click', function() {
        searchPendingPost();
    });

    $('#searchInput').on('keypress', function(e) {
        if(e.which === 13) {
          searchPendingPost();
        }
    });

    // ==============================================================================

    // =====================     Post Moderation     =========================
    // Helper function to check if there are any pending posts left
    function checkPendingPosts() {
        if ($('#pendingPosts .card').length === 0) {
        $('#pendingPosts').html('<div class="text-center p-3">No more pendings display</div>');
        }
    }

    function moderatePostFunc(method, postID, reasons, isBulk=false) {
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: "Loading...",
                text: "Performing request...",
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
                    title: 'Failed to perform request',
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
            url: moderatePost,
            type: "POST",
            data: {
                method: method,
                postID: postID,
                reasons: reasons,
                isBulk: isBulk,
                csrfmiddlewaretoken: csrf
            },
            success: function(response) {
                clearTimeout(timeout);
                clearTimeout(timeout2);
                Swal.close();

                Swal.fire({
                title: "Success!",
                text: `Post has been ${method.toLowerCase()} successfully.`,
                icon: "success",
                customClass: { confirmButton: 'btn btn-success waves-effect' },
                buttonsStyling: false
                })
                resolve(true);
            },
            error: function(xhr) {
                clearTimeout(timeout);
                clearTimeout(timeout2);
                Swal.close();

                Swal.fire({
                title: "Failed!",
                text: "Post moderation have failed. Please try again.",
                icon: 'error',
                customClass: { confirmButton: 'btn btn-danger waves-effect' },
                buttonsStyling: false
                })
                reject(false);
            }
            })
        });
    }
    document.moderatePostFunc = moderatePostFunc;

    function publishPost(method, authorID, reasons=null) {
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: 'Publish Post',
                text: 'Are you sure you want to publish this post?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, publish',
                cancelButtonText: 'Cancel',
                customClass: {
                    confirmButton: 'btn btn-success me-3 waves-effect waves-light',
                    cancelButton: 'btn btn-outline-secondary waves-effect'
                },
                buttonsStyling: false
            })
            .then((result) => {
                if (result.isConfirmed) {
                    moderatePostFunc(method, authorID, reasons)
                    .then(response => {
                        resolve(response);
                    })
                } else {
                    reject(false);
                }
            });
        })
    }
    document.publishPost = publishPost;

    function declinePost(method, authorID, reasons=null) {
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: 'Reject Post',
                text: 'Are you sure you want to reject this post?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, reject',
                cancelButtonText: 'Cancel',
                customClass: {
                    confirmButton: 'btn btn-success me-3 waves-effect waves-light',
                    cancelButton: 'btn btn-outline-secondary waves-effect'
                },
                buttonsStyling: false
            })
            .then((result) => {
                if (result.isConfirmed) {
                    moderatePostFunc(method, authorID, reasons)
                    .then(response => {
                        resolve(response);
                    })
                } else {
                    reject(false);
                }
            });
        })
    }
    document.declinePost = declinePost;

    function reportPost(method, authorID, reasons=null) {
        console.log("Reasons: ", reasons)
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: 'Report Post',
                text: 'Are you sure you want to report this post?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, report',
                cancelButtonText: 'Cancel',
                customClass: {
                    confirmButton: 'btn btn-success me-3 waves-effect waves-light',
                    cancelButton: 'btn btn-outline-secondary waves-effect'
                },
                buttonsStyling: false
            })
            .then((result) => {
                if (result.isConfirmed) {
                    moderatePostFunc(method, authorID, reasons)
                    .then(response => {
                        resolve(response);
                    })
                } else {
                    reject(false);
                }
            });
        })
    }
    document.reportPost = reportPost;

    let $currentReportPost = null;
    $(document).on('click', '.btn-report, .item-report', function() {
        const postID = $(this).data('id');
        const type = $(this).data('type');
        const loc = $(this).data('loc');
        $('#submitNewReport').data('id', postID).data('type', type);

        $currentReportPost = loc === 'table' ? null : $(this).closest('.card');
        $('#addReportModal').modal('show');
    });

    // Publish button action
    $(document).on('click', '.btn-publish, .btn-reject, #submitNewReport', function (e) {
        let $post = $(this).closest('.card');
        if($(this).attr('id') === 'submitNewReport') {
            $post = $currentReportPost
        }

        const type = $(this).data('type')
        const postID = $(this).data('id');
        // For reporting - optional for other two types
        const reportTitle = $('#newReportTitle').val();
        const reportDescription = $('#newReportDescription').val();
        const reportCategory = $('#newReportCategory').val();

        console.log("type: ", type)
        console.log("postID: ", postID)

        if(type === "Approved") {
            publishPost(type, postID)
            .then(response => { if(response) { $post.remove(); checkPendingPosts(); } })
        } else if(type === "Declined") {
            declinePost(type, postID)
            .then(response => { if(response) { $post.remove(); checkPendingPosts(); } })
        } else if(type === "Flagged") {
            reportPost(type, postID, reasons=JSON.stringify({title: reportTitle, description: reportDescription, category: reportCategory}, false))
            .then(response => {
                if(response) {
                    if($currentReportPost) {
                        $currentReportPost.remove();
                        checkPendingPosts();
                    } else {
                        const tableName = $(this).data('table');
                        $(`#${tableName}`).DataTable().ajax.reload(null, false);
                    }
                    $('#addReportModal').modal('hide');
                }
            })
        }
    });
    // =======================================================================
})
