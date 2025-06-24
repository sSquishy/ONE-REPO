$(document).ready(function() {
    // =====================     Ano ang Chika     =========================
    const chikaContainerEl = $('#chikaContainer');

    $.ajax({
        url: getChikas,
        type: 'GET',
        success: function(response) {
            chikaContainerEl.empty();
            if(response.length > 0) {
                response.forEach(chika => {
                    chikaContainerEl.append(`
                        <div class="col-12 col-md-6 col-lg-4 chikaCard" style="flex: 0 0 250px; height: 240px;">
                            <a href="#" data-bs-toggle="modal" data-bs-target="#anoangChikaModal" style="color: black; text-decoration: none;">
                                <div class="card shadow-none border h-100 chikaCard" style="height: 150px; width: 300px; border-radius: 10px; overflow: hidden;">
                                    <div class="p-2 pb-0" style="height: 120px; width: 100%;">
                                        <img src="${chika.chikaImage}" class="img-fluid chikaImage"
                                            style="width: 100%; height: 120px; object-fit: cover; border-radius: 10px;"
                                            alt="${chika.chikaTitle}">
                                    </div>
                                    <div class="card-body" style="text-align: left;">
                                        <h5 class="card-title" style="font-size: small; color: black;">${chika.chikaTitle}</h5>
                                        <p class="card-text" style="font-size: small; margin: 0; flex-grow: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: black;">
                                            ${chika.chikaDescription}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `);
                });
            } else {
                chikaContainerEl.append(`
                    <div class="col-12 col-md-6 col-lg-4 chikaCard" style="flex: 0 0 250px; height: 240px;">
                        <a href="#" data-bs-toggle="modal" data-bs-target="#anoangChikaModal" style="color: black; text-decoration: none;">
                            <div class="card shadow-none border h-100 chikaCard" style="height: 150px; width: 300px; border-radius: 10px; overflow: hidden;">
                                <div class="p-2 pb-0" style="height: 120px; width: 100%;">
                                    <img src="${defaultImage}" class="img-fluid chikaImage"
                                        style="width: 100%; height: 120px; object-fit: cover; border-radius: 10px;"
                                        alt="Wala pa tayong chika ngayon.">
                                </div>
                                <div class="card-body" style="text-align: left;">
                                    <h5 class="card-title" style="font-size: small; color: black;">Wala pa tayong chika ngayon.</h5>
                                    <p class="card-text" style="font-size: small; margin: 0; flex-grow: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: black;">
                                        Sagap muna tayo balita!
                                    </p>
                                </div>
                            </div>
                        </a>
                    </div>
                `);
            }
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    });

    $(document).on('click', '.chikaCard', function() {
        // Retrieve the card title and description; trim to remove any unwanted leading/trailing spaces.
        const title = $(this).find('.card-title').text().trim();
        // Use .html() for description to preserve any internal formatting (e.g., line breaks)
        const description = $(this).find('.card-text').html().trim();
        const image = $(this).find('.chikaImage').attr('src');

        // Set the modal title without any custom font weight (using only color black)
        $('#chikaCardTitle').html(`<span style="color: black;">${title}</span>`);
        // Display the description as is with preserved formatting.
        $('#chikaCardText').html(`<div style="white-space: pre-wrap; word-wrap: break-word; color: black;">${description}</div>`);
        $('#chikaCardImage').attr('src', image).attr('alt', title);
    });
    // ==========================================================

    // =====================     Calendar     =========================
    const calendarEventsEl = $('#calendarEventsContainer');

    $.ajax({
        url: getCalendarEvents,
        type: 'GET',
        success: function(response) {
            calendarEventsEl.empty();
            if(response.length > 0) {
                response.forEach(event => {
                    calendarEventsEl.append(`
                        <a href="javascript:void(0);" class="list-group-item list-group-item-action d-flex justify-content-between p-2">
                            <div class="li-wrapper d-flex justify-content-start align-items-center">
                            <div class="avatar avatar-xs me-2">
                                <span class="avatar-initial rounded-circle bg-label-success" style="font-size: 10px; padding: 5px;">M</span>
                            </div>
                            <div class="list-content">
                                <h6 class="mb-0" style="font-size: 12px;">${event.eventName}</h6>
                                <small style="font-size: 10px;">${event.eventDate}</small>
                            </div>
                            </div>
                        </a>
                    `)
                })
            } else {
                calendarEventsEl.append(`
                    <a href="javascript:void(0);" class="list-group-item list-group-item-action d-flex justify-content-between p-2">
                        <div class="li-wrapper d-flex justify-content-start align-items-center">
                        <div class="avatar avatar-xs me-2">
                            <span class="avatar-initial rounded-circle bg-label-success" style="font-size: 10px; padding: 5px;">M</span>
                        </div>
                        <div class="list-content">
                            <h6 class="mb-0" style="font-size: 12px;">No events currently happening</h6>
                            <small style="font-size: 10px;">Stay tuned for updates!</small>
                        </div>
                        </div>
                    </a>
                `)
            }
        }
    })

    // ================================================================
    // =====================     Posts     =========================
    let currentPage = 1;
    let isLoading = false; // Prevent duplicate requests

    const feedContainter = $('#feedContainer');
    const loadingTrigger = $('#loadingTrigger');

    const seeMoreThreshold = 200; // characters

    function loadPosts() {
        if (isLoading) return; // Prevent multiple calls
        isLoading = true;

        $.ajax({
            url: getPosts,
            type: 'GET',
            data: { page: currentPage },
            beforeSend: function () {
                // Show the skeleton loader
                loadingTrigger.show();
            },
            success: function (response) {
                if (response.posts.length > 0) {
                    response.posts.forEach(post => {
                        // Trim the content to remove extra leading/trailing spaces.
                        let trimmedContent = post.postContent.trim();
                        let contentHtml = "";
                        if (trimmedContent.length > seeMoreThreshold) {
                            let shortContent = trimmedContent.substring(0, seeMoreThreshold);
                            contentHtml = `<span class="short-text">${shortContent}</span><span class="full-text" style="display:none;">${trimmedContent}</span> <a href="#" class="see-more" style="color:black; font-weight: bold;"> ... See More</a>`;
                        } else {
                            contentHtml = trimmedContent;
                        }
                        const postCard = `
                            <div class="card border rounded-3 p-3 mb-3 shadow-sm" style="background: #fff; width: 770px; max-width: 100%;">
                                <div class="card-header bg-transparent border-bottom-0 p-2 d-flex align-items-center w-100" style="width: 770px; max-width: 100%;">
                                    <div class="d-flex align-items-center flex-grow-1">
                                        <img src="${defaultImage}" alt="User Avatar" class="rounded-circle me-2"
                                            style="width: 45px; height: 45px; object-fit: cover;" />
                                        <div>
                                            <h6 class="mb-0 fw-semibold" style="font-size: 15px; color: black;">${post.postAuthor}</h6>
                                            <small class="text-muted" style="font-size: 12px;">${timeSince(post.evaluatedTime)}</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body p-2" style="width: 770px; max-width: 100%;">
                                    <p class="mb-0" style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; color: black;">${contentHtml}</p>
                                </div>
                                ${ post.postImage.length > 0 ? `
                                  <div style="position: relative; width: 770px; max-width: 100%; height: 350px; overflow: hidden;">
                                    <!-- BLURRED BACKGROUND -->
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

                                    <!-- ACTUAL IMAGE -->
                                    <a href="#" class="postImage" data-bs-toggle="modal" data-bs-target="#imageModal" style="position: relative; z-index: 2;">
                                      <img src="${post.postImage[0]}" alt="Post Image" class="card-img-top rounded-3"
                                          style="width: 100%; max-width: 100%; height: 100%; object-fit: contain; display: block; cursor: pointer;" />
                                    </a>
                                  </div>
                                  ` : '' }
                            </div>
                        `;
                        feedContainter.append(postCard);
                    });

                    currentPage++; // Increment after successful response
                }

                if (!response.hasMore) {
                    observer.unobserve(loadingTrigger[0]);
                    loadingTrigger.hide();
                }
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
            },
            complete: function () {
                isLoading = false; // Allow new requests
            }
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
            $link.text('... See More');
        } else {
            $full.show();
            $short.hide();
            $link.text('See Less');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadPosts();
        }
    }, { rootMargin: "100px" });

    observer.observe(loadingTrigger[0]);
    loadPosts();

    // =============================================================

});
