from django.urls import include, path
from mypupqc.controller import *

urlpatterns = [
    path('sysAdmin/', include('mypupqc.urls.AdminUrls')),
    path('student/', include('mypupqc.urls.StudentUrls')),
    path('faculty/', include('mypupqc.urls.FacultyUrls')),
    path('alumni/', include('mypupqc.urls.AlumniUrls')),
    path('api/', include('mypupqc.urls.APIUrls')),
    path('', include('mypupqc.urls.GuestUrls')),
]

urlpatterns += [
    path(
        "forgotPasswordRequest/",
        AuthController.forgotPasswordRequest, 
        name="forgotPasswordRequest"
    ),
    path(
        "batchForgotPasswordRequest/", 
        AuthController.batchForgotPasswordRequest, 
        name="batchForgotPasswordRequest"
    ),
    path(
        "forgotPassword/<uidb64>/<token>/", 
        AuthController.forgotPassword, 
        name="forgotPassword"
    ),
    path(
        "changeUserPassword/", 
        AuthController.changeUserPassword, 
        name="changeUserPassword"
    ),
]