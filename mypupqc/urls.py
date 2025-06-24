from django.urls import include, path
from mypupqc.controller import *
import mypupqc.urls

urlpatterns = [
    path('', include('mypupqc.urls')),
]