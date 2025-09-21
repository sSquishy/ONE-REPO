$(document).ready(function() {
    // ======================================= Slideshows ===================================================================
    const mainSlideshowEl = $('#mainSlideshow');
    const pupqcSlideshowEl = $('#pupqcSlideshow');

    let mainSlideshowSwiper = null;
    let pupqcSlideshowSwiper = null;

    // Skeleton slide HTML
    const skeletonSlideHTML = `
      <div class="swiper-slide">
        <div class="placeholder-glow" style="width: 100%; background: #e0e0e0; border-radius: 8px;"></div>
      </div>
    `;

    function addSkeletonSlides(swiperInstance, count = 3) {
        if (swiperInstance) {
            for (let i = 0; i < count; i++) {
                swiperInstance.appendSlide(skeletonSlideHTML);
            }
        }
    }

    function clearAllSlides(swiperInstance) {
        if (swiperInstance && swiperInstance.slides.length) {
            swiperInstance.removeAllSlides();
        }
    }

    function initSlideshow(el, options = {}) {
        if (el.length) {
            return new Swiper(el[0], {
                slidesPerView: 'auto',
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                    waitForTransition: true // Ensure autoplay waits for transition
                },
                navigation: {
                    prevEl: '.swiper-button-prev',
                    nextEl: '.swiper-button-next'
                },
                on: {
                    init: function() {
                        setTimeout(() => {
                            this.autoplay.start();
                        }, 100);
                    }
                },
                ...options
            });
        }
        return null;
    }

    // Initialize slideshows
    mainSlideshowSwiper = initSlideshow(mainSlideshowEl);
    pupqcSlideshowSwiper = initSlideshow(pupqcSlideshowEl);

    // Add initial skeletons
    addSkeletonSlides(mainSlideshowSwiper);
    addSkeletonSlides(pupqcSlideshowSwiper);

    // Fix for potential lazy loading issues
    $(window).on('load', function () {
        if (mainSlideshowSwiper) {
            mainSlideshowSwiper.update();
            mainSlideshowSwiper.autoplay.start();
        }
        if (pupqcSlideshowSwiper) {
            pupqcSlideshowSwiper.update();
            pupqcSlideshowSwiper.autoplay.start();
        }
    });

    // Get Slideshows
    $.ajax({
        url: getSlideshows,
        type: 'GET',
        success: function (response) {
            const mainSlideshows = response.slideshows.main;
            const pupqcSlideshows = response.slideshows.mypupqc;

            clearAllSlides(mainSlideshowSwiper);
            mainSlideshows.forEach(slideshow => {
                mainSlideshowSwiper.addSlide(0,
                    `<div class="swiper-slide" style="background-image:url(${slideshow.image}); background-size: cover; background-position: center;"></div>`
                );
            });
            mainSlideshowSwiper.update();
            mainSlideshowSwiper.slideTo(0, 1500);

            clearAllSlides(pupqcSlideshowSwiper);
            pupqcSlideshows.forEach(slideshow => {
                pupqcSlideshowSwiper.addSlide(0,
                    `<div class="swiper-slide" style="background-image:url(${slideshow.image}); background-size: cover; background-position: center;"></div>`
                );
            });
            pupqcSlideshowSwiper.update();
            pupqcSlideshowSwiper.slideTo(0, 1500);
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });


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
      const noArticlesEl = $('#noArticles');

      // Clear existing articles
      articlesEl.empty();
      noArticlesEl.addClass('d-none'); // Hide initially

      // === Insert Skeleton Loaders ===
      const skeletonHTML = `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-none border h-100" style="height: 300px; border-radius: 10px; overflow: hidden;">
            <div class="p-2 pb-0">
              <div class="placeholder bg-secondary" style="width: 100%; height: 250px; border-radius: 10px;"></div>
            </div>
            <div class="card-body">
              <h5 class="card-title placeholder-glow">
                <span class="placeholder col-6" style="width: 80%; height: 20px;"></span>
              </h5>
              <p class="card-text placeholder-glow" style="font-size: small;">
                <span class="placeholder col-7" style="width: 100%; height: 14px;"></span><br>
                <span class="placeholder col-5" style="width: 70%; height: 14px;"></span>
              </p>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-none border h-100" style="height: 300px; border-radius: 10px; overflow: hidden;">
            <div class="p-2 pb-0">
              <div class="placeholder bg-secondary" style="width: 100%; height: 250px; border-radius: 10px;"></div>
            </div>
            <div class="card-body">
              <h5 class="card-title placeholder-glow">
                <span class="placeholder col-4" style="width: 50%; height: 18px;"></span>
              </h5>
              <p class="card-text placeholder-glow" style="font-size: small;">
                <span class="placeholder col-10" style="width: 100%; height: 14px;"></span><br>
                <span class="placeholder col-9" style="width: 90%; height: 14px;"></span>
              </p>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-none border h-100" style="height: 300px; border-radius: 10px; overflow: hidden;">
            <div class="p-2 pb-0">
              <div class="placeholder bg-secondary" style="width: 100%; height: 250px; border-radius: 10px;"></div>
            </div>
            <div class="card-body">
              <h5 class="card-title placeholder-glow">
                <span class="placeholder col-8" style="width: 90%; height: 25px;"></span>
              </h5>
              <p class="card-text placeholder-glow" style="font-size: small;">
                <span class="placeholder col-6" style="width: 75%; height: 14px;"></span>
              </p>
            </div>
          </div>
        </div>
      `;
      articlesEl.append(skeletonHTML);

      // === Fetch Actual Articles ===
      $.ajax({
        url: getArticles,
        type: 'GET',
        success: function(response) {
          articlesEl.empty(); // Remove skeletons

          let articles = response.articles || [];
          articles = articles.reverse(); // Show newest first

          if (articles.length === 0) {
            noArticlesEl.removeClass('d-none');
            return; // Stop here if no articles
          }

          noArticlesEl.addClass('d-none'); // Hide if there are articles

          articles.forEach(article => {
            const description = article.articleDescription.trim();
            const safeDataDescription = article.articleDescription.replace(/"/g, '&quot;');

            articlesEl.append(`
              <div class="col-12 col-md-6 col-lg-4 articleCard" data-title="${article.articleTitle}" data-description="${safeDataDescription}" data-image="${article.articleImage}">
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
              </div>
            `);
          });
        },
        error: function(xhr, status, error) {
          console.log(xhr.responseText);
        }
      });
    }

    // Initial load
    loadArticles();

    // Modal population on article click
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
            $('#faqSkeletons').remove(); // remove skeleton loader
            const faqs = response.faqs;

            if (!faqs.length) {
                $('#noFaqs').removeClass('d-none');
                return;
            } else {
                $('#noFaqs').addClass('d-none');
            }

            faqs.forEach(faq => {
                faqsEl.append(`
                    <div style="background: #fff; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                      <div onclick="toggleAccordion(this)"
                          style="background-color: #ffcccc; color: #880000; padding: 15px 20px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.3s ease;">
                          <span>${faq.question}</span>
                          <span class="toggle-icon" style="transition: transform 0.3s ease;">&#9662;</span>
                      </div>
                      <div style="background: #fff2f2; padding: 25px; font-size: 16px; color: #000; display: none;">
                          ${faq.answer}
                      </div>
                  </div>
                `);
            });
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
        }
    });


    // ======================================================================================================================

    // ======================================= How To =======================================================================
    const howtoDropdownWrapper = $('#howToDropdownWrapper');
    const howtoEl = $('#howToDropdown');

    $.ajax({
        url: getHowToLinks,
        type: 'GET',
        success: function(response) {
            const howtos = response.howtoLinks;

            if (howtos && howtos.length > 0) {
                howtos.forEach(howto => {
                    howtoEl.append(`
                        <li><a class="dropdown-item fw-bold text-black" href="${howto.howtoLink}" target="_blank">${howto.howtoName}</a></li>
                    `);
                });
                howtoDropdownWrapper.show(); // Show dropdown only if data exists
            }
            // If no data, leave it hidden
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
            // Keep dropdown hidden on error
        }
    });

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
    // Helper: show inline email feedback under the field
    function showEmailFeedback(field, message) {
        var $field = $(field);
        var $wrapper = $field.parent();
        var $feedback = $wrapper.find('.email-feedback');
        if ($feedback.length === 0) {
            $feedback = $('<div class="invalid-feedback d-block email-feedback" style="font-size:12px; margin-top:4px;"></div>');
            $wrapper.append($feedback);
        }
        $feedback.text(message);
        $field.addClass('is-invalid');
    }

    function clearEmailFeedback(field) {
        var $field = $(field);
        var $wrapper = $field.parent();
        $wrapper.find('.email-feedback').remove();
        $field.removeClass('is-invalid');
    }

    function isValidEmail(value) {
        var genericEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!genericEmailRegex.test(value)) return false;
        if (value.indexOf('pup.edu.ph') !== -1 && !value.endsWith('@iskolarngbayan.pup.edu.ph')) return false;
        return true;
    }

    $(document).on('click', '.forgot-password', function() {
        const role = $(this).data('role');
        let email = null;
        let $emailField = null;

        if(role === 'Student') {
            $emailField = $('#studentEmail');
            email = $emailField.val();
        } else if(role === 'Faculty') {
            $emailField = $('#facultyEmail');
            email = $emailField.val();
        } else if(role === 'Alumni') {
            $emailField = $('#alumniEmail');
            email = $emailField.val();
        }

        // Clear previous inline feedback
        if ($emailField) clearEmailFeedback($emailField);

        // Client-side validations with inline feedback (no Swal on missing/invalid)
        if(!email) {
            if ($emailField) showEmailFeedback($emailField, 'Please enter your email address');
            return;
        }

        if(!isValidEmail(email)) {
            if ($emailField) showEmailFeedback($emailField, 'Please enter valid email address');
            return;
        }

        // At this point email is present and format looks valid. Proceed with AJAX.
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
                // Clear input and feedback on success
                if ($emailField) {
                    $emailField.val('');
                    clearEmailFeedback($emailField);
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.message || 'Password reset link sent.',
                    customClass: { confirmButton: 'btn btn-primary waves-effect' },
                    buttonsStyling: false
                });
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseJSON);
                stopProcessingSwal(swalTimeouts);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'An error occurred.',
                    customClass: { confirmButton: 'btn btn-primary waves-effect' },
                    buttonsStyling: false
                })
            }
        })
    })

    // =======================================================================
});
