# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json
# from ..models import ChatbotData
# from langchain_community.llms import Ollama
# import re

# # Load the Mistral model via Ollama
# llm = Ollama(model="mistral")

# # Define keyword groups
# GREETING_KEYWORDS = [
#     "hi", "hello", "good morning", "good afternoon", "good evening",
#     "hey", "ey", "greetings", "howdy", "what's up", "yo", "sup",
#     "how are you", "how's it going", "whats up", "nice to meet you"
# ]

# PERSONAL_INFO_KEYWORDS = [
#     "my grade", "my student number", "my schedule", "my email", "my password",
#     "what's my", "where is my", "can you check my", "do you know my"
# ]

# APPRECIATION_KEYWORDS = [
#     "thank you", "thank you", "thanks", "appreciate it", "grateful", "many thanks",
#     "thank you so much", "thanks a lot", "i appreciate your help",
#     "you are awesome", "you are great", "you are amazing",
#     "i'm grateful for your help"
# ]

# FRUSTRATION_KEYWORDS = [
#     "this is stupid", "frustrated", "annoyed", "not helpful", "useless",
#     "waste of time", "i'm upset", "i'm angry", "this is ridiculous",
#     "i can't believe this", "this is a joke"
# ]

# PROFANITY_KEYWORDS = [
#     "damn", "hell", "shit", "fuck", "crap", "sucks", "bullshit",
#     "asshole", "idiot", "stupid", "dumb", "fucking", "pissed off", "pissed",
#     "screw this", "fuck you"
# ]

# HELPDESK_KEYWORDS = [
#     "talk to support", "helpdesk", "contact support", "speak to someone",
#     "talk to a human", "i need help", "escalate", "i need assistance",
#     "i need to speak to someone", "i need a human", "i need to talk to a person",
#     "i need to escalate this", "i need to report this issue"
# ]

# # Prompt builder
# def construct_prompt(context_text, user_message):
#     return f"""
# You are a friendly and knowledgeable AI assistant for PUPQC students.

# ## Document Knowledge:
# {context_text}

# ## Student Question:
# {user_message}

# ## Instructions:
# - ONLY answer using the document above.
# - If the answer is not found in the document, reply with:
#   "I'm sorry, I couldn't find the answer to that in the uploaded document."
# - Keep replies friendly, natural, and helpful.
# """

# @csrf_exempt
# def chat_with_ai(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Invalid request method."}, status=405)

#     try:
#         data = json.loads(request.body)
#         user_message = data.get("message", "").strip().lower()

#         if not user_message:
#             return JsonResponse({"error": "No message provided."}, status=400)

#         # Handle greetings
#         if any(word in user_message for word in GREETING_KEYWORDS):
#             return JsonResponse({
#                 "response": "Hello! 😊 How can I assist you with your concerns about PUPQC?"
#             })

#         # Handle personal info
#         if any(word in user_message for word in PERSONAL_INFO_KEYWORDS):
#             return JsonResponse({
#                 "response": "I'm sorry, but I don’t have access to personal information like student records or grades. Please contact the PUPQC office directly."
#             })

#         # Appreciation
#         if any(word in user_message for word in APPRECIATION_KEYWORDS):
#             return JsonResponse({
#                 "response": "You're very welcome! 😊 Always here to help."
#             })

#         # Frustration or profanity
#         if any(word in user_message for word in FRUSTRATION_KEYWORDS + PROFANITY_KEYWORDS):
#             return JsonResponse({
#                 "response": "I'm really sorry you're feeling that way. Let me try to help you as best as I can. 😊"
#             })

#         # Helpdesk
#         if any(word in user_message for word in HELPDESK_KEYWORDS):
#             return JsonResponse({
#                 "response": "No worries! I've forwarded this to the helpdesk — someone will assist you shortly."
#             })

#         # Load knowledge base
#         active_docs = ChatbotData.objects.filter(is_active=True)
#         context_text = "\n\n".join(doc.extracted_text for doc in active_docs if doc.extracted_text)

#         if not context_text:
#             return JsonResponse({
#                 "response": "Sorry, I cannot help with that right now."
#             })

#         context_text = context_text[:8000]  # Limit for safety
#         prompt = construct_prompt(context_text, user_message)

#         try:
#             response = llm.invoke(prompt)
#             return JsonResponse({"response": response.strip()})
#         except Exception as e:
#             return JsonResponse({"error": f"AI model failed to respond: {str(e)}"}, status=500)

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from ..models import ChatbotData
from langchain_community.llms import Ollama
import re

