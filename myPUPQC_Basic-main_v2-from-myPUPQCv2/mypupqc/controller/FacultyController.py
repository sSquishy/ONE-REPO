from django.http import JsonResponse
from django.shortcuts import render
from django.db import transaction
from django.core.paginator import Paginator, EmptyPage

from mypupqc.models import *
from mypupqc.helper import *

from datetime import datetime
import json, openpyxl
from django.http import HttpResponse


#Faculty Method
def getFacultyProfile(request):
    userID = request.user
    faculty = Faculty.objects.get(credID=userID)
    facultyData = {
        "fullname": getFacultyFullName(faculty),
        "facultyNumber": faculty.credID.user_number,
        "dateOfBirth": faculty.dateOfBirth.strftime("%B %d, %Y"),
        "mobileNumber": faculty.mobileNo,
        "emailAddress": faculty.emailAddress,
        "webMail": faculty.webMail,
    }

    return JsonResponse(facultyData)


def getPosts(request):
    page = int(request.GET.get('page', 1))
    postsPerPage = 5

    posts = Post.objects.filter(isActive='1', postStatus="Approved").order_by('-evaluatedTime')
    paginator = Paginator(posts, postsPerPage)

    try:
        paginated_posts = paginator.page(page)
    except EmptyPage:
        return JsonResponse({"posts": [], "hasMore": False})

    postsData = [
        {
            "postID": post.postID,
            "postAuthor": getFullName(post.postAuthorID),
            "postContent": post.postContent,
            "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=post)],
            "evaluatedTime": post.evaluatedTime,
        } for post in paginated_posts
    ]

    return JsonResponse({"posts": postsData, "hasMore": paginated_posts.has_next()})


# Faculty CRUD
@transaction.atomic
def createPost(request):
    if request.method == 'POST':
        postContent = request.POST.get('postBody')
        postLabelID = request.POST.get('postLabel')
        postImages = request.FILES.get('postImages')
        # postImages = request.FILES.getlist('postImages')

        post = Post.objects.create(
            postContent=postContent,
            # postLabel=program,
            postAuthorID=request.user,
            postPage='Faculty',
        )

        # for image in postImages:
        #     PostImages.objects.create(
        #         imageLink=image,
        #         postID=post,
        #     )

        if postImages:
            PostImages.objects.create(
                imageLink=postImages,
                postID=post,
            )

        return JsonResponse({'status': 'Success'})
    return JsonResponse({'status': 'Failed'})


def getSpecificPost(request):
    if request.method == 'POST':
        postID = request.POST.get('postID')
        post = Post.objects.get(postID=postID)

        post = {
            'postID': post.postID,
            'postContent': post.postContent,
            # 'postImages': post.postImages,
            'postAuthorID': post.postAuthorID.user_number,
            'createdTime': post.createdTime,
            'postStatus': post.postStatus,
        }

        return JsonResponse({'post': post})
    

def getPendingPosts(request):
    page = int(request.GET.get('page', 1))
    search = request.GET.get('search', None)
    postsPerPage = 5

    posts = Post.objects.filter(
        isActive='1', postStatus="Pending",
        postContent__icontains=search if search else ''
    ).order_by('-createdTime')
    paginator = Paginator(posts, postsPerPage)

    if page > paginator.num_pages:
        return JsonResponse({"posts": [], "hasMore": False})
    
    postsData = [
        {
            "postID": post.postID,
            "postAuthor": getFullName(post.postAuthorID),
            "postContent": post.postContent,
            "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=post)],
            "createdTime": post.createdTime,
        } for post in paginator.get_page(page)
    ]

    return JsonResponse({"posts": postsData, "hasMore": paginator.num_pages > page})


