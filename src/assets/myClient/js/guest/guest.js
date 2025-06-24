$(document).ready(function() {
    // ======================================= Slideshows ===================================================================
    const mainSlideshowEl = $('#mainSlideshow');
    const pupqcSlideshowEl = $('#pupqcSlideshow');

    let mainSlideshowSwiper = null;
    let pupqcSlideshowSwiper = null

    if (mainSlideshowEl) {
        mainSlideshowSwiper = new Swiper(mainSlideshowEl[0], {
            slidesPerView: 'auto',
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            navigation: {
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next'
            }
        });
    }

    if(pupqcSlideshowEl) {
        pupqcSlideshowSwiper = new Swiper(pupqcSlideshowEl[0], {
            slidesPerView: 'auto',
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            navigation: {
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next'
            }
        });
    }

    // Get Slideshows
    $.ajax({
        url: getSlideshows,
        type: 'GET',
        success: function(response) {
            const mainSlideshows = response.slideshows.main;
            const pupqcSlideshows = response.slideshows.mypupqc;
            mainSlideshows.forEach(slideshow => {
                mainSlideshowSwiper.addSlide(0, `<div class="swiper-slide" style="background-image:url(${slideshow.image});"></div>`);
            });
            mainSlideshowSwiper.update();
            mainSlideshowSwiper.slideTo(0, 1500);

            pupqcSlideshows.forEach(slideshow => {
                pupqcSlideshowSwiper.addSlide(0, `<div class="swiper-slide" style="background-image:url(${slideshow.image});"></div>`);
            });
            pupqcSlideshowSwiper.update();
            pupqcSlideshowSwiper.slideTo(0, 1500);
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    })

    // // ======================================================================================================================

    // // ======================================= Articles / Latest News =======================================================
    // const articlesEl = $('#card-slider');
    // console.log("getArticles: ", getArticles);

    // // Function to truncate text to 100 characters
    // function truncateText(text, maxLength = 100) {
    //     return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    // }

    // $.ajax({
    //     url: getArticles,
    //     type: 'GET',
    //     success: function(response) {
    //         const articles = response.articles;

    //         articles.forEach(article => {
    //             articlesEl.append(`
    //                 <div class="col-12 col-md-6 col-lg-4 articleCard"
    //                     data-title="${article.articleTitle}"
    //                     data-description="${article.articleDescription}"
    //                     data-image="${article.articleImage}">

    //                     <a href="#" data-bs-toggle="modal" data-bs-target="#imageModal">
    //                         <div class="card shadow-none border h-100">
    //                             <div class="p-2 pb-0">
    //                                 <img src="${article.articleImage}" class="img-fluid articleImage"
    //                                     style="height: 250px; width: 100%; object-fit: cover;"
    //                                     alt="${article.articleTitle}">
    //                             </div>
    //                             <div class="card-body">
    //                                 <h5 class="card-title">${article.articleTitle}</h5>
    //                                 <p class="card-text">
    //                                     ${truncateText(article.articleDescription)}
    //                                 </p>
    //                             </div>
    //                         </div>
    //                     </a>

    //                 </div>
    //             `);
    //         });
    //     },
    //     error: function(xhr, status, error) {
    //         console.log(xhr.responseText);
    //     }
    // });

    // // When an article is clicked, show the full description in the modal
    // $(document).on('click', '.articleCard', function() {
    //     const title = $(this).data('title');  // Get full title
    //     const description = $(this).data('description'); // Get full description
    //     const image = $(this).data('image');  // Get image

    //     $('#cardTitle').html(title);
    //     $('#cardText').html(description);  // Show full description in modal
    //     $('#cardImage').attr('src', image).attr('alt', title);
    // });


    // ======================================= Articles / Latest News =======================================================
    function loadArticles() {
      const articlesEl = $('#card-slider');
      // Clear existing articles
      articlesEl.empty();

      $.ajax({
        url: getArticles,
        type: 'GET',
        success: function(response) {
          let articles = response.articles;
          // Reverse the articles array so the newest appears first.
          articles = articles.reverse();
          articles.forEach(article => {
            // Trim description to remove unwanted spaces at beginning and end.
            const description = article.articleDescription.trim();
            // Escape double quotes for the data attribute.
            const safeDataDescription = article.articleDescription.replace(/"/g, '&quot;');
            articlesEl.append(
    `<div class="col-12 col-md-6 col-lg-4 articleCard" data-title="${article.articleTitle}" data-description="${safeDataDescription}" data-image="${article.articleImage}">
        <a href="#" data-bs-toggle="modal" data-bs-target="#imageModal" style="color: black; text-decoration: none;">
            <div class="card shadow-none border h-100">
                <div class="p-2 pb-0">
                    <img src="${article.articleImage}" class="img-fluid articleImage" style="height: 250px; width: 100%; object-fit: cover;" alt="${article.articleTitle}">
                </div>
                <div class="card-body">
                    <h5 class="card-title" style="color: black;">${article.articleTitle}</h5>
                    <p class="card-text" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap; word-wrap: break-word; color: black;">${description}</p>
                </div>
            </div>
        </a>
    </div>`
            );
          });
        },
        error: function(xhr, status, error) {
          console.log(xhr.responseText);
        }
      });
    }

    // Initial load
    loadArticles();

    // When an article is clicked, show the full description in the modal (preserving internal formatting)
    // The modal title is now black and bold.
    $(document).on('click', '.articleCard', function() {
      const title = $(this).attr('data-title');
      const description = $(this).attr('data-description').replace(/&quot;/g, '"').trim();
      const image = $(this).attr('data-image');
      $('#cardTitle').html(`<span style="color: black; font-weight: bold;">${title}</span>`);
      $('#cardText').html(`<div style="white-space: pre-wrap; word-wrap: break-word; color: black;">${description}</div>`);
      $('#cardImage').attr('src', image).attr('alt', title);
    });


    // ======================================================================================================================

    // ======================================= FAQs =========================================================================
    const faqsEl = $('#faqs');

    $.ajax({
        url: getFAQs,
        type: 'GET',
        success: function(response) {
            const faqs = response.faqs;

            faqs.forEach(faq => {
                faqsEl.append(`
                    <div style="background: #fff; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <div onclick="toggleAccordion(this)"
                        style="background-color: #ffcccc; color: #880000; padding: 15px 20px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.3s ease;">
                        <span>${faq.question}</span>
                        <span class="toggle-icon" style="transition: transform 0.3s ease;">&#9662;</span>
                    </div>
                    <div
                        style="background: #fff2f2; padding: 25px; font-size: 16px; color: #000; display: none;">
                        ${faq.answer}
                    </div>
                </div>
                `)
            })
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    })

    // ======================================================================================================================

    // ======================================= How To =======================================================================
    const howtoEl = $('#howToDropdown');

    $.ajax({
        url: getHowToLinks,
        type: 'GET',
        success: function(response) {
            const howtos = response.howtoLinks;

            howtos.forEach(howto => {
                howtoEl.append(`
                    <li><a class="dropdown-item fw-bold text-black" href="${howto.howtoLink}" target="_blank">${howto.howtoName}</a></li>
                `)
            })
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    })

    // ======================================================================================================================

    // ======================================= Login ========================================================================
    function loginFunc(data) {
        const role = $(data).data('role');
        let username = '';
        let password = '';
        let birthMonth = '';
        let birthDay = '';
        let birthYear = '';
        let redirectUrl = '';

        if(role === 'Student') {
            username = $('#studentNumber').val();
            password = $('#studentPassword').val();
            birthMonth = $('#studentBirthMonth').val();
            birthDay = $('#studentBirthDay').val();
            birthYear = $('#studentBirthYear').val();
            redirectUrl = '/student/Homepage';
        } else if(role === 'Faculty') {
            username = $('#facultyNumber').val();
            password = $('#facultyPassword').val();
            birthMonth = $('#facultyBirthMonth').val();
            birthDay = $('#facultyBirthDay').val();
            birthYear = $('#facultyBirthYear').val();
            redirectUrl = '/faculty/Homepage';
        } else if(role === 'Alumni') {
            username = $('#alumniNumber').val();
            password = $('#alumniPassword').val();
            birthMonth = $('#alumniBirthMonth').val();
            birthDay = $('#alumniBirthDay').val();
            birthYear = $('#alumniBirthYear').val();
            redirectUrl = '/alumni/Homepage';
        }

        $.ajax({
            url: authenticateUser,
            type: 'POST',
            data: {
                username: username,
                password: password,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                role: role,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(response) {
                console.log(response);
                if(response.status === 'Success') {
                    window.location.href = redirectUrl;
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseJSON);
                const remainingAttempts = xhr.responseJSON.remainingAttempts || 0;
                $('.attemptCounter').text(`Remaining Attempts: ${remainingAttempts}`).attr('hidden', false);

                if(remainingAttempts > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'Invalid Credentials',
                        customClass: { confirmButton: 'btn btn-primary waves-effect' },
                        buttonsStyling: false
                    })
                } else if(remainingAttempts === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'You have reached the maximum number of login attempts. Please try again later.',
                        customClass: { confirmButton: 'btn btn-primary waves-effect' },
                        buttonsStyling: false
                    })
                }
            }
        })
    }
    document.loginFunc = loginFunc;

    // ======================================================================================================================

    // =====================     Forgot Password     =========================
    $(document).on('click', '.forgot-password', function() {
        const role = $(this).data('role');
        let email = null;

        if(role === 'Student') {
            email = $('#studentEmail').val();
        } else if(role === 'Faculty') {
            email = $('#facultyEmail').val();
        } else if(role === 'Alumni') {
            email = $('#alumniEmail').val();
        }

        if(!email) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter your email address',
                customClass: { confirmButton: 'btn btn-primary waves-effect' },
                buttonsStyling: false
            })
            return;
        }

        let swalTimeouts = showProcessingSwal(
            "Requesting Password Reset",
            "Please wait while we process your request",
            "Failed to request password reset link. Please try again later.",
        );

        $.ajax({
            url: forgotPasswordRequest,
            type: 'POST',
            data: {
                email: email,
                role: role,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(response) {
                console.log(response);
                stopProcessingSwal(swalTimeouts);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.message,
                    customClass: { confirmButton: 'btn btn-primary waves-effect' },
                    buttonsStyling: false
                })
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseJSON);
                stopProcessingSwal(swalTimeouts);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: xhr.responseJSON.message,
                    customClass: { confirmButton: 'btn btn-primary waves-effect' },
                    buttonsStyling: false
                })
            }
        })
    })    

    // =======================================================================
});
