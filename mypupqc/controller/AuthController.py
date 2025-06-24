from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.http import JsonResponse, Http404
from django.core.exceptions import ObjectDoesNotExist
from django.urls import reverse
from django_ratelimit.decorators import ratelimit

from mypupqc.controller import HistoryLogsController
from mypupqc.models import Faculty, PermissionList, Student
from mypupqc.helper import *

from axes.models import AccessAttempt


def authenticateCredentials(request, username, password) -> CustomUser:
    user = authenticate(request, username=username, password=password)
    return user


def verifyUserBirthday(request, user: CustomUser) -> Student | Faculty:
    birthday = buildBirthday(
        request.POST.get('birthYear'),
        request.POST.get('birthMonth'),
        request.POST.get('birthDay')
        )

    try:
        auth_user = Student.objects.get(credID=user.user_id)
    except ObjectDoesNotExist:
        try:
            auth_user = Faculty.objects.get(credID=user.user_id)
        except ObjectDoesNotExist:
            return "Object Not Found"

    if not str(auth_user.dateOfBirth) == birthday:
        return "Incorrect Birthday"

    return auth_user


def verifyUserPermission(request, user: CustomUser, auth_user: Student | Faculty):
    user_status: str = auth_user.status
    firstname: str = auth_user.firstname
    middlename: str = auth_user.middlename
    lastname: str = auth_user.lastname

    # Updates the user's status to 'Active' if it is their first time logging in
    def firstTimeLogin(request) -> None:
        auth_user.status = 'Active'
        auth_user.joinedTime = timezone.now()
        auth_user.save()

        # history log purposes
        HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Status Change",
            actionDesc = f"A {role.lower()}'s account status has been updated by logging in: {firstname} {middlename if middlename else ''}{'.' if middlename else ''} {lastname}",
        )

    role: str = request.POST.get('role')
    userRole: list[str] = []
    if role in ('Student', 'Alumni'):
        userRole = PermissionList.objects.filter(
            studentID=user.user_id,
            isActive=1,
            ).values_list('permissionName', flat=True)

    elif role == 'Faculty':
        userRole = PermissionList.objects.filter(
            facultyID=user.user_id,
            isActive=1,
            ).values_list('permissionName', flat=True)

    if role in userRole:
        request.session.cycle_key()  # Generate a new session key
        login(request, user)
        firstTimeLogin(request) if user_status == 'Pending' else None
        resetLoginAttempt(user.user_number)

        return JsonResponse({'status': 'Success'})
    else:
        remainingAttempts = 3 - addAccessAttempt(request)
        return JsonResponse({'status': 'Unauthorized', 'remainingAttempts': remainingAttempts}, status=401)

def authenticateUser(request):
    '''
    Credentials are first checked if they are valid then authenticates the user.
    If the user is not found, it will return a JsonResponse with a status of 'Not Found'.
    '''
    username = request.POST.get('username')
    password = request.POST.get('password')

    user: CustomUser = authenticateCredentials(request, username, password)
    if not user:
        remainingAttempts = 3 - getAccessAttempts(request)
        return JsonResponse({'status': 'Not Found', 'remainingAttempts': remainingAttempts}, status=404)

    '''
    It will then find the appropriate user in the database and check if the birthday
    matches the birthday inputted by the user. If it does not match, it will return a JsonResponse
    with a status of 'Incorrect Birthday'.
    '''
    auth_user: Student | Faculty = verifyUserBirthday(request, user)
    if auth_user == "Object Not Found":
        remainingAttempts = 3 - addAccessAttempt(request)
        return JsonResponse({'status': 'Object Not Found', 'remainingAttempts': remainingAttempts})
    elif auth_user == "Incorrect Birthday":
        remainingAttempts = 3 - addAccessAttempt(request)
        return JsonResponse({'status': 'Incorrect Birthday', 'remainingAttempts': remainingAttempts})

    '''
    After all the checks, it will then check the user's role. If the user is verified to have the permission
    to access a specific page, it will log the user in and return a JsonResponse with a status of 'Success'.
    If the user is not authorized, it will return a JsonResponse with a status of 'Unauthorized'.
    '''
    return verifyUserPermission(request, user, auth_user)


