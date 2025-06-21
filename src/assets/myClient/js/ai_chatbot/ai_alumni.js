document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleBtn"),
          chatBubble = document.getElementById("chatBubble"),
          chatInput = document.getElementById("chatInput"),
          sendBtn = document.getElementById("sendBtn"),
          chatBody = document.querySelector(".chat-body"),
          chatHeader = document.querySelector(".chat-header");

    let suggestedChatClicked = false;

    const icons = {
        message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        send: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2Z"></path></svg>`
    };

    toggleButton.innerHTML = icons.message;
    sendBtn.innerHTML = icons.send;

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
        profileIcon.textContent = type === "sent" ? "A" : "C";
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
    
            if (["ALUMNI SERVICES", "SERVICES", "FAQ Request"].includes(text)) {
                suggestedBtn.classList.add("highlighted-btn");
            }
    
            suggestedBtn.textContent = text;
    
            suggestedBtn.addEventListener("click", () => {
                addMessage(text, "sent"); // Send the message when clicked
                suggestedBtn.remove(); // Remove only the clicked button
    
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
    
        setTimeout(() => {
            chatBody.appendChild(suggestedContainer);
        }, 200);
    };
    
    
    

    const showSuggestedChat = () => {
        if (!suggestedChatClicked && !document.querySelector(".suggested-container")) {
            createSuggestedChat([
                {
                    text: "ALUMNI SERVICES",
                    subOptions: [
                        { text: "PUP Alumni", response: "Here is the PUP Alumni..." }
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
                    text: "FAQ Request",
                    subOptions: [
                        { text: "Online Document Request", response: "Request Document..." },
                        { text: "Transcript of Records", response: "Request TOR..." },
                        { text: "Diploma Claiming", response: "Request Diploma..." },
                        { text: "Alumni ID", response: "Request Alumni ID..." },
                        { text: "PUP Visitor Appointment", response: "Request Appointment..." },

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

    chatInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendBtn.click();
    });

    const userRole = "Alumni",
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
});
