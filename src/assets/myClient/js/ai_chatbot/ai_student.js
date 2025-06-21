document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatBookmark = document.getElementById('chatBookmark');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
    const messagesContainer = document.getElementById('messagesContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    let isOpen = false;

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');

            if (tabId === 'chatTab') {
                setTimeout(scrollToBottom, 100);
            }
        });
    });

    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            answer.style.maxHeight = question.classList.contains('active') ? answer.scrollHeight + 'px' : '0';
        });
    });

    // Simulated AI responses
    const aiResponses = [
        "I can help you with that!",
        "Interesting question. Let me think...",
        "Here's what I found:",
        "Thanks for asking! The answer is:",
        "That's a common question. Basically,",
        "According to our records:",
        "The official policy states that:",
        "You'll need to:",
        "Here's how to proceed:"
    ];

    // Sample knowledge base
    const knowledgeBase = {
        "hello": "Hello there! How can I assist you today?",
        "hi": "Hi! What can I help you with?",
        "thanks": "You're welcome! Is there anything else I can help with?",
        "thank you": "My pleasure! Feel free to ask if you have more questions.",
        "enroll": "You can enroll through the student portal during enrollment periods. Visit portal.pupqc.edu.ph and look for the enrollment section.",
        "grades": "Grades are typically released 2 weeks after finals. Check your student portal under 'Academic Records'.",
        "tuition": "Tuition fees vary by program. You can find the complete fee structure on the PUPQC website's finance section.",
        "schedule": "Class schedules are available on the student portal 1 week before classes start.",
        "professor": "You can find faculty information on the PUPQC website under 'Faculty Directory'.",
        "library": "The library is open Monday to Friday from 8:00 AM to 5:00 PM.",
        "deadline": "Important deadlines are posted on the official PUPQC bulletin and website."
    };

    // Initialize chat
    function initChat() {
        messagesContainer.innerHTML = ''; // Clear any existing messages
        messagesContainer.scrollTop = 0; // Start at top

        // Add welcome message
        addMessage('ai', "Hello! I'm myPUPQC AI. How can I help you today?");

        // Show suggested chats after message appears
        setTimeout(showSuggestedChats, 300);
    }

    // Show suggested chats
    function showSuggestedChats() {
        const container = document.createElement('div');
        container.className = 'suggested-chats-container';

        let html = '<h3>Quick questions you might have:</h3>';
        suggestedChats.forEach(chat => {
            html += `<div class="suggested-chat" data-query="${chat.toLowerCase()}">${chat}</div>`;
        });

        container.innerHTML = html;
        messagesContainer.appendChild(container);

        // Add click handlers
        document.querySelectorAll('.suggested-chat').forEach(button => {
            button.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                container.remove();
                addMessage('user', query);

                const typingIndicator = addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator(typingIndicator);
                    generateAIResponse(query);
                }, 1000);
            });
        });

        scrollToBottom();
    }

    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        addMessage('user', message);
        userInput.value = '';

        const typingIndicator = addTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator(typingIndicator);
            generateAIResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    // Generate AI response
    // Generate AI response from backend
    function generateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // First, check if the message is answerable from the local knowledge base
        const localResponse = getKnowledgeResponse(lowerMessage);

        if (localResponse) {
            // Respond from the hardcoded knowledge base
            addMessage('ai', localResponse);
        } else {
            // Fallback to backend AI response
            fetch('/chatbot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: lowerMessage }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.response) {
                    addMessage('ai', data.response);
                } else if (data.error) {
                    addMessage('ai', "Sorry, something went wrong: " + data.error);
                } else {
                    // Optional: fallback to a random response if AI is confused
                    addMessage('ai', getRandomResponse());
                }
            })
            .catch(error => {
                console.error('Error:', error);
                addMessage('ai', "Failed to connect to the AI server.");
            });
        }
    }


    // Check knowledge base for response
    function getKnowledgeResponse(message) {
        for (const [keyword, response] of Object.entries(knowledgeBase)) {
            if (message.includes(keyword)) {
                return response;
            }
        }
        return null;
    }

    // Get random response
    function getRandomResponse() {
        return aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }

    function addMessage(sender, text) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${sender}-message-container`;

        const avatarLetter = sender === 'user' ? 'U' : 'C';
        const messageClass = sender === 'user' ? 'user-message' : 'ai-message';

        messageContainer.innerHTML = `
            ${sender === 'ai' ? `<div class="message-avatar">${avatarLetter}</div>` : ''}
            <div class="message ${messageClass}">
                <div class="message-content">${text}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
            ${sender === 'user' ? `<div class="message-avatar">${avatarLetter}</div>` : ''}
        `;

        messagesContainer.appendChild(messageContainer);
        scrollToBottom();
    }

    // Add typing indicator with external avatar
    function addTypingIndicator() {
        const typingContainer = document.createElement('div');
        typingContainer.className = 'message-container ai-message-container';

        typingContainer.innerHTML = `
            <div class="message-avatar">C</div>
            <div class="message ai-message typing-indicator">
                <div class="message-content">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingContainer);
        scrollToBottom();
        return typingContainer;
    }
    // Remove typing indicator
    function removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.remove();
        }
    }

    // Helper functions
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Observe mutations to auto-scroll when new messages are added
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                scrollToBottom();
            }
        }
    });

    observer.observe(messagesContainer, {
        childList: true,
        subtree: true
    });

    // Toggle chat with bookmark
    chatBookmark.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!isOpen) {
            openChat();
        }
    });

    // Close chat with close button
    closeChat.addEventListener('click', function(e) {
        e.stopPropagation();
        closeChatWindow();
    });

    function openChat() {
        isOpen = true;
        chatContainer.classList.add('open');
        chatBookmark.style.opacity = '0';
        chatBookmark.style.pointerEvents = 'none';
        // Set focus to input when opening
        setTimeout(() => userInput.focus(), 300);
    }

    function closeChatWindow() {
        isOpen = false;
        chatContainer.classList.remove('open');
        chatBookmark.style.opacity = '1';
        chatBookmark.style.pointerEvents = 'auto';
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initialize chat on load
    initChat();
});