def getApprovedPosts(request):
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    posts = Post.objects.filter(isActive='1', postStatus="Approved", postContent__icontains=search_value).order_by('-evaluatedTime')
    total_posts = posts.count()

    posts = posts[start:start + length]

    postsData = [
        {
            "postID": post.postID,
            "postAuthor": getFullName(post.postAuthorID),
            "postAuthorID": post.postAuthorID.user_number,
            "postContent": post.postContent,
            "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=post)],
            "evaluatedTime": post.evaluatedTime.strftime("%B %d, %Y %I:%M %p"),
            "createdTime": post.createdTime.strftime("%B %d, %Y %I:%M %p"),
        } for post in posts
    ]

    return JsonResponse({
        "draw": int(request.GET.get('draw', 1)),
        "recordsTotal": total_posts,
        "recordsFiltered": total_posts,
        "data": postsData
    })


def getRejectedPosts(request):
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    posts = Post.objects.filter(isActive='1', postStatus="Declined", postContent__icontains=search_value).order_by('-evaluatedTime')
    total_posts = posts.count()

    posts = posts[start:start + length]

    postsData = [
        {
            "postID": post.postID,
            "postAuthor": getFullName(post.postAuthorID),
            "postAuthorID": post.postAuthorID.user_number,
            "postContent": post.postContent,
            "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=post)],
            "evaluatedTime": post.evaluatedTime.strftime("%B %d, %Y %I:%M %p"),
            "createdTime": post.createdTime.strftime("%B %d, %Y %I:%M %p"),
        } for post in posts
    ]

    return JsonResponse({
        "draw": int(request.GET.get('draw', 1)),
        "recordsTotal": total_posts,
        "recordsFiltered": total_posts,
        "data": postsData
    })


def getFlaggedPosts(request):
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    posts = Post.objects.filter(isActive='1', postStatus="Flagged", postContent__icontains=search_value).order_by('-evaluatedTime')
    total_posts = posts.count()

    posts = posts[start:start + length]

    postsData = [
        {
            "postID": post.postID,
            "postAuthor": getFullName(post.postAuthorID),
            "postAuthorID": post.postAuthorID.user_number,
            "postContent": post.postContent,
            "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=post)],
            "evaluatedTime": post.evaluatedTime.strftime("%B %d, %Y %I:%M %p"),
            "createdTime": post.createdTime.strftime("%B %d, %Y %I:%M %p"),
        } for post in posts
    ]

    return JsonResponse({
        "draw": int(request.GET.get('draw', 1)),
        "recordsTotal": total_posts,
        "recordsFiltered": total_posts,
        "data": postsData
    })


def emailReport(request, post, reasons):
    # Create a PostReportFlags object
    reportTitle = reasons.get('title', None)
    reportDescription = reasons.get('description', None)
    reportCategory = reasons.get('category', None)

    # Add the flag reasons to the email message
    emailMessage = f"Your post has been flagged by the moderator." \
                    f"\n\nPost Content: \n{post.postContent}" \
                    f"\n\nFlag Reasons:" \
                    f"\n- Report Title: {reportTitle}" \
                    f"\n- Report Description: {reportDescription}" \
                    f"\n- Report Category: {reportCategory}"
    
    flag = PostReportFlags.objects.create(
                reportTitle=reportTitle,
                reportDescription=reportDescription,
                reportCategory=reportCategory,
            )
    
    # Add the flag to the post
    post.postStatus = 'Flagged'
    post.reportID = flag

    # Notify author about evaluation
    email_success = True
    try:
        send_email(
            subject= "Post Evaluation",
            message = emailMessage,
            recipient_list = [getPostAuthorEmailViaCredentials(post.postAuthorID)]
        )
        
    except Exception as e:
        email_success = False

    return post


def getFlagDetails(request):
    postID = request.GET.get('postID')
    post = Post.objects.get(postID=postID)
    flag = PostReportFlags.objects.get(reportID=post.reportID.reportID)

    flagData = {
        "reportTitle": flag.reportTitle,
        "reportDescription": flag.reportDescription,
        "reportCategory": flag.reportCategory,
    }

    return JsonResponse(flagData)


