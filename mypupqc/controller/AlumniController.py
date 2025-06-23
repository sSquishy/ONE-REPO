from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.db import transaction
from mypupqc.helper import *
from mypupqc.models import *


#Alumni Method
def getAlumniProfile(request):
    userID = request.user
    alumni = Student.objects.get(credID=userID)
    alumniData = {
        "fullname": getStudentFullName(alumni),
        "alumniNumber": alumni.credID.user_number,
        "program": alumni.programID.programName,
        "dateOfBirth": alumni.dateOfBirth.strftime("%B %d, %Y"),
        "mobileNumber": alumni.mobileNo,
        "emailAddress": alumni.emailAddress,
        "webMail": alumni.webMail,
    }

    return JsonResponse(alumniData)
                  
                  
# Faculty CRUD
@transaction.atomic
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
def editAlumniProfile(request):
    if request.method == 'POST':
        if not request.POST.get('password') == '':
            user = CustomUser.objects.get(user_number=request.user.user_number)
            user.set_password(request.POST.get('password'))
            user.save()

        alumni = Student.objects.get(credID=request.user)
        alumni.emailAddress = request.POST.get('emailAddress')
        alumni.webMail = request.POST.get('webMail')
        alumni.save()

        return JsonResponse({'status': 'Success'})