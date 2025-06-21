from django.urls import path
from .views import SchedulerAuthView, UsersView

urlpatterns = [

    path(
        "sysAdmin/authentication/Login/",
        SchedulerAuthView.as_view(template_name="sysAdmin/authentication/sysAdmin_login.html"),
        name="sysAdminLogin",
    ),
    path(
        "sysAdmin/authentication/ForgotPassword/",
        SchedulerAuthView.as_view(template_name="sysAdmin/authentication/sysAdmin_forgot-password.html"),
        name="sysAdminForgotPassword",
    ),
    path(
        "sysAdmin/authentication/ChangePassword/",
        SchedulerAuthView.as_view(template_name="sysAdmin/authentication/sysAdmin_change-password.html"),
        name="sysAdminChangePassword",
    ),

    # Main Pages
    path(
        "sysAdmin/Admin/Homepage/",
        UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Homepage.html"),
        name="sysAdminHomepage",
    ),

    path(
        "sysAdmin/Admin/Account-Management/",
        UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Account-Management.html"),
        name="sysAdminAccountManagement",
    ),
    path(
        "sysAdmin/Admin/Content-Management/",
        UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Content-Management.html"),
        name="sysAdminContentManagement",
    ),
    path(
        "sysAdmin/Admin/Audit/",
        UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Audit.html"),
        name="sysAdminAudit",
    ),

    # System Admin Profile Paths
    path(
        "sysAdmin/Admin/Profile/",
        UsersView.as_view(template_name="sysAdmin/Admin/Settings/sysAdmin_Profile.html"),
        name="sysAdmin-Profile-Page",
    ),
    path(
        "sysAdmin/Admin/Security",
        UsersView.as_view(template_name="sysAdmin/Admin/Settings/sysAdmin_Security.html"),
        name="sysAdmin-Security-Page",
    ),


    path(
        "sysAdmin/Admin/Content-Management/Manage-program/",
        UsersView.as_view(template_name="sysAdmin/Admin/Account-Management/AMmanage-program.html"),
        name="sysAdminManageProgram",
    ),
    path(
        "sysAdmin/Admin/Content-Management/Manage-Bulk-Upload/",
        UsersView.as_view(template_name="sysAdmin/Admin/Account-Management/AMmanage-bulk_upload.html"),
        name="sysAdminManageBulkUpload",
    ),
    path(
        "sysAdmin/Admin/Content-Management/Manage-Recycle/",
        UsersView.as_view(template_name="sysAdmin/Admin/Account-Management/AMmanage-recycle_account.html"),
        name="sysAdminManageRecycle",
    ),


    ##################
    ## Guest Paths ##
    ##################

    path(
        "sysClient/guest",
        UsersView.as_view(template_name="sysClient/Guestt/sysGuest_Homepage.html"),
        name="sys-guest-home",
    ),
    path(
        "sysClient/authentication/ChangePassword/",
        SchedulerAuthView.as_view(template_name="sysClient/authentication/sysClient_change-password.html"),
        name="sysClientChangePassword",
    ),

    ###################
    ## Student Paths ##
    ###################
    path(
        "sysStudent/Student/Homepage",
        SchedulerAuthView.as_view(template_name="sysClient/Student/sysStudent_Homepage.html"),
        name="sys-student-Homepage",
    ),
    path(
        "sysStudent/Student/Student-Guide",
        UsersView.as_view(template_name="sysClient/Student/sysStudent_StudentGuide.html"),
        name="sys-student-StudentGuide",
    ),

    # Student Profile Paths
    path(
        "sysStudent/Student/Profile/",
        UsersView.as_view(template_name="sysClient/Student/Settings/sysStudent_Profile.html"),
        name="sysStudent-Profile-Page",
    ),
    path(
        "sysStudent/Student/Security",
        UsersView.as_view(template_name="sysClient/Student/Settings/sysStudent_Security.html"),
        name="sysStudent-Security-Page",
    ),

    ##################
    ## Alumni Paths ##
    ##################

    path(
        "sysAlumni/Alumni/Homepage",
        SchedulerAuthView.as_view(template_name="sysClient/Alumni/sysAlumni_Homepage.html"),
        name="sys-alumni-Homepage",
    ),

    # Alumni Profile Paths
    path(
        "sysAlumni/Alumni/Profile/",
        UsersView.as_view(template_name="sysClient/Alumni/Settings/sysAlumni_Profile.html"),
        name="sysAlumni-Profile-Page",
    ),
    path(
        "sysAlumni/Alumni/Security",
        UsersView.as_view(template_name="sysClient/Alumni/Settings/sysAlumni_Security.html"),
        name="sysAlumni-Security-Page",
    ),

    ###################
    ## Faculty Paths ##
    ###################
    path(
        "sysFaculty/Faculty/Homepage",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/sysFaculty_Homepage.html"),
        name="sys-faculty-Homepage",
    ),

    # Faculty Profile Paths
    path(
        "sysFaculty/Faculty/Profile/",
        UsersView.as_view(template_name="sysClient/Faculty/Settings/sysFaculty_Profile.html"),
        name="sysFaculty-Profile-Page",
    ),
    path(
        "sysFaculty/Faculty/Security",
        UsersView.as_view(template_name="sysClient/Faculty/Settings/sysFaculty_Security.html"),
        name="sysFaculty-Security-Page",
    ),

    #####################
    ## Moderator Paths ##
    #####################

    path(
        "sysAdmin/Moderator/Post-Management",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MPost-Management.html"),
        name="sys-moderator-PostManagement",
    ),

    path(
        "sysAdmin/Moderator/Calendar-Management",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MCalendar.html"),
        name="sys-moderator-CalendarManagement",
    ),

    path(
        "sysAdmin/Moderator/Anoang-Chika",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MAnoangChika.html"),
        name="sys-moderator-AnoangChika",
    ),

    path(
        "sysAdmin/Moderator/Audit-Log",
        SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MAudit-Log.html"),
        name="sys-moderator-AuditLog",
    ),


]
