from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from cloudinary.models import CloudinaryField


# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, user_number, password=None, **extra_fields):
        if not user_number:
            raise ValueError('The User Number field must be set')
        user = self.model(user_number=user_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(user_number, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    user_number = models.TextField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_time = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'user_number'

    def __str__(self):
        return self.user_number


customUser = CustomUser()


class RefreshTokens(models.Model):
    tokenID = models.AutoField(primary_key=True)
    userID = models.ForeignKey(customUser, on_delete=models.CASCADE, db_column='userID')
    refreshToken = models.TextField()
    createdTime = models.DateTimeField(default=timezone.now)


class Student(models.Model):
    userID = models.AutoField(primary_key=True)
    credID = models.OneToOneField(customUser, on_delete=models.CASCADE, db_column='credID', related_name='student')
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, null=True)
    suffix = models.CharField(max_length=10, null=True)
    programID = models.ForeignKey('Program', on_delete=models.SET_NULL, db_column='programID', null=True)
    dateOfBirth = models.DateField()
    mobileNo = models.CharField(max_length=20)
    emailAddress = models.CharField(max_length=100, unique=True)
    webMail = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=25, default='Pending')
    createdTime = models.DateTimeField(default=timezone.now)
    joinedTime = models.DateTimeField(null=True)
    updatedTime = models.DateTimeField(null=True)
    isAlumni = models.IntegerField(default=0)
    isActive = models.IntegerField(default=1)
    isRetained = models.IntegerField(default=0)
    isFromBulkUpload = models.IntegerField(default=0)


class Faculty(models.Model):
    userID = models.AutoField(primary_key=True)
    credID = models.OneToOneField(customUser, on_delete=models.CASCADE, db_column='credID', related_name='faculty')
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, null=True)
    suffix = models.CharField(max_length=10, null=True)
    dateOfBirth = models.DateField()
    emailAddress = models.CharField(max_length=100, unique=True)
    webMail = models.CharField(max_length=100, unique=True)
    mobileNo = models.CharField(max_length=20)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    status = models.CharField(max_length=25, default='Pending')
    isActive = models.IntegerField(default=1)
    isRetained = models.IntegerField(default=0)
    isFromBulkUpload = models.IntegerField(default=0)


class Personnel(models.Model):
    userID = models.AutoField(primary_key=True)
    credID = models.OneToOneField(customUser, on_delete=models.CASCADE, db_column='credID', related_name='personnel')
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, null=True)
    suffix = models.CharField(max_length=10, null=True)
    dateOfBirth = models.DateField()
    emailAddress = models.CharField(max_length=100, unique=True)
    webMail = models.CharField(max_length=100, unique=True)
    mobileNo = models.CharField(max_length=20)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    status = models.CharField(max_length=25, default='Pending')
    remarks = models.TextField(null=True)
    isActive = models.IntegerField(default=1)
    isRetained = models.IntegerField(default=0)
    isFromBulkUpload = models.IntegerField(default=0)


class PendingAccount(models.Model):
    userID = models.AutoField(primary_key=True)
    userNumber = models.CharField(max_length=50, unique=True)
    userType = models.CharField(max_length=50)
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, null=True)
    suffix = models.CharField(max_length=10, null=True)
    birthYear = models.IntegerField()
    birthMonth = models.IntegerField()
    birthDay = models.IntegerField()
    emailAddress = models.CharField(max_length=100)
    mobileNo = models.CharField(max_length=20)
    webMail = models.CharField(max_length=100)
    programShortName = models.CharField(max_length=15, null=True)
    programName = models.CharField(max_length=200, null=True)
    isAdmin = models.IntegerField(default=0, null=True)
    isModerator = models.IntegerField(default=0, null=True)
    isActivated = models.IntegerField(default=0)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)


class PermissionList(models.Model):
    permissionID = models.AutoField(primary_key=True)
    studentID = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='studentID', related_name='studentPermission', null=True)
    facultyID = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='facultyID', related_name='facultyPermission', null=True)
    personnelID = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='personnelID', related_name='personnelPermission', null=True)
    permissionName = models.CharField(max_length=50)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


class PostImages(models.Model):
    imageID = models.AutoField(primary_key=True)
    imageLink = CloudinaryField('image')
    postID = models.ForeignKey('Post', on_delete=models.CASCADE, db_column='postID', related_name='postImages')
    createdTime = models.DateTimeField(default=timezone.now)
    isActive = models.IntegerField(default=1)


class Post(models.Model):
    postID = models.AutoField(primary_key=True)
    postAuthorID = models.ForeignKey(customUser, on_delete=models.CASCADE, db_column='postAuthorID')
    reportID = models.ForeignKey('PostReportFlags', on_delete=models.SET_NULL, db_column='flagReasons', null=True)
    postLabel = models.ForeignKey('Program', on_delete=models.SET_NULL, db_column='postLabel', null=True)
    postContent = models.TextField()
    postPage = models.CharField(max_length=50)
    postStatus = models.CharField(max_length=50, default='Pending')
    evaluatedTime = models.DateTimeField(null=True)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


class PostReportFlags(models.Model):
    reportID = models.AutoField(primary_key=True)
    reportTitle = models.CharField(max_length=100)
    reportDescription = models.TextField()
    reportCategory = models.CharField(max_length=50)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


class PostLogs(models.Model):
    postLogID = models.AutoField(primary_key=True)
    postID = models.ForeignKey(Post, on_delete=models.CASCADE, db_column='postID')
    moderatorID = models.ForeignKey(customUser, on_delete=models.CASCADE, db_column='moderatorID')
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


