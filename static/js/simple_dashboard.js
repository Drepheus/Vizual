document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const voiceModeButton = document.getElementById('voice-mode-button');
    const imageCreationButton = document.getElementById('image-creation-button');

    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${type}`;

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="formatted-content">${content}</div>
                </div>
            `;
        } else {
            // Parse markdown and handle formatting
            const formattedContent = marked.parse(content);
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="ai-response-header">Omi</div>
                    <div class="formatted-content"></div>
                </div>
            `;
            
            if (type === 'ai') {
                const formattedDiv = messageDiv.querySelector('.formatted-content');
                typingIndicator.style.display = 'none';
                let i = 0;
                
                const typeText = () => {
                    if (i < formattedContent.length) {
                        formattedDiv.innerHTML = formattedContent.substring(0, i + 1);
                        i++;
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        setTimeout(typeText, 20);
                    }
                };
                
                typeText();
            }
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Initialize recent conversations
    loadRecentConversations();

    // Handle query form
    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!queryInput) return;

            const query = queryInput.value.trim();
            if (!query) return;

            // Add user message to chat
            appendMessage('user', query);
            queryInput.value = '';

            // Show typing indicator
            typingIndicator.style.display = 'flex';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Send query to backend
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            })
            .then(response => response.json())
            .then(data => {
                // Hide typing indicator
                typingIndicator.style.display = 'none';

                // Add AI response to chat with proper formatting
                if (data.ai_response) {
                    appendMessage('ai', data.ai_response);
                } else {
                    appendMessage('ai', 'Sorry, I received an invalid response format.');
                }

                // Refresh recent conversations
                loadRecentConversations();
            })
            .catch(error => {
                console.error('Error:', error);
                typingIndicator.style.display = 'none';
                appendMessage('ai', 'Sorry, I encountered an error. Please try again.');
            });
        });
    }

    // Voice and image button handlers
    if (voiceModeButton) {
        voiceModeButton.addEventListener('click', () => {
            alert("Voice mode is coming soon!");
        });
    }

    if (imageCreationButton) {
        imageCreationButton.addEventListener('click', () => {
            alert("Image creation feature is coming soon!");
        });
    }
});

function loadRecentConversations() {
    const recentConversationsDiv = document.getElementById('recent-conversations');
    if (!recentConversationsDiv) return;

    fetch('/api/recent-conversations')
        .then(response => response.json())
        .then(data => {
            if (data.conversations && data.conversations.length > 0) {
                recentConversationsDiv.innerHTML = '';
                
                // Create conversation items with click handlers
                data.conversations.forEach(conv => {
                    const conversationItem = document.createElement('div');
                    conversationItem.className = 'conversation-item';
                    conversationItem.innerHTML = `
                        <div class="query-preview">${conv.query_text}</div>
                        <div class="timestamp">${new Date(conv.created_at).toLocaleString()}</div>
                    `;
                    
                    // Add click event listener
                    conversationItem.addEventListener('click', function() {
                        // Find the query input and messages container
                        const queryInput = document.getElementById('query-input');
                        const messagesContainer = document.getElementById('messages-container');
                        
                        if (queryInput && messagesContainer) {
                            // Clear existing messages except the first welcome message
                            while (messagesContainer.children.length > 1) {
                                messagesContainer.removeChild(messagesContainer.lastChild);
                            }
                            
                            // Add the query as a user message
                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'message-bubble user';
                            messageDiv.innerHTML = `
                                <div class="message-content">
                                    <div class="formatted-content">${conv.query_text}</div>
                                </div>
                            `;
                            messagesContainer.appendChild(messageDiv);
                            
                            // Add the response as an AI message
                            const responseDiv = document.createElement('div');
                            responseDiv.className = 'message-bubble ai';
                            responseDiv.innerHTML = `
                                <div class="message-content">
                                    <div class="ai-response-header">Omi</div>
                                    <div class="formatted-content">${marked.parse(conv.response)}</div>
                                </div>
                            `;
                            messagesContainer.appendChild(responseDiv);
                            
                            // Scroll to the bottom of the messages container
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            
                            // Set the query in the input field
                            queryInput.value = conv.query_text;
                            queryInput.focus();
                        }
                    });
                    
                    recentConversationsDiv.appendChild(conversationItem);
                });
            } else {
                recentConversationsDiv.innerHTML = '<div class="text-center py-3 text-muted"><small>No recent conversations</small></div>';
            }
        })
        .catch(error => {
            console.error('Error loading conversations:', error);
            recentConversationsDiv.innerHTML = '<div class="text-center py-3 text-danger"><small>Error loading conversations</small></div>';
        });
}