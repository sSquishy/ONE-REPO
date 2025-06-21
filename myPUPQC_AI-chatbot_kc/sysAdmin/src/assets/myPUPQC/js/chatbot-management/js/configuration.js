// Select elements
const elements = {
  fileInput: document.getElementById("pdfUpload"),
  fileList: document.getElementById("fileList"),
  progressBarContainer: document.getElementById("uploadProgressContainer"),
  progressBar: document.getElementById("uploadProgressBar"),
  pdfPreviewContainer: document.getElementById("pdfPreviewContainer"),
  pdfPreview: document.getElementById("pdfPreview"),
  submitButton: document.getElementById("submitChatbotDataBtn"),
  dataNameInput: document.getElementById("dataName"),
  dataLinkInput: document.getElementById("dataLink"),
  tableBody: document.querySelector("table tbody"),
  chatbotModal: document.getElementById("chatbotDataModal"),
  paginationControls: document.getElementById("paginationControls"),
  paginationControlsData: document.getElementById("paginationControlsData"),
  paginationControlsOptions: document.getElementById("paginationControlsOptions"),
};

// Pagination
const maxRows = 5;
let currentPage = 1;

const truncateText = (text, maxLength = 20) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

const resetUI = () => {
  elements.fileList.innerHTML = "";
  ["uploadProgressContainer", "pdfPreviewContainer", "submitButton"].forEach(
    id => (document.getElementById(id).style.display = "none")
  );
  elements.pdfPreviewContainer.classList.remove("show");
};

// Handle file selection
const handleFileSelection = () => {
  resetUI();
  const file = elements.fileInput.files[0];

  if (!file || file.type !== "application/pdf") {
    Swal.fire("Error", "Only PDF files are allowed.", "error");
    elements.fileInput.value = "";
    return;
  }

  elements.fileList.innerHTML = `
    <div class="d-flex align-items-center mb-2">
      <span class="me-2">${truncateText(file.name)}</span>
      <button class="btn btn-danger btn-sm remove-file">✕</button>
    </div>
  `;

  document.querySelector(".remove-file").addEventListener("click", () => {
    resetUI();
    elements.fileInput.value = "";
  });

  elements.progressBarContainer.style.display = "block";
  Object.assign(elements.progressBar.style, { width: "0%", textContent: "0%" });

  simulateSmoothUpload(file);
};

// Simulate progress visually only
const simulateSmoothUpload = (file) => {
  let progress = 0;
  const interval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(interval);
      elements.pdfPreview.src = URL.createObjectURL(file);
      elements.pdfPreview.style.height = "250px";
      elements.pdfPreviewContainer.style.display = "block";
      setTimeout(() => elements.pdfPreviewContainer.classList.add("show"), 100);
      elements.submitButton.style.display = "block";
    }
    elements.progressBar.style.width = elements.progressBar.textContent = `${progress}%`;
    elements.progressBar.setAttribute("aria-valuenow", progress);
    progress += 2;
  }, 50);
};

// CSRF token helper
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))?.split('=')[1];
  return cookieValue || '';
};

const loadChatbotData = () => {
  $.ajax({
    url: "/sysAdmin/config/manage_data/",
    method: "GET",
    success: function (response) {
      if (response.status === "success") {
        elements.tableBody.innerHTML = ""; // Clear existing rows
        response.data.forEach((data) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${truncateText(data.name)}</td>
            <td>${new Date().toISOString().split("T")[0]}</td>
            <td>User</td> <!-- Replace with actual admin name if available -->
            <td>System Admin</td> <!-- Replace with actual role if needed -->
            <td>
              ${data.link ? `<a href="${data.link}" target="_blank">${truncateText(data.link)}</a><br>` : ""}
              ${data.attachment ? `<a href="${data.attachment}" target="_blank">Download</a>` : ""}
            </td>
            <td>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${data.data_id}">Delete</button>
            </td>
          `;
          elements.tableBody.appendChild(row);
        });
        updateDataPagination(); // Recalculate pagination after data loads
      }
    },
    error: function (xhr) {
      console.error("Failed to load chatbot data:", xhr.responseText);
      Swal.fire("Error", "Could not load data.", "error");
    },
  });
};

// Real AJAX call
const submitChatbotData = () => {
  const name = elements.dataNameInput.value.trim();
  const link = elements.dataLinkInput.value.trim();
  const attachment = elements.fileInput.files[0];

  if (!name) return Swal.fire("Warning", "Please enter Data Name.", "warning");
  if (!link && !attachment) return Swal.fire("Warning", "Provide a Data Link or PDF file.", "warning");

  const formData = new FormData();
  formData.append("name", name);
  if (link) formData.append("link", link);
  if (attachment) formData.append("attachment", attachment);

  $.ajax({
    url: "/sysAdmin/config/manage_data/",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    headers: { "X-CSRFToken": getCSRFToken() },
    beforeSend: () => {
      elements.submitButton.disabled = true;
      elements.submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Uploading...`;
    },
    success: function (res) {
      Swal.fire("Success!", "Data successfully added!", "success").then(() => {
        resetUI();
        document.querySelectorAll("input").forEach(input => input.value = "");
        elements.submitButton.style.display = "none";
        bootstrap.Modal.getInstance(elements.chatbotModal)?.hide();
        loadChatbotData();
        updateDataPagination();
      });
    },
    error: function (xhr) {
      console.error("Upload failed:", xhr.responseText);
      Swal.fire("Error", "Something went wrong while uploading.", "error");
    },
    complete: () => {
      elements.submitButton.disabled = false;
      elements.submitButton.innerHTML = "Submit";
    }
  });
};



// Table delete button
elements.tableBody.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      e.target.closest("tr").remove();
      Swal.fire("Deleted!", "The record has been removed.", "success");
      updateDataPagination();
    }
  });
});


