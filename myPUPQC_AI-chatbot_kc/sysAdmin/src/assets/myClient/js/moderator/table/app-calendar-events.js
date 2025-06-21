/**
 * App Calendar Events
 */
'use strict';
let date = new Date();
let nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

let events = [
  {
    id: 1,
    title: 'Design Review',
    start: date,
    end: nextDay,
    url: ''
  },
  {
    id: 2,
    title: 'Meeting With Client',
    start: new Date(date.getFullYear(), date.getMonth() + 1, -11),
    end: new Date(date.getFullYear(), date.getMonth() + 1, -10),
    url: ''
  },
  {
    id: 3,
    title: 'Family Trip',
    start: new Date(date.getFullYear(), date.getMonth() + 1, -9),
    end: new Date(date.getFullYear(), date.getMonth() + 1, -7),
    url: ''
  },
  {
    id: 4,
    title: "Doctor's Appointment",
    start: new Date(date.getFullYear(), date.getMonth() + 1, -11),
    end: new Date(date.getFullYear(), date.getMonth() + 1, -10),
    url: ''
  },
  {
    id: 5,
    title: 'Dart Game?',
    start: new Date(date.getFullYear(), date.getMonth() + 1, -13),
    end: new Date(date.getFullYear(), date.getMonth() + 1, -12),
    url: ''
  }
];
