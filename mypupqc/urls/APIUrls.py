from django.urls import path
from mypupqc.controller import *

from mypupqc.controller.API import *
from mypupqc.controller.API.AuthAPIController import *


urlpatterns = [
    path('token/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/storeRefreshToken/', AuthAPIController.storeRefreshToken, name='storeRefreshToken'),
    path('token/retrieveRefreshToken/', AuthAPIController.retrieveRefreshToken, name='retrieveRefreshToken'),
    path('token/deleteRefreshToken/', AuthAPIController.deleteRefreshToken, name='deleteRefreshToken'),
]

urlpatterns += [
    path('faculty/getLoginHistory/', AuthAPIController.getLoginHistory, name='getLoginHistory'),
    path('faculty/getAllFaculties/', FacultyAPIController.getAllFaculties, name='getAllFaculties'),
    path('faculty/getFaculty/<int:facultyID>/', FacultyAPIController.getFaculty, name='getFaculty'),
    path('faculty/getFacultyNames/', FacultyAPIController.getFacultyNames, name='getFacultyNames'),
    path('faculty/getFacultyName/', FacultyAPIController.getFacultyName, name='getFacultyName'),
    path('faculty/addFaculty/', FacultyAPIController.addFaculty, name='addFaculty'),
    path('faculty/editFaculty/', FacultyAPIController.editFaculty, name='editFaculty'),
    path('faculty/deleteFaculty/', FacultyAPIController.deleteFacultyAPI, name='deleteFaculty'),
    path('faculty/bulkDeleteFacultyAPI/', FacultyAPIController.bulkDeleteFacultyAPI, name='bulkDeleteFacultyAPI'),
    path('faculty/getRetainedFaculty/', FacultyAPIController.getRetainedFacultyAPI, name='getRetainedFaculty'),
    path('faculty/restoreRetainedFacultyAPI/', FacultyAPIController.restoreRetainedFacultyAPI, name='restoreRetainedFacultyAPI'),
    path('faculty/deleteRetainedFacultyAPI/', FacultyAPIController.deleteRetainedFacultyAPI, name='deleteRetainedFacultyAPI'),
    path('forgotPasswordRequest/', AuthController.forgotPasswordRequest, name="forgotPasswordRequestAPI"),
    path('forgotPassword/<uidb64>/<token>/', AuthController.forgotPassword, name="forgotPasswordAPI"),
    path('changePassword/', AuthAPIController.changePassword, name="changePasswordAPI"),
]

urlpatterns += [
    path('helpdesk/getUserRole/', HelpdeskController.getUserRole, name='getUserRole'),
]