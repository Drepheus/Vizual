
document.addEventListener('DOMContentLoaded', function() {
    // Get necessary DOM elements
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const voiceModeButton = document.getElementById('voice-mode-button');
    const imageCreationButton = document.getElementById('image-creation-button');
    const submitButton = document.getElementById('submit-query');
    
    console.log("Simple Dashboard script loaded");

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
                
                // Add AI response to chat
                appendMessage('ai', data.response);
                
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

    // Handle voice mode button
    if (voiceModeButton) {
        voiceModeButton.addEventListener('click', function() {
            alert("Voice mode is coming soon!");
        });
    }

    // Handle image creation button
    if (imageCreationButton) {
        imageCreationButton.addEventListener('click', function() {
            console.log("Image creation button clicked");

            try {
                // Open Leonardo AI in a new tab
                const leonardoWindow = window.open('https://app.leonardo.ai/realtime-gen', '_blank');
                
                if (!leonardoWindow || leonardoWindow.closed || typeof leonardoWindow.closed == 'undefined') {
                    // Popup was blocked, use direct navigation
                    window.location.href = 'https://app.leonardo.ai/realtime-gen';
                }

                // Provide feedback to the user
                const feedback = document.createElement('div');
                feedback.className = 'popup-blocked-notification';
                feedback.innerHTML = `
                    <div class="notification-content">
                        <p><i class="fas fa-check-circle"></i> Opening Leonardo AI image generation...</p>
                    </div>
                `;

                document.body.appendChild(feedback);

                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(feedback)) {
                        document.body.removeChild(feedback);
                    }
                }, 3000);
            } catch (error) {
                console.error("Error opening Leonardo AI:", error);

                // Show error notification
                const errorNotification = document.createElement('div');
                errorNotification.className = 'popup-blocked-notification';
                errorNotification.innerHTML = `
                    <div class="notification-content error-notification">
                        <p><i class="fas fa-exclamation-triangle"></i> Could not open Leonardo AI. Please try again or check your browser settings.</p>
                        <button class="notification-close">Dismiss</button>
                    </div>
                `;

                document.body.appendChild(errorNotification);

                // Add dismiss functionality
                const closeBtn = errorNotification.querySelector('.notification-close');
                closeBtn.addEventListener('click', function() {
                    document.body.removeChild(errorNotification);
                });

                // Auto-dismiss after 10 seconds
                setTimeout(() => {
                    if (document.body.contains(errorNotification)) {
                        document.body.removeChild(errorNotification);
                    }
                }, 10000);
            }
        });
    } else {
        console.error("Image creation button not found in the DOM");
    }

    // Function to append message to chat
    function appendMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${sender}`;
        
        // Format content (handle code blocks, bullet points, etc.)
        const formattedContent = formatContent(content);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${sender === 'ai' ? '<div class="ai-response-header">Omi</div>' : ''}
                <div class="formatted-content">${formattedContent}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to format message content
    function formatContent(content) {
        // Convert markdown-style code blocks
        let formatted = content.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
        
        // Convert inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert URLs to links
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert bullet points
        formatted = formatted.replace(/\n\s*-\s+([^\n]+)/g, '\n<ul><li>$1</li></ul>');
        formatted = formatted.replace(/<\/ul>\n<ul>/g, '');
        
        // Convert newlines to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    // Function to load recent conversations
    function loadRecentConversations() {
        const recentConversationsContainer = document.getElementById('recent-conversations');
        if (!recentConversationsContainer) return;
        
        fetch('/api/recent-conversations')
            .then(response => response.json())
            .then(data => {
                if (data.conversations && data.conversations.length > 0) {
                    recentConversationsContainer.innerHTML = '';
                    
                    data.conversations.forEach(conversation => {
                        const conversationDiv = document.createElement('div');
                        conversationDiv.className = 'conversation-item';
                        conversationDiv.innerHTML = `
                            <div class="conversation-header">
                                <span class="conversation-date">${new Date(conversation.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="conversation-query">${conversation.query}</div>
                        `;
                        
                        conversationDiv.addEventListener('click', function() {
                            queryInput.value = conversation.query;
                            queryInput.focus();
                        });
                        
                        recentConversationsContainer.appendChild(conversationDiv);
                    });
                } else {
                    recentConversationsContainer.innerHTML = `
                        <div class="text-center py-3 text-muted">
                            <small>No recent conversations</small>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading recent conversations:', error);
                recentConversationsContainer.innerHTML = `
                    <div class="text-center py-3 text-danger">
                        <small>Error loading conversations</small>
                    </div>
                `;
            });
    }
});
