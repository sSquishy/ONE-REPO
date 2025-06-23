from django.urls import path
from mypupqc.views import SchedulerAuthView, UsersView
from mypupqc.controller import *


urlpatterns = [
    path(
        "Homepage/",
        SchedulerAuthView.as_view(template_name="sysClient/Alumni/sysAlumni_Homepage.html"),
        name="sys-alumni-Homepage",
    ),

    # Alumni Profile Paths
    path(
        "Profile/",
        UsersView.as_view(template_name="sysClient/Alumni/Settings/sysAlumni_Profile.html"),
        name="sysAlumni-Profile-Page",
    ),
    path(
        "Security/",
        UsersView.as_view(template_name="sysClient/Alumni/Settings/sysAlumni_Security.html"),
        name="sysAlumni-Security-Page",
    ),
]

# Ano ang Chika and Calendar
urlpatterns += [
    path(
        "getChikas/",
        HomePageController.getChikas,
        name="alumni.getChikas",
    ),
    path(
        "getCalendarEvents/",
        HomePageController.getCalendarEvents,
        name="alumni.getCalendarEvents",
    ),
]

# Posting
urlpatterns += [
    path(
        "post/",
        AlumniController.createPost,
        name="alumni.post",
    ),
    path(
        "getPosts/",
        HomePageController.getPosts,
        name="alumni.getPosts",
    ),
]

# Alumni Profile
urlpatterns += [
    path(
        "getAlumniProfile/",
        AlumniController.getAlumniProfile,
        name="alumni.getAlumniProfile",
    ),
    path(
        "changeUserPassword/",
        AuthController.changeUserPassword,
        name="alumni.changeUserPassword",
    ),
]