class Organization(models.Model):
    organizationID = models.AutoField(primary_key=True)
    organizationName = models.CharField(max_length=100)
    organizationDescription = models.TextField()
    organizationType = models.CharField(max_length=50)
    organizationAdviser = models.TextField()
    organizationTag = models.CharField(max_length=20)
    organizationTagColor = models.CharField(max_length=50)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)
    

class StudentsOrganization(models.Model):
    studentOrganizationID = models.AutoField(primary_key=True)
    studentID = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='studentID')
    organizationID = models.ForeignKey(Organization, on_delete=models.CASCADE, db_column='organizationID')
    joinedTime = models.DateTimeField(default=timezone.now)
    leftTime = models.DateTimeField(null=True)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


class Program(models.Model):
    programID = models.AutoField(primary_key=True)
    programName = models.CharField(max_length=200)
    programShortName = models.CharField(max_length=15)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


class HistoryLog(models.Model):
    historyID = models.AutoField(primary_key=True)
    userID = models.ForeignKey(customUser, on_delete=models.CASCADE, db_column='userID')
    userType = models.CharField(max_length=50)
    system = models.CharField(max_length=50)
    actionType = models.CharField(max_length=50)
    actionDescription = models.TextField()
    createdTime = models.DateTimeField(default=timezone.now)


class SchoolYear(models.Model):
    schoolYearID = models.AutoField(primary_key=True)
    schoolYear = models.CharField(max_length=10)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(null=True)
    isActive = models.IntegerField(default=1)


# No relation with other entities
class SlideShow(models.Model):
    slideshowID = models.AutoField(primary_key=True)
    image = CloudinaryField('image')
    status = models.CharField(max_length=10, default='Active')
    isActive = models.IntegerField(default=1)
    section = models.CharField(max_length=50)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(default=timezone.now)


class MyPUPQCInformation(models.Model):
    infoID = models.AutoField(primary_key=True)
    infoTitle = models.CharField(max_length=100)
    infoDescription = models.TextField()
    isActive = models.IntegerField(default=1)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(default=timezone.now)


class ServicesSection(models.Model):
    serviceID = models.AutoField(primary_key=True)
    serviceName = models.CharField(max_length=50)
    serviceLink = models.TextField()
    serviceIcon = models.ImageField(upload_to='servicesSection/')
    createdTime = models.DateTimeField(default=timezone.now)
    isActive = models.IntegerField(default=1)
    updatedTime = models.DateTimeField(default=timezone.now)


class ArticlesSection(models.Model):
    articleID = models.AutoField(primary_key=True)
    articleTitle = models.CharField(max_length=100)
    articleDescription = models.TextField()
    articleImage = CloudinaryField('image')
    startDate = models.DateField(null=True)
    endDate = models.DateField(null=True)
    status = models.CharField(max_length=50, default='Active')
    createdTime = models.DateTimeField(default=timezone.now)
    isActive = models.IntegerField(default=1)
    updatedTime = models.DateTimeField(default=timezone.now)


class FrequentlyAskedQuestions(models.Model):
    faqID = models.AutoField(primary_key=True)
    question = models.TextField()
    answer = models.TextField()
    status = models.CharField(max_length=50, default='Active')
    createdTime = models.DateTimeField(default=timezone.now)
    isActive = models.IntegerField(default=1)
    updatedTime = models.DateTimeField(default=timezone.now)


class CalendarEvents(models.Model):
    eventID = models.AutoField(primary_key=True)
    eventName = models.CharField(max_length=100)
    eventStartDate = models.DateField()
    eventEndDate = models.DateField()
    eventUrl = models.TextField(null=True)
    createdTime = models.DateTimeField(default=timezone.now)
    updatedTime = models.DateTimeField(default=timezone.now, null=True)
    isActive = models.IntegerField(default=1)


class Chikas(models.Model):
    chikaID = models.AutoField(primary_key=True)
    chikaTitle = models.CharField(max_length=100)
    chikaDescription = models.TextField()
    chikaImage = CloudinaryField('image')
    startDate = models.DateField(null=True)
    endDate = models.DateField(null=True)
    status = models.CharField(max_length=50, default='Active')
    createdTime = models.DateTimeField(default=timezone.now)
    isActive = models.IntegerField(default=1)
    updatedTime = models.DateTimeField(default=timezone.now)


class HowToLinks(models.Model):
    howtoID = models.AutoField(primary_key=True)
    howtoName = models.TextField()
    howtoLink = models.TextField()
    status = models.CharField(max_length=50, default='Active')
    createdTime = models.DateTimeField(default=timezone.now)
    isActive = models.IntegerField(default=1)
    updatedTime = models.DateTimeField(default=timezone.now)


# Login History
from django.db import models
from django.conf import settings

class UserLoginHistory(models.Model):
    ACCESS_TYPES = (
        ('web', 'Web Login'),
        ('api', 'API Login'),
    )
    
    user = models.ForeignKey("Faculty", on_delete=models.CASCADE)
    browser = models.CharField(max_length=200)
    device = models.CharField(max_length=200)
    os = models.CharField(max_length=200)
    ip_address = models.GenericIPAddressField()
    location = models.CharField(max_length=200)
    login_datetime = models.DateTimeField()
    access_type = models.CharField(max_length=10, choices=ACCESS_TYPES, default='web')
    
    class Meta:
        ordering = ['-login_datetime']
        
    def __str__(self):
        return f"{self.user.firstname} - {self.login_datetime}"

# if __name__ == '__main__':
#     print(generate_password())