# Load the Mistral model via Ollama
llm = Ollama(model="mistral")

# Define keyword groups
GREETING_KEYWORDS = [
    "hi", "hello", "good morning", "good afternoon", "good evening",
    "hey", "ey", "greetings", "howdy", "what's up", "yo", "sup",
    "how are you", "how's it going", "whats up", "nice to meet you"
]

PERSONAL_INFO_KEYWORDS = [
    "my grade", "my student number", "my schedule", "my email", "my password",
    "what's my", "where is my", "can you check my", "do you know my"
]

APPRECIATION_KEYWORDS = [
    "thank you", "ty", "okay", "ok", "thanks", "appreciate it", "grateful", "many thanks",
    "thank you so much", "thanks a lot", "i appreciate your help",
    "you are awesome", "you are great", "you are amazing",
    "i'm grateful for your help"
]

FRUSTRATION_KEYWORDS = [
    "this is stupid", "frustrated", "annoyed", "not helpful", "useless",
    "waste of time", "i'm upset", "i'm angry", "this is ridiculous",
    "i can't believe this", "this is a joke"
]

PROFANITY_KEYWORDS = [
    "damn", "hell", "shit", "fuck", "crap", "sucks", "bullshit",
    "asshole", "idiot", "stupid", "dumb", "fucking", "pissed off", "pissed",
    "screw this", "fuck you"
]

HELPDESK_KEYWORDS = [
    "talk to support", "helpdesk", "contact support", "speak to someone",
    "talk to a human", "i need help", "escalate", "i need assistance",
    "i need to speak to someone", "i need a human", "i need to talk to a person",
    "i need to escalate this", "i need to report this issue"
]

# Helper: check if any full keyword/phrase appears
def contains_whole_keyword(message, keywords):
    return any(re.search(r'\b' + re.escape(kw) + r'\b', message) for kw in keywords)

# Prompt builder
def construct_prompt(context_text, user_message):
    return f"""
You are a friendly and knowledgeable AI assistant for PUPQC students.

## Document Knowledge:
{context_text}

## Student Question:
{user_message}

## Instructions:
- Answer ONLY using the information in the provided document.
- If the answer cannot be found, respond politely with:
  "I'm sorry, I couldn't find the answer to that. Please try rephrasing your question."
- Do NOT say anything like "the document does not contain" or "not found in the document."
- Keep your tone friendly, natural, and helpful.
- Do NOT make up information or guess beyond what's in the document.
"""

@csrf_exempt
def chat_with_ai(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
        user_message = data.get("message", "").strip().lower()

        if not user_message:
            return JsonResponse({"error": "No message provided."}, status=400)

        # Handle greetings
        if contains_whole_keyword(user_message, GREETING_KEYWORDS):
            return JsonResponse({
                "response": "Hello! 😊 How can I assist you with your concerns about PUPQC?"
            })

        # Handle personal info
        if contains_whole_keyword(user_message, PERSONAL_INFO_KEYWORDS):
            return JsonResponse({
                "response": "I'm sorry, but I don’t have access to personal information like student records or grades. Please contact the PUPQC office directly."
            })

        # Appreciation
        if contains_whole_keyword(user_message, APPRECIATION_KEYWORDS):
            return JsonResponse({
                "response": "You're very welcome! 😊 Always here to help."
            })

        # Frustration or profanity
        if contains_whole_keyword(user_message, FRUSTRATION_KEYWORDS + PROFANITY_KEYWORDS):
            return JsonResponse({
                "response": "I'm really sorry you're feeling that way. Let me try to help you as best as I can. 😊"
            })

        # Helpdesk
        if contains_whole_keyword(user_message, HELPDESK_KEYWORDS):
            return JsonResponse({
                "response": "No worries! I've forwarded this to the helpdesk — someone will assist you shortly."
            })

        # Load knowledge base
        active_docs = ChatbotData.objects.filter(is_active=True)
        context_text = "\n\n".join(doc.extracted_text for doc in active_docs if doc.extracted_text)

        if not context_text:
            return JsonResponse({
                "response": "Sorry, I cannot help with that right now."
            })

        # Truncate context to safe size
        context_text = context_text[:8000]
        prompt = construct_prompt(context_text, user_message)

        try:
            response = llm.invoke(prompt)
            return JsonResponse({"response": response.strip()})
        except Exception as e:
            return JsonResponse({"error": f"AI model failed to respond: {str(e)}"}, status=500)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
