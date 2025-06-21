# myPUPQC/apps.py
from django.apps import AppConfig
from langchain_community.llms import Ollama
from django.conf import settings


class MyPUPQCConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = "apps.myPUPQC"

    def ready(self):
        try:
            print("Preloading Ollama model...")
            settings.ollama_llm = Ollama(model="mistral")

            settings.ollama_llm.invoke("Hello")
            print("Ollama model ready.")
        except Exception as e:
            print(f"⚠️ Ollama preload failed: {e}")
