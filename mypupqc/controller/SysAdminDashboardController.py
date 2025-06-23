from django.http import HttpResponse, JsonResponse
from datetime import datetime, timedelta
from mypupqc.helper import *

from mypupqc.models import *


def getCardsInformation(request):
    """
    Get all the necessary information for the cards in the dashboard.
    """
    totalActiveUsers = (
        Student.objects.filter(isActive=1, isAlumni=0).count() +
        Faculty.objects.filter(isActive=1).count() +
        Student.objects.filter(isAlumni=1).count() +
        Personnel.objects.filter(isActive=1).count()
    )

    pendingApprovals = PendingAccount.objects.count()
    today = datetime.now().date()
    recentLogs = HistoryLog.objects.filter(createdTime__date=today).order_by('-createdTime').count()

    cardsInfo = {
        "totalActiveUsers": totalActiveUsers,
        "pendingApprovals": pendingApprovals,
        "recentLogs": recentLogs,
    }
    print(cardsInfo)
    return JsonResponse(cardsInfo, safe=False)


def getTotalRegisteredUsers(request):
    thisMonth = datetime.now().month
    thisYear = datetime.now().year
    monthsThisYear = [datetime(thisYear, month, 1).strftime('%Y-%m') for month in range(1, thisMonth+1, 1)]

    # Data needed for the chart
    months = []
    studentCounts = []
    facultyCounts = []
    alumniCounts = []
    personnelCounts = []

    for month in monthsThisYear:
        studentRecords = Student.objects.filter(createdTime__icontains=month, isAlumni=0)
        facultyRecords = Faculty.objects.filter(createdTime__icontains=month)
        alumniRecords = Student.objects.filter(createdTime__icontains=month, isAlumni=1)
        personnelRecords = Personnel.objects.filter(createdTime__icontains=month)
        
        months.append(datetime.strptime(month, '%Y-%m').strftime('%B'))
        studentCounts.append(studentRecords.count())
        facultyCounts.append(facultyRecords.count())
        alumniCounts.append(alumniRecords.count())
        personnelCounts.append(personnelRecords.count())

    monthsCounts = {
        "xLabel": months,
        "xLabelName": "Months",
        "students": studentCounts,
        "faculties": facultyCounts,
        "alumni": alumniCounts,
        "personnel": personnelCounts,
    }
    
    return JsonResponse(monthsCounts, safe=False)


def new_getTotalRegisteredUsers(request):
    timespan = request.GET.get('timespan')

    if int(timespan) != 0:
        today = datetime.now()
        last_30_days = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(int(timespan) - 1, -1, -1)]

        # Data needed for the chart
        days = []
        studentCounts = []
        facultyCounts = []
        alumniCounts = []

        for day in last_30_days:
            studentRecords = Student.objects.filter(createdTime__lte=day, isAlumni=0)
            facultyRecords = Faculty.objects.filter(createdTime__lte=day)
            alumniRecords = Student.objects.filter(createdTime__lte=day, isAlumni=1)
            
            days.append(datetime.strptime(day, '%Y-%m-%d').strftime('%b %d'))
            studentCounts.append(studentRecords.count())
            facultyCounts.append(facultyRecords.count())
            alumniCounts.append(alumniRecords.count())

        daysCounts = {
            "xLabel": days,
            "xLabelName": "Days",
            "students": studentCounts,
            "faculties": facultyCounts,
            "alumni": alumniCounts
        }
        
        return JsonResponse(daysCounts, safe=False)
    else:
        return getTotalRegisteredUsers(request)


def getTotalStudentsPerYear(request):
    try:
        latestYear = Student.objects.latest('createdTime').createdTime.year
        earliestYear = Student.objects.earliest('createdTime').createdTime.year
    except ObjectDoesNotExist:
        latestYear = datetime.now().year
        earliestYear = datetime.now().year
    # Earliest Year if data since 1997 was imported
    # earliestYear = 1997

    years = [year for year in range(earliestYear, latestYear+1, 1)]
    counts = []

    for year in years:
        students = Student.objects.filter(createdTime__icontains=year, isActive=1)
        counts.append(students.count())

    yearsCounts = {
        "years": years,
        "counts": counts
    }

    return JsonResponse(yearsCounts, safe=False)


