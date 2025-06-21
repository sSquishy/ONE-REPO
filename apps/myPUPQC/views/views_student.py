from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
from ..models import ChatbotData

@csrf_exempt
def chat_with_ai(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
        user_message = data.get("message", "").strip()

        if not user_message:
            return JsonResponse({"error": "No message provided."}, status=400)

        # Fetch all active extracted texts at once
        docs = ChatbotData.objects.filter(is_active=True).values_list("extracted_text", flat=True)
        context_list = [text for text in docs if text]

        if not context_list:
            return JsonResponse({"error": "No extracted document content available."}, status=404)

        # Efficient string joining and optional truncation
        context_text = "\n\n".join(context_list)[:8000]

        prompt = f"""You are a helpful assistant. Use the following document information to answer the user's question.

Documents:
{context_text}

Question:
{user_message}
"""

        # Use preloaded model from settings
        llm = getattr(settings, "ollama_llm", None)
        if not llm:
            return JsonResponse({"error": "LLM model not loaded."}, status=500)

        response = llm.invoke(prompt)
        return JsonResponse({"response": response})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)