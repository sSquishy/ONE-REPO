document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleBtn"),
          chatBubble = document.getElementById("chatBubble"),
          chatInput = document.getElementById("chatInput"),
          sendBtn = document.getElementById("sendBtn"),
          chatBody = document.querySelector(".chat-body"),
          chatHeader = document.querySelector(".chat-header");

    let suggestedChatClicked = false;

<<<<<<< Updated upstream
    const icons = {
        message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        send: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2Z"></path></svg>`
=======
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

    // Knowledge base with detailed responses
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
        "deadline": "Important deadlines are posted on the official PUPQC bulletin and website.",
        "freshmen guide": "Here's the Freshmen Guide content:\n\n1. Enrollment Process: Complete online registration via the student portal\n2. Required Documents: PSA birth certificate, Form 138, Good Moral Certificate\n3. Orientation Schedule: Typically held 1 week before classes start\n4. First Week Tips: Arrive early, bring your schedule, locate all classrooms beforehand\n5. Important Contacts: Registrar (123-4567), Dean's Office (123-4568)",
        "scholarship": "Available scholarships at PUPQC:\n\n1. Academic Scholarship - For students with 1.5 GWA or better\n2. Socio-Economic Scholarship - For financially challenged students\n3. Athletic Scholarship - For varsity team members\n\nApplications are accepted every semester through the OSA.",
        "calendar": "Academic Calendar 2023-2024:\n\n- First Semester: August 14 - December 15\n- Midterm Break: October 23-27\n- Finals Week: December 11-15\n- Second Semester: January 8 - May 18\n- Summer Term: June 5 - July 28",
        "contact": "Important PUPQC Contacts:\n\n- Registrar's Office: (02) 123-4567\n- Dean's Office: (02) 123-4568\n- Library: (02) 123-4569\n- Cashier: (02) 123-4570\n\nEmail: info@pupqc.edu.ph"
>>>>>>> Stashed changes
    };

    toggleButton.innerHTML = icons.message;
    sendBtn.innerHTML = icons.send;

