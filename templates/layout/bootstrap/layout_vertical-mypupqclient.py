from django.conf import settings
import json
import logging
from pathlib import Path
from web_project.template_helpers.theme import TemplateHelper

# Define the menu file path
menu_file_path = Path(settings.BASE_DIR) / "templates" / "layout" / "partials" / "menu" / "vertical" / "json" / "vertical_menu.json"

# Configure logging
logger = logging.getLogger(__name__)

"""
This is an entry and Bootstrap class for the theme level.
The init() function will be called in web_project/__init__.py
"""

class TemplateBootstrapLayoutVertical:
    @staticmethod
    def init(context):
        """
        Initializes the template context with layout settings and menu data.
        """
        context.update(
            {
                "layout": "vertical",
                "content_navbar": True,
                "is_navbar": True,
                "is_menu": True,
                "is_footer": True,
                "navbar_detached": True,
            }
        )

        # Map context according to updated values
        TemplateHelper.map_context(context)

        # Load menu data
        TemplateBootstrapLayoutVertical.init_menu_data(context)

        return context

    @staticmethod
    def init_menu_data(context):
        """
        Loads the menu data from the JSON file and updates the context.
        """
        if menu_file_path.exists():
            try:
                with menu_file_path.open(encoding="utf-8") as json_file:
                    menu_data = json.load(json_file)
                context.update({"menu_data": menu_data})
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding JSON file {menu_file_path}: {e}")
                context.update({"menu_data": []})
        else:
            logger.warning(f"Menu file not found: {menu_file_path}")
            context.update({"menu_data": []})
