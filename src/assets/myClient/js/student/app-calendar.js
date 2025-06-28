'use strict';

let direction = 'ltr';
if (isRtl) {
  direction = 'rtl';
}

document.addEventListener('DOMContentLoaded', function () {
  (function () {
    // --- File Preview Initialization ---
    const fileInput          = document.getElementById('offcanvas-attachments'),
          previewContainer   = document.getElementById('offcanvas-post-upload-preview'),
          previewImage       = document.getElementById('offcanvas-post-uploaded-preview'),
          previewFilename    = document.getElementById('offcanvas-post-uploaded-filename'),
          previewSize        = document.getElementById('offcanvas-post-uploaded-size'),
          previewPercentage  = document.getElementById('offcanvas-post-upload-percentage'),
          progressBar        = document.querySelector('.upload-progress-bar'),
          removeBtn          = document.getElementById('offcanvas-post-remove-upload');

    if (fileInput) {
      fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
          // Show preview container
          previewContainer.style.display = 'block';
          // Update filename and size
          previewFilename.textContent = file.name;
          previewSize.textContent     = (file.size / 1024).toFixed(2) + ' KB';
          // Read file as Data URL
          const reader = new FileReader();
          reader.onload = function (event) {
            previewImage.src = event.target.result;
            // Simulate upload progress (replace with real upload logic as needed)
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              previewPercentage.textContent = progress + '%';
              progressBar.style.width      = progress + '%';
              if (progress >= 100) {
                clearInterval(interval);
              }
            }, 100);
          };
          reader.readAsDataURL(file);
        }
      });

      removeBtn.addEventListener('click', function () {
        // Clear the file input
        fileInput.value = '';
        // Hide preview container
        previewContainer.style.display = 'none';
        // Reset progress bar and percentage
        progressBar.style.width = '0%';
        previewPercentage.textContent = '0%';
      });
    }
    // --- End File Preview ---

    const calendarEl = document.getElementById('calendar'),
      appCalendarSidebar = document.querySelector('.app-calendar-sidebar'),
      addEventSidebar = document.getElementById('addEventSidebar'),
      appOverlay = document.querySelector('.app-overlay'),
      offcanvasTitle = document.querySelector('.offcanvas-title'),
      btnToggleSidebar = document.querySelector('.btn-toggle-sidebar'),
      btnSubmit = document.querySelector('#addEventBtn'),
      btnDeleteEvent = document.querySelector('.btn-delete-event'),
      btnCancel = document.querySelector('.btn-cancel'),
      eventTitle = document.querySelector('#eventTitle'),
      eventStartDate = document.querySelector('#eventStartDate'),
      eventEndDate = document.querySelector('#eventEndDate'),
      // Updated select for event label with new id
      calendarEventLabel = $('#calendarEventLabel'),
      eventDescription = document.querySelector('#eventDescription'),
      inlineCalendar = document.querySelector('.inline-calendar');

    // Colors used for events based on label value
    const calendarsColor = {
      Business: 'primary',
      Holiday: 'success',
      Personal: 'danger',
      Family: 'warning',
      ETC: 'info'
    };

    // Force calendar container to full width
    calendarEl.style.width = '100%';

    // “events” array is assumed to come from your data/app-calendar-events.js, etc.
    let eventToUpdate,
      currentEvents = events || [],
      isFormValid = false,
      inlineCalInstance;

    // Offcanvas init
    const bsAddEventSidebar = new bootstrap.Offcanvas(addEventSidebar);

    // ----
    // 1) Setup Select2 for Calendar Event Label with new id
    // ----
    function renderBadges(option) {
      if (!option.id) {
        return option.text;
      }
      const colorClass = option.element ? option.element.dataset.label : 'primary';
      const badge =
        "<span class='badge badge-dot bg-" +
        colorClass +
        " me-2'></span>" +
        "<span style='color: black;'>" +
        option.text +
        '</span>';
      return $(badge);
    }

    if (calendarEventLabel.length) {
      select2Focus(calendarEventLabel);
      calendarEventLabel
        .wrap('<div class="position-relative"></div>')
        .select2({
          placeholder: 'Select value',
          dropdownParent: calendarEventLabel.parent(),
          templateResult: renderBadges,
          templateSelection: renderBadges,
          minimumResultsForSearch: -1,
          escapeMarkup: function (markup) {
            return markup;
          }
        });
    }

    // ----
    // 2) Flatpickr for Start & End
    // ----
    let startPicker, endPicker;
    if (eventStartDate) {
      startPicker = eventStartDate.flatpickr({
        enableTime: true,
        altFormat: 'Y-m-dTH:i:S',
        onReady: function (selectedDates, dateStr, instance) {
          if (instance.isMobile) {
            instance.mobileInput.setAttribute('step', null);
          }
        }
      });
    }
    if (eventEndDate) {
      endPicker = eventEndDate.flatpickr({
        enableTime: true,
        altFormat: 'Y-m-dTH:i:S',
        onReady: function (selectedDates, dateStr, instance) {
          if (instance.isMobile) {
            instance.mobileInput.setAttribute('step', null);
          }
        }
      });
    }

    // 3) Inline Calendar (if used in sidebar)
    if (inlineCalendar) {
      inlineCalInstance = inlineCalendar.flatpickr({
        monthSelectorType: 'static',
        inline: true
      });
    }

    // ----
    // 4) FullCalendar Setup
    // ----
    const calendar = new Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin, listPlugin, timegridPlugin],
      editable: true,
      dragScroll: true,
      dayMaxEvents: 2,
      eventResizableFromStart: true,
      customButtons: {
        sidebarToggle: {
          text: 'Sidebar'
        }
      },
      headerToolbar: {
        start: 'sidebarToggle, prev,next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      direction: direction,
      initialDate: new Date(),
      navLinks: true,
      // Dynamically color events
      eventClassNames: function ({ event: calendarEvent }) {
        const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar] || 'primary';
        return ['fc-event-' + colorName];
      },

      // ----
      // Always return ALL events; no filters
      // ----
      events: function (info, successCallback) {
        successCallback(currentEvents);
      },

      dateClick: function (info) {
        // “Add” mode
        const date = moment(info.date).format('YYYY-MM-DD');
        resetValues();
        bsAddEventSidebar.show();

        if (offcanvasTitle) offcanvasTitle.innerHTML = 'Add Event';
        btnSubmit.innerHTML = 'Add';
        btnSubmit.classList.remove('btn-update-event');
        btnSubmit.classList.add('btn-add-event');
        btnDeleteEvent.classList.add('d-none');

        // Set default start/end
        eventStartDate.value = date;
        eventEndDate.value = date;
      },
      eventClick: function (info) {
        // “Edit/Update” mode
        eventToUpdate = info.event;
        if (eventToUpdate.url) {
          info.jsEvent.preventDefault();
          window.open(eventToUpdate.url, '_blank');
        }
        bsAddEventSidebar.show();

        if (offcanvasTitle) offcanvasTitle.innerHTML = 'Update Event';
        btnSubmit.innerHTML = 'Update';
        btnSubmit.classList.add('btn-update-event');
        btnSubmit.classList.remove('btn-add-event');
        btnDeleteEvent.classList.remove('d-none');

        // Populate form fields
        eventTitle.value = eventToUpdate.title;
        startPicker.setDate(eventToUpdate.start, true, 'Y-m-d');
        if (eventToUpdate.end !== null) {
          endPicker.setDate(eventToUpdate.end, true, 'Y-m-d');
        } else {
          endPicker.setDate(eventToUpdate.start, true, 'Y-m-d');
        }
        // Update select2 for label with new id
        calendarEventLabel.val(eventToUpdate.extendedProps.calendar).trigger('change');
        eventDescription.value = eventToUpdate.extendedProps.description || '';
      },
      datesSet: function () {
        modifyToggler();
      },
      viewDidMount: function () {
        modifyToggler();
      }
    });
    calendar.render();

    // Keep calendar responsive on resize
    window.addEventListener('resize', function () {
      calendar.updateSize();
    });

    // ----
    // 5) Tweak the built-in FullCalendar toggler
    // ----
    function modifyToggler() {
      const fcSidebarToggleButton = document.querySelector('.fc-sidebarToggle-button'),
        fcPrevButton = document.querySelector('.fc-prev-button'),
        fcNextButton = document.querySelector('.fc-next-button'),
        fcHeaderToolbar = document.querySelector('.fc-header-toolbar');

      if (fcPrevButton && fcNextButton) {
        fcPrevButton.classList.add('btn', 'btn-sm', 'btn-icon', 'btn-outline-secondary', 'me-2');
        fcNextButton.classList.add('btn', 'btn-sm', 'btn-icon', 'btn-outline-secondary', 'me-4');
      }
      if (fcHeaderToolbar) {
        fcHeaderToolbar.classList.add('row-gap-4', 'gap-2');
      }
      if (fcSidebarToggleButton) {
        fcSidebarToggleButton.classList.remove('fc-button-primary');
        fcSidebarToggleButton.classList.add('d-lg-none', 'd-inline-block', 'ps-0');
        while (fcSidebarToggleButton.firstChild) {
          fcSidebarToggleButton.firstChild.remove();
        }
        fcSidebarToggleButton.setAttribute('data-bs-toggle', 'sidebar');
        fcSidebarToggleButton.setAttribute('data-overlay', '');
        fcSidebarToggleButton.setAttribute('data-target', '#app-calendar-sidebar');
        fcSidebarToggleButton.insertAdjacentHTML('beforeend', '<i class="ri-menu-line ri-24px text-body"></i>');
      }
    }

    // ----
    // 6) Validation (same approach as your old code)
    // ----
    const eventForm = document.getElementById('eventForm');
    const fv = FormValidation.formValidation(eventForm, {
      fields: {
        eventTitle: {
          validators: {
            notEmpty: { message: 'Please enter event title' }
          }
        },
        eventStartDate: {
          validators: {
            notEmpty: { message: 'Please enter start date' }
          }
        },
        eventEndDate: {
          validators: {
            notEmpty: { message: 'Please enter end date' }
          }
        }
      },
      plugins: {
        trigger: new FormValidation.plugins.Trigger(),
        bootstrap5: new FormValidation.plugins.Bootstrap5({
          eleValidClass: '',
          rowSelector: () => '.mb-3'
        }),
        submitButton: new FormValidation.plugins.SubmitButton(),
        autoFocus: new FormValidation.plugins.AutoFocus()
      }
    })
      .on('core.form.valid', function () {
        isFormValid = true;
      })
      .on('core.form.invalid', function () {
        isFormValid = false;
      });

    if (btnToggleSidebar) {
      btnToggleSidebar.addEventListener('click', e => {
        btnCancel.classList.remove('d-none');
      });
    }

    // ----
    // 7) Add / Update / Remove – same structure as old code
    // ----
    function addEvent(eventData) {
      currentEvents.push(eventData);
      calendar.refetchEvents();
    }
    function updateEvent(eventData) {
      eventData.id = parseInt(eventData.id, 10);
      const idx = currentEvents.findIndex(el => el.id === eventData.id);
      if (idx !== -1) {
        currentEvents[idx] = eventData;
      }
      calendar.refetchEvents();
    }
    function removeEvent(eventId) {
      currentEvents = currentEvents.filter(evt => evt.id != eventId);
      calendar.refetchEvents();
    }

    // Reset form fields
    function resetValues() {
      eventEndDate.value = '';
      eventStartDate.value = '';
      eventTitle.value = '';
      eventDescription.value = '';
      // Default label to e.g. "Business"
      calendarEventLabel.val('Business').trigger('change');
    }

    // On offcanvas hide => reset
    addEventSidebar.addEventListener('hidden.bs.offcanvas', function () {
      resetValues();
    });

    // ----
    // 8) Save button – same logic from old code
    // ----
    btnSubmit.addEventListener('click', e => {
      // Only proceed if form is valid
      if (!isFormValid) return;

      // ADD
      if (btnSubmit.classList.contains('btn-add-event')) {
        const newEvent = {
          id: calendar.getEvents().length + 1, // simplistic ID
          title: eventTitle.value,
          start: eventStartDate.value,
          end: eventEndDate.value,
          startStr: eventStartDate.value,
          endStr: eventEndDate.value,
          display: 'block',
          extendedProps: {
            calendar: calendarEventLabel.val(),
            description: eventDescription.value
          }
        };
        addEvent(newEvent);
        bsAddEventSidebar.hide();
      }
      // UPDATE
      else {
        const updatedData = {
          id: eventToUpdate.id,
          title: eventTitle.value,
          start: eventStartDate.value,
          end: eventEndDate.value,
          display: 'block',
          extendedProps: {
            calendar: calendarEventLabel.val(),
            description: eventDescription.value
          }
        };
        updateEvent(updatedData);
        bsAddEventSidebar.hide();
      }
    });

    // ----
    // 9) Delete button
    // ----
    btnDeleteEvent.addEventListener('click', e => {
      removeEvent(parseInt(eventToUpdate.id, 10));
      bsAddEventSidebar.hide();
    });

    // ----
    // 10) Toggle sidebar – no filter logic
    // ----
    btnToggleSidebar.addEventListener('click', e => {
      if (offcanvasTitle) offcanvasTitle.innerHTML = 'Add Event';
      btnSubmit.innerHTML = 'Add';
      btnSubmit.classList.remove('btn-update-event');
      btnSubmit.classList.add('btn-add-event');
      btnDeleteEvent.classList.add('d-none');
      appCalendarSidebar.classList.remove('show');
      appOverlay.classList.remove('show');
    });

    // If using the inline calendar in the sidebar
    if (inlineCalInstance) {
      inlineCalInstance.config.onChange.push(function (date) {
        const pickedDate = moment(date[0]).format('YYYY-MM-DD');
        calendar.changeView(calendar.view.type, pickedDate);
        modifyToggler();
        appCalendarSidebar.classList.remove('show');
        appOverlay.classList.remove('show');
      });
    }
  })();
});