<<<<<<< Updated upstream
    const toggleChat = () => {
        chatBubble.classList.toggle("active");
        toggleButton.classList.toggle("active");
        toggleButton.innerHTML = chatBubble.classList.contains("active") ? icons.close : icons.message;
        if (chatBubble.classList.contains("active") && !suggestedChatClicked) showSuggestedChat();
    };

    toggleButton.addEventListener("click", toggleChat);

    const createMessageElement = (text, type) => {
        const messageContainer = document.createElement("div"),
              profileIcon = document.createElement("div"),
              messageDiv = document.createElement("div");

        messageContainer.classList.add("message-container", type === "sent" ? "sent-container" : "received-container");
        profileIcon.classList.add("profile-icon");
        profileIcon.textContent = type === "sent" ? "G" : "C";
        messageDiv.classList.add("message", type);
        messageDiv.textContent = text;

        type === "sent" ? messageContainer.append(messageDiv, profileIcon) : messageContainer.append(profileIcon, messageDiv);

        return messageContainer;
    };

    const addMessage = (text, type) => {
        chatBody.appendChild(createMessageElement(text, type));
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const createSuggestedChat = (options, parentBtn = null) => {
        if (parentBtn) parentBtn.remove(); // Remove the parent button when clicked
    
        const suggestedContainer = document.createElement("div");
        suggestedContainer.classList.add("suggested-container");
    
        options.forEach(({ text, subOptions, response }) => {
            const suggestedBtn = document.createElement("button");
            suggestedBtn.classList.add("suggested-btn");
    
            if (["STUDENT GUIDE", "SERVICES", "STUDENT SERVICES", "About myPUPQC"].includes(text)) {
                suggestedBtn.classList.add("highlighted-btn");
            }
    
            suggestedBtn.textContent = text;
    
            suggestedBtn.addEventListener("click", () => {
                addMessage(text, "sent"); // Send the message when clicked
                suggestedBtn.remove(); // Remove only the clicked button
    
=======
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
>>>>>>> Stashed changes
                setTimeout(() => {
                    if (subOptions) {
                        createSuggestedChat(subOptions); // Show sub-options
                    } else {
                        addMessage(response, "received"); // Respond from chatbot
                    }
                }, 800);
            });
    
            suggestedContainer.appendChild(suggestedBtn);
        });
<<<<<<< Updated upstream
    
=======

        scrollToBottom();
    }

    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        addMessage('user', message);
        userInput.value = '';

        const typingIndicator = addTypingIndicator();

>>>>>>> Stashed changes
        setTimeout(() => {
            chatBody.appendChild(suggestedContainer);
        }, 200);
    };
    
    
    

    const showSuggestedChat = () => {
        if (!suggestedChatClicked && !document.querySelector(".suggested-container")) {
            createSuggestedChat([
                {
                    text: "STUDENT GUIDE",
                    subOptions: [
                        {
                            text: "Freshmen Guide",
                            subOptions: [
                                { text: "Freshmen Guide Content", response: "Here is the Freshmen Guide content..." }
                            ]
                        },
                        {
                            text: "Use PUPSIS Guide",
                            subOptions: [
                                { text: "How to view enrollment?", response: "Here’s how to view enrollment..." },
                                { text: "How to view my schedule?", response: "Here’s how to view your schedule..." },
                                { text: "How to view my Grades?", response: "Here’s how to view your grades..." },
                                { text: "How to view my accounts (payment)?", response: "Here’s how to check your payment..." },
                                { text: "How is Room TBA?", response: "Room TBA means To Be Announced..." }
                            ]
                        },
                        {
                            text: "Use SIS Guide",
                            subOptions: [
                                { text: "How to use PUP SIS Tools for enrollment?", response: "Here’s how to use PUP SIS..." }
                            ]
                        }
                    ]
                },
                {
                    text: "SERVICES",
                    subOptions: [
                        { text: "University Calendar", response: "Here is the University Calendar..." },
                        { text: "PUP Sinta", response: "PUP Sinta is..." },
                        { text: "Online Document Request System", response: "This system allows you to request documents online..." }
                    ]
                },
                {
                    text: "STUDENT SERVICES",
                    subOptions: [
                        { text: "PUP SIS", response: "PUP SIS is..." },
                        { text: "Scholarship", response: "Scholarship opportunities are available..." }
                    ]
                },
                {
                    text: "About myPUPQC",
                    subOptions: [
                        { text: "What is myPUPQC", response: "myPUPQC is..." },

                    ]
                }
            ]);
        }
    };

    sendBtn.addEventListener("click", () => {
        const messageText = chatInput.value.trim();
        if (messageText) {
            addMessage(messageText, "sent");
            chatInput.value = "";
            setTimeout(() => addMessage("I'm here to help! What do you need?", "received"), 1000);
        }
    });

<<<<<<< Updated upstream
    chatInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendBtn.click();
    });

    const userRole = "GUEST",
          roleInitial = userRole.charAt(0).toUpperCase(),
          profileIndicator = `<div class="profile-indicator">${roleInitial}</div>`;

    chatHeader.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center;">
                <img src="https://cdn-icons-png.flaticon.com/512/9081/9081491.png" alt="Star Icon" style="width: 24px; height: 24px; margin-right: 8px;">
                <span>myPUPQCI AI</span>
            </div>
            ${profileIndicator}
        </div>
    `;

    const profileEl = document.querySelector(".profile-indicator");
    profileEl.addEventListener("mouseenter", () => profileEl.textContent = userRole);
    profileEl.addEventListener("mouseleave", () => profileEl.textContent = roleInitial);
=======
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

    // Add typing indicator
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

    // MutationObserver for auto-scrolling
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
        setTimeout(() => userInput.focus(), 300);
    }

    function closeChatWindow() {
        isOpen = false;
        chatContainer.classList.remove('open');
        chatBookmark.style.opacity = '1';
        chatBookmark.style.pointerEvents = 'auto';
        initChat(); // Reset chat when closed
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initialize chat on load
    initChat();
>>>>>>> Stashed changes
});
