from django.db import models


class ChatbotData(models.Model):
    data_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    link = models.URLField(blank=True, null=True)
    attachment = models.FileField(upload_to='chatbot_attachments/', blank=True, null=True)
    extracted_text = models.TextField(null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.data_id

class ChatbotLabel(models.Model):
    label_id = models.AutoField(primary_key=True)
    label_name = models.CharField(max_length=255)
    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)