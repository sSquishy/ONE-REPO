from datetime import datetime
import json, csv, openpyxl
from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.db.transaction import TransactionManagementError
from mypupqc.controller import HistoryLogsController
from mypupqc.helper import *
from mypupqc.models import *
from itertools import chain
import logging

logger = logging.getLogger('django')


@transaction.atomic
def editSysAdminProfile(request):
    if request.method == 'POST':
        user = request.user
        info = checkWhichUserType2(user)

        firstname = request.POST.get('firstname')
        middlename = request.POST.get('middlename')
        lastname = request.POST.get('lastname')
        suffix = request.POST.get('suffix')
        facultyNumber = request.POST.get('facultyNumber')
        mobileNo = request.POST.get('mobileNo')
        emailAddress = request.POST.get('emailAddress')
        webMail = request.POST.get('webMail')

        info.firstname = firstname
        info.middlename = middlename
        info.lastname = lastname
        info.suffix = suffix
        info.credID.user_number = facultyNumber
        info.mobileNo = mobileNo
        info.emailAddress = emailAddress
        info.webMail = webMail
        info.save()
        info.credID.save()

        return JsonResponse({'status': 'Profile was updated successfully.'})


# Used in System Admin Account Management
def getStudentAlumniFilterOptions(request):
    programs = Program.objects.all()

    return JsonResponse({
        'programs': list(programs.values('programID', 'programName')),
    })


# Uses Lazy Loading for DataTables
def getStudentList(request):
    # Shares the same function with Alumni table
    isAlumni = int(request.GET.get('isAlumni', 0))

    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')
    year = request.GET.get('year', None)
    program = request.GET.get('program', None)
    status = request.GET.get('status', None)

    # Query the database with search filtering
    filters = Q()
    if search_value:
        filters &= Q(firstname__icontains=search_value) | Q(middlename__icontains=search_value) | Q(lastname__icontains=search_value) | \
        Q(suffix__icontains=search_value) | Q(programID__programName__icontains=search_value) | Q(emailAddress__icontains=search_value) | \
        Q(credID__user_number__icontains=search_value) | Q(status__icontains=search_value) | Q(createdTime__icontains=search_value)
    if year:
        filters &= Q(credID__user_number__icontains=year)
    if program:
        filters &= Q(programID__programName=program)
    if status:
        filters &= Q(status=status)

    queryset = Student.objects.filter(filters, isAlumni=isAlumni, isActive=1)
    total_records = Student.objects.filter(isAlumni=isAlumni, isActive=1).count()
    filtered_records = queryset.count()

    # Paginate the data
    students = queryset.select_related('credID', 'programID').only(
        'credID__user_number', 'firstname', 'middlename', 'lastname', 'suffix', 
        'programID__programName', 'dateOfBirth', 'mobileNo', 'emailAddress', 'webMail', 
        'status', 'createdTime', 'userID'
    )[start:start+(length if length != -1 else total_records)]

    students_list = [
        {
            "studentNumber": student.credID.user_number,
            "firstname": student.firstname,
            "middlename": student.middlename,
            "lastname": student.lastname,
            "suffix": student.suffix,
            "program": student.programID.programName,
            "dateOfBirth": student.dateOfBirth.strftime("%B %d, %Y"),
            "mobileNo": student.mobileNo,
            "emailAddress": student.emailAddress,
            "webMail": student.webMail,
            "status": student.status,
            "createdTime": student.createdTime.strftime("%B %d, %Y"),
            "userID": student.userID,
        } for student in students
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": students_list,
    })


# Uses Lazy Loading for DataTables
def getFacultyList(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')
    role = request.GET.get('role', None)
    status = request.GET.get('status', None)

    # Query the database with search filtering
    filters = Q()
    if search_value:
        filters &= Q(firstname__icontains=search_value) | Q(middlename__icontains=search_value) | Q(lastname__icontains=search_value) | \
        Q(suffix__icontains=search_value) | Q(emailAddress__icontains=search_value) | \
        Q(credID__user_number__icontains=search_value) | Q(status__icontains=search_value) | Q(createdTime__icontains=search_value)
    if status:
        filters &= Q(status=status)

    queryset = Faculty.objects.filter(filters, isActive=1)

    if role:
        queryset = queryset.filter(credID__facultyPermission__permissionName=role, credID__facultyPermission__isActive=1)

    total_records = Faculty.objects.filter(isActive=1).count()
    filtered_records = queryset.count()

    # Paginate the data
    faculties = queryset.select_related('credID').only(
        'credID__user_number', 'firstname', 'middlename', 'lastname', 'suffix', 
        'dateOfBirth', 'mobileNo', 'emailAddress', 'webMail',
        'status', 'createdTime', 'userID'
    )[start:start+(length if length != -1 else total_records)]

    faculties_list = [
        {
            "facultyNumber": faculty.credID.user_number,
            "firstname": faculty.firstname,
            "middlename": faculty.middlename,
            "lastname": faculty.lastname,
            "suffix": faculty.suffix,
            "role": [permission.permissionName for permission in faculty.credID.facultyPermission.filter(isActive=1)],
            "dateOfBirth": faculty.dateOfBirth.strftime("%B %d, %Y"),
            "mobileNo": faculty.mobileNo,
            "emailAddress": faculty.emailAddress,
            "webMail": faculty.webMail,
            "status": faculty.status,
            "createdTime": faculty.createdTime.strftime("%B %d, %Y"),
            "userID": faculty.userID,
        } for faculty in faculties
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": faculties_list,
    })


# Uses Lazy Loading for DataTables
def getPersonnelList(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')
    role = request.GET.get('role', None)
    status = request.GET.get('status', None)

    # Query the database with search filtering
    filters = Q()
    if search_value:
        filters &= Q(firstname__icontains=search_value) | Q(middlename__icontains=search_value) | Q(lastname__icontains=search_value) | \
        Q(suffix__icontains=search_value) | Q(emailAddress__icontains=search_value) | \
        Q(credID__user_number__icontains=search_value) | Q(status__icontains=search_value) | Q(createdTime__icontains=search_value)
    if status:
        filters &= Q(status=status)

    queryset = Personnel.objects.filter(filters, isActive=1)

    if role:
        queryset = queryset.filter(credID__personnelPermission__permissionName=role, credID__personnelPermission__isActive=1)

    total_records = Personnel.objects.filter(isActive=1).count()
    filtered_records = queryset.count()

    # Paginate the data
    personnels = queryset.select_related('credID').only(
        'credID__user_number', 'firstname', 'middlename', 'lastname', 'suffix', 
        'dateOfBirth', 'emailAddress', 'webMail',
        'status', 'createdTime', 'userID'
    )[start:start+(length if length != -1 else total_records)]

    personnels_list = [
        {
            "personnelNumber": personnel.credID.user_number,
            "firstname": personnel.firstname,
            "middlename": personnel.middlename,
            "lastname": personnel.lastname,
            "suffix": personnel.suffix,
            "role": [permission.permissionName for permission in personnel.credID.personnelPermission.filter(isActive=1)],
            "dateOfBirth": personnel.dateOfBirth.strftime("%B %d, %Y"),
            "emailAddress": personnel.emailAddress,
            "webMail": personnel.webMail,
            "status": personnel.status,
            "createdTime": personnel.createdTime.strftime("%B %d, %Y"),
            "userID": personnel.userID,
        } for personnel in personnels
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": personnels_list,
    })
 

def getPermissionList(request):
    permissions = PermissionList.objects.all().only('permissionID', 'permissionName').distinct('permissionName')

    return JsonResponse({
        'permissions': list(permissions.values('permissionID', 'permissionName')),
    })


def getMainSlideShows(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q(section='main', isActive=1)
    if search_value:
        filters &= Q(createdTime__icontains=search_value) | Q(status__icontains=search_value)

    slideshows = SlideShow.objects.filter(filters).order_by('-createdTime')
    total_records = SlideShow.objects.filter(section='main', isActive=1).count()
    filtered_records = slideshows.count()

    # Paginate the data
    slideshows = slideshows[start:start+(length if length != -1 else total_records)]

    slideshows_list = [
        {
            "slideshowID": slideshow.slideshowID,
            "image": slideshow.image.url,
            "createdTime": slideshow.createdTime.strftime("%B %d, %Y"),
            "status": slideshow.status,
        } for slideshow in slideshows
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": slideshows_list,
    })


@transaction.atomic
def addSlideShow(request):
    if request.method == 'POST':
        image = request.FILES.get('slideshowImage')
        section = request.POST.get('section')
        status = request.POST.get('status')

        newSlide = SlideShow.objects.create(
            image = image,
            section = section,
            status=status,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new slideshow image: {newSlide.image.public_id}",
        )

        return JsonResponse({'status': 'Slide show image was added successfully.', 'logging': isLoggingSuccess})
    

@transaction.atomic
def editSlideShow(request):
    if request.method == 'POST':
        slideshow = SlideShow.objects.get(slideshowID=request.POST.get('slideshowID'))
        image = request.FILES.get('slideshowImage')
        status = request.POST.get('status')

        slideshow.status = status
        if image:
            slideshow.image = image
        
        slideshow.save()
        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"Edited slideshow image: {slideshow.image.public_id}",
        )

        return JsonResponse({'status': 'Slide show image was edited successfully.', 'logging': isLoggingSuccess})


@transaction.atomic
def deleteSlideShow(request, slideShowID=None):
    if request.method == 'POST':
        slideShowID = slideShowID if slideShowID else request.POST.get('slideshowID')
        slideshow = SlideShow.objects.get(slideshowID=slideShowID)
        slideshow.isActive = 0
        slideshow.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f"Deleted slideshow image: {slideshow.image.public_id}",
        )

        return JsonResponse({'status': 'Slide show image was deleted successfully.', 'logging': isLoggingSuccess})
    

@transaction.atomic
def bulkDeleteSlideShow(request):
    if request.method == 'POST':
        slideshowIDList = request.POST.getlist('slideshowIDList[]')
        for slideshowID in slideshowIDList:
            deleteSlideShow(request, slideshowID)

        return JsonResponse({'status': 'Slide show images were deleted successfully.'})
    

