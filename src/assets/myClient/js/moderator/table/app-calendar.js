/**
 * App Calendar
 */
'use strict';

let direction = 'ltr';
if (isRtl) {
  direction = 'rtl';
}

document.addEventListener('DOMContentLoaded', function () {
  (function () {
    const calendarEl = document.getElementById('calendar'),
          appCalendarSidebar = document.querySelector('.app-calendar-sidebar'),
          addEventSidebar = document.getElementById('addEventSidebar'),
          appOverlay = document.querySelector('.app-overlay'),
          offcanvasTitle = document.querySelector('.offcanvas-title'),
          btnToggleSidebar = document.querySelector('.btn-toggle-sidebar'),
          btnSubmit = document.querySelector('button[type="submit"]'),
          btnDeleteEvent = document.querySelector('.btn-delete-event'),
          btnCancel = document.querySelector('.btn-cancel'),
          eventTitle = document.querySelector('#eventTitle'),
          eventStartDate = document.querySelector('#eventStartDate'),
          eventEndDate = document.querySelector('#eventEndDate'),
          eventUrl = document.querySelector('#eventURL'),
          inlineCalendar = document.querySelector('.inline-calendar');

    let eventToUpdate,
        currentEvents = events, // events from app-calendar-events.js
        inlineCalInstance;

    // Initialize offcanvas
    const bsAddEventSidebar = new bootstrap.Offcanvas(addEventSidebar);

    // Initialize flatpickr on date fields
    let start = eventStartDate.flatpickr({
      enableTime: true,
      altFormat: 'Y-m-dTH:i:S'
    });
    let end = eventEndDate.flatpickr({
      enableTime: true,
      altFormat: 'Y-m-dTH:i:S'
    });

    // Inline calendar initialization
    if (inlineCalendar) {
      inlineCalInstance = inlineCalendar.flatpickr({
        monthSelectorType: 'static',
        inline: true
      });
    }

    // Validation function for event form
    function validateEventForm() {
      let isValid = true;
      // Remove previous invalid styling
      eventTitle.classList.remove('is-invalid');
      eventStartDate.classList.remove('is-invalid');
      eventEndDate.classList.remove('is-invalid');
      eventUrl.classList.remove('is-invalid');

      const title = eventTitle.value.trim();
      const startDate = eventStartDate.value.trim();
      const endDate = eventEndDate.value.trim();
      const url = eventUrl.value.trim();

      if (!title) {
        isValid = false;
        eventTitle.classList.add('is-invalid');
      }
      if (!startDate) {
        isValid = false;
        eventStartDate.classList.add('is-invalid');
      }
      if (!endDate) {
        isValid = false;
        eventEndDate.classList.add('is-invalid');
      }
      if (url) {
        try {
          new URL(url);
        } catch (e) {
          isValid = false;
          eventUrl.classList.add('is-invalid');
        }
      }
      if (!isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill in all required fields correctly.'
        });
      }
      return isValid;
    }

    // Function to handle event click for updating
    function eventClick(info) {
      eventToUpdate = info.event;
      if (eventToUpdate.url) {
        info.jsEvent.preventDefault();
        window.open(eventToUpdate.url, '_blank');
      }
      bsAddEventSidebar.show();
      offcanvasTitle.innerHTML = 'Update Event';
      btnSubmit.innerHTML = 'Update';
      btnSubmit.classList.add('btn-update-event');
      btnSubmit.classList.remove('btn-add-event');
      btnDeleteEvent.classList.remove('d-none');

      eventTitle.value = eventToUpdate.title;
      start.setDate(eventToUpdate.start, true, 'Y-m-d');
      if (eventToUpdate.end) {
        end.setDate(eventToUpdate.end, true, 'Y-m-d');
      } else {
        end.setDate(eventToUpdate.start, true, 'Y-m-d');
      }
      eventUrl.value = eventToUpdate.url ? eventToUpdate.url : '';
    }

    // Modify sidebar toggler if necessary
    function modifyToggler() {
      const fcSidebarToggleButton = document.querySelector('.fc-sidebarToggle-button');
      if (fcSidebarToggleButton) {
        fcSidebarToggleButton.classList.remove('fc-button-primary');
        fcSidebarToggleButton.classList.add('d-lg-none', 'd-inline-block', 'ps-0');
        while (fcSidebarToggleButton.firstChild) {
          fcSidebarToggleButton.firstChild.remove();
        }
        fcSidebarToggleButton.setAttribute('data-bs-toggle', 'sidebar');
        fcSidebarToggleButton.setAttribute('data-overlay', '');
        fcSidebarToggleButton.setAttribute('data-target', '#app-calendar-sidebar');
        fcSidebarToggleButton.insertAdjacentHTML('beforeend', '<i class="mdi mdi-menu mdi-24px text-body"></i>');
      }
    }

    // Fetch all events (no filtering)
    function fetchEvents(info, successCallback) {
      successCallback(currentEvents);
    }

    // Initialize FullCalendar with forced info color for events
    let calendar = new Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: fetchEvents,
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
      // Force all events to display with the info color
      eventClassNames: function () {
        return ['fc-event-info'];
      },
      eventClick: function (info) {
        eventClick(info);
      },
      dateClick: function (info) {
        let date = moment(info.date).format('YYYY-MM-DD');
        resetValues();
        bsAddEventSidebar.show();
        offcanvasTitle.innerHTML = 'Add Event';
        btnSubmit.innerHTML = 'Add';
        btnSubmit.classList.remove('btn-update-event');
        btnSubmit.classList.add('btn-add-event');
        btnDeleteEvent.classList.add('d-none');
        eventStartDate.value = date;
        eventEndDate.value = date;
      },
      datesSet: function () {
        modifyToggler();
      },
      viewDidMount: function () {
        modifyToggler();
      }
    });

    // Render the calendar
    calendar.render();
    modifyToggler();

    // Function to add a new event and immediately refetch events
    function addEvent(eventData) {
      currentEvents.push(eventData);
      calendar.refetchEvents();
    }

    // Function to update an event
    function updateEvent(eventData) {
      eventData.id = parseInt(eventData.id);
      currentEvents[currentEvents.findIndex(el => el.id === eventData.id)] = eventData;
      calendar.refetchEvents();
    }

    // Function to remove an event
    function removeEvent(eventId) {
      currentEvents = currentEvents.filter(function (event) {
        return event.id != eventId;
      });
      calendar.refetchEvents();
    }

    // Handle Add/Update event on form submit
    btnSubmit.addEventListener('click', e => {
      if (!validateEventForm()) {
        return;
      }

      if (btnSubmit.classList.contains('btn-add-event')) {
        let newEvent = {
          id: calendar.getEvents().length + 1,
          title: eventTitle.value,
          start: eventStartDate.value,
          end: eventEndDate.value,
          display: 'block',
          url: eventUrl.value ? eventUrl.value : undefined
        };
        addEvent(newEvent);
        bsAddEventSidebar.hide();
        Swal.fire({
          icon: 'success',
          title: 'Event Added',
          text: 'Your event has been added successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        let eventData = {
          id: eventToUpdate.id,
          title: eventTitle.value,
          start: eventStartDate.value,
          end: eventEndDate.value,
          url: eventUrl.value,
          display: 'block'
        };
        updateEvent(eventData);
        bsAddEventSidebar.hide();
        Swal.fire({
          icon: 'success',
          title: 'Event Updated',
          text: 'Your event has been updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });

    // Handle event deletion
    btnDeleteEvent.addEventListener('click', e => {
      removeEvent(parseInt(eventToUpdate.id));
      bsAddEventSidebar.hide();
      Swal.fire({
        icon: 'success',
        title: 'Event Deleted',
        text: 'Your event has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    });

    // Reset form values and clear invalid states
    function resetValues() {
      eventTitle.value = '';
      eventStartDate.value = '';
      eventEndDate.value = '';
      eventUrl.value = '';
      eventTitle.classList.remove('is-invalid');
      eventStartDate.classList.remove('is-invalid');
      eventEndDate.classList.remove('is-invalid');
      eventUrl.classList.remove('is-invalid');
    }

    // Reset form when offcanvas is hidden
    addEventSidebar.addEventListener('hidden.bs.offcanvas', function () {
      resetValues();
    });

    // Sidebar toggler handler
    btnToggleSidebar.addEventListener('click', e => {
      offcanvasTitle.innerHTML = 'Add Event';
      btnSubmit.innerHTML = 'Add';
      btnSubmit.classList.remove('btn-update-event');
      btnSubmit.classList.add('btn-add-event');
      btnDeleteEvent.classList.add('d-none');
      appCalendarSidebar.classList.remove('show');
      appOverlay.classList.remove('show');
    });

    // Jump to date on inline calendar change
    inlineCalInstance.config.onChange.push(function (date) {
      calendar.changeView(calendar.view.type, moment(date[0]).format('YYYY-MM-DD'));
      modifyToggler();
      appCalendarSidebar.classList.remove('show');
      appOverlay.classList.remove('show');
    });
  })();
});
