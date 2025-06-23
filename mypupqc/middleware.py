from django.shortcuts import redirect
from django.conf import settings
from mypupqc.helper import *

import re


class AuthenticationMiddleware:
    """
    Middleware to restrict access for unauthenticated users.
    """

    def authenticateAdminUrls(self, request):
        excluded_paths = [
                "/sysAdmin/authentication/ForgotPassword/",
                "/sysAdmin/authentication/Login/LoginSysAdmin/",
                settings.SYSTEM_ADMIN_LOGIN_URL,
            ]

        included_patterns = [
            r'^/sysAdmin/.+$',  # Matches /sysAdmin/[anything]/
        ]

        if request.path in excluded_paths:
            return self.get_response(request)
        
        if any(re.match(pattern, request.path) for pattern in included_patterns):
            if not request.user.is_authenticated:
                return redirect(settings.SYSTEM_ADMIN_LOGIN_URL)
            return self.get_response(request)
        
    
    def authenticateStudentUrls(self, request):
        excluded_paths = [

        ]

        included_patterns = [
            r'^/student/.+$',  # Matches /student/[anything]/
        ]

        if request.path in excluded_paths:
            return self.get_response(request)
        
        if any(re.match(pattern, request.path) for pattern in included_patterns):
            if not request.user.is_authenticated:
                return redirect(settings.STUDENT_LOGIN_URL)
            return self.get_response(request)
    
    
    def authenticateFacultyUrls(self, request):
        excluded_paths = [

        ]

        included_patterns = [
            r'^/faculty/.+$',  # Matches /faculty/[anything]/
        ]

        if request.path in excluded_paths:
            return self.get_response(request)
        
        if any(re.match(pattern, request.path) for pattern in included_patterns):
            if not request.user.is_authenticated:
                return redirect(settings.FACULTY_LOGIN_URL)
            return self.get_response(request)
    
    
    def authenticateAlumniUrls(self, request):
        excluded_paths = [

        ]

        included_patterns = [
            r'^/alumni/.+$',  # Matches /alumni/[anything]/
        ]

        if request.path in excluded_paths:
            return self.get_response(request)
        
        if any(re.match(pattern, request.path) for pattern in included_patterns):
            if not request.user.is_authenticated:
                return redirect(settings.ALUMNI_LOGIN_URL)
            return self.get_response(request)
            

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        role = request.path.split('/')[1]
        
        if role == 'sysAdmin':
            return self.authenticateAdminUrls(request)
        
        if role == 'student':
            return self.authenticateStudentUrls(request)
        
        if role == 'faculty':
            return self.authenticateFacultyUrls(request)
        
        if role == 'alumni':
            return self.authenticateAlumniUrls(request)
        
        # Just return the response since only the above roles are needed of authentication
        return self.get_response(request)


class AuthenticatedMiddleware:
    """
    Middleware to automatically redirect authenticated users
    to their respective home pages.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.included_paths = [settings.SYSTEM_ADMIN_LOGIN_URL]

    def __call__(self, request):
        # Check if user is authenticated
        if request.user.is_authenticated and request.path in self.included_paths:
            # Redirect to admin dashboaard if user is an admin
            print(True)
            return redirect('/sysAdmin/Admin/Homepage/')
        else:
            return self.get_response(request)