@transaction.atomic
def getMyPUPQCSlideShows(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q(section='mypupqc', isActive=1)
    if search_value:
        filters &= Q(createdTime__icontains=search_value) | Q(status__icontains=search_value)

    slideshows = SlideShow.objects.filter(filters).order_by('-createdTime')
    total_records = SlideShow.objects.filter(section='mypupqc', isActive=1).count()
    filtered_records = slideshows.count()

    # Paginate the data
    slideshows = slideshows[start:start+(length if length != -1 else total_records)]

    slideshows_list = [
        {
            "slideshowID": slideshow.slideshowID,
            "image": slideshow.image.url,
            "createdTime": slideshow.createdTime.strftime("%B %d, %Y"),
            "status": slideshow.status,
        } for slideshow in slideshows
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": slideshows_list,
    })
    

@transaction.atomic
def modifyPUPQCInfo(request):
    if request.method == 'POST':
        infoTitle = request.POST.get('infoTitle')
        infoDescription = request.POST.get('infoDescription')

        MyPUPQCInformation.objects.create(
            infoTitle=infoTitle,
            infoDescription=infoDescription,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Modify",
            actionDesc = f"Modified the information: {infoTitle}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def addService(request):
    if request.method == 'POST':
        serviceName = request.POST.get('serviceName')
        serviceLink = request.POST.get('serviceLink')
        serviceIcon = request.FILES.get('serviceIcon')

        ServicesSection.objects.create(
            serviceName=serviceName,
            serviceLink=serviceLink,
            serviceIcon=serviceIcon,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new service: {serviceName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def editService(request):
    if request.method == 'POST':
        serviceID = request.POST.get('serviceID')
        serviceName = request.POST.get('serviceName')
        serviceLink = request.POST.get('serviceLink')
        serviceIcon = request.FILES.get('serviceIcon')

        service = ServicesSection.objects.get(serviceID=serviceID)
        service.serviceName = serviceName
        service.serviceLink = serviceLink
        if serviceIcon:
            service.serviceIcon = serviceIcon
        service.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"Service has been edited: {serviceName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def deleteService(request):
    if request.method == 'POST':
        serviceID = request.POST.get('serviceID')
        service = ServicesSection.objects.get(serviceID=serviceID)
        service.isActive = 0
        service.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f"Deleted service: {service.serviceName}",
        )

        return JsonResponse({'status': 'Service was deleted successfully.', 'logging': isLoggingSuccess})


def getArticles(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q(isActive=1)
    if search_value:
        filters &= Q(articleTitle__icontains=search_value) | Q(articleDescription__icontains=search_value)

    articles = ArticlesSection.objects.filter(filters).order_by('-createdTime')
    total_records = ArticlesSection.objects.filter(isActive=1).count()
    filtered_records = articles.count()

    # Paginate the data
    articles = articles[start:start+(length if length != -1 else total_records)]

    articles_list = [
        {
            "articleID": article.articleID,
            "title": article.articleTitle,
            "description": article.articleDescription,
            "image": article.articleImage.url,
            "status": article.status,
            "startDate": article.startDate.strftime("%B %d, %Y") if article.startDate else None,
            "endDate": article.endDate.strftime("%B %d, %Y") if article.endDate else None,
            "createdTime": article.createdTime.strftime("%B %d, %Y") if article.createdTime else None,
        } for article in articles
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": articles_list,
    })


@transaction.atomic
def addArticle(request):
    if request.method == 'POST':
        title = request.POST.get('articleTitle')
        description = request.POST.get('articleDescription')
        startDate = request.POST.get('startDate')
        endDate = request.POST.get('endDate')
        status = request.POST.get('status')
        image = request.FILES.get('articleImage')

        ArticlesSection.objects.create(
            articleTitle=title,
            articleDescription=description,
            startDate=startDate,
            endDate=endDate,
            status=status,
            articleImage=image,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new article: {title}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def editArticle(request):
    if request.method == 'POST':
        id = request.POST.get('articleID')
        title = request.POST.get('articleTitle')
        description = request.POST.get('articleDescription')
        startDate = request.POST.get('startDate')
        endDate = request.POST.get('endDate')
        status = request.POST.get('status')
        image = request.FILES.get('articleImage')

        article = ArticlesSection.objects.get(articleID=id)
        article.articleTitle = title
        article.articleDescription = description
        article.startDate = startDate
        article.endDate = endDate
        article.status = status
        if image:
            article.articleImage = image
        article.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"Article has been edited: {title}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def deleteArticle(request, articleID=None):
    if request.method == 'POST':
        articleID = articleID if articleID else request.POST.get('articleID')
        article = ArticlesSection.objects.get(articleID=articleID)
        article.isActive = 0
        article.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f"Deleted article: {article.articleTitle}",
        )

        return JsonResponse({'status': 'Article was deleted successfully.', 'logging': isLoggingSuccess})
    

@transaction.atomic
def bulkDeleteArticle(request):
    if request.method == 'POST':
        articleIDList = request.POST.getlist('articleIDList[]')
        for articleID in articleIDList:
            deleteArticle(request, articleID)

        return JsonResponse({'status': 'Articles were deleted successfully.'})
    

def getFAQs(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q(isActive=1)
    if search_value:
        filters &= Q(question__icontains=search_value) | Q(answer__icontains=search_value)

    faqs = FrequentlyAskedQuestions.objects.filter(filters).order_by('-createdTime')
    total_records = FrequentlyAskedQuestions.objects.filter(isActive=1).count()
    filtered_records = faqs.count()

    # Paginate the data
    faqs = faqs[start:start+(length if length != -1 else total_records)]

    faqs_list = [
        {
            "faqID": faq.faqID,
            "question": faq.question,
            "answer": faq.answer,
            "status": faq.status,
            "createdTime": faq.createdTime.strftime("%B %d, %Y"),
        } for faq in faqs
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": faqs_list,
    })


@transaction.atomic
def addFAQ(request):
    if request.method == 'POST':
        faqQuestion = request.POST.get('question')
        faqAnswer = request.POST.get('answer')

        FrequentlyAskedQuestions.objects.create(
            question=faqQuestion,
            answer=faqAnswer,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new FAQ: {faqQuestion}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def editFAQ(request):
    if request.method == 'POST':
        faqID = request.POST.get('faqID')
        faqQuestion = request.POST.get('faqQuestion')
        faqAnswer = request.POST.get('faqAnswer')

        faq = FrequentlyAskedQuestions.objects.get(faqID=faqID)
        faq.question = faqQuestion
        faq.answer = faqAnswer
        faq.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"FAQ has been edited: {faqQuestion}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def deleteFAQ(request, faqID=None):
    if request.method == 'POST':
        faqID = faqID if faqID else request.POST.get('faqID')
        faq = FrequentlyAskedQuestions.objects.get(faqID=faqID)
        faq.isActive = 0
        faq.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f"Deleted FAQ: {faq.question}",
        )

        return JsonResponse({'status': 'FAQ was deleted successfully.', 'logging': isLoggingSuccess})
    

@transaction.atomic
def bulkDeleteFAQ(request):
    if request.method == 'POST':
        faqIDList = request.POST.getlist('faqIDList[]')
        for faqID in faqIDList:
            deleteFAQ(request, faqID)

        return JsonResponse({'status': 'FAQs were deleted successfully.'})
    

def getHowTo(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q(isActive=1)
    if search_value:
        filters &= Q(howtoName__icontains=search_value) | Q(howtoLink__icontains=search_value)

    howtos = HowToLinks.objects.filter(filters).order_by('-createdTime')
    total_records = HowToLinks.objects.filter(isActive=1).count()
    filtered_records = howtos.count()

    # Paginate the data
    howtos = howtos[start:start+(length if length != -1 else total_records)]

    howtos_list = [
        {
            "howtoID": howto.howtoID,
            "name": howto.howtoName,
            "link": howto.howtoLink,
            "status": howto.status,
            "createdTime": howto.createdTime.strftime("%B %d, %Y"),
        } for howto in howtos
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": howtos_list,
    })


@transaction.atomic
def addHowTo(request):
    if request.method == 'POST':
        name = request.POST.get('howtoName')
        link = request.POST.get('howtoLink')
        status = request.POST.get('status')

        HowToLinks.objects.create(
            howtoName=name,
            howtoLink=link,
            status=status,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Add",
            actionDesc = f"Added HowTo: {name}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def editHowTo(request):
    if request.method == "POST":
        howtoID = request.POST.get('howtoID')
        name = request.POST.get('howtoName')
        link = request.POST.get('howtoLink')
        status = request.POST.get('status')

        howto = HowToLinks.objects.get(howtoID=howtoID)
        howto.howtoName = name
        howto.howtoLink = link
        howto.status = status
        howto.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"Edited HowTo: {name}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def deleteHowTo(request, howtoID=None):
    if request.method == "POST":
        howtoID = howtoID if howtoID else request.POST.get('howtoID')
        howto = HowToLinks.objects.get(howtoID=howtoID)
        howto.isActive = 0
        howto.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f"Deleted HowTo: {howto.howtoName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})


@transaction.atomic
def bulkDeleteHowTo(request):
    if request.method == 'POST':
        howtoIDList = request.POST.getlist('howtoIDList[]')
        for howtoID in howtoIDList:
            deleteHowTo(request, howtoID)

        return JsonResponse({'status': 'HowTos were deleted successfully.'})


# Lazy Loading for DataTables
def getHistoryLogs(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q()
    if search_value:
        filters &= Q(historyID__icontains=search_value) | Q(userType__icontains=search_value) | Q(system__icontains=search_value) | \
                   Q(actionType__icontains=search_value) | Q(actionDescription__icontains=search_value) | Q(createdTime__icontains=search_value) | \
                   Q(userID__user_number__icontains=search_value) | Q(userID__faculty__firstname__icontains=search_value) | Q(userID__faculty__middlename__icontains=search_value) | \
                   Q(userID__faculty__lastname__icontains=search_value) | Q(userID__faculty__suffix__icontains=search_value) | \
                   Q(userID__personnel__firstname__icontains=search_value) | Q(userID__personnel__middlename__icontains=search_value) | \
                   Q(userID__personnel__lastname__icontains=search_value) | Q(userID__personnel__suffix__icontains=search_value)

    historylogs = HistoryLog.objects.filter(filters).order_by('-createdTime')
    total_records = HistoryLog.objects.count()
    filtered_records = historylogs.count()

    # Paginate the data
    historylogs = historylogs.select_related('userID').only(
        'historyID', 'userType', 'system', 'actionType', 'actionDescription', 'createdTime', 'userID'
    )[start:start+(length if length != -1 else total_records)]

    historylogs_list = [
        {
            "historyID": log.historyID,
            "userType": log.userType,
            "system": log.system,
            "actionType": log.actionType,
            "actionDescription": log.actionDescription,
            "date": log.createdTime.strftime("%B %d, %Y"),
            "time": log.createdTime.strftime("%I:%M %p"),
            "userID": log.userID.user_number,
            "user": getFullName(log.userID),
        } for log in historylogs
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": historylogs_list,
    })


def downloadHistoryLogsExcel(request):
    try:
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Activity Logs"

        headers = [
            'historyID',
            'userType',
            'system',
            'actionType',
            'actionDescription',
            'createdTime',
            # 'userID',
            'user',
        ]
        worksheet.append(headers)

        historylogs = HistoryLog.objects.all().order_by('-createdTime')
        for log in historylogs:
            if log.userType == 'Student':
                worksheet.append([
                    log.historyID,
                    log.userType,
                    log.system,
                    log.actionType,
                    log.actionDescription,
                    log.createdTime.replace(tzinfo=None),
                    # (log.userID.user_id),
                    getStudentFullName(log.userID.student),
                ])
            elif log.userType == 'Faculty' or log.userType == 'Admin':
                worksheet.append([
                    log.historyID,
                    log.userType,
                    log.system,
                    log.actionType,
                    log.actionDescription,
                    log.createdTime.replace(tzinfo=None),
                    # (log.userID.user_id),
                    getFacultyFullName(log.userID.faculty),
                ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f"attachment; filename={datetime.now().strftime('%Y-%m-%d')} - Activity Logs.xlsx"
        workbook.save(response)

        return response
    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': str(e)})


# View for Bulk Uploads
def showBulkUploads(request):
    # pending_students = Student.objects.filter(status='Pending', isFromBulkUpload=1, isActive=1)
    # pending_faculties = Faculty.objects.filter(status='Pending', isFromBulkUpload=1, isActive=1)
    programs = Program.objects.all()
    pending_users = PendingAccount.objects.all()

    # pending_users = list(chain(pending_students, pending_faculties))

    context = {
        'pending_users': pending_users,
        'programs': programs,
    }

    return render(request, 'mypupqc/systemAdmin/BulkUploads.html', context)


# Pending accounts from bulk uploads
def getPendingAccounts(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q()
    if search_value:
        filters &= Q(userNumber__icontains=search_value) | Q(lastname__icontains=search_value) | Q(firstname__icontains=search_value) | \
                   Q(middlename__icontains=search_value) | Q(suffix__icontains=search_value) | Q(programShortName__icontains=search_value) | \
                   Q(programName__icontains=search_value) | Q(emailAddress__icontains=search_value) | Q(webMail__icontains=search_value) | \
                   Q(userType__icontains=search_value)

    pending_users = PendingAccount.objects.filter(filters)
    total_records = pending_users.count()
    filtered_records = pending_users.count()

    # Paginate the data
    pending_users = pending_users[start:start+(length if length != -1 else total_records)]

    pending_users_list = [
        {
            "userID": user.userID,
            "userType": user.userType,
            "userNumber": user.userNumber,
            "firstname": user.firstname,
            "middlename": user.middlename,
            "lastname": user.lastname,
            "suffix": user.suffix,
            "dateOfBirth": f"{user.birthYear}-{user.birthMonth}-{user.birthDay}",
            "mobileNo": user.mobileNo,
            "emailAddress": user.emailAddress,
            "webMail": user.webMail,
            "programShortName": user.programShortName,
            "programName": user.programName,
        } for user in pending_users
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": pending_users_list,
    })


def getSpecificPendingAccount(request):
    userID = request.GET.get('userID')
    user = PendingAccount.objects.get(userID=userID)

    return JsonResponse({
        "userType": user.userType,
        "userNumber": user.userNumber,
        "firstname": user.firstname,
        "middlename": user.middlename,
        "lastname": user.lastname,
        "suffix": user.suffix,
        "dateOfBirth": f"{user.birthYear}-{user.birthMonth}-{user.birthDay}",
        "mobileNo": user.mobileNo,
        "emailAddress": user.emailAddress,
        "webMail": user.webMail,
        "programShortName": user.programShortName,
        "programName": user.programName,
    })
            
    
def processBulkUploads(request):
    if request.method != 'POST' or not request.FILES.get('csvFile'):
        return JsonResponse({'status': 'Failed', 'message': 'No file uploaded.'})
    
    try:
        csv_file = request.FILES.get('csvFile')

        if not csv_file.name.endswith('.csv'):
            return JsonResponse({'status': 'Failed', 'message': 'File is not CSV type.'})
        
        decoded_file = csv_file.read().decode('UTF-8').splitlines()
        csv_reader = csv.reader(decoded_file)
        next(csv_reader)  # Skip header row

        failed_rows = []
        total_rows = 0

        for row in csv_reader:
            try:
                with transaction.atomic():
                    # sid = transaction.savepoint()  # Create savepoint

                    user_type, user_number, birthYear, birthMonth, birthDay, mobileNo, \
                    emailAddress, webMail, programShortName, programName, \
                    firstname, middlename, lastname, suffix = row

                    print(f"Inserting: {firstname} {lastname} ({user_number})")
                    total_rows += 1

                    PendingAccount.objects.create(
                        userNumber=user_number,
                        suffix=suffix,
                        lastname=lastname,
                        firstname=firstname,
                        middlename=middlename,
                        birthYear=birthYear,
                        birthMonth=birthMonth,
                        birthDay=birthDay,
                        mobileNo=mobileNo,
                        emailAddress=emailAddress,
                        webMail=webMail,
                        programShortName=programShortName,
                        programName=programName,
                        userType=user_type,
                    )

                    # transaction.savepoint_commit(sid)  # Commit only this row
            except IntegrityError:
                # transaction.savepoint_rollback(sid)  # Rollback only the failed row
                failed_rows.append(row)

        if len(failed_rows) == total_rows:
            return JsonResponse({'status': 'Duplicates', 'message': 'All information already exists', 'failed_rows': len(failed_rows)})
        elif len(failed_rows) > 0:
            return JsonResponse({'status': 'Partial', 'message': 'Some information were already existing or has some problems', 'failed_rows': len(failed_rows)})
        else:
            return JsonResponse({'status': 'Success', 'message': 'All information were successfully added.'})

    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': repr(e)})
    

@transaction.atomic
def activateUploadedAccount(request, userID=None):
    if request.method == 'POST':
        userID = userID if userID else request.POST.get('userID')
        user = PendingAccount.objects.get(userID=userID)

        if user.userType in ['Student', 'Alumni']:
            try:
                print("STUDENT/ ALUMNI")
                program = Program.objects.get(programShortName=user.programShortName)
                programID = program.programID
            except ObjectDoesNotExist:
                program = Program.objects.create(
                    programName=user.programName,
                    programShortName=user.programShortName,
                )
                programID = program.programID

                # history log purposes
                isLoggingSuccess = HistoryLogsController.addHistoryLog(
                    request,
                    system = "MyPUPQC",
                    actionType = "Create",
                    actionDesc = f"Added new program via bulk upload: {user.programName}",
                )

            addStudent(request, isFromBulkUpload=1,
                    isAlumni=1 if user.userType == 'Alumni' else 0,
                    user_number=user.userNumber, 
                    birthYear=str(user.birthYear), 
                    birthMonth=str(user.birthMonth), 
                    birthDay=str(user.birthDay), 
                    mobileNo=user.mobileNo, 
                    emailAddress=user.emailAddress, 
                    webMail=user.webMail,
                    programID=programID, 
                    firstname=user.firstname, 
                    middlename=user.middlename, 
                    lastname=user.lastname)
        elif user.userType == 'Faculty':
            print("FACULTY")
            addFaculty(request, isFromBulkUpload=1,
                    user_number=user.userNumber, 
                    birthYear=str(user.birthYear), 
                    birthMonth=str(user.birthMonth), 
                    birthDay=str(user.birthDay), 
                    mobileNo=user.mobileNo, 
                    emailAddress=user.emailAddress, 
                    webMail=user.webMail, 
                    firstname=user.firstname, 
                    middlename=user.middlename, 
                    lastname=user.lastname,
                    suffix=user.suffix)
        elif user.userType == 'Personnel':
            print("PERSONNEL")
            addPersonnel(request, isFromBulkUpload=1,
                    user_number=user.userNumber, 
                    birthYear=str(user.birthYear), 
                    birthMonth=str(user.birthMonth), 
                    birthDay=str(user.birthDay), 
                    emailAddress=user.emailAddress, 
                    webMail=user.webMail, 
                    firstname=user.firstname, 
                    middlename=user.middlename, 
                    lastname=user.lastname,
                    suffix=user.suffix)

        user.delete()

        return JsonResponse({'status': 'Success'})
    

@transaction.atomic
def bulkActivateUploadedAccount(request):
    if request.method == 'POST':
        userIDs = request.POST.getlist('userIDList[]')
        for userID in userIDs:
            activateUploadedAccount(request, userID=userID)

        return JsonResponse({'status': 'Success'})
        

@transaction.atomic
def editBulkUploadAccount(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        user = PendingAccount.objects.get(userID=userID)
        user.userNumber = request.POST.get('userNumberEdit')
        user.lastname = request.POST.get('lastNameEdit')
        user.firstname = request.POST.get('firstNameEdit')
        user.middlename = request.POST.get('middleInitialEdit')
        user.birthYear = request.POST.get('birthYearEdit')
        user.birthMonth = request.POST.get('birthMonthEdit')
        user.birthDay = request.POST.get('birthDayEdit')
        user.mobileNo = request.POST.get('mobileNoEdit')
        user.emailAddress = request.POST.get('emailAddressEdit')
        user.webMail = request.POST.get('webMailEdit')
        user.programShortName = request.POST.get('programEdit')
        user.isAdmin = request.POST.get('isAdminEdit')
        user.isModerator = request.POST.get('isModeratorEdit')
        user.save()

        return JsonResponse({'status': 'Success'})
    

@transaction.atomic
def deleteBulkUploadAccount(request, userID=None):
    if request.method == 'POST':
        userID = userID if userID else request.POST.get('userID')
        user = PendingAccount.objects.get(userID=userID)
        user.delete()

        return JsonResponse({'status': 'Success'})
    

@transaction.atomic
def bulkDeleteBulkUploadAccounts(request):
    if request.method == 'POST':
        userIDs = request.POST.getlist('userIDList[]')
        for userID in userIDs:
            deleteBulkUploadAccount(request, userID=userID)

        return JsonResponse({'status': 'Success'})


# View for Configure Courses
def configureCourse(request):
    programs = Program.objects.filter(isActive=1)

    context = {
        'programs': programs,
    }

    return render(request, 'mypupqc/systemAdmin/ConfigureCourse.html', context)


# View for Configure Year Level
def configureYearLevel(request):
    schoolYears = SchoolYear.objects.all()

    context = {
        'schoolYears': schoolYears,
    }

    return render(request, 'mypupqc/systemAdmin/ConfigureYearLevel.html', context)


# View for Configure Retained/Archive Accounts
def configureRetainedAccount(request):
    retainedStudentAccounts = Student.objects.filter(isRetained=1)
    retainedFacultyAccounts = Faculty.objects.filter(isRetained=1)

    retainedAccounts = chain(retainedStudentAccounts, retainedFacultyAccounts)

    context = {
        'retainedAccounts': retainedAccounts,
    }

    return render(request, 'mypupqc/systemAdmin/ConfigureRetainedAccountPage.html', context)


# Lazy Loading for DataTables
def getRetainedAccounts(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Query the database with search filtering
    filters = Q(isRetained=1)
    if search_value:
        filters &= Q(firstname__icontains=search_value) | Q(middlename__icontains=search_value) | Q(lastname__icontains=search_value) | \
                   Q(suffix__icontains=search_value) | Q(emailAddress__icontains=search_value) | \
                   Q(credID__user_number__icontains=search_value) | Q(status__icontains=search_value) | Q(createdTime__icontains=search_value)

    retainedStudentAccounts = Student.objects.filter(filters, isRetained=1)
    retainedFacultyAccounts = Faculty.objects.filter(filters, isRetained=1)

    retainedAccounts = list(chain(retainedStudentAccounts, retainedFacultyAccounts))
    total_records = len(retainedAccounts)
    filtered_records = len(retainedAccounts)

    # Paginate the data
    retainedAccounts = retainedAccounts[start:start+(length if length != -1 else total_records)]

    retainedAccounts_list = [
        {
            "userID": account.userID,
            "userType": "Student" if isinstance(account, Student) else "Faculty",
            "userNumber": account.credID.user_number,
            "firstname": account.firstname,
            "middlename": account.middlename,
            "lastname": account.lastname,
            "suffix": account.suffix,
            "dateOfBirth": account.dateOfBirth.strftime("%B %d, %Y"),
            "mobileNo": account.mobileNo,
            "emailAddress": account.emailAddress,
            "webMail": account.webMail,
            "status": account.status,
            "createdTime": account.createdTime.strftime("%B %d, %Y"),
        } for account in retainedAccounts
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": retainedAccounts_list,
    })


@transaction.atomic
def deleteRetainedAccount(request, userID=None, userType=None):
    if request.method == 'POST':
        userID = userID if userID else request.POST.get('userID')
        userType = userType if userType else request.POST.get('userType')

        print("USER ID: ", userID)
        print("USER TYPE: ", userType)

        firstname = None
        middlename = None
        lastname = None
        suffix = None

        if userType in ['Student', 'Alumni']:
            student = Student.objects.get(userID=userID)
            student.isRetained = 2
            student.isActive = 0
            student.save()

            # history log purposes
            firstname = student.firstname
            middlename = student.middlename
            lastname = student.lastname
            suffix = student.suffix

        elif userType in ['Faculty', 'Admin', 'Moderator', 'Academic Head']:
            faculty = Faculty.objects.get(userID=userID)
            faculty.isRetained = 2
            faculty.isActive = 0
            faculty.save()

            # history log purposes
            firstname = faculty.firstname
            middlename = faculty.middlename
            lastname = faculty.lastname
            suffix = faculty.suffix
        
        elif userType == 'Personnel':
            personnel = Personnel.objects.get(userID=userID)
            personnel.isRetained = 2
            personnel.isActive = 0
            personnel.save()

            # history log purposes
            firstname = personnel.firstname
            middlename = personnel.middlename
            lastname = personnel.lastname
            suffix = personnel.suffix

        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f'The account has been permanently deleted: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname} {suffix if suffix else ""}',
        )
        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def bulkDeleteRetainedAccounts(request):
    if request.method == 'POST':
        retainedAccounts = request.POST.getlist('retainedAccounts[]')

        for account in retainedAccounts:
            account = json.loads(account)
            deleteRetainedAccount(request, userID=account['userID'], userType=account['userType'])

        return JsonResponse({'status': 'Success'})


@transaction.atomic
def reactivateRetainedAccount(request, system=None, API=False, userID=None, userType=None):
    if request.method == 'POST':
        userID = userID if userID else request.POST.get('userID')
        userType = userType if userType else request.POST.get('userType')

        print("USER ID: ", userID)
        print("USER TYPE: ", userType)

        user = None

        if userType in ['Student', 'Alumni']:
            student = Student.objects.get(userID=userID)
            student.isRetained = 0
            student.isActive = 1
            student.status = 'Pending'
            student.save()
            user = student.credID
        elif userType in ['Faculty', 'Admin', 'Moderator', 'Academic Head']:
            faculty = Faculty.objects.get(userID=userID)
            faculty.isRetained = 0
            faculty.isActive = 1
            faculty.status = 'Pending'
            faculty.save()
            user = faculty.credID
        elif userType == 'Personnel':
            personnel = Personnel.objects.get(userID=userID)
            personnel.isRetained = 0
            personnel.isActive = 1
            personnel.status = 'Pending'
            personnel.save()
            user = personnel.credID

        user.is_active = 1
        user.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = system if system else "MyPUPQC",
            actionType = "Reactivate",
            actionDesc = f"Reactivated the account of {user.user_number}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def bulkReactivateRetainedAccounts(request):
    if request.method == 'POST':
        retainedAccounts = request.POST.getlist('retainedAccounts[]')

        for account in retainedAccounts:
            account = json.loads(account)
            reactivateRetainedAccount(request, userID=account['userID'], userType=account['userType'])

        return JsonResponse({'status': 'Success'})


# Add Student
@transaction.atomic
def addStudent(request, **kwargs):
    if request.method == 'POST':
        try:
            # customuser
            user_number = request.POST.get('studentNumberAdd') or kwargs['user_number']
            password = generatePassword()
            # password = 'default'

            newUser = CustomUser.objects.create_user(
                user_number=user_number,
                password=password,
            )

        except IntegrityError as ie:
            return JsonResponse({"status": "existing", "message": "Student number already exists."}, status=400)

        # mypupqc_student
        studentNumberID = newUser
        dateOfBirth = buildBirthday(
            request.POST.get('birthYearAdd') or kwargs['birthYear'],
            request.POST.get('birthMonthAdd') or kwargs['birthMonth'],
            request.POST.get('birthDayAdd') or kwargs['birthDay'],
        )
        mobileNo = request.POST.get('mobileNoAdd') or kwargs['mobileNo']
        emailAddress = request.POST.get('emailAddressAdd') or kwargs['emailAddress']
        webMail = request.POST.get('webmailAdd') or kwargs['webMail']
        programID = request.POST.get('programAdd') or kwargs['programID']
        firstname = request.POST.get('firstNameAdd') or kwargs['firstname']
        middlename = request.POST.get('middleNameAdd') or kwargs['middlename']
        lastname = request.POST.get('lastNameAdd') or kwargs['lastname']
        suffix = request.POST.get('suffixAdd') or kwargs.get('suffix', None)

        newStudent = Student.objects.create(
            credID=studentNumberID,
            dateOfBirth=dateOfBirth,
            mobileNo=mobileNo,
            emailAddress=emailAddress,
            webMail=webMail,
            programID=Program.objects.get(programID=programID),
            firstname=firstname,
            middlename=middlename,
            lastname=lastname,
            suffix=suffix,
            isFromBulkUpload = kwargs['isFromBulkUpload'] if 'isFromBulkUpload' in kwargs else 0,
        )

        addPermissionList('Student', istudentID=newUser)

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
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new student: {firstname} {middlename if middlename else ''}{'.' if middlename else ''} {lastname}",
        )

        return JsonResponse({'status': 'Student was registered successfully.', 'logging': isLoggingSuccess})


# Edit Student
@transaction.atomic
def editStudent(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')

        try:
            student = Student.objects.select_related('credID').get(userID=userID)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'Student not found.'}, status=404)

        # Mapping fields to be updated
        fields_to_update = {
            'firstname': request.POST.get('firstNameEdit', ''),
            'middlename': request.POST.get('middleNameEdit', ''),
            'lastname': request.POST.get('lastNameEdit', ''),
            'suffix': request.POST.get('suffixEdit', ''),
            'dateOfBirth': buildBirthday(
                request.POST.get('birthYearEdit'),
                request.POST.get('birthMonthEdit'),
                request.POST.get('birthDayEdit')
            ),
            'mobileNo': request.POST.get('mobileNoEdit', ''),
            'emailAddress': request.POST.get('emailAddressEdit', ''),
            'webMail': request.POST.get('webmailEdit', '')
        }

        # Update fields using setattr
        for field, value in fields_to_update.items():
            setattr(student, field, value)

        # Update student number if provided
        try:
            if request.POST.get('studentNumberEdit'):
                student.credID.user_number = request.POST.get('studentNumberEdit')
                student.credID.save()
        except IntegrityError as ie:
            return JsonResponse({"status": "existing", "message": "Student number already exists."}, status=400)

        student.save()

        # History log
        try:
            isLoggingSuccess = HistoryLogsController.addHistoryLog(
                request,
                system="MyPUPQC",
                actionType="Edit",
                actionDesc=f'Modified student information of: {student.firstname} {student.middlename if student.middlename else ""}{"." if student.middlename else ""} {student.lastname}',
            )
        except Exception as e:
            isLoggingSuccess = False
            print(f"Error logging history: {e}")

        return JsonResponse({'status': 'Student was updated successfully.', 'logging': isLoggingSuccess})
    

# Delete Student
@transaction.atomic
def deleteStudent(request, batchData=None):
    if request.method == 'POST':
        if batchData:
            student = Student.objects.get(userID=batchData)
        else:
            userID = request.POST.get('userID')
            student = Student.objects.get(userID=userID)

        student.isActive = 0
        student.isRetained = 1
        student.save()

        studentCredentials = student.credID
        studentCredentials.is_active = 0
        studentCredentials.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f'Deleted and retained the student account of: {student.firstname} {student.middlename if student.middlename else ""}{"." if student.middlename else ""} {student.lastname}',
        )

        return JsonResponse({'status': 'Student was deleted successfully.', 'logging': isLoggingSuccess})

    
@transaction.atomic
def batchDeleteStudent(request):
    userIDList = request.POST.getlist('userIDList[]')

    for userID in userIDList:
        deleteStudent(request, userID)

    return JsonResponse({'status': 'Success'})
    

@transaction.atomic
def deleteRetainedStudent(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        student = Student.objects.get(userID=userID)
        student.isRetained = 2
        student.save()

        # history log purposes
        firstname = student.firstname
        middlename = student.middlename
        lastname = student.lastname

        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f'The account has been permanently deleted: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname}',
        )

        return JsonResponse({'status': 'Student was deleted successfully.', 'logging': isLoggingSuccess})
    

@transaction.atomic
def transferStudent(request, batchData=None):
    if request.method == 'POST':
        if batchData:
            student = Student.objects.get(userID=batchData)
        else:
            userID = request.POST.get('userID')
            student = Student.objects.get(userID=userID)
            
        student.isAlumni = 1
        student.save()

        try:
            studentPermission = PermissionList.objects.get(studentID=student.userID, permissionName='Student')
            studentPermission.isActive = 0
            studentPermission.save()
        finally:
            PermissionList.objects.create(
                permissionName='Alumni',
                studentID=student.credID,
            )

            # history log purposes
            isLoggingSuccess = HistoryLogsController.addHistoryLog(
                request,
                system = "MyPUPQC",
                actionType = "Transfer",
                actionDesc = f'Student account was converted into Alumni account: {student.firstname} {student.middlename if student.middlename else ""}{"." if student.middlename else ""} {student.lastname}',
            )

            return JsonResponse({'status': 'Student was transferred to Alumni successfully.', 'logging': isLoggingSuccess})


@transaction.atomic
def batchTransferStudent(request):
    userIDList = request.POST.getlist('userIDList[]')

    for userID in userIDList:
        transferStudent(request, userID)

    return JsonResponse({'status': 'Success'})
    

def downloadStudentExcel(request):
    try:
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Students"

        headers = [
            'Last Name',
            'First Name',
            'Middle Name',
            'Suffix',
            'Date of Birth',
            'Mobile Number',
            'Email Address',
            'Webmail',
            'Program',
        ]
        worksheet.append(headers)

        students = Student.objects.filter(isAlumni=0, isActive=1).order_by('-createdTime')
        for student in students:
            worksheet.append([
                student.lastname,
                student.firstname,
                student.middlename,
                student.suffix,
                student.dateOfBirth,
                student.mobileNo,
                student.emailAddress,
                student.webMail,
                student.programID.programName,
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f"attachment; filename={datetime.now().strftime('%Y-%m-%d')} - Students.xlsx"
        workbook.save(response)

        return response
    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': str(e)})


@transaction.atomic
def initAdmin(request, email, accessString):
    if request.method == 'GET':
        # email = request.GET.get('email')
        # accessString = request.GET.get('accessString')

        if not accessString == "PUPQC":
            return JsonResponse({'status': 'Admin initialization failed.'})
        
        try:
            newUser = CustomUser.objects.create_user(
                user_number='admin',
                password='default',
            )

            addPermissionList('Admin', ifacultyID=newUser)
            addPermissionList('Faculty', ifacultyID=newUser)

            facultyNumberID = newUser
            firstname = 'Admin'
            middlename = ''
            lastname = ''
            suffix = ''
            dateOfBirth = datetime.now()
            mobileNo = ''
            emailAddress = email
            webMail = ''

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

            send_email(
                subject='Admin Initialization',
                message=f'The initial admin account has been registered using your email.\n\n' \
                        f'Username: admin \n' \
                        f'Password: default \n' \
                        f'Please change your password as soon as possible.',
                recipient_list=[email],
            )

            return JsonResponse({'status': 'Success'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'User does not exist.'})
            

def downloadAdminExcel(request):
    try:
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Admins"

        headers = [
            'Last Name',
            'First Name',
            'Middle Name',
            'Suffix',
            'Date of Birth',
            'Mobile Number',
            'Email Address',
            'Webmail',
            'Is Admin?',
            'Is Moderator?',
        ]
        worksheet.append(headers)

        faculties = Faculty.objects.filter(credID__facultyPermission__permissionName='Admin',
                                           credID__facultyPermission__isActive=1,
                                           isActive=1).order_by('-createdTime')
        for faculty in faculties:
            worksheet.append([
                faculty.lastname,
                faculty.firstname,
                faculty.middlename,
                faculty.suffix,
                faculty.dateOfBirth,
                faculty.mobileNo,
                faculty.emailAddress,
                faculty.webMail,
                'Yes' if checkExistingPermission('Admin', ifacultyID=faculty.credID) else 'No',
                'Yes' if checkExistingPermission('Moderator', ifacultyID=faculty.credID) else 'No',
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f"attachment; filename={datetime.now().strftime('%Y-%m-%d')} - Admins.xlsx"
        workbook.save(response)

        return response
    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': str(e)})


# Add Faculty
@transaction.atomic
def addFaculty(request, **kwargs):
    if request.method == 'POST':
        # customuser
        user_number = request.POST.get('facultyNumberAdd') or kwargs['user_number']
        password = generatePassword()
        # password = 'default'

        newUser = CustomUser.objects.create_user(
            user_number=user_number,
            password=password,
            # sys_role='Faculty'
        )

        # mypupqc_faculty
        facultyNumberID = newUser
        firstname = request.POST.get('firstNameAdd') or kwargs['firstname']
        middlename = request.POST.get('middleNameAdd') or kwargs['middlename']
        lastname = request.POST.get('lastNameAdd') or kwargs['lastname']
        suffix = request.POST.get('suffixAdd', kwargs.get('suffix', ''))
        dateOfBirth = buildBirthday(
            request.POST.get('birthYearAdd') or kwargs['birthYear'],
            request.POST.get('birthMonthAdd') or kwargs['birthMonth'],
            request.POST.get('birthDayAdd') or kwargs['birthDay'],
        )
        mobileNo = request.POST.get('mobileNoAdd') or kwargs['mobileNo']
        emailAddress = request.POST.get('emailAddressAdd') or kwargs['emailAddress']
        webMail = request.POST.get('webmailAdd') or kwargs['webMail']

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
            isFromBulkUpload = kwargs['isFromBulkUpload'] if 'isFromBulkUpload' in kwargs else 0,
        )

        # Adds necessary permissions based on given roles
        if newFaculty.isFromBulkUpload == 0:
            if int(request.POST.get('isAdmin')) == 1:
                addPermissionList('Admin', ifacultyID=newUser)
            if int(request.POST.get('isModerator')) == 1:
                addPermissionList('Moderator', ifacultyID=newUser)

        # Default faculty permission
        addPermissionList('Faculty', ifacultyID=newUser)

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
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f'Added new faculty: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname}',
        )

    return JsonResponse({'status': 'Faculty was registered successfully.', 'logging': isLoggingSuccess, 'facultyID': newFaculty.userID})


# Edit Faculty
@transaction.atomic
def editFaculty(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        faculty = Faculty.objects.get(userID=userID)

        # The code first checks if the permission exists before updating it
        is_admin = request.POST.get('isAdmin')
        if checkExistingPermission('Admin', ifacultyID=faculty.credID, any=True):
            updatePermissionList('Admin', ifacultyID=faculty.credID, isActive=is_admin)
        elif is_admin:
            addPermissionList('Admin', ifacultyID=faculty.credID)

        is_moderator = request.POST.get('isModerator')
        if checkExistingPermission('Moderator', ifacultyID=faculty.credID, any=True):
            updatePermissionList('Moderator', ifacultyID=faculty.credID, isActive=is_moderator)
        elif is_moderator:
            addPermissionList('Moderator', ifacultyID=faculty.credID)

        # For Acad Head
        is_acad_head = request.POST.get('isAcadHead')
        if is_acad_head:
            if checkExistingPermission('Academic Head', ifacultyID=faculty.credID, any=True):
                updatePermissionList('Academic Head', ifacultyID=faculty.credID, isActive=is_acad_head)
            elif is_acad_head:
                addPermissionList('Academic Head', ifacultyID=faculty.credID)

        if request.POST.get('facultyNumberEdit'):
            faculty.credID.user_number = request.POST.get('facultyNumberEdit')
            faculty.credID.save()

        faculty.firstname = request.POST.get('firstNameEdit')
        faculty.middlename = request.POST.get('middleNameEdit')
        faculty.lastname = request.POST.get('lastNameEdit')
        faculty.suffix = request.POST.get('suffixEdit')
        # faculty.gender = request.POST.get('genderEdit')
        faculty.dateOfBirth = buildBirthday(
            request.POST.get('birthYearEdit'),
            request.POST.get('birthMonthEdit'),
            request.POST.get('birthDayEdit')
        )
        faculty.mobileNo = request.POST.get('mobileNoEdit')
        faculty.emailAddress = request.POST.get('emailAddressEdit')
        faculty.webMail = request.POST.get('webmailEdit')
        faculty.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f'Modified faculty information of: {faculty.firstname} {faculty.middlename if faculty.middlename else ""}{"." if faculty.middlename else ""} {faculty.lastname}',
        )

        return JsonResponse({'status': 'Faculty was updated successfully.', 'logging': isLoggingSuccess})


def getSpecificFacultyRoles(request):
    userID = request.GET.get('userID')
    faculty = Faculty.objects.get(userID=userID)

    isAdmin = checkExistingPermission('Admin', ifacultyID=faculty.credID)
    isModerator = checkExistingPermission('Moderator', ifacultyID=faculty.credID)
    isAcadHead = checkExistingPermission('Academic Head', ifacultyID=faculty.credID)

    return JsonResponse({'isAdmin': isAdmin, 'isModerator': isModerator, 'isAcadHead': isAcadHead})

@transaction.atomic
def editFacultyRoles(request):
    userID = request.POST.get('userID')
    faculty = Faculty.objects.get(userID=userID)

    print("Faculty ID: ", faculty.userID)
    print("isAdmin: ", request.POST.get('isAdmin'))
    print("isModerator: ", request.POST.get('isModerator'))
    print("isAcadHead: ", request.POST.get('isAcadHead'))

    # The code first checks if the permission exists before updating it
    is_admin = request.POST.get('isAdmin')
    if checkExistingPermission('Admin', ifacultyID=faculty.credID, any=True):
        updatePermissionList('Admin', ifacultyID=faculty.credID, isActive=is_admin)
        print(f"Admin permission exists. Changed to zero. is_admin: {is_admin}")
    elif is_admin:
        addPermissionList('Admin', ifacultyID=faculty.credID)

    is_moderator = request.POST.get('isModerator')
    if checkExistingPermission('Moderator', ifacultyID=faculty.credID, any=True):
        updatePermissionList('Moderator', ifacultyID=faculty.credID, isActive=is_moderator)
    elif is_moderator:
        addPermissionList('Moderator', ifacultyID=faculty.credID)

    # For Acad Head
    is_acad_head = request.POST.get('isAcadHead')
    if is_acad_head:
        if checkExistingPermission('Academic Head', ifacultyID=faculty.credID, any=True):
            updatePermissionList('Academic Head', ifacultyID=faculty.credID, isActive=is_acad_head)
        elif is_acad_head:
            addPermissionList('Academic Head', ifacultyID=faculty.credID)

    return JsonResponse({'status': 'Faculty roles were updated successfully.'})
    

# Delete Faculty
@transaction.atomic
def deleteFaculty(request, userID=None, system=None, API=False):
    if request.method == 'POST':
        try:
            userID = userID if userID else request.POST.get('userID')
            faculty = Faculty.objects.get(userID=userID)

            if is_admin(faculty.credID):
                adminCount = len(PermissionList.objects.filter(permissionName='Admin', isActive=1))
                if adminCount == 1:
                    return JsonResponse({'status': 'failed', 'message': 'There must be at least one active admin.'})

            faculty.isActive = 0
            faculty.isRetained = 1
            faculty.save()

            # Disables the account credentials
            facultyCredentials = faculty.credID
            facultyCredentials.is_active = 0
            facultyCredentials.save()


            # history log purposes
            isLoggingSuccess = HistoryLogsController.addHistoryLog(
                request,
                system = system if system is not None else "MyPUPQC",
                actionType = "Delete",
                actionDesc = f'Deleted faculty account of: {faculty.firstname} {faculty.middlename if faculty.middlename else ""}{"." if faculty.middlename else ""} {faculty.lastname}',
            )

            if API:
                return JsonResponse({'status': 'success'})

            return JsonResponse({'status': 'Faculty was deleted successfully.', 'logging': isLoggingSuccess})
        except Faculty.DoesNotExist:
            if API:
                return JsonResponse({'status': 'failed'})
            return JsonResponse({'status': 'Faculty does not exist.'})  

        
@transaction.atomic
def batchDeleteFaculty(request):
    userIDList = request.POST.getlist('userIDList[]')

    for userID in userIDList:
        deleteFaculty(request, userID)

    return JsonResponse({'status': 'Success'})
    

@transaction.atomic
def deleteRetainedFaculty(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        faculty = Faculty.objects.get(userID=userID)
        faculty.isRetained = 2
        faculty.save()

        # history log purposes
        firstname = faculty.firstname
        middlename = faculty.middlename
        lastname = faculty.lastname

        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f'The account has been permanently deleted: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname}',
        )

        return JsonResponse({'status': 'Faculty was deleted successfully.', 'logging': isLoggingSuccess})
    


def downloadFacultyExcel(request):
    try:
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Faculties"

        headers = [
            'Last Name',
            'First Name',
            'Middle Name',
            'Suffix',
            'Date of Birth',
            'Mobile Number',
            'Email Address',
            'Webmail',
            'Is Admin?',
            'Is Moderator?',
        ]
        worksheet.append(headers)

        faculties = Faculty.objects.filter(isActive=1).order_by('-createdTime')
        for faculty in faculties:
            worksheet.append([
                faculty.lastname,
                faculty.firstname,
                faculty.middlename,
                faculty.suffix,
                faculty.dateOfBirth,
                faculty.mobileNo,
                faculty.emailAddress,
                faculty.webMail,
                'Yes' if checkExistingPermission('Admin', ifacultyID=faculty.credID) else 'No',
                'Yes' if checkExistingPermission('Moderator', ifacultyID=faculty.credID) else 'No',
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f"attachment; filename={datetime.now().strftime('%Y-%m-%d')} - Faculties.xlsx"
        workbook.save(response)

        return response
    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': str(e)})
    

# Add Alumni
@transaction.atomic
def addAlumni(request):
    if request.method == 'POST':
        # customuser
        user_number = request.POST.get('studentNumberAdd')
        # password = request.POST.get(generatePassword())
        password = 'default'

        try:
            newUser = CustomUser.objects.create_user(
                user_number=user_number,
                password=password,
                # sys_role='Alumni'
            )
        except IntegrityError as ie:
            return JsonResponse({"status": "existing", "message": "Alumni number already exists."}, status=400)

        # mypupqc_alumni
        studentNumberID = newUser
        firstname = request.POST.get('firstNameAdd')
        middlename = request.POST.get('middleNameAdd')
        lastname = request.POST.get('lastNameAdd')
        # suffix = request.POST.get('suffixAdd')
        # gender = request.POST.get('genderAdd')
        # placeOfBirth = request.POST.get('birthPlaceAdd')
        dateOfBirth = buildBirthday(
            request.POST.get('birthYearAdd'),
            request.POST.get('birthMonthAdd'),
            request.POST.get('birthDayAdd')
        )
        programID=request.POST.get('programAdd')
        mobileNo = request.POST.get('mobileNoAdd')
        emailAddress = request.POST.get('emailAddressAdd')
        webMail = request.POST.get('webmailAdd')
        # residentAddress = request.POST.get('resAddressAdd')
        # permanentAddress = request.POST.get('permAddressAdd')

        newAlumni = Student.objects.create(
            credID=studentNumberID,
            firstname=firstname,
            middlename=middlename,
            lastname=lastname,
            # suffix=suffix,
            # gender=gender,
            # placeOfBirth=placeOfBirth,
            dateOfBirth=dateOfBirth,
            mobileNo=mobileNo,
            emailAddress=emailAddress,
            webMail=webMail,
            programID=Program.objects.get(programID=programID),
            # residentAddress=residentAddress,
            # permanentAddress=permanentAddress,
            isAlumni = 1,
            isActive = 1,
        )

        addPermissionList('Alumni', istudentID=newUser)

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
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f'Added new alumni: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname}',
        )

    return JsonResponse({'status': 'Alumni was registered successfully.', 'logging': isLoggingSuccess})


# Edit Alumni
@transaction.atomic
def editAlumni(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')

        alumni = Student.objects.get(userID=userID)

        try:
            if request.POST.get('studentNumberEdit'):
                alumni.credID.user_number = request.POST.get('studentNumberEdit')
                alumni.credID.save()
        except IntegrityError as ie:
            return JsonResponse({"status": "existing", "message": "Alumni number already exists."}, status=400)

        alumni.firstname = request.POST.get('firstNameEdit')
        alumni.middlename = request.POST.get('middleNameEdit')
        alumni.lastname = request.POST.get('lastNameEdit')
        alumni.suffix = request.POST.get('suffixEdit')
        alumni.dateOfBirth = buildBirthday(
            request.POST.get('birthYearEdit'),
            request.POST.get('birthMonthEdit'),
            request.POST.get('birthDayEdit')
        )
        alumni.mobileNo = request.POST.get('mobileNoEdit')
        alumni.emailAddress = request.POST.get('emailAddressEdit')
        alumni.webMail = request.POST.get('webmailEdit')
        alumni.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f'Edited alumni information of: {alumni.firstname} {alumni.middlename if alumni.middlename else ""}{"." if alumni.middlename else ""} {alumni.lastname}',
        )

        return JsonResponse({'status': 'Alumni was updated successfully.', 'logging': isLoggingSuccess})
    

# Delete Alumni
@transaction.atomic
def deleteAlumni(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        alumni = Student.objects.get(userID=userID)
        alumni.isActive = 0
        alumni.isRetained = 1
        alumni.save()

        alumniCredentials = alumni.credID
        alumniCredentials.is_active = 0
        alumniCredentials.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f'Deleted the alumni account of: {alumni.firstname} {alumni.middlename if alumni.middlename else ""}{"." if alumni.middlename else ""} {alumni.lastname}',
        )

        return JsonResponse({'status': 'Alumni was removed successfully.', 'logging': isLoggingSuccess})
    

def downloadAlumniExcel(request):
    try:
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Alumni"

        headers = [
            'Last Name',
            'First Name',
            'Middle Name',
            'Suffix',
            'Date of Birth',
            'Mobile Number',
            'Email Address',
            'Webmail',
            'Program',
        ]
        worksheet.append(headers)

        alumni = Student.objects.filter(isAlumni=1, isActive=1).order_by('-createdTime')
        for alumnus in alumni:
            worksheet.append([
                alumnus.lastname,
                alumnus.firstname,
                alumnus.middlename,
                alumnus.suffix,
                alumnus.dateOfBirth,
                alumnus.mobileNo,
                alumnus.emailAddress,
                alumnus.webMail,
                alumnus.programID.programName,
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f"attachment; filename={datetime.now().strftime('%Y-%m-%d')} - Alumni.xlsx"
        workbook.save(response)

        return response
    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': str(e)})
    

def getNonAdminFaculty(request):
    if request.method == 'GET':
        faculty = Faculty.objects.filter(isActive=1).exclude(credID__facultyPermission__permissionName='Admin', credID__facultyPermission__isActive=1)
        nonAcadHead = Faculty.objects.filter(isActive=1).exclude(credID__facultyPermission__permissionName='Academic Head', credID__facultyPermission__isActive=1)

        facultyList = []
        seen_user_ids = set()

        for f in faculty:
            if f.userID not in seen_user_ids:
                facultyList.append({
                    'userID': f.userID,
                    'firstname': f.firstname,
                    'middlename': f.middlename,
                    'lastname': f.lastname,
                    'suffix': f.suffix,
                })
                seen_user_ids.add(f.userID)

        for f in nonAcadHead:
            if f.userID not in seen_user_ids:
                facultyList.append({
                    'userID': f.userID,
                    'firstname': f.firstname,
                    'middlename': f.middlename,
                    'lastname': f.lastname,
                    'suffix': f.suffix,
                })
                seen_user_ids.add(f.userID)

        return JsonResponse({'facultyList': facultyList}, safe=False)

# Add Admin
@transaction.atomic
def addAdmin(request):
    if request.method == 'POST':
        facultyID = request.POST.get('facultyID')
        faculty = Faculty.objects.get(userID=facultyID)

        # For Admin
        # is_admin = int(request.POST.get('isOSASEdit'))
        is_admin = 1
        if checkExistingPermission('Admin', ifacultyID=faculty.credID):
            updatePermissionList('Admin', ifacultyID=faculty.credID, isActive=is_admin)
        elif is_admin:
            addPermissionList('Admin', ifacultyID=faculty.credID)

        # For Acad Head
        is_acad_head = int(request.POST.get('isAcadHeadEdit'))
        if checkExistingPermission('Academic Head', ifacultyID=faculty.credID):
            updatePermissionList('Academic Head', ifacultyID=faculty.credID, isActive=is_acad_head)
        elif is_acad_head:
            addPermissionList('Academic Head', ifacultyID=faculty.credID)

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Modify",
            actionDesc = f'Added new admin: {faculty.firstname} {faculty.middlename if faculty.middlename else ""}{"." if faculty.middlename else ""} {faculty.lastname}',
        )

        return JsonResponse({'status': 'Admin was added successfully.', 'logging': isLoggingSuccess, 'isAdmin': is_admin, 'isAcadHead': is_acad_head})
    

@transaction.atomic
def addPersonnel(request, **kwargs):
    if request.method == 'POST':
        # customuser
        user_number = request.POST.get('personnelNumberAdd') or kwargs.get('user_number', '')
        password = generatePassword()
        # password = 'default'

        try:
            newUser = CustomUser.objects.create_user(
                user_number=user_number,
                password=password,
            )
        except IntegrityError as ie:
            return JsonResponse({"status": "existing", "message": "Personnel number already exists."}, status=400)

        # mypupqc_faculty
        personnelNumberID = newUser
        firstname = request.POST.get('firstNameAdd') or kwargs.get('firstname', '')
        middlename = request.POST.get('middleNameAdd') or kwargs.get('middlename', '')
        lastname = request.POST.get('lastNameAdd') or kwargs.get('lastname', '')
        suffix = request.POST.get('suffixAdd', kwargs.get('suffix', ''))
        dateOfBirth = buildBirthday(
            request.POST.get('birthYearAdd') or kwargs.get('birthYear', ''),
            request.POST.get('birthMonthAdd') or kwargs.get('birthMonth', ''),
            request.POST.get('birthDayAdd') or kwargs.get('birthDay', ''),
        )
        mobileNo = request.POST.get('mobileNoAdd') or kwargs.get('mobileNo', '')
        emailAddress = request.POST.get('emailAddressAdd') or kwargs.get('emailAddress', '')
        webMail = request.POST.get('webmailAdd') or kwargs.get('webMail', '')
        remarks = request.POST.get('remarksAdd', kwargs.get('remarks', ''))

        newPersonnel = Personnel.objects.create(
            credID=personnelNumberID,
            firstname=firstname,
            middlename=middlename,
            lastname=lastname,
            suffix=suffix,
            dateOfBirth=dateOfBirth,
            mobileNo=mobileNo,
            emailAddress=emailAddress,
            webMail=webMail,
            remarks=remarks,
            isFromBulkUpload=kwargs.get('isFromBulkUpload', 0),
        )

        if int(request.POST.get('isAcadHead', 0)) == 1:
            addPermissionList('Academic Head', ipersonnelID=newUser)
        if int(request.POST.get('isAdmin', 0)) == 1:
            addPermissionList('Admin', ipersonnelID=newUser)

        # Default personnel permission
        addPermissionList('Personnel', ifacultyID=newUser)

        email_sent = send_email(
            subject='Account Registration',
            message=f'Your account has been successfully registered.\n\n'
                    f'Username: {user_number} \n'
                    f'Password: {password} \n'
                    f'Please change your password as soon as possible.',
            recipient_list=[emailAddress, webMail],
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system="MyPUPQC",
            actionType="Create",
            actionDesc=f'Added new personnel: {firstname} {middlename if middlename else ""}{"." if middlename else ""} {lastname}',
        )

    return JsonResponse({'status': 'Personnel was registered successfully.', 'logging': isLoggingSuccess, 'facultyID': newPersonnel.userID})


@transaction.atomic
def editPersonnel(response):
    if response.method == 'POST':
        userID = response.POST.get('userID')
        personnel = Personnel.objects.get(userID=userID)

        # The code first checks if the permission exists before updating it
        is_admin = response.POST.get('isAdmin')
        if checkExistingPermission('Admin', ifacultyID=personnel.credID, any=True):
            updatePermissionList('Admin', ifacultyID=personnel.credID, isActive=is_admin)
        elif is_admin:
            addPermissionList('Admin', ifacultyID=personnel.credID)

        is_acad_head = response.POST.get('isAcadHead')
        if checkExistingPermission('Academic Head', ifacultyID=personnel.credID, any=True):
            updatePermissionList('Academic Head', ifacultyID=personnel.credID, isActive=is_acad_head)
        elif is_acad_head:
            addPermissionList('Academic Head', ifacultyID=personnel.credID)

        try:
            if response.POST.get('personnelNumberEdit'):
                personnel.credID.user_number = response.POST.get('personnelNumberEdit')
                personnel.credID.save()
        except IntegrityError as ie:
            return JsonResponse({"status": "existing", "message": "Personnel number already exists."}, status=400)

        personnel.firstname = response.POST.get('firstNameEdit')
        personnel.middlename = response.POST.get('middleNameEdit')
        personnel.lastname = response.POST.get('lastNameEdit')
        personnel.suffix = response.POST.get('suffixEdit')
        personnel.dateOfBirth = buildBirthday(
            response.POST.get('birthYearEdit'),
            response.POST.get('birthMonthEdit'),
            response.POST.get('birthDayEdit')
        )
        personnel.mobileNo = response.POST.get('mobileNoEdit')
        personnel.emailAddress = response.POST.get('emailAddressEdit')
        personnel.webMail = response.POST.get('webmailEdit')
        personnel.remarks = response.POST.get('remarksEdit')
        personnel.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            response,
            system="MyPUPQC",
            actionType="Edit",
            actionDesc=f'Modified personnel information of: {personnel.firstname} {personnel.middlename if personnel.middlename else ""}{"." if personnel.middlename else ""} {personnel.lastname}',
        )

        return JsonResponse({'status': 'Personnel was updated successfully.', 'logging': isLoggingSuccess})
    

def getSpecificPersonnelRoles(request):
    userID = request.GET.get('userID')
    personnel = Personnel.objects.get(userID=userID)

    isAdmin = checkExistingPermission('Admin', ipersonnelID=personnel.credID)
    isAcadStaff = checkExistingPermission('Academic Staff', ipersonnelID=personnel.credID)
    isAcadHead = checkExistingPermission('Academic Head', ipersonnelID=personnel.credID)

    return JsonResponse({'isAdmin': isAdmin, 'isAcadStaff': isAcadStaff, 'isAcadHead': isAcadHead})

@transaction.atomic
def editPersonnelRoles(request):
    userID = request.POST.get('userID')
    personnel = Personnel.objects.get(userID=userID)

    print("Personnel ID: ", personnel.userID)
    print("isAdmin: ", request.POST.get('isAdmin'))
    print("isAcadStaff: ", request.POST.get('isAcadStaff'))
    print("isAcadHead: ", request.POST.get('isAcadHead'))

    # The code first checks if the permission exists before updating it
    is_admin = request.POST.get('isAdmin')
    if checkExistingPermission('Admin', ipersonnelID=personnel.credID, any=True):
        updatePermissionList('Admin', ipersonnelID=personnel.credID, isActive=is_admin)
        print(f"Admin permission exists. Changed to zero. is_admin: {is_admin}")
    elif is_admin:
        addPermissionList('Admin', ipersonnelID=personnel.credID)

    is_acad_staff = request.POST.get('isAcadStaff')
    if checkExistingPermission('Academic Staff', ipersonnelID=personnel.credID, any=True):
        updatePermissionList('Academic Staff', ipersonnelID=personnel.credID, isActive=is_acad_staff)
    elif is_acad_staff:
        addPermissionList('Academic Staff', ipersonnelID=personnel.credID)

    # For Acad Head
    is_acad_head = request.POST.get('isAcadHead')
    if is_acad_head:
        if checkExistingPermission('Academic Head', ipersonnelID=personnel.credID, any=True):
            updatePermissionList('Academic Head', ipersonnelID=personnel.credID, isActive=is_acad_head)
        elif is_acad_head:
            addPermissionList('Academic Head', ipersonnelID=personnel.credID)

    return JsonResponse({'status': 'Faculty roles were updated successfully.'})


@transaction.atomic
def deletePersonnel(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        personnel = Personnel.objects.get(userID=userID)
        personnel.isActive = 0
        personnel.isRetained = 1
        personnel.save()

        personnelCredentials = personnel.credID
        personnelCredentials.is_active = 0
        personnelCredentials.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system="MyPUPQC",
            actionType="Delete",
            actionDesc=f'Deleted the personnel account of: {personnel.firstname} {personnel.middlename if personnel.middlename else ""}{"." if personnel.middlename else ""} {personnel.lastname}',
        )

        return JsonResponse({'status': 'Personnel was removed successfully.', 'logging': isLoggingSuccess})
    

@transaction.atomic
def batchDeletePersonnel(request):
    userIDList = request.POST.getlist('userIDList[]')

    for userID in userIDList:
        deletePersonnel(request, userID)

    return JsonResponse({'status': 'Success'})


# Admin CRUD
@transaction.atomic
def addOrganization(request):
    if request.method == 'POST':
        organizationName = request.POST.get('orgName')
        organizationDescription = request.POST.get('orgDescription')
        organizationType = request.POST.get('orgType')
        organizationAdviser = request.POST.get('orgAdviser')
        organizationTag = request.POST.get('orgTag')
        organizationTagColor = request.POST.get('orgTagColor')

        Organization.objects.create(
            organizationName=organizationName,
            organizationDescription=organizationDescription,
            organizationType=organizationType,
            organizationAdviser=organizationAdviser,
            organizationTag=organizationTag,
            organizationTagColor=organizationTagColor,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new organization: {organizationName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def editOrganization(request):
    if request.method == 'POST':
        organizationID = request.POST.get('orgID')
        organizationName = request.POST.get('orgName')
        organizationDescription = request.POST.get('orgDescription')
        organizationType = request.POST.get('orgType')
        organizationAdviser = request.POST.get('orgAdviser')
        organizationTag = request.POST.get('orgTag')
        organizationTagColor = request.POST.get('orgTagColor')

        org = Organization.objects.get(organizationID=organizationID)
        org.organizationName = organizationName
        org.organizationDescription = organizationDescription
        org.organizationType = organizationType
        org.organizationAdviser = organizationAdviser
        org.organizationTag = organizationTag
        org.organizationTagColor = organizationTagColor
        org.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"Edited organization information of: {organizationName}",
        )
        
        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

def getActiveProgram(request):
    isActive = request.GET.get('isActive', 1)
    programs = Program.objects.filter(isActive=1) if isActive == 1 else Program.objects.all()
    programList = []

    for program in programs:
        programList.append({
            'programID': program.programID,
            'programName': program.programName,
            'programShortName': program.programShortName,
            'createdTime': program.createdTime.strftime("%B %d, %Y"),
        })

    return JsonResponse(programList, safe=False)


@transaction.atomic
def addProgram(request):
    if request.method == 'POST':
        programName = request.POST.get('programName')
        programShortName = request.POST.get('programShortName')

        Program.objects.create(
            programName=programName,
            programShortName=programShortName,
            isActive=1,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new program: {programName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})


@transaction.atomic
def editProgram(request):
    if request.method == 'POST':
        programID = request.POST.get('programID')
        programName = request.POST.get('programName')
        programShortName = request.POST.get('programShortName')

        program = Program.objects.get(programID=programID)
        program.programName = programName
        program.programShortName = programShortName
        program.isActive = 1
        program.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Edit",
            actionDesc = f"Edited program information of: {programName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def deleteProgram(request, programID=None):
    if request.method == 'POST':
        programID = programID if programID else request.POST.get('programID')
        program = Program.objects.get(programID=programID)
        program.isActive = 0
        program.save()

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Delete",
            actionDesc = f'Deleted program: {program.programName}',
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})
    

@transaction.atomic
def bulkDeleteProgram(request):
    programIDList = request.POST.getlist('programIDList[]')

    for programID in programIDList:
        deleteProgram(request, programID)

    return JsonResponse({'status': 'Success'})
    

@transaction.atomic
def addSchoolYear(request):
    if request.method == 'POST':
        schoolYearName = request.POST.get('schoolYear')

        SchoolYear.objects.create(
            schoolYear = schoolYearName,
        )

        # history log purposes
        isLoggingSuccess = HistoryLogsController.addHistoryLog(
            request,
            system = "MyPUPQC",
            actionType = "Create",
            actionDesc = f"Added new year level: {schoolYearName}",
        )

        return JsonResponse({'status': 'Success', 'logging': isLoggingSuccess})


def getSpecificUser(request):
    if request.method == 'POST':
        userID = request.POST.get('userID')
        userRole = request.POST.get('userRole')
        
        if userRole in ['Student', 'Alumni']:
            student = Student.objects.select_related('credID', 'programID').get(userID=userID)
            user_dict = {
                'firstname': student.firstname,
                'middlename': student.middlename,
                'lastname': student.lastname,
                'suffix': student.suffix,
                'studentNumber': student.credID.user_number,
                'dateOfBirth': student.dateOfBirth,
                'mobileNo': student.mobileNo,
                'emailAddress': student.emailAddress,
                'webMail': student.webMail,
                'programID': student.programID.programID
            }
        elif userRole == 'Faculty':
            faculty = Faculty.objects.select_related('credID').get(userID=userID)
            permissions = list(PermissionList.objects.filter(facultyID=faculty.credID, isActive=1).order_by('permissionName').values_list('permissionName', flat=True))
            user_dict = {
                'firstname': faculty.firstname,
                'middlename': faculty.middlename,
                'lastname': faculty.lastname,
                'suffix': faculty.suffix,
                'facultyNumber': faculty.credID.user_number,
                'dateOfBirth': faculty.dateOfBirth,
                'mobileNo': faculty.mobileNo,
                'emailAddress': faculty.emailAddress,
                'webMail': faculty.webMail,
                'permissions': permissions,
            }
        elif userRole == 'Personnel':
            personnel = Personnel.objects.select_related('credID').get(userID=userID)
            permissions = list(PermissionList.objects.filter(facultyID=personnel.credID, isActive=1).order_by('permissionName').values_list('permissionName', flat=True))
            user_dict = {
                'firstname': personnel.firstname,
                'middlename': personnel.middlename,
                'lastname': personnel.lastname,
                'suffix': personnel.suffix,
                'personnelNumber': personnel.credID.user_number,
                'dateOfBirth': personnel.dateOfBirth,
                'mobileNo': personnel.mobileNo,
                'emailAddress': personnel.emailAddress,
                'webMail': personnel.webMail,
                'permissions': permissions,
                'remarks': personnel.remarks,
            }
        else:
            return JsonResponse({'status': 'Invalid user role'}, status=400)

        return JsonResponse(user_dict)
    return JsonResponse({'status': 'Invalid request method'}, status=405)


def getPendingUser(request):
    if request.method == "POST":
        userID = request.POST.get('userID')

        user = PendingAccount.objects.get(userID=userID)
        user_dict = {
            'userNumber': user.userNumber,
            'lastname': user.lastname,
            'firstname': user.firstname,
            'middlename': user.middlename,
            'birthYear': user.birthYear,
            'birthMonth': user.birthMonth,
            'birthDay': user.birthDay,
            'mobileNo': user.mobileNo,
            'emailAddress': user.emailAddress,
            'webMail': user.webMail,
            'programShortName': user.programShortName,
            'isAdmin': user.isAdmin,
            'isModerator': user.isModerator,
        }

        return JsonResponse(user_dict)


def getSpecificOrganization(request):
    if request.method == 'POST':
        orgID = request.POST.get('orgID')
        org = Organization.objects.get(organizationID=orgID)
        orgMembers = []
        orgPosts = []

        orgMembersList = StudentsOrganization.objects.filter(organizationID=org.organizationID).select_related('studentID')
        for member in orgMembersList:
            orgMembers.append({
                'studentNumber': member.studentID.studentNumberID.user_number,
                'joinedDate': (member.joinedTime).strftime('%Y-%m-%d'),
                'joinedTime': (member.joinedTime).strftime('%I:%M:%S %p'),
            })

        orgPostsLists = Post.objects.filter(postLabel=orgID).order_by('-createdTime')
        for post in orgPostsLists:
            orgPosts.append({
                'postID': post.postID,
                'postContent': post.postContent,
                'postImages': post.postImages,
                'postAuthorID': post.postAuthorID.user_number,
                'createdDate': post.createdTime.strftime('%Y-%m-%d'),
                'createdTime': post.createdTime.strftime('%I:%M:%S %p'),
                'evaluatedDate': post.evaluatedTime.strftime('%Y-%m-%d'),
                'evaluatedTime': post.evaluatedTime.strftime('%I:%M:%S %p'),
                'postStatus': post.postStatus,
            })

        org = serializers.serialize('json', [org])
        orgMembers = json.dumps(orgMembers)
        orgPosts = json.dumps(orgPosts)

        return JsonResponse({
            'org': org,
            'orgMembers': orgMembers,
            'orgPosts': orgPosts,
        })
    

def getSpecificProgram(request):
    if request.method == 'GET':
        program = Program.objects.get(programID=request.GET.get('programID'))

        program_dict = {
            'programID': program.programID,
            'programName': program.programName,
            'programShortName': program.programShortName,
        }

        return JsonResponse(program_dict)
    

def getSpecificInfo(request):
    if request.method == 'GET':
        info = MyPUPQCInformation.objects.latest('createdTime')

        info_dict = {
            'infoTitle': info.infoTitle,
            'infoDescription': info.infoDescription,
        }

        return JsonResponse(info_dict)
    

def getSpecificService(request):
    if request.method == 'POST':
        service = ServicesSection.objects.get(serviceID=request.POST.get('serviceID'))

        service_dict = {
            'serviceID': service.serviceID,
            'serviceName': service.serviceName,
            'serviceLink': service.serviceLink,
            'serviceIcon': service.serviceIcon.url,
        }

        return JsonResponse(service_dict)
    

def getSpecificArticle(request):
    if request.method == 'GET':
        article = ArticlesSection.objects.get(articleID=request.GET.get('articleID'))

        article_dict = {
            'articleID': article.articleID,
            'articleTitle': article.articleTitle,
            'articleDescription': article.articleDescription,
            'articleImage': article.articleImage.url,
            'articleStartDate': article.startDate.strftime('%Y-%m-%d') if article.startDate else '',
            'articleEndDate': article.endDate.strftime('%Y-%m-%d') if article.endDate else '',
            'articleStatus': article.status,
        }

        return JsonResponse(article_dict)
    

def getSpecificFAQ(request):
    if request.method == 'POST':
        faq = FrequentlyAskedQuestions.objects.get(faqID=request.POST.get('faqID'))

        faq_dict = {
            'faqID': faq.faqID,
            'question': faq.question,
            'answer': faq.answer
        }

        return JsonResponse(faq_dict)
    

def getSpecificHowTo(request):
    if request.method == 'POST':
        howTo = HowToLinks.objects.get(howtoID=request.POST.get('howtoID'))

        howTo_dict = {
            'howtoID': howTo.howtoID,
            'howtoName': howTo.howtoName,
            'howtoLink': howTo.howtoLink,
        }

        return JsonResponse(howTo_dict)