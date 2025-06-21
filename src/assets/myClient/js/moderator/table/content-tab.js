// Global variable to store the current post being reported (if needed)
let $currentReportPost = null;

// Helper function to check if there are any pending posts left
function checkPendingPosts() {
  if ($('#pendingPosts .card').length === 0) {
    $('#pendingPosts').html('<div class="text-center p-3">No more pendings display</div>');
  }
}

$(document).ready(function () {
  // Publish button action
  $(document).on('click', '.btn-publish', function (e) {
    e.preventDefault();
    const $post = $(this).closest('.card');
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
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Published!',
          text: 'Post published successfully.',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        }).then(() => {
          $post.remove(); // Remove the post from the DOM
          checkPendingPosts(); // Check if any posts remain
        });
      }
    });
  });

  // Reject button action
  $(document).on('click', '.btn-reject', function (e) {
    e.preventDefault();
    const $post = $(this).closest('.card');
    Swal.fire({
      title: 'Reject Post',
      text: 'Are you sure you want to reject this post?',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3 waves-effect waves-light',
        cancelButton: 'btn btn-outline-secondary waves-effect'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Post rejected successfully.',
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        }).then(() => {
          $post.remove(); // Remove the post from the DOM
          checkPendingPosts(); // Check for remaining posts
        });
      }
    });
  });

  // Report button action: store reference and open Add Report modal
  $(document).on('click', '.btn-report', function (e) {
    e.preventDefault();
    $currentReportPost = $(this).closest('.card');
    $('#addReportModal').modal('show');
  });

  // Example submission for the Add Report modal form
  $('#addReportForm').on('submit', function (e) {
    e.preventDefault();
    // Here you can perform any validation or Ajax submission
    Swal.fire({
      icon: 'success',
      title: 'Reported!',
      text: 'Post reported successfully.',
      customClass: { confirmButton: 'btn btn-success' },
      buttonsStyling: false
    }).then(() => {
      $('#addReportModal').modal('hide');
      if ($currentReportPost) {
        $currentReportPost.remove();
        $currentReportPost = null;
      }
      checkPendingPosts();
      $(this)[0].reset();
    });
  });
});
