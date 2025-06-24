from django.utils import timezone
from django.shortcuts import redirect
from mypupqc.models import CustomUser, Faculty, PermissionList, Student, Personnel
from django.core.exceptions import ObjectDoesNotExist
from functools import wraps
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from axes.handlers.proxy import AxesProxyHandler
from axes.models import AccessAttempt
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Decorators
def is_faculty(user: CustomUser):
    try:
        userRole = PermissionList.objects.filter(
            facultyID=user.user_id,
            isActive=1
            ).values_list('permissionName', flat=True)
    except ObjectDoesNotExist:
        return False
    except AttributeError:
        return False

    status = user.is_authenticated and 'Faculty' in userRole
    return status


def is_personnel(user: CustomUser):
    try:
        userRole = PermissionList.objects.filter(
            personnelID=user.user_id,
            isActive=1
            ).values_list('permissionName', flat=True)
    except ObjectDoesNotExist:
        return False
    except AttributeError:
        return False

    status = user.is_authenticated and 'Personnel' in userRole
    return status


def is_admin(user: CustomUser):
    try:
        userRole = PermissionList.objects.filter(
            facultyID=user.user_id,
            isActive=1
            ).values_list('permissionName', flat=True)
    except ObjectDoesNotExist:
        return False
    except AttributeError:
        return False

    status = user.is_authenticated and 'Admin' in userRole
    return status


def is_student(user: CustomUser):
    try:
        userRole = PermissionList.objects.filter(
            studentID=user.user_id,
            isActive=1
            ).values_list('permissionName', flat=True)
    except ObjectDoesNotExist:
        return False
    except AttributeError:
        return False

    status = user.is_authenticated and 'Student' in userRole
    return status


def is_alumni(user):
    try:
        userRole = PermissionList.objects.filter(
            studentID=user.user_id,
            isActive=1
            ).values_list('permissionName', flat=True)
    except ObjectDoesNotExist:
        return False
    except AttributeError:
        return False

    status = user.is_authenticated and 'Alumni' in userRole
    return status


def checkUserType(user):
    if is_student(user):
        return 'Student'
    elif is_admin(user):
        return 'Admin'
    elif is_faculty(user):
        return 'Faculty'
    elif is_personnel(user):
        return 'Personnel'
    else:
        return None


def student_or_alumni_required(view_func, login_url=None):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if is_student(request.user) or is_alumni(request.user):
            return view_func(request, *args, **kwargs)
        return redirect('SHomePage')
    return _wrapped_view


# Helper Functions
def addPermissionList(permissionName, ifacultyID=None, istudentID=None, ipersonnelID=None, isActive=1):
    PermissionList.objects.create(
        permissionName=permissionName,
        facultyID=ifacultyID,
        studentID=istudentID,
        personnelID=ipersonnelID,
        isActive=isActive
    )


def updatePermissionList(permissionName, isActive, ifacultyID=None, istudentID=None, ipersonnelID=None):
    permission = PermissionList.objects.get(
        permissionName=permissionName,
        facultyID=ifacultyID,
        studentID=istudentID,
        personnelID=ipersonnelID
    )
    permission.isActive = isActive
    permission.save()


def checkExistingPermission(permissionName, ifacultyID=None, istudentID=None, ipersonnelID=None, any=False):
    try:
        if any:
            PermissionList.objects.get(
                permissionName=permissionName,
                facultyID=ifacultyID,
                studentID=istudentID,
                personnelID=ipersonnelID,
            )
        else:
            PermissionList.objects.get(
                permissionName=permissionName,
                facultyID=ifacultyID,
                studentID=istudentID,
                personnelID=ipersonnelID,
                isActive=1
            )
        return True
    except ObjectDoesNotExist:
        return False
    

def retrievePermissions(ifacultyID=None, istudentID=None, ipersonnelID=None):
    try:
        return PermissionList.objects.filter(
            facultyID=ifacultyID,
            studentID=istudentID,
            personnelID=ipersonnelID,
            isActive=1
        ).values_list('permissionName', flat=True)
    except ObjectDoesNotExist:
        return None


def generatePassword():
    import random
    import string

    # Define the character sets
    uppercase = random.choice(string.ascii_uppercase)  # 1 random uppercase letter
    lowercase = random.choice(string.ascii_lowercase)  # 1 random lowercase letter
    digit = random.choice(string.digits)  # 1 random digit
    special_char = random.choice(string.punctuation)  # 1 random special character

    # Fill the rest with random characters
    other_characters = random.choices(string.ascii_letters + string.digits + string.punctuation, k=4)

    # Combine all the characters
    password_list = [uppercase, lowercase, digit, special_char] + other_characters

    # Shuffle to ensure randomness
    random.shuffle(password_list)

    # Join into a string
    return ''.join(password_list)


def buildBirthday(year, month, day):
    return year+'-'+month+'-'+day


def checkWhichUserType(request):
    user = Student.objects.filter(credID=request.user).first() or \
           Faculty.objects.filter(credID=request.user).first() or \
           Personnel.objects.filter(credID=request.user).first()
    return user


def checkWhichUserType2(request):
    user = Student.objects.filter(credID=request.user_id).first() or \
           Faculty.objects.filter(credID=request.user_id).first() or \
           Personnel.objects.filter(credID=request.user_id).first()
    return user


def findStudentByEmail(email):
    try:
        user = Student.objects.get(emailAddress=email)
        return int(user.credID.user_id)
    except ObjectDoesNotExist:
        return None
    

def findFacultyByEmail(email):
    try:
        user = Faculty.objects.get(emailAddress=email)
        return int(user.credID.user_id)
    except ObjectDoesNotExist:
        return None
    

def findPersonnelByEmail(email):
    try:
        user = Personnel.objects.get(emailAddress=email)
        return int(user.credID.user_id)
    except ObjectDoesNotExist:
        return None


def changeUserPassword(user: CustomUser, newPassword):
    user.set_password(newPassword)
    user.save()


# This function is used to track user login attempts
# This will return the number of failed login attempts for a user based on their username or IP address
def getAccessAttempts(request):
    return sum(AccessAttempt.objects.filter(
        Q(username=request.POST.get('username')) | Q(ip_address=get_client_ip(request))
        ).values_list('failures_since_start', flat=True))


# This is different from getAccessAttempts, this will return the first AccessAttempt object for a user based on their username or IP address
def getAccessAttempt(request):
    return AccessAttempt.objects.filter(
        Q(username=request.POST.get('username')) | Q(ip_address=get_client_ip(request))
        ).first()


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def reduceLoginAttempt(request) -> int:
    try:
        loginAttempts = getAccessAttempt(request)
        loginAttempts.failures_since_start += 1
        loginAttempts.save()

    except ObjectDoesNotExist:
        None

    failedAttempts = getAccessAttempts(request)
    return failedAttempts


def resetLoginAttempt(iusername: str):
    try:
        loginAttempts = AccessAttempt.objects.get(username=iusername)
        loginAttempts.failures_since_start = 0
        loginAttempts.save()
    except ObjectDoesNotExist:
        None


def addAccessAttempt(request):
    if getAccessAttempts(request) > 0:
        reduceLoginAttempt(request)
    else:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT')
        username = request.POST.get('username')
        post_data = request.POST

        AccessAttempt.objects.create(
            username=username,  # The username for the attempted login
            ip_address=ip_address,  # The IP address of the request
            user_agent=user_agent,  # User agent string (can be fetched from request)
            attempt_time=timezone.now(),  # Timestamp of the attempt
            post_data=post_data,  # The POST data of the request
            failures_since_start=1,  # Set this based on success or failure
        )

    failedAttempts = getAccessAttempts(request)
    return failedAttempts


def send_email(subject, message, recipient_list, from_email=settings.EMAIL_HOST_USER):
    """
    Sends an email using Django's send_mail function.

    :param subject: Subject of the email
    :param message: Message body of the email
    :param recipient_list: List of recipient email addresses
    :param from_email: Sender's email address (default is EMAIL_HOST_USER from settings)
    """
    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
    

def getStudentFullName(student: Student | dict) -> str:
    '''
    Returns the full name of a student.
    
    :param student: Student object
    :return: Full name of the student
    '''
    # Check if student is a dictionary (updated querying)
    if type(student) == dict:
        return f"{student['firstname']} {student['middlename'] if student['middlename'] else ''} {student['lastname']}"
    # Old querying - student is a Student object
    return f"{student.firstname} {student.middlename if student.middlename else ''} {student.lastname}"


def getFacultyFullName(faculty: Faculty | dict) -> str:
    '''
    Returns the full name of a faculty.
    
    :param student: Faculty object
    :return: Full name of the faculty
    '''
    # Check if faculty is a dictionary (updated querying)
    if type(faculty) == dict:
        return f"{faculty['firstname']} {faculty['middlename'] if faculty['middlename'] else ''} {faculty['lastname']}"
    # Old querying - faculty is a Faculty object
    return f"{faculty.firstname} {faculty.middlename if faculty.middlename else ''} {faculty.lastname}"


def getPersonnelFullName(personnel: Personnel | dict) -> str:
    '''
    Returns the full name of a personnel.
    
    :param student: Personnel object
    :return: Full name of the personnel
    '''
    # Check if personnel is a dictionary (updated querying)
    if type(personnel) == dict:
        return f"{personnel['firstname']} {personnel['middlename'] if personnel['middlename'] else ''} {personnel['lastname']}"
    # Old querying - personnel is a Personnel object
    return f"{personnel.firstname} {personnel.middlename if personnel.middlename else ''} {personnel.lastname}"


def getFullName(user: CustomUser):
    '''
    Returns the full name of a user.
    
    :param user: CustomUser object
    :return: Full name of the user
    '''
    try:
        student = Student.objects.get(credID=user)
        return getStudentFullName(student)
    except ObjectDoesNotExist:
        try:
            faculty = Faculty.objects.get(credID=user)
            return getFacultyFullName(faculty)
        except ObjectDoesNotExist:
            try:
                personnel = Personnel.objects.get(credID=user)
                return getPersonnelFullName(personnel)
            except ObjectDoesNotExist:
                return None


def getPostAuthorEmailViaCredentials(customUser: CustomUser):
    '''
    Returns the email of the post author of a post using the CustomUser object.
    
    :param customUser: CustomUser object
    :return: Author ID of the post
    '''
    try:
        student = Student.objects.get(credID=customUser)
        return student.emailAddress
    except ObjectDoesNotExist:
        try:
            faculty = Faculty.objects.get(credID=customUser)
            return faculty.emailAddress
        except ObjectDoesNotExist:
            try:
                personnel = Personnel.objects.get(credID=customUser)
                return personnel.emailAddress
            except ObjectDoesNotExist:
                return None
        

def verifyAccessToken(request):
    auth = JWTAuthentication()
    header = auth.get_header(request)
    if header is None:
        raise AuthenticationFailed("Authorization header missing.")

    # Get the raw token
    raw_token = auth.get_raw_token(header)
    if raw_token is None:
        raise AuthenticationFailed("Token missing.")

    # Validate the token and get the user
    validated_token = auth.get_validated_token(raw_token)
    user = auth.get_user(validated_token)
    return user