@transaction.atomic
def editFlag(request):
    postID = request.POST.get('postID')
    post = Post.objects.get(postID=postID)
    flag = PostReportFlags.objects.get(reportID=post.reportID.reportID)

    flag.reportTitle = request.POST.get('reportTitle')
    flag.reportDescription = request.POST.get('reportDescription')
    flag.reportCategory = request.POST.get('reportCategory')
    flag.save()

    return JsonResponse({'status': 'Success'})


@transaction.atomic
def moderatePost(request):
    if request.method == 'POST':
        isBulk = request.POST.get('isBulk', False)
        method = request.POST.get('method')
        moderator = CustomUser.objects.get(user_id=request.user.user_id)

        if isBulk == 'true' or isBulk == True:
            postIDs = request.POST.getlist('postID[]')
            posts = Post.objects.filter(postID__in=postIDs)
            for post in posts:
                if method == 'Approved':
                    post.postStatus = 'Approved'
                elif method == 'Declined':
                    post.postStatus = 'Declined'
                elif method == "Flagged":
                    reasons_json = request.POST.get('reasons', '[]')
                    reasons = json.loads(reasons_json)
                    post = emailReport(request, post, reasons)
                print("POST: ", post)
                post.evaluatedTime = datetime.utcnow()
                post.save()

                # Post Logging Purposes
                PostLogs.objects.create(
                    postID=post,
                    moderatorID=moderator,
                )

            return JsonResponse({'status': 'Success'})
        else:
            postID = request.POST.get('postID')
            post = Post.objects.get(postID=postID)

            if method == 'Approved':
                post.postStatus = 'Approved'
            elif method == 'Declined':
                post.postStatus = 'Declined'
            elif method == "Flagged":
                reasons_json = request.POST.get('reasons', '[]')
                reasons = json.loads(reasons_json)
                emailReport(request, post, reasons)
            
            post.evaluatedTime = datetime.utcnow()
            post.save()

            # Post Logging Purposes
            PostLogs.objects.create(
                postID=post,
                moderatorID=moderator,
            )

            return JsonResponse({'status': 'Success'})
        

def getChikasModerator(request):
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    chikas = Chikas.objects.filter(
        isActive='1', chikaTitle__icontains=search_value, chikaDescription__icontains=search_value
    ).order_by('-createdTime')
    total_posts = chikas.count()

    chikas = chikas[start:start + length]

    chikasData = [
        {
            "chikaID": chika.chikaID,
            "chikaTitle": chika.chikaTitle,
            "chikaDescription": chika.chikaDescription,
            "chikaImage": chika.chikaImage.url,
            "startDate": chika.startDate.strftime("%B %d, %Y") if chika.startDate else None,
            "endDate": chika.endDate.strftime("%B %d, %Y") if chika.endDate else None,
            "status": chika.status,
            "createdTime": chika.createdTime.strftime("%B %d, %Y") if chika.createdTime else None,
        } for chika in chikas
    ]

    return JsonResponse({
        "draw": int(request.GET.get('draw', 1)),
        "recordsTotal": total_posts,
        "recordsFiltered": total_posts,
        "data": chikasData
    })


@transaction.atomic
def addChika(request):
    if request.method == 'POST':
        chikaTitle = request.POST.get('chikaTitle')
        chikaDescription = request.POST.get('chikaDescription')
        chikaImage = request.FILES.get('chikaImage')
        startDate = request.POST.get('startDate')
        endDate = request.POST.get('endDate')
        status = request.POST.get('status')

        chika = Chikas.objects.create(
            chikaTitle=chikaTitle,
            chikaDescription=chikaDescription,
            chikaImage=chikaImage,
            startDate=startDate,
            endDate=endDate,
            status=status,
        )

        return JsonResponse({'status': 'Success'})
    return JsonResponse({'status': 'Failed'})


