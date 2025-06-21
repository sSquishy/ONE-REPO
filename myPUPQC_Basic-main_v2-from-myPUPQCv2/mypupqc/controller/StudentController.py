from django.http import JsonResponse
from django.shortcuts import render
from django.db import transaction
from django.core.paginator import Paginator

from mypupqc.models import *
from mypupqc.helper import *

#Student Method
def getStudentProfile(request):
    userID = request.user
    student = Student.objects.get(credID=userID)
    studentData = {
        "fullname": getStudentFullName(student),
        "studentNumber": student.credID.user_number,
        "program": student.programID.programName,
        "dateOfBirth": student.dateOfBirth.strftime("%B %d, %Y"),
        "mobileNumber": student.mobileNo,
        "emailAddress": student.emailAddress,
        "webMail": student.webMail,
    }

    return JsonResponse(studentData)


def getPosts(request):
    page = int(request.GET.get('page', 1))
    postsPerPage = 5

    posts = Post.objects.filter(isActive='1', postStatus="Approved").order_by('-evaluatedTime')
    paginator = Paginator(posts, postsPerPage)

    if page > paginator.num_pages:
        return JsonResponse({"posts": [], "hasMore": False})
    
    postsData = [
        {
            "postID": post.postID,
            "postAuthor": getFullName(post.postAuthorID),
            "postContent": post.postContent,
            "postImage": [postImage.imageLink.url for postImage in PostImages.objects.filter(postID=post)],
            "evaluatedTime": post.evaluatedTime,
        } for post in paginator.get_page(page)
    ]

    return JsonResponse({"posts": postsData, "hasMore": paginator.num_pages > page})


# Student CRUD
@transaction.atomic
def createPost(request):
    if request.method == 'POST':
        postContent = request.POST.get('postBody')
        postLabelID = request.POST.get('postLabel')
        postImages = request.FILES.get('postImages')
        # postImages = request.FILES.getlist('postImages')
        
        try:
            program = Program.objects.get(programID=postLabelID)
        except Program.DoesNotExist:
            program = None
        except Exception as e:
            program = None

        post = Post.objects.create(
            postContent=postContent,
            postLabel=program,
            postAuthorID=request.user,
            postPage='Student',
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


@transaction.atomic
def editStudentProfile(request):
    if request.method == 'POST':
        if not request.POST.get('password') == '':
            user = CustomUser.objects.get(user_number=request.user.user_number)
            user.set_password(request.POST.get('password'))
            user.save()

        student = Student.objects.get(credID=request.user)
        student.emailAddress = request.POST.get('emailAddress')
        student.webMail = request.POST.get('webMail')
        student.save()

        return JsonResponse({'status': 'Success'})
    