# System Admin Methods
def showSysAdminLogin(request):
    if request.method == 'GET':
        if request.user.is_authenticated and is_admin(request.user):
            return JsonResponse({'status': 'Success'})
        else:
            sysAdminLogout(request)

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print(f"Username: {username}, Password: {password}")

        # Retrieves all user permissions and check if the user is an admin or has admin rights
        user = authenticate(request, username=username, password=password)
        if not user:
            print("User not found")
            remainingAttempts = 3 - getAccessAttempts(request)
            return JsonResponse({'status': 'Failed', 'remainingAttempts': remainingAttempts})

        if not is_faculty(user):
            print("User is not a faculty")
            remainingAttempts = 3 - addAccessAttempt(request)
            return JsonResponse({'status': 'Failed', 'remainingAttempts': remainingAttempts})

        userRole = PermissionList.objects.filter(
                facultyID=user,
                isActive=1,
                ).values_list('permissionName', flat=True)

        if 'Admin' in userRole:
            request.session.cycle_key()  # Generate a new session key
            login(request, user)
            try:
                resetLoginAttempt(username)
            except AccessAttempt.DoesNotExist:
                pass  # Handle the case where the AccessAttempt does not exist

            # history log purposes
            sys_admin = Faculty.objects.get(credID=user.user_id)
            firstname: str = sys_admin.firstname
            middlename: str = sys_admin.middlename
            lastname: str = sys_admin.lastname

            HistoryLogsController.addHistoryLog(
                request,
                system = "MyPUPQC",
                actionType = "Login",
                actionDesc = f"A system admin has logged in: {firstname} {middlename if middlename else ''}{'.' if middlename else ''} {lastname}",
            )

            return JsonResponse({'status': 'Success'})
        else:
            print("User is not an admin")
            remainingAttempts = 3 - addAccessAttempt(request)
            return JsonResponse({'status': 'Unauthorized', 'remainingAttempts': remainingAttempts}, status=401)
            # messages.info(request, make_password('pass'))

    return JsonResponse({'status': 'Failed'})


def loginHomePage(request):
    if request.method == 'POST':
        return authenticateUser(request)

    return render(request, 'mypupqc/student/SHomePage.html')


# Used for logged in users to change their password
def changeUserPassword(request):
    if request.method == 'POST':
        user = authenticate(request, username=request.user.user_number, password=request.POST.get('oldPassword'))
        if user:
            user.set_password(request.POST.get('newPassword'))
            user.save()
            return JsonResponse({'status': 'Success'})
        return JsonResponse({'status': 'Failed'})


def sysAdminLogout(request):
    logout(request)
    return redirect('sysAdminLogin')


def logoutHomePage(request):
    logout(request)
    return redirect('guestHome')


# Begin: Forgot Password Method
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()


def showResetPasswordPage(request):
    return render(request, "mypupqc/resetpassword/resetpassword.html")


@csrf_exempt
@ratelimit(key='ip', rate='1/m', block=False)
def forgotPasswordRequest(request, batchData=None, batchRole=None):
    # Check if the request is rate-limited
    # Handle the case where the request is rate-limited
    if getattr(request, 'limited', False):
        return JsonResponse({
            'status': 'rate_limited',
            'detail': 'Too many requests. Please try again later.',
            'retry_after': 60  # seconds (you can make this dynamic if needed)
        }, status=429)
    
    if request.method == 'POST':
        # If batchData is not None, it means that the request is a batch request
        if batchData:
            email = batchData
            if str(batchRole).title() in ('Student', 'Alumni'):
                userType = findStudentByEmail(batchData)
                print("Student")
            elif str(batchRole).title() in ('Faculty', 'Academic Head'):
                userType = findFacultyByEmail(batchData)
                print("Faculty")
            elif str(batchRole).title() in ('Personnel'):
                userType = findPersonnelByEmail(batchData)
                print("Personnel")
        else:
            email = request.POST.get('email')
            if str(request.POST.get('role')).title() in ('Student', 'Alumni'):
                userType = findStudentByEmail(email)
                print("Student")
            elif str(request.POST.get('role')).title() in ('Faculty', 'Academic Head'):
                userType = findFacultyByEmail(email)
                print("Faculty")
            elif str(request.POST.get('role')).title() in ('Personnel'):
                userType = findPersonnelByEmail(email)
                print("Personnel")

        try:
            user = User.objects.get(user_id=userType)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = request.build_absolute_uri(reverse('forgotPassword', kwargs={'uidb64': uid, 'token': token}))

            # Send the password reset email
            send_email(
                'Password Reset Request',
                f'A password reset has been requested to the account: {user.user_number}. \n' \
                f'Click the link to reset your password: {reset_url} \n\n' \
                f'If you did not request a password reset, please ignore this email.',
                [email],
            )
        except User.DoesNotExist:
            # Handle case where user does not exist
            return JsonResponse({'status': 'failed'})

        print("Email sent")
        return JsonResponse({'status': 'success'})


@csrf_exempt
def batchForgotPasswordRequest(request):
    if request.method == 'POST':
        emailList = request.POST.getlist('emailList[]')
        role = request.POST.get('role')

        for email in emailList:
            forgotPasswordRequest(request, email, role)

        return JsonResponse({'status': 'success'})


@csrf_exempt
def forgotPassword(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            if password == confirm_password:
                user.password = make_password(password)
                user.save()
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'failed'})
        else:
            # Pass uidb64 and token to the template context
            return render(request, r'mypupqc/Templates/sysAdmin/authentication/sysAdmin_change-password.html', {
                'uidb64': uidb64,
                'token': token
            })
    else:
        raise Http404  # Invalid token or user

# End: Forgot Password Method