@transaction.atomic
def editChika(request):
    if request.method == 'POST':
        chikaID = request.POST.get('chikaID')
        chika = Chikas.objects.get(chikaID=chikaID)

        # Replace the image if user uploaded a new one
        chikaImage = request.FILES.get('chikaImage')
        if chikaImage:
            chika.chikaImage = chikaImage

        chika.chikaTitle = request.POST.get('chikaTitle')
        chika.chikaDescription = request.POST.get('chikaDescription')
        chika.startDate = request.POST.get('startDate')
        chika.endDate = request.POST.get('endDate')
        chika.status = request.POST.get('status')
        chika.save()

        return JsonResponse({'status': 'Success'})
    return JsonResponse({'status': 'Failed'})


@transaction.atomic
def deleteChika(request):
    if request.method == 'POST':
        chikaID = request.POST.get('chikaID')
        chika = Chikas.objects.get(chikaID=chikaID)
        chika.isActive = '0'
        chika.save()

        return JsonResponse({'status': 'Success'})
    return JsonResponse({'status': 'Failed'})


def getActivityLogs(request):
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    logs = PostLogs.objects.filter(
        postID__postContent__icontains=search_value
    ).select_related('postID', 'moderatorID').order_by('-createdTime')
    total_logs = logs.count()

    logs = logs[start:start + length]

    logsData = [
        {
            "postLogID": log.postLogID,
            "postAuthor": getFullName(log.postID.postAuthorID),
            # "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=log.postID)],
            "postContent": log.postID.postContent,
            "moderator": getFullName(log.moderatorID),
            "action": log.postID.postStatus,
            "evaluatedTime": log.postID.evaluatedTime.strftime("%B %d, %Y - %I:%M %p"),
        } for log in logs
    ]

    return JsonResponse({
        "draw": int(request.GET.get('draw', 1)),
        "recordsTotal": total_logs,
        "recordsFiltered": total_logs,
        "data": logsData
    })


def getCalendarEventsModerator(request):
    yearMonth = request.GET.get('yearMonth')

    events = CalendarEvents.objects.filter(
        eventStartDate__icontains=yearMonth
    ).order_by('eventStartDate').values(
        'eventID', 'eventName', 'eventStartDate', 'eventEndDate', 'eventUrl'
    )

    eventsData = []
    for event in events:
        eventDict = {
            'id': event['eventID'],
            'title': event['eventName'],
            'start': event['eventStartDate'],
            'end': event['eventEndDate'],
        }
        if event['eventUrl']:
            eventDict['url'] = event['eventUrl']
        eventsData.append(eventDict)

    return JsonResponse({'events': eventsData})


def addCalendarEvent(request):
    if request.method == 'POST':
        eventName = request.POST.get('eventName')
        eventStartDate = request.POST.get('eventStartDate')
        eventEndDate = request.POST.get('eventEndDate')
        eventUrl = request.POST.get('eventUrl')

        event = CalendarEvents.objects.create(
            eventName=eventName,
            eventStartDate=eventStartDate,
            eventEndDate=eventEndDate,
            eventUrl=eventUrl,
        )

        return JsonResponse({'status': 'Success'})
    return JsonResponse({'status': 'Failed'})
    

def downloadPostLogsExcel(request):
    try:
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Post Logs"

        headers = [
            'moderator',
            'postID',
            'action',
            'postAuthor',
            'createdTime',
            'postPage',
        ]
        worksheet.append(headers)

        postlogs = PostLogs.objects.all().order_by('-createdTime')
        for log in postlogs:
            worksheet.append([
                getFullName(log.moderatorID),
                log.postID.postID,
                log.postID.postStatus,
                getFullName(log.postID.postAuthorID),
                log.createdTime.replace(tzinfo=None),
                log.postID.postPage,
            ])

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f"attachment; filename={datetime.now().strftime('%Y-%m-%d')} - Post Logs.xlsx"
        workbook.save(response)

        return response
    except Exception as e:
        return JsonResponse({'status': 'Failed', 'message': str(e)})