from django.urls import path
from .views import SchedulerAuthView, UsersView

urlpatterns = [
    # Main Pages
    path(
        "sysStudent/Student/Homepage",
        SchedulerAuthView.as_view(template_name="sysClient/Student/sysStudent_Homepage.html"),
        name="sys-student-Homepage",
    ),

]