def getTotalStudentsPerProgram(request):
    programsObj = Program.objects.all()
    programs = [program.programShortName for program in programsObj]
    students = []

    for program in programsObj:
        count = Student.objects.filter(programID=program, isActive=1, isAlumni=0).count()
        students.append(count)

    programsCounts = {
        "programs": programs,
        "students": students,
    }

    return JsonResponse(programsCounts, safe=False)


def getActiveInactiveUsers(request):
    inactiveDate = datetime.now() - timedelta(days=30)

    activeUsers = Student.objects.filter(isActive=1).count()
    activeUsers += Faculty.objects.filter(isActive=1).count()

    inactiveUsers = Student.objects.filter(credID__last_login__lte=inactiveDate).count()
    inactiveUsers += Faculty.objects.filter(credID__last_login__lte=inactiveDate).count()

    pendingUsers = Student.objects.filter(status='Pending').count()
    pendingUsers += Faculty.objects.filter(status='Pending').count()

    activeInactiveCounts = {
        "active": activeUsers,
        "inactive": inactiveUsers,
        "pending": pendingUsers
    }

    return JsonResponse(activeInactiveCounts, safe=False)


def getLatestRegisteredUsers(request):
    latestStudents = list(Student.objects.filter(isActive=1, isAlumni=0).order_by('-createdTime')[:5].values('createdTime', 'firstname', 'lastname', 'middlename', 'status'))
    latestFaculties = list(Faculty.objects.filter(isActive=1).order_by('-createdTime')[:5].values('createdTime', 'firstname', 'lastname', 'middlename', 'status'))
    latestAlumni = list(Student.objects.filter(isAlumni=1).order_by('-createdTime')[:5].values('createdTime', 'firstname', 'lastname', 'middlename', 'status'))

    latestUsers = [
        {"createdTime": user['createdTime'], "fullname": f"{user['firstname']} {user['middlename'][0]+'.' if user['middlename'] else ''} {user['lastname']}", "type": "Student", "status": user['status']} for user in latestStudents
    ] + [
        {"createdTime": user['createdTime'], "fullname": f"{user['firstname']} {user['middlename'][0]+'.' if user['middlename'] else ''} {user['lastname']}", "type": "Faculty", "status": user['status']} for user in latestFaculties
    ] + [
        {"createdTime": user['createdTime'], "fullname": f"{user['firstname']} {user['middlename'][0]+'.' if user['middlename'] else ''} {user['lastname']}", "type": "Alumni", "status": user['status']} for user in latestAlumni
    ]

    latestUsers.sort(key=lambda x: x['createdTime'], reverse=True)

    return JsonResponse({"latestUsers": latestUsers}, safe=False)


def getTotalRegisteredUsersPerYear(request):
    thisYear = datetime.now().year
    years = [thisYear - i for i in range(2, -1, -1)]

    # Data needed for the chart
    studentCounts = []
    facultyCounts = []
    alumniCounts = []
    personnelCounts = []

    for year in years:
        studentRecords = Student.objects.filter(createdTime__year=year, isAlumni=0)
        facultyRecords = Faculty.objects.filter(createdTime__year=year)
        alumniRecords = Student.objects.filter(createdTime__year=year, isAlumni=1)
        personnelRecords = Personnel.objects.filter(createdTime__year=year)
        
        studentCounts.append(studentRecords.count())
        facultyCounts.append(facultyRecords.count())
        alumniCounts.append(alumniRecords.count())
        personnelCounts.append(personnelRecords.count())

    yearsCounts = {
        "xLabel": years,
        "xLabelName": "Years",
        "students": studentCounts,
        "faculties": facultyCounts,
        "alumni": alumniCounts,
        "personnel": personnelCounts,
    }
    
    return JsonResponse(yearsCounts, safe=False)
