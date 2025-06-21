document.addEventListener('DOMContentLoaded', function () {
  const chatBookmark = document.getElementById('chatBookmark');
  const chatContainer = document.getElementById('chatContainer');
  const closeChat = document.getElementById('closeChat');
  const messagesContainer = document.getElementById('messagesContainer');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');

  let isOpen = false;

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

  function initChat() {
    messagesContainer.innerHTML = '';
    messagesContainer.scrollTop = 0;

    const typingIndicator = addTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator(typingIndicator);
      const greeting = "Welcome to myPUPQC! I'm your AI assistant, here to help you with any questions you have about PUPQC.";
      addMessage('ai', greeting);
      addQuickOptions();
    }, 1000);
  }

  function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    handleUserQuery(message);
    userInput.value = '';
  }

  function generateAIResponse(userMessage, typingIndicator) {
    fetch('/chatbot/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        removeTypingIndicator(typingIndicator);

        if (data.response) {
          addMessage('ai', data.response);
        } else if (data.error) {
          addMessage('ai', "Sorry, something went wrong: " + data.error);
        } else {
          addMessage('ai', "I'm having trouble resolving this. Let me get a human agent to assist you further.");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        removeTypingIndicator(typingIndicator);
        addMessage('ai', "Sorry mate, I'm having a bit of trouble on this, I'm still learning.");
      });
  }

  function addMessage(sender, text) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${sender}-message-container`;

    const avatarLetter = sender === 'user' ? 'U' : 'C';
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';

    const content = sender === 'ai' ? marked.parse(text) : text;

    messageContainer.innerHTML = `
      ${sender === 'ai' ? `<div class="message-avatar">${avatarLetter}</div>` : ''}
      <div class="message ${messageClass}">
        <div class="message-content">${content}</div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
      ${sender === 'user' ? `<div class="message-avatar">${avatarLetter}</div>` : ''}
    `;

    messagesContainer.appendChild(messageContainer);
    scrollToBottom();
  }

  function removeTypingIndicator(element) {
    if (element && element.parentNode) {
      element.remove();
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function openChat() {
    isOpen = true;
    chatContainer.classList.add('open');
    chatBookmark.style.opacity = '0';
    chatBookmark.style.pointerEvents = 'none';
    initChat();
    setTimeout(() => userInput.focus(), 300);
  }

  function closeChatWindow() {
    isOpen = false;
    chatContainer.classList.remove('open');
    chatBookmark.style.opacity = '1';
    chatBookmark.style.pointerEvents = 'auto';
  }

  chatBookmark.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!isOpen) openChat();
  });

  closeChat.addEventListener('click', function (e) {
    e.stopPropagation();
    closeChatWindow();
  });

  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function handleUserQuery(displayText, messageToSend = null) {
    addMessage('user', displayText);
    const typingIndicator = addTypingIndicator();
    generateAIResponse(messageToSend || displayText, typingIndicator);
  }

  function addQuickOptions() {
    $.ajax({
      url: "/sysAdmin/config/manage_labels/",
      type: "GET",
      success: function (res) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'quick-options';

        const title = document.createElement('div');
        title.className = 'quick-options-title';
        title.textContent = "Quick questions you might have:";
        optionsContainer.appendChild(title);

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'quick-options-buttons';

        if (res.status === "success" && res.data.length > 0) {
          res.data.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quick-option-button';
            button.textContent = option.label_name;

            button.onclick = () => {
              handleUserQuery(option.label_name);
              optionsContainer.remove();
            };

            buttonGroup.appendChild(button);
          });
        } else {
          const noOptions = document.createElement('p');
          noOptions.textContent = "No quick options available.";
          noOptions.style.padding = '10px';
          buttonGroup.appendChild(noOptions);
        }

        optionsContainer.appendChild(buttonGroup);
        messagesContainer.appendChild(optionsContainer);
      },
      error: function (xhr) {
        console.error("Failed to load quick options:", xhr.responseText);
      }
    });
  }

});


// // Wait for the HTML document to fully load before running the script
// document.addEventListener('DOMContentLoaded', function () {

//   // Get all necessary DOM elements for the chatbot interface
//   const chatBookmark = document.getElementById('chatBookmark');
//   const chatContainer = document.getElementById('chatContainer');
//   const closeChat = document.getElementById('closeChat');
//   const messagesContainer = document.getElementById('messagesContainer');
//   const userInput = document.getElementById('userInput');
//   const sendButton = document.getElementById('sendButton');

//   // State to check if the chat is open
//   let isOpen = false;

//   // Show typing indicator (3 dots)
//   function addTypingIndicator() {
//     const typingContainer = document.createElement('div');
//     typingContainer.className = 'message-container ai-message-container';
//     typingContainer.innerHTML = `
//       <div class="message-avatar">C</div>
//       <div class="message ai-message typing-indicator">
//         <div class="message-content">
//           <span class="typing-dot"></span>
//           <span class="typing-dot"></span>
//           <span class="typing-dot"></span>
//         </div>
//       </div>
//     `;
//     messagesContainer.appendChild(typingContainer);
//     scrollToBottom();
//     return typingContainer;
//   }

//   // Initialize chat with a welcome message and quick options
//   function initChat() {
//     messagesContainer.innerHTML = ''; // Clear previous messages
//     messagesContainer.scrollTop = 0;  // Reset scroll

//     const typingIndicator = addTypingIndicator(); // Show typing animation

//     // Simulate AI thinking and respond after 1 second
//     setTimeout(() => {
//       removeTypingIndicator(typingIndicator); // Remove typing
//       const greeting = "Welcome to myPUPQC! I'm your AI assistant, here to help you with any questions you have about PUPQC.";
//       addMessage('ai', greeting); // Add welcome message
//       addQuickOptions();          // Show quick response options
//     }, 1000);
//   }

