from django.urls import path
from mypupqc.views import SchedulerAuthView, UsersView
from mypupqc.controller import *


urlpatterns = [
    path(
        "Homepage/",
        SchedulerAuthView.as_view(template_name="sysClient/Student/sysStudent_Homepage.html"),
        name="sys-student-Homepage",
    ),
    path(
        "Student-Guide/",
        UsersView.as_view(template_name="sysClient/Student/sysStudent_StudentGuide.html"),
        name="sys-student-StudentGuide",
    ),
    path(
        "Student-Tracker/",
        UsersView.as_view(template_name="sysClient/Student/Backpack/sysStudent_Assignment-Tracker.html"),
        name="sys-student-StudentTracker",
    ),
    path(
        "Student-Tracker/",
        UsersView.as_view(template_name="sysClient/Student/Backpack/sysStudent_Assignment-Tracker.html"),
        name="sys-student-StudentTracker",
    ),
    path(
        "Chat/",
        UsersView.as_view(template_name="sysClient/Student/Backpack/ChatGroup/sysStudent_Chat.html"),
        name="sys-student-StudentChat",
    ),
    path(
        "Student-ChatGroup/",
        UsersView.as_view(template_name="sysClient/Student/Backpack/sysStudent_ChatGroup-Community.html"),
        name="sys-student-StudentChatGroup",
    ),


    # Student Profile Paths
    path(
        "Profile/",
        UsersView.as_view(template_name="sysClient/Student/Settings/sysStudent_Profile.html"),
        name="sysStudent-Profile-Page",
    ),
    path(
        "Security/",
        UsersView.as_view(template_name="sysClient/Student/Settings/sysStudent_Security.html"),
        name="sysStudent-Security-Page",
    ),
]

# Ano ang Chika and Calendar
urlpatterns += [
    path(
        "getChikas/",
        HomePageController.getChikas,
        name="student.getChikas",
    ),
    path(
        "getCalendarEvents/",
        HomePageController.getCalendarEvents,
        name="student.getCalendarEvents",
    ),
]

# Posting
urlpatterns += [
    path(
        "post/",
        StudentController.createPost,
        name="student.post",
    ),
    path(
        "getPosts/",
        HomePageController.getPosts,
        name="student.getPosts",
    ),
]

# Student Profile
urlpatterns += [
    path(
        "getStudentProfile/",
        StudentController.getStudentProfile,
        name="student.getStudentProfile",
    ),
    path(
        "changeUserPassword/",
        AuthController.changeUserPassword,
        name="student.changeUserPassword",
    ),
]
