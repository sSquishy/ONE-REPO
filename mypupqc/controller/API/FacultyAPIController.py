import json
from datetime import datetime
from django.http import JsonResponse
from mypupqc.models import *
from mypupqc.helper import *
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from mypupqc.controller import HistoryLogsController, SysAdminController


def getAllFaculties(request):
    if verifyAccessToken(request):
        faculties = Faculty.objects.filter(isActive=1).values(
            'userID', 'firstname', 'middlename', 'lastname', 'suffix', 'emailAddress'
        )
        facultyList = [
            {
                "facultyID": faculty['userID'],
                "fullName": getFacultyFullName(faculty),
                "firstname": faculty['firstname'],
                "middlename": faculty['middlename'],
                "lastname": faculty['lastname'],
                "suffix": faculty['suffix'],
                "email": faculty['emailAddress'],
            }
            for faculty in faculties
        ]
        return JsonResponse(facultyList, safe=False)
    else:
        return JsonResponse({"error": "Invalid access token."}, status=401)
    

def getFaculty(request, facultyID):
    if not verifyAccessToken(request):
        return JsonResponse({"error": "Invalid access token."}, status=401)
    
    try:
        faculty = Faculty.objects.values(
            'userID', 'credID__user_number', 'firstname', 'middlename', 
            'lastname', 'suffix', 'mobileNo', 'emailAddress', 'webMail', 'dateOfBirth'
        ).filter(userID=facultyID).first()
        
        facultyData = {
            "facultyID": faculty['userID'],
            "facultyNumber": faculty['credID__user_number'],
            "fullName": getFacultyFullName(faculty),
            "firstname": faculty['firstname'],
            "middlename": faculty['middlename'],
            "lastname": faculty['lastname'],
            "suffix": faculty['suffix'],
            "mobileNo": faculty['mobileNo'],
            "email": faculty['emailAddress'],
            "webmail": faculty['webMail'],
            "dateOfBirth": str(faculty['dateOfBirth']),
            "avatar": "",
        }
        return JsonResponse(facultyData, safe=False)
    except Faculty.DoesNotExist:
        return JsonResponse({"error": "Faculty not found."}, status=404)
    

def getFacultyNames(request):
    if verifyAccessToken(request):
        faculties = Faculty.objects.filter(isActive=1)
        facultyList = {}
        for faculty in faculties:
            facultyList[faculty.userID] = {
                "facultyID": faculty.userID,
                "fullName": getFacultyFullName(faculty),
                "firstname": faculty.firstname,
                "middlename": faculty.middlename,
                "lastname": faculty.lastname,
                "suffix": faculty.suffix,
            }
        return JsonResponse(facultyList, safe=False)
    else:
        return JsonResponse({"error": "Invalid access token."}, status=401)
    

def getFacultyName(request):
    if verifyAccessToken(request):
        facultyID = request.GET.get('facultyID')
        faculty = Faculty.objects.get(userID=facultyID)
        facultyData = {
            "facultyID": faculty.userID,
            "fullName": getFacultyFullName(faculty),
            "firstname": faculty.firstname,
            "middlename": faculty.middlename,
            "lastname": faculty.lastname,
            "suffix": faculty.suffix,
        }
        return JsonResponse(facultyData, safe=False)
    else:
        return JsonResponse({"error": "Invalid access token."}, status=401)
    

@csrf_exempt
def addFaculty(request):
    from mypupqc.controller import HistoryLogsController
    with transaction.atomic():
        if verifyAccessToken(request):
            # customuser
            user_number = request.POST.get('facultyNumberAdd')
            password = generatePassword()

            newUser = CustomUser.objects.create_user(
                user_number=user_number,
                password=password,
            )

            # mypupqc_faculty
            facultyNumberID = newUser
            firstname = request.POST.get('firstNameAdd')
            middlename = request.POST.get('middleNameAdd')
            lastname = request.POST.get('lastNameAdd')
            suffix = request.POST.get('suffixAdd')
            dateOfBirth = buildBirthday(
                request.POST.get('birthYearAdd'),
                request.POST.get('birthMonthAdd'),
                request.POST.get('birthDayAdd'),
            )
            mobileNo = request.POST.get('mobileNoAdd')
            emailAddress = request.POST.get('emailAddressAdd')
            webMail = request.POST.get('webmailAdd')

            newFaculty = Faculty.objects.create(
                credID=facultyNumberID,
                firstname=firstname,
                middlename=middlename,
                lastname=lastname,
                suffix=suffix,
                dateOfBirth=dateOfBirth,
                mobileNo=mobileNo,
                emailAddress=emailAddress,
                webMail=webMail,
                isFromBulkUpload = 0,
            )

            # Default faculty permission
            addPermissionList('Faculty', ifacultyID=newUser, isActive=1)

            email_sent = send_email(
                subject='Account Registration',
                message=f'Your account has been successfully registered.\n\n' \
                        f'Username: {user_number} \n' \
                        f'Password: {password} \n' \
                        f'Please change your password as soon as possible.',
                recipient_list=[emailAddress, webMail],
            )

            # history log purposes
            isLoggingSuccess = HistoryLogsController.addHistoryLog(
                request,
                system = "MyScheduler",
                actionType = "Create",
                actionDesc = f'Added new faculty: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname}',
            )

            return JsonResponse({"status": "Success", "facultyID": newFaculty.userID})
        else:
            return JsonResponse({"error": "Invalid access token."}, status=401)
    