const updateDataPagination = () => {
  const rows = document.querySelectorAll("#chatbotDataTable tbody tr"); // or a more specific selector
  const totalPages = Math.max(1, Math.ceil(rows.length / maxRows));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  rows.forEach((row, index) => {
    row.style.display = (index >= (currentPage - 1) * maxRows && index < currentPage * maxRows) ? "" : "none";
  });

  const container = elements.paginationControlsData;
  if (!container) return console.warn("paginationControlsData not found");
  
  container.innerHTML = `
    <button class="btn btn-sm btn-outline-primary ${currentPage === 1 ? "disabled" : ""}" id="prevDataPage">Previous</button>
    <span class="px-2 fw-bold">Page ${currentPage} of ${totalPages}</span>
    <button class="btn btn-sm btn-outline-primary ${currentPage === totalPages ? "disabled" : ""}" id="nextDataPage">Next</button>
  `;

  document.getElementById("prevDataPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateDataPagination();
    }
  });

  document.getElementById("nextDataPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateDataPagination();
    }
  });
};

const updateOptionsPagination = () => {
  const rows = document.querySelectorAll("#chatbotOptionTableBody tr");
  const totalPages = Math.max(1, Math.ceil(rows.length / maxRows));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  rows.forEach((row, index) => {
    row.style.display = (index >= (currentPage - 1) * maxRows && index < currentPage * maxRows) ? "" : "none";
  });

  const container = elements.paginationControlsOptions;
  if (!container) return console.warn("paginationControlsOptions not found");

  container.innerHTML = `
    <button class="btn btn-sm btn-outline-primary ${currentPage === 1 ? "disabled" : ""}" id="prevOptionsPage">Previous</button>
    <span class="px-2 fw-bold">Page ${currentPage} of ${totalPages}</span>
    <button class="btn btn-sm btn-outline-primary ${currentPage === totalPages ? "disabled" : ""}" id="nextOptionsPage">Next</button>
  `;

  document.getElementById("prevOptionsPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateOptionsPagination();
    }
  });

  document.getElementById("nextOptionsPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateOptionsPagination();
    }
  });
};

// Init
$(document).ready(function () {
  loadChatbotData();       // Loads chatbot data table
  loadChatbotOptions();    // Loads chatbot labels table
});

elements.fileInput.addEventListener("change", handleFileSelection);
elements.submitButton.onclick = submitChatbotData;

// Delete button handler
elements.tableBody.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const dataId = e.target.getAttribute("data-id");

  Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Send DELETE request
      $.ajax({
        url: `/sysAdmin/config/delete_data/?data_id=${dataId}`, // API URL with the specific data_id
        type: "DELETE",
        headers: { "X-CSRFToken": getCSRFToken() },
        success: function (res) {
          Swal.fire("Deleted!", "The record has been removed.", "success");

          // Remove the row from the table
          e.target.closest("tr").remove();
          updatePagination(); // Update pagination after deletion
        },
        error: function (xhr) {
          console.error("Delete failed:", xhr.responseText);
          Swal.fire("Error", "Something went wrong while deleting.", "error");
        }
      });
    }
  });
});


function loadChatbotOptions() {
  $.ajax({
    url: "/sysAdmin/config/manage_labels/",
    type: "GET",
    success: function (res) {
      const $tbody = $("#chatbotOptionTableBody");
      $tbody.empty();

      if (res.status === "success" && res.data.length > 0) {
        res.data.forEach(label => {
          const row = `
            <tr>
              <td>${label.label_name}</td>
              <td>
                <!-- Optionally add Edit/Delete buttons -->
                <button class="btn btn-danger btn-sm delete-label-btn" data-label_id="${label.label_id}">Delete</button>
              </td>
            </tr>
          `;
          $tbody.append(row);
        });
        $("#noDataRowOption").hide();
        updateOptionsPagination();
      } else {
        $("#noDataRowOption").show();
      }
    },
    error: function (xhr) {
      console.error("Error loading chatbot options:", xhr.responseText);
      Swal.fire("Error", "Failed to fetch chatbot labels.", "error");
    }
  });
}

// Submit new chatbot label
function submitChatbotOption() {
  const labelName = $("#OptionName").val().trim();
  if (!labelName) {
    return Swal.fire("Warning", "Please enter a Chatbot Label Name.", "warning");
  }

  $.ajax({
    url: "/sysAdmin/config/manage_labels/",
    type: "POST",
    headers: {
      "X-CSRFToken": getCSRFToken()
    },
    contentType: "application/json",
    data: JSON.stringify({ label_name: labelName }),
    success: function (res) {
      Swal.fire("Success", res.message, "success").then(() => {
        $("#OptionName").val("");
        $("#chatbotOptionsModal").modal("hide");
        loadChatbotOptions(); // Refresh 
        updateOptionsPagination();
      });
    },
    error: function (xhr) {
      console.error("Error saving chatbot label:", xhr.responseText);
      Swal.fire("Error", "Failed to save chatbot label.", "error");
    }
  });
}


$(document).ready(function () {
  const $labelTable = $("#chatbotOptionTableBody");

  $labelTable.on("click", ".delete-label-btn", function () {
    const labelId = $(this).data("label_id");
    if (!labelId) return;

    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: `/sysAdmin/config/delete_labels/?label_id=${labelId}`,
          type: "DELETE",
          headers: {
            "X-CSRFToken": getCSRFToken()
          },
          success: function () {
            Swal.fire("Deleted!", "Label has been removed.", "success");
            loadChatbotOptions(); // Refresh table
          },
          error: function (xhr) {
            Swal.fire("Error", "Something went wrong while deleting.", "error");
          }
        });
      }
    });
  });
});
