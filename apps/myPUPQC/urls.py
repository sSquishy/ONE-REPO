from django.urls import path
from .views import *

urlpatterns = [

    # Admin configuration API URLs:
    path("sysAdmin/config/manage_data/", views_admin.ChatbotDataView.as_view(), name="chatbot_data"),
    path("sysAdmin/config/delete_data/", views_admin.ChatbotDataDelete.as_view(), name="delete_chatbot_data"),
    path("sysAdmin/config/manage_labels/", views_admin.ChatbotLabelView.as_view(), name="chatbot_labels"),
    path("sysAdmin/config/delete_labels/", views_admin.ChatbotLabelDelete.as_view(), name="delete_chatbot_labels"),

    # Admin Login
    path("sysAdmin/authentication/Login/", views_base.SchedulerAuthView.as_view(template_name="sysAdmin/authentication/sysAdmin_login.html"), name="sysAdminLogin"),
    path("sysAdmin/authentication/ForgotPassword/", views_base.SchedulerAuthView.as_view(template_name="sysAdmin/authentication/sysAdmin_forgot-password.html"), name="sysAdminForgotPassword"),

    # Main Pages
    path("sysAdmin/Admin/Homepage/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Homepage.html"), name="sysAdminHomepage"),
    path("sysAdmin/Admin/Account-Management/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Account-Management.html"), name="sysAdminAccountManagement"),
    path("sysAdmin/Admin/Content-Management/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Content-Management.html"), name="sysAdminContentManagement"),
    path("sysAdmin/Admin/Audit/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Audit.html"), name="sysAdminAudit"),
    path("sysAdmin/Admin/Configuration/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/sysAdmin_Configuration.html"), name="sysAdminConfiguration"),

    # System Admin Profile Paths
    path("sysAdmin/Admin/Profile/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/Settings/sysAdmin_Profile.html"), name="sysAdmin-Profile-Page"),
    path("sysAdmin/Admin/Security", views_base.UsersView.as_view(template_name="sysAdmin/Admin/Settings/sysAdmin_Security.html"), name="sysAdmin-Security-Page"),

    path("sysAdmin/Admin/Content-Management/Manage-program/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/Account-Management/AMmanage-program.html"), name="sysAdminManageProgram"),
    path("sysAdmin/Admin/Content-Management/Manage-Bulk-Upload/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/Account-Management/AMmanage-bulk_upload.html"), name="sysAdminManageBulkUpload"),
    path("sysAdmin/Admin/Content-Management/Manage-Recycle/", views_base.UsersView.as_view(template_name="sysAdmin/Admin/Account-Management/AMmanage-recycle_account.html"), name="sysAdminManageRecycle"),

    ##################
    ## Guest Paths ##
    ##################
    path("sysClient/guest", views_base.UsersView.as_view(template_name="sysClient/Guestt/sysGuest_Homepage.html"), name="sys-guest-home"),
    path("sysClient/ai_guest", views_base.UsersView.as_view(template_name="sysClient/ai_chatbot/ai_guest.html"), name="sys-ai_guest-home"),

    ###################
    ## Student Paths ##
    ###################
    path("sysStudent/Student/Homepage", views_base.SchedulerAuthView.as_view(template_name="sysClient/Student/sysStudent_Homepage.html"), name="sys-student-Homepage"),
    path("sysStudent/Student/Student-Guide", views_base.UsersView.as_view(template_name="sysClient/Student/sysStudent_StudentGuide.html"), name="sys-student-StudentGuide"),
    path("sysStudent/Student/Profile/", views_base.UsersView.as_view(template_name="sysClient/Student/Settings/sysStudent_Profile.html"), name="sysStudent-Profile-Page"),
    path("sysStudent/Student/Security", views_base.UsersView.as_view(template_name="sysClient/Student/Settings/sysStudent_Security.html"), name="sysStudent-Security-Page"),
    path("sysStudent/Student/ai_student", views_base.UsersView.as_view(template_name="sysClient/ai_chatbot/ai_student.html"), name="sysStudent-ai_student-Page"),
    # path('api/chatbot/document/<int:doc_id>/', views_student.ChatbotKnowledgeByDocumentView.as_view(), name='chatbot_document_data'),
    # path('chatbot/data/', views_student.ChatbotKnowledgeByDocumentView.as_view(), name='chatbot-latest'),
    # path('chatbot/data/<uuid:data_id>/', views_student.ChatbotKnowledgeByDocumentView.as_view(), name='chatbot-by-id'),
    path("chatbot/", views_student.chat_ with_ai, name="chatbot"),

    ##################
    ## Alumni Paths ##
    ##################
    path("sysAlumni/Alumni/Homepage", views_base.SchedulerAuthView.as_view(template_name="sysClient/Alumni/sysAlumni_Homepage.html"), name="sys-alumni-Homepage"),
    path("sysAlumni/ai_alumni/Homepage", views_base.SchedulerAuthView.as_view(template_name="sysClient/ai_chatbot/ai_alumni.html"), name="sys-ai_alumni-Homepage"),
    path("sysAlumni/Alumni/Profile/", views_base.UsersView.as_view(template_name="sysClient/Alumni/Settings/sysAlumni_Profile.html"), name="sysAlumni-Profile-Page"),
    path("sysAlumni/Alumni/Security", views_base.UsersView.as_view(template_name="sysClient/Alumni/Settings/sysAlumni_Security.html"), name="sysAlumni-Security-Page"),

    ###################
    ## Faculty Paths ##
    ###################
    path("sysFaculty/Faculty/Homepage", views_base.SchedulerAuthView.as_view(template_name="sysClient/Faculty/sysFaculty_Homepage.html"), name="sys-faculty-Homepage"),
    path("sysFaculty/ai_faculty/Homepage", views_base.SchedulerAuthView.as_view(template_name="sysClient/ai_chatbot/ai_faculty.html"), name="sys-ai_faculty-Homepage"),
    path("sysFaculty/Faculty/Profile/", views_base.UsersView.as_view(template_name="sysClient/Faculty/Settings/sysFaculty_Profile.html"), name="sysFaculty-Profile-Page"),
    path("sysFaculty/Faculty/Security", views_base.UsersView.as_view(template_name="sysClient/Faculty/Settings/sysFaculty_Security.html"), name="sysFaculty-Security-Page"),

    #####################
    ## Moderator Paths ##
    #####################
    path("sysAdmin/Moderator/Post-Management", views_base.SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MPost-Management.html"), name="sys-moderator-PostManagement"),
    path("sysAdmin/Moderator/Calendar-Management", views_base.SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MCalendar.html"), name="sys-moderator-CalendarManagement"),
    path("sysAdmin/Moderator/Anoang-Chika", views_base.SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MAnoangChika.html"), name="sys-moderator-AnoangChika"),
    path("sysAdmin/Moderator/Audit-Log", views_base.SchedulerAuthView.as_view(template_name="sysClient/Faculty/Moderator/sysFaculty_MAudit-Log.html"), name="sys-moderator-AuditLog"),
]
