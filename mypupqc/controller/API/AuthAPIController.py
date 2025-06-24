from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed, APIException
from mypupqc.models import *
from mypupqc.helper import *
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.contrib.auth import authenticate

from axes.helpers import get_client_username
from axes.handlers.proxy import AxesProxyHandler
from rest_framework.response import Response
from rest_framework import status

from user_agents import parse
from django.contrib.gis.geoip2 import GeoIP2
from django.utils import timezone

from mypupqc.helper import  *
import logging


class CustomAuthenticationFailed(APIException):
    status_code = 401
    default_detail = 'Authentication failed.'
    default_code = 'authentication_failed'

    def __init__(self, detail, code=None):
        self.detail = detail


class TooManyRequests(APIException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Too many requests. Please try again later.'
    default_code = 'too_many_requests'

    def __init__(self, detail=None, code=None):
        if detail is not None:
            self.detail = detail
        else:
            self.detail = {'detail': self.default_detail}


logger = logging.getLogger(__name__)
def track_user_login(request, user):
    try:
        # Initialize GeoIP2
        g = GeoIP2()
        
        # Get User Agent information
        user_agent_string = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(user_agent_string)
        
        # Get IP Address - handle proxy forwarding
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get location from IP
        try:
            location_data = g.city(ip_address)
            location = f"{location_data.get('city', 'Unknown')}, {location_data.get('country_name', 'Unknown')}"
        except:
            location = "Accessed via Localhost"

        device_brand = user_agent.device.brand
        device_model = user_agent.device.model

        if device_brand is None and device_model is None:
            device = f"{user_agent.device.family}: {user_agent}"
        else:
            device = f"{device_brand + ' '}{device_model}"
        
        # Create login record
        UserLoginHistory.objects.create(
            user=checkWhichUserType2(user),
            browser=f"{user_agent.browser.family} {user_agent.browser.version_string}",
            device=device,
            os=f"{user_agent.os.family} {user_agent.os.version_string}",
            ip_address=ip_address,
            location=location,
            login_datetime=timezone.now(),
            access_type='api'
        )
        # print("Tracking user login")
    except Exception as e:
        logger.error(f"Error tracking user login: {str(e)}")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Manually authenticate first to catch login errors
        request = self.context['request']
        user = authenticate(
            request=self.context['request'],
            username=attrs.get("user_number"),
            password=attrs.get("password")
        )

        # Check if user is authenticated and active
        if user is None or not user.is_active:
            currentAccessAttempts = getAccessAttempts(request)
            if currentAccessAttempts >= 3:
                raise TooManyRequests({
                    'detail': 'Too many failed login attempts. Account is locked.',
                    'remaining_attempts': 0
                })

            raise CustomAuthenticationFailed({
                'detail': 'Invalid credentials or user is inactive.',
                'remaining_attempts': 3 - currentAccessAttempts
            })

        self.user = user
        data = super().validate(attrs)
        
        permissions = list(retrievePermissions(ifacultyID=user.user_id))

        # Custom checks
        if not "Faculty" in permissions:  # Role check
            raise CustomAuthenticationFailed({
                'detail': 'You do not have the required role.',
                'remaining_attempts': 3 - getAccessAttempts(request)
            })
       
        access = AccessToken.for_user(self.user) # Generate the access token
        access["role"] = permissions
        access["facultyID"] = user.faculty.userID
        data["access"] = str(access) # Overwrite the default access token with new user information

        request = self.context['request']
        track_user_login(request, self.user)
        # print("User logged in")

        return data
    

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        # Ensure the refresh token is validated by the parent class first
        data = super().validate(attrs)

        # Access the refresh token from validated data
        refresh_token = data['refresh']

        try:
            # Decode the refresh token and retrieve the user
            self.token = RefreshToken(refresh_token)
            user = CustomUser.objects.get(user_id=self.token['user_id'])  # Access the user from the decoded token
        except InvalidToken:
            print("Invalid token")
            raise AuthenticationFailed('Invalid refresh token.')

        # Permissions check
        permissions = list(retrievePermissions(ifacultyID=user.user_id))
        if not "Faculty" in permissions:
            raise AuthenticationFailed('You do not have the required role.')

        # Modify the access token with custom claims
        self.token["role"] = permissions
        self.token["facultyID"] = user.faculty.userID

        # Overwrite the default access token with the new user information
        data["access"] = str(self.token.access_token)

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        username = get_client_username(request=request, credentials=request.data)
        if AxesProxyHandler.is_locked(request, credentials=request.data):
            return Response(
                {
                    'detail': 'Too many failed login attempts. Account is locked.',
                    'remaining_attempts': 0
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        try:
            return super().post(request, *args, **kwargs)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer


def getLoginHistory(request):
    if not verifyAccessToken(request):
        return JsonResponse({"error": "Invalid access token."}, status=401)

    if request.method == "GET":
        userID = request.GET.get('facultyID')
        login_history = UserLoginHistory.objects.filter(user_id=userID).order_by('-login_datetime')[:5]
        data = []
        for history in login_history:
            data.append({
                'login_datetime': history.login_datetime,
                'browser': history.browser,
                'device': history.device,
                'os': history.os,
                'ip_address': history.ip_address,
                'location': history.location,
                'access_type': history.access_type
            })
            
        return JsonResponse(data, safe=False, status=200)


@csrf_exempt
def storeRefreshToken(request):
    with transaction.atomic():
        if request.method == "POST":
            token = request.POST.get('refresh_token')
            userID = request.POST.get('userID')

            # Check if refresh token already exists
            # If it does, delete the existing refresh token
            if RefreshTokens.objects.filter(userID=userID).exists():
                RefreshTokens.objects.filter(userID=userID).delete()

            # Get the custom user instance
            user = CustomUser.objects.get(user_id=userID)

            RefreshTokens.objects.create(
                refreshToken=token,
                userID=user,
            )
            return JsonResponse({'message': 'Refresh token stored successfully'}, status=200)


@csrf_exempt
def retrieveRefreshToken(request):
    if request.method == "GET":
        userID = request.GET.get('userID')
        token = RefreshTokens.objects.get(userID=userID)

        return JsonResponse({'refresh_token': token.refreshToken}, status=200)


@csrf_exempt
def deleteRefreshToken(request):
    if request.method == "POST":
        userID = request.POST.get('userID')
        RefreshTokens.objects.filter(userID=userID).delete()

        return JsonResponse({'message': 'Refresh token deleted successfully'}, status=200)
    

@csrf_exempt
def changePassword(request):
    with transaction.atomic():
        if not verifyAccessToken(request):
            return JsonResponse({"error": "Invalid access token."}, status=401)
        
        if request.method == "POST":
            userID = request.POST.get('userID')
            currentPassword = request.POST.get('currentPassword')
            newPassword = request.POST.get('newPassword')
            confirmPassword = request.POST.get('confirmPassword')

            user = CustomUser.objects.get(user_id=userID)
            # Check if current password given is correct for verification
            if not user.check_password(currentPassword):
                return JsonResponse({'error': 'Incorrect password'}, status=400)
            
            # Check if new password is the same as the current password
            if user.check_password(newPassword):
                return JsonResponse({'error': 'New password cannot be the same as the current password'}, status=400)
            
            # Check if new password and confirm password match
            if newPassword != confirmPassword:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)
            
            # Change the password if all checks pass
            user.set_password(newPassword)
            user.save()

            return JsonResponse({'message': 'Password changed successfully'}, status=200)