from django.urls import path
from mypupqc.views import SchedulerAuthView, UsersView
from mypupqc.controller import *


urlpatterns = [
    path(
        "Homepage/",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/sysFaculty_Homepage.html"),
        name="sys-faculty-Homepage",
    ),

    # Faculty Profile Paths
    path(
        "Profile/",
        UsersView.as_view(template_name="sysClient/Faculty/Settings/sysFaculty_Profile.html"),
        name="sysFaculty-Profile-Page",
    ),
    path(
        "Security/",
        UsersView.as_view(template_name="sysClient/Faculty/Settings/sysFaculty_Security.html"),
        name="sysFaculty-Security-Page",
    ),

    # Moderator Paths
    path(
        "Moderator/Post-Management",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MPost-Management.html"),
        name="sys-moderator-PostManagement",
    ),
    path(
        "Moderator/Calendar-Management",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MCalendar.html"),
        name="sys-moderator-CalendarManagement",
    ),
    path(
        "Moderator/Anoang-Chika",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MAnoangChika.html"),
        name="sys-moderator-AnoangChika",
    ),
    path(
        "Moderator/Audit-Log",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MAudit-Log.html"),
        name="sys-moderator-AuditLog",
    ),
]


# Ano ang Chika and Calendar
urlpatterns += [
    path(
        "getChikas/",
        HomePageController.getChikas,
        name="faculty.getChikas",
    ),
    path(
        "getCalendarEvents/",
        HomePageController.getCalendarEvents,
        name="faculty.getCalendarEvents",
    ),
]

# Posting
urlpatterns += [
    path(
        "post/",
        FacultyController.createPost,
        name="faculty.post",
    ),
    path(
        "getPosts/",
        HomePageController.getPosts,
        name="faculty.getPosts",
    ),
]

# Faculty Profile
urlpatterns += [
    path(
        "getFacultyProfile/",
        FacultyController.getFacultyProfile,
        name="faculty.getFacultyProfile",
    ),
    path(
        "changeUserPassword/",
        AuthController.changeUserPassword,
        name="faculty.changeUserPassword",
    ),
]

# Moderator - Posts
urlpatterns += [
    path(
        "getPendingPosts/",
        FacultyController.getPendingPosts,
        name="faculty.getPendingPosts",
    ),
    path(
        "getApprovedPosts/",
        FacultyController.getApprovedPosts,
        name="faculty.getApprovedPosts",
    ),
    path(
        "getRejectedPosts/",
        FacultyController.getRejectedPosts,
        name="faculty.getRejectedPosts",
    ),
    path(
        "getFlaggedPosts/",
        FacultyController.getFlaggedPosts,
        name="faculty.getFlaggedPosts",
    ),
    path(
        "getFlagDetails/",
        FacultyController.getFlagDetails,
        name="faculty.getFlagDetails",
    ),
    path(
        "editFlag/",
        FacultyController.editFlag,
        name="faculty.editFlag",
    ),
    path(
        "moderatePost/",
        FacultyController.moderatePost,
        name="faculty.moderatePost",
    ),
]

# Moderator - Chikas
urlpatterns += [
    path(
        "getChikasModerator/",
        FacultyController.getChikasModerator,
        name="faculty.getChikasModerator",
    ),
    path(
        "addChika/",
        FacultyController.addChika,
        name="faculty.addChika",
    ),
    path(
        "editChika/",
        FacultyController.editChika,
        name="faculty.editChika",
    ),
    path(
        "deleteChika/",
        FacultyController.deleteChika,
        name="faculty.deleteChika",
    ),
    path(
        "getActivityLogs/",
        FacultyController.getActivityLogs,
        name="faculty.getActivityLogs",
    ),
    path(
        "getCalendarEventsModerator/",
        FacultyController.getCalendarEventsModerator,
        name="faculty.getCalendarEventsModerator",
    ),
    path(
        "addCalendarEvent/",
        FacultyController.addCalendarEvent,
        name="faculty.addCalendarEvent",
    ),
]