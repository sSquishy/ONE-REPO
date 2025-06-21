from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import ChatbotData, ChatbotLabel
import PyPDF2  # pip install PyPDF2
# import fitz  # PyMuPDF

class ChatbotDataView(APIView):

    def get(self, request):
        chatbot_data = ChatbotData.objects.filter(is_active=True)

        data_list = []
        for data in chatbot_data:
            data_list.append({
                'data_id': data.data_id,
                'name': data.name,
                'link': data.link,
                'attachment': data.attachment.url if data.attachment else None,
                'extracted_text': (data.extracted_text[:50000] + '...') if data.extracted_text else None,  # Added missing comma
                'date_added': data.date_added,
                'date_updated': data.date_updated,
                'is_active': data.is_active,
            })
        return Response({'status': 'success', 'data': data_list}, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('name')
        link = request.data.get('link')
        attachment = request.FILES.get('attachment')

        extracted_text = None

        # Extract text if attachment is a PDF
        if attachment and attachment.name.endswith('.pdf'):
            try:
                reader = PyPDF2.PdfReader(attachment)
                extracted_text = ""
                for page in reader.pages:
                    extracted_text += page.extract_text() or ""
            except Exception as e:
                return Response({
                    'status': 'error',
                    'message': f'Failed to extract text from PDF: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        data = ChatbotData.objects.create(
            name=name,
            link=link,
            attachment=attachment,
            extracted_text=extracted_text
        )

        return Response({
            'status': 'success',
            'message': 'Chatbot data saved successfully!',
            'data_id': data.data_id
        }, status=status.HTTP_201_CREATED)


class ChatbotDataDelete(APIView):

    def delete(self, request):
        data_id = request.query_params.get('data_id')

        if not data_id:
            return Response({
                'status': 'error',
                'message': 'data_id is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            chatbot_data = ChatbotData.objects.get(data_id=data_id)
            chatbot_data.is_active = False
            chatbot_data.save()

            return Response({
                'status': 'success',
                'message': 'Chatbot data deactivated successfully!',
                'data_id': chatbot_data.data_id
            }, status=status.HTTP_200_OK)

        except ChatbotData.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Chatbot data not found.'
            }, status=status.HTTP_404_NOT_FOUND)

class ChatbotKnowledgeByDocumentView(APIView):
    def get(self, request, data_id=None):
        try:
            if data_id:
                chatbot_data = ChatbotData.objects.get(data_id=data_id, is_active=True)
            else:
                # If no ID is passed, fetch the latest active document
                chatbot_data = ChatbotData.objects.filter(is_active=True).latest('date_added')

            return Response({
                'status': 'success',
                'data': {
                    'data_id': chatbot_data.data_id,
                    'name': chatbot_data.name,
                    'extracted_text': chatbot_data.extracted_text,
                }
            }, status=status.HTTP_200_OK)

        except ChatbotData.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'No chatbot data found.'
            }, status=status.HTTP_404_NOT_FOUND)
        

class ChatbotLabelView(APIView):
    def get(self, request):
        chatbot_labels = ChatbotLabel.objects.filter(is_active=True)
        
        label_list = []
        for label in chatbot_labels:
            label_list.append({
                'label_id': label.label_id,
                'label_name': label.label_name,
                'date_added': label.date_added,
                'date_updated': label.date_updated,
                'is_active': label.is_active,
            })
        return Response({'status': 'success', 'data': label_list}, status=status.HTTP_200_OK)


    def post(self, request):
        label_name = request.data.get('label_name')
        data = ChatbotLabel.objects.create(label_name=label_name,)

        return Response({
            'status': 'success',
            'message': 'Chatbot label saved successfully!',
            'label_id': data.label_id
        }, status=status.HTTP_201_CREATED)

class ChatbotLabelDelete(APIView):
    def delete(self, request):
        label_id = request.query_params.get('label_id')

        if not label_id:
            return Response({
                'status': 'error',
                'message': 'id is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            chatbot_label = ChatbotLabel.objects.get(label_id=label_id)
            chatbot_label.is_active = False
            chatbot_label.save()

            return Response({
                'status': 'success',
                'message': 'Chatbot option deactivated successfully!',
                'label_id': chatbot_label.label_id
            }, status=status.HTTP_200_OK)

        except ChatbotLabel.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Chatbot option not found.'
            }, status=status.HTTP_404_NOT_FOUND)