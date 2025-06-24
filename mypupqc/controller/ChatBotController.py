import json
import os
import random
from difflib import get_close_matches
from django.http import JsonResponse


def load_knowledge_base(file_path: str) -> dict:
    with open(file_path, 'r') as file:
        return json.load(file)
    

def save_knowledge_base(file_path: str, data: dict) -> None:
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)


def find_best_match(user_question: str, questions: list[str]) -> str | None:
    matches: list = get_close_matches(user_question, questions, n=1, cutoff=0.55)
    return matches[0] if matches else None


def get_answer_for_question(question: str, knowledge_base: dict) -> str | None:
    for q in knowledge_base["questions"]:
        if q["question"] == question:
            return q["answer"]
        

def getAnswer(request) -> str:
    knowledge_base: dict = load_knowledge_base("static/js/cb-knowledge-base.json")
    best_match: str | None = find_best_match(request.POST.get('message'), [q["question"] for q in knowledge_base["questions"]])

    if best_match:
        return JsonResponse({"answer": get_answer_for_question(best_match, knowledge_base)}, safe=False)
    else:
        idk_responses = [
            "I'm sorry, I do not how to answer that question. Please rephrase it or ask another question.",
            "Can you please rephrase that question?",
            "I'm not sure what you're asking. Can you please ask another question?",
            "I'm sorry, I do not understand that question.",
            "Unfortunately, I do not know how to answer that question.",
            "I will need more information to answer that question.",
        ]
        response: str = random.choice(idk_responses)
        return JsonResponse({"answer": response}, safe=False)
        

def chat_bot():
    knowledge_base: dict = load_knowledge_base("static/js/cb-knowledge-base.json")

    while True:
        user_input: str = input("You: ")

        if user_input.lower() == "exit" or user_input.lower() == "quit":
            break

        best_match: str | None = find_best_match(user_input, [q["question"] for q in knowledge_base["questions"]])

        if best_match:
            answer: str | None = get_answer_for_question(best_match, knowledge_base)
            print(f"Bot: {answer}")
        else:
            print("Bot: I'm sorry, I do not understand that question.")
            user_answer: str = input("Bot: Would you like to add this question to my knowledge base? (yes/no) ")

            if user_answer.lower() == "yes":
                user_answer: str = input("Bot: What is the answer to that question? ")
                knowledge_base["questions"].append({"question": user_input, "answer": user_answer})
                save_knowledge_base("static/js/cb-knowledge-base.json", knowledge_base)
                print("Bot: Question has been added to my knowledge base.")
            else:
                print("Bot: Okay, let me know if you have any other questions.")


if __name__ == "__main__":
    os.system('cls' if os.name == 'nt' else 'clear')
    chat_bot()