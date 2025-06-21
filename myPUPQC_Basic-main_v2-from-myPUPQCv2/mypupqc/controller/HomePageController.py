import json
from django.http import JsonResponse
from django.db import transaction
from mypupqc.models import *
from django.core.exceptions import ObjectDoesNotExist
import datetime
from mypupqc.helper import *
from django.core.paginator import Paginator, EmptyPage


def getCalendarEvents(request):
    eventsList = []
    calendarEvents = CalendarEvents.objects.filter(
        eventStartDate__gte=datetime.datetime.now(), 
    ).order_by('eventStartDate')[:5]

    for event in calendarEvents:
        eventsList.append({
            'eventID': event.eventID,
            'eventName': event.eventName,
            'eventDate': event.eventStartDate.strftime('%B %d, %Y'),
        })

    return JsonResponse(eventsList, safe=False)


def getChikas(request):
    chikasList = []
    chikas = Chikas.objects.all().order_by('-createdTime')[:10]

    for chika in chikas:
        chikasList.append({
            'chikaID': chika.chikaID,
            'chikaTitle': chika.chikaTitle,
            'chikaDescription': chika.chikaDescription,
            'chikaImage': chika.chikaImage.url,
            'createdTime': chika.createdTime,
        })

    return JsonResponse(chikasList, safe=False)


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