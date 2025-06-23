from django.urls import path
from mypupqc.views import SchedulerAuthView, UsersView
from mypupqc.controller import *


urlpatterns = [
    path(
        "guest/",
        UsersView.as_view(template_name="sysClient/Guestt/sysGuest_Homepage.html"),
        name="guestHome",
    ),
    path(
        "authentication/ChangePassword/",
        SchedulerAuthView.as_view(template_name="sysClient/authentication/sysClient_change-password.html"),
        name="clientChangePassword",
    ),
    path(
        "ping/",
        GuestController.ping,
        name="ping",
    )
]

# Contents
urlpatterns += [
    path(
        "guest/getSlideshows/",
        GuestController.getSlideshows,
        name="guest.getSlideshows",
    ),
    path(
        "guest/getArticles/",
        GuestController.getArticles,
        name="guest.getArticles",
    ),
    path(
        "guest/getFAQs/",
        GuestController.getFAQs,
        name="guest.getFAQs",
    ),
    path(
        "guest/getHowToLinks/",
        GuestController.getHowToLinks,
        name="guest.getHowToLinks",
    ),
]

# Authentication
urlpatterns += [
    path(
        "guest/authentication/Login/",
        AuthController.authenticateUser,
        name="guest.authenticateUser",
    ),
    path(
        "logout/guestHome/",
        AuthController.logoutHomePage,
        name="g.logout"
    )
]