@csrf_exempt
def editFaculty(request):
    with transaction.atomic():
        if verifyAccessToken(request):
            facultyID = request.POST.get('facultyID')
            firstname = request.POST.get('firstname')
            middlename = request.POST.get('middlename')
            lastname = request.POST.get('lastname')
            suffix = request.POST.get('suffix')
            email = request.POST.get('email')
            webmail = request.POST.get('webMail')
            dateOfBirth = request.POST.get('dateOfBirth')

            if dateOfBirth:
                dateOfBirth = datetime.strptime(dateOfBirth, '%Y-%m-%d')
            
            faculty = Faculty.objects.get(userID=facultyID)
            faculty.firstname = firstname
            faculty.middlename = middlename
            faculty.lastname = lastname
            faculty.suffix = suffix
            faculty.emailAddress = email
            faculty.webMail = webmail
            if dateOfBirth:
                faculty.dateOfBirth = dateOfBirth
            faculty.save()
            
            return JsonResponse({"status": "Success"})
        else:
            return JsonResponse({"error": "Invalid access token."}, status=401)
        

@csrf_exempt
def deleteFacultyAPI(request):
    with transaction.atomic():
        if verifyAccessToken(request):
            system = request.POST.get('system')
            data = SysAdminController.deleteFaculty(request, system=system, API=True)
            response = json.loads(data.content)

            if response.get('status') == 'success':
                return JsonResponse({"status": "success"})
            elif response.get('status') == 'failed':
                return JsonResponse({"status": "failed"}, status=400)
        else:
            return JsonResponse({"error": "Invalid access token."}, status=401)
        

@csrf_exempt
def bulkDeleteFacultyAPI(request):
    with transaction.atomic():
        if verifyAccessToken(request):
            system = request.POST.get('system')
            facultyIDs = request.POST.getlist('facultyIDs[]')

            failedDeletion = 0
            failureCauses = []

            for facultyID in facultyIDs:
                data = SysAdminController.deleteFaculty(request, userID=facultyID, system=system, API=True)
                response = json.loads(data.content)

                if response.get('status') == 'failed':
                    failedDeletion += 1
                    failureCauses.append(response.get('message'))
                elif response.get('status') == 'success':
                    continue
            return JsonResponse({"status": "success", "failedDeletion": failedDeletion, "failureCauses": failureCauses})
        else:
            return JsonResponse({"error": "Invalid access token."}, status=401)
        

@csrf_exempt
def getRetainedFacultyAPI(request):
    if verifyAccessToken(request):
        retained = Faculty.objects.filter(isRetained=1)
        facultyList = []

        for faculty in retained:
            facultyList.append({
                "facultyID": faculty.userID,
                "fullName": getFacultyFullName(faculty),
                "firstname": faculty.firstname,
                "middlename": faculty.middlename,
                "lastname": faculty.lastname,
                "suffix": faculty.suffix,
                "email": faculty.emailAddress,
            })

        return JsonResponse(facultyList, safe=False)
    else:
        return JsonResponse({"error": "Invalid access token."}, status=401)
    

@csrf_exempt
def restoreRetainedFacultyAPI(request):
    with transaction.atomic():
        if verifyAccessToken(request):
            system = request.POST.get('system')
            facultyID = request.POST.get('facultyID')
            faculty = Faculty.objects.get(userID=facultyID)
            faculty.isRetained = 0
            faculty.isActive = 1
            faculty.credID.is_active = 1
            faculty.save()

            # history log purposes
            HistoryLogsController.addHistoryLog(
                request,
                system = system if system else "MyPUPQC",
                actionType = "Reactivate",
                actionDesc = f"Reactivated the account of {faculty.credID.user_number}",
            )

            return JsonResponse({"status": "Success"})
        else:
            return JsonResponse({"error": "Invalid access token."}, status=401)
        

@csrf_exempt
def deleteRetainedFacultyAPI(request):
    with transaction.atomic():
        if verifyAccessToken(request):
            system = request.POST.get('system')
            facultyID = request.POST.get('facultyID')
            faculty = Faculty.objects.get(userID=facultyID)
            faculty.isRetained = 2
            faculty.save()

            # history log purposes
            HistoryLogsController.addHistoryLog(
                request,
                system = system if system else "MyPUPQC",
                actionType = "Delete",
                actionDesc = f"Deleted the account of {faculty.credID.user_number}",
            )

            return JsonResponse({"status": "Success"})
        else:
            return JsonResponse({"error": "Invalid access token."}, status=401)