from django.views.generic import TemplateView
from web_project import TemplateLayout
from web_project.template_helpers.theme import TemplateHelper


class MyPUPQCClientConfig(TemplateView):

    # Predefined function
    def get_context_data(self, **kwargs):
        # A function to init the global layout. It is defined in web_project/__init__.py file
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        # Update the context
        context.update(
            {
                "layout": "front",
                "layout_path": TemplateHelper.set_layout("layout_front.html", context),
                "active_url": self.request.path,  # Get the current url path (active URL) from request
            }
        )

        # map_context according to updated context values
        TemplateHelper.map_context(context)

        return context

class SchedulerAuthView(TemplateView):
    # Predefined function
    def get_context_data(self, **kwargs):
        # A function to init the global layout. It is defined in web_project/__init__.py file
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        # Update the context
        context.update(
            {
                "layout_path": TemplateHelper.set_layout("layout_blank.html", context),
            }
        )

        return context

class UsersView(TemplateView):
    permission_required = ("user.view_user", "user.delete_user", "user.change_user", "user.add_user")

    # Predefined function
    def get_context_data(self, **kwargs):
        # A function to init the global layout. It is defined in web_project/__init__.py file
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        return context
