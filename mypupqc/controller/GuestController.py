from django.shortcuts import render
from django.views.generic.base import TemplateView
from mypupqc.helper import *
from mypupqc.models import *
from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse


# Dummy method for waking up render
def ping(request):
    return JsonResponse({"message": "pong"})


def getSlideshows(request):
    slideshows = SlideShow.objects.filter(isActive=1, status="Active")
    mainSlideshows = slideshows.filter(section="main")
    pupqcSlideshows = slideshows.filter(section="mypupqc")
    slideshowList = {}

    mainSlideshows = [
        {
            "slideshowID": slideshow.slideshowID,
            "image": slideshow.image.url,
        }
        for slideshow in mainSlideshows
    ]
    pupqcSlideshows = [
        {
            "slideshowID": slideshow.slideshowID,
            "image": slideshow.image.url,
        }
        for slideshow in pupqcSlideshows
    ]

    slideshowList['main'] = mainSlideshows
    slideshowList['mypupqc'] = pupqcSlideshows

    return JsonResponse({"slideshows": slideshowList})


def getArticles(request):
    articles = ArticlesSection.objects.filter(
            isActive=1, status="Active", 
            startDate__lte=timezone.now(), 
            endDate__gte=timezone.now()
        ). order_by('-startDate').values(
            'articleID', 'articleTitle', 'articleDescription',
            'articleImage', 'startDate', 'endDate'
        )
    articleList = [
        {
            "articleID": article["articleID"],
            "articleTitle": article["articleTitle"],
            "articleDescription": article["articleDescription"],
            "articleImage": article["articleImage"].url,
            "startDate": article["startDate"],
            "endDate": article["endDate"],
        }
        for article in articles
    ]

    return JsonResponse({"articles": articleList})


def getFAQs(request):
    faqs = FrequentlyAskedQuestions.objects.filter(isActive=1, status="Active")
    faqList = [
        {
            "faqID": faq.faqID,
            "question": faq.question,
            "answer": faq.answer,
        }
        for faq in faqs
    ]

    return JsonResponse({"faqs": faqList})
    

def getHowToLinks(request):
    howToLinks = HowToLinks.objects.filter(isActive=1, status="Active").order_by('howtoName')
    howToLinksList = [
        {
            "howtoID": howToLink.howtoID,
            "howtoName": howToLink.howtoName,
            "howtoLink": howToLink.howtoLink,
        }
        for howToLink in howToLinks
    ]

    return JsonResponse({"howtoLinks": howToLinksList})