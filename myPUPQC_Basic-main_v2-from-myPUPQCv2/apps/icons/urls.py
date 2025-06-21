from django.urls import path
from .views import IconsView
from django.contrib.auth.decorators import login_required


urlpatterns = [
    path(
        "icons/mdi/",
        login_required(IconsView.as_view(template_name="icons_mdi.html")),
        name="icons-mdi",
    ),
]