//   // Handle sending the user's message
//   function sendMessage() {
//     const message = userInput.value.trim();
//     if (message === '') return; // Prevent sending empty messages
//     handleUserQuery(message);   // Process user input
//     userInput.value = '';       // Clear input box
//   }

//   // Send user message to backend and handle AI response
//   function generateAIResponse(userMessage, typingIndicator) {
//     fetch('/chatbot/', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ message: userMessage }),
//     })
//       .then(response => {
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         return response.json(); // Parse response
//       })
//       .then(data => {
//         removeTypingIndicator(typingIndicator); // Remove typing once response received

//         if (data.response) {
//           addMessage('ai', data.response); // Display AI reply
//         } else if (data.error) {
//           addMessage('ai', "Sorry, something went wrong: " + data.error); // Show error
//         } else {
//           addMessage('ai', "I'm having trouble resolving this. Let me get a human agent to assist you further."); // Fallback
//         }
//       })
//       .catch(error => {
//         console.error('Error:', error);
//         removeTypingIndicator(typingIndicator);
//         addMessage('ai', "Sorry mate, I'm having a bit of trouble on this, I'm still learning."); // On fetch error
//       });
//   }

//   // Add a message to the chat window (AI or user)
//   function addMessage(sender, text) {
//     const messageContainer = document.createElement('div');
//     messageContainer.className = `message-container ${sender}-message-container`;

//     const avatarLetter = sender === 'user' ? 'U' : 'C'; // U for user, C for chatbot
//     const messageClass = sender === 'user' ? 'user-message' : 'ai-message';

//     // AI messages support Markdown, user messages are plain
//     const content = sender === 'ai' ? marked.parse(text) : text;

//     messageContainer.innerHTML = `
//       ${sender === 'ai' ? `<div class="message-avatar">${avatarLetter}</div>` : ''}
//       <div class="message ${messageClass}">
//         <div class="message-content">${content}</div>
//         <div class="message-time">${getCurrentTime()}</div>
//       </div>
//       ${sender === 'user' ? `<div class="message-avatar">${avatarLetter}</div>` : ''}
//     `;

//     messagesContainer.appendChild(messageContainer);
//     scrollToBottom(); // Auto-scroll to latest message
//   }

//   // Remove typing animation from the chat
//   function removeTypingIndicator(element) {
//     if (element && element.parentNode) {
//       element.remove();
//     }
//   }

//   // Get current time in HH:MM AM/PM format
//   function getCurrentTime() {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   }

//   // Scroll to the bottom of chat container
//   function scrollToBottom() {
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
//   }

//   // Show chat window
//   function openChat() {
//     isOpen = true;
//     chatContainer.classList.add('open');
//     chatBookmark.style.opacity = '0';
//     chatBookmark.style.pointerEvents = 'none';
//     initChat();
//     setTimeout(() => userInput.focus(), 300); // Focus input field
//   }

//   // Close chat window
//   function closeChatWindow() {
//     isOpen = false;
//     chatContainer.classList.remove('open');
//     chatBookmark.style.opacity = '1';
//     chatBookmark.style.pointerEvents = 'auto';
//   }

//   // When the user clicks the chat bookmark icon
//   chatBookmark.addEventListener('click', function (e) {
//     e.stopPropagation();
//     if (!isOpen) openChat();
//   });

//   // When the user clicks the close button
//   closeChat.addEventListener('click', function (e) {
//     e.stopPropagation();
//     closeChatWindow();
//   });

//   // Send message on click of the send button
//   sendButton.addEventListener('click', sendMessage);

//   // Send message on Enter key
//   userInput.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') sendMessage();
//   });

//   // Handles user's question and shows typing animation
//   function handleUserQuery(displayText, messageToSend = null) {
//     addMessage('user', displayText); // Show user message
//     const typingIndicator = addTypingIndicator(); // Show typing animation
//     generateAIResponse(messageToSend || displayText, typingIndicator); // Get AI reply
//   }

//   // Load and display quick response buttons from backend
//   function addQuickOptions() {
//     $.ajax({
//       url: "/sysAdmin/config/manage_labels/",
//       type: "GET",
//       success: function (res) {
//         const optionsContainer = document.createElement('div');
//         optionsContainer.className = 'quick-options';

//         const title = document.createElement('div');
//         title.className = 'quick-options-title';
//         title.textContent = "Quick questions you might have:";
//         optionsContainer.appendChild(title);

//         const buttonGroup = document.createElement('div');
//         buttonGroup.className = 'quick-options-buttons';

//         // If quick labels are available from backend
//         if (res.status === "success" && res.data.length > 0) {
//           res.data.forEach(option => {
//             const button = document.createElement('button');
//             button.className = 'quick-option-button';
//             button.textContent = option.label_name;

//             // Send selected option as message when clicked
//             button.onclick = () => {
//               handleUserQuery(option.label_name);
//               optionsContainer.remove(); // Remove options after selection
//             };

//             buttonGroup.appendChild(button);
//           });
//         } else {
//           // No quick options available
//           const noOptions = document.createElement('p');
//           noOptions.textContent = "No quick options available.";
//           noOptions.style.padding = '10px';
//           buttonGroup.appendChild(noOptions);
//         }

//         optionsContainer.appendChild(buttonGroup);
//         messagesContainer.appendChild(optionsContainer); // Show in chat
//       },
//       error: function (xhr) {
//         console.error("Failed to load quick options:", xhr.responseText); // Show error in console
//       }
//     });
//   }

// });
