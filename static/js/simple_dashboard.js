
// Simple Dashboard specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log("Simple Dashboard script loaded");
    initializeSimpleDashboard();
});

function initializeSimpleDashboard() {
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const voiceModeButton = document.getElementById('voice-mode-button');
    const imageCreationButton = document.getElementById('image-creation-button');
    
    // Load recent conversations
    loadRecentConversations();

    // Handle voice mode button
    if (voiceModeButton) {
        voiceModeButton.addEventListener('click', function() {
            alert("Voice mode is coming soon!");
        });
    }

    // Handle image creation button
    if (imageCreationButton) {
        imageCreationButton.addEventListener('click', function() {
            alert("Image creation feature is coming soon!");
        });
    }

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
            typingIndicator.style.display = 'block';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Send query to server
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

                if (data.error) {
                    appendMessage('ai', `Error: ${data.error}`);
                } else {
                    // Display AI response
                    // Convert markdown to HTML (basic formatting)
                    let formattedResponse = data.ai_response
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code>$1</code>');
                    appendMessage('ai', formattedResponse);
                    
                    // Display remaining queries for free users if available
                    if (data.queries_remaining !== undefined) {
                        const remainingElem = document.querySelector('.queries-remaining');
                        if (remainingElem) {
                            remainingElem.textContent = `${data.queries_remaining} queries remaining`;
                        }
                    }
                }

                // Refresh recent conversations
                loadRecentConversations();
            })
            .catch(error => {
                console.error('Error:', error);
                typingIndicator.style.display = 'none';
                appendMessage('ai', 'Sorry, there was an error processing your request. Please try again.');
            });
        });
    }
}

function appendMessage(sender, content) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (sender === 'ai') {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'ai-response-header';
        headerDiv.textContent = 'Omi';
        contentDiv.appendChild(headerDiv);
    }
    
    const contentPara = document.createElement('div');
    contentPara.innerHTML = content;
    contentDiv.appendChild(contentPara);
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadRecentConversations() {
    const recentConversationsContainer = document.getElementById('recent-conversations');
    if (!recentConversationsContainer) return;

    fetch('/api/recent-conversations')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.conversations && data.conversations.length > 0) {
                recentConversationsContainer.innerHTML = '';
                
                data.conversations.forEach(conv => {
                    const convItem = document.createElement('div');
                    convItem.className = 'conversation-item';
                    
                    const queryPreview = document.createElement('div');
                    queryPreview.className = 'query-preview';
                    queryPreview.textContent = conv.query_text.length > 50 
                        ? conv.query_text.substring(0, 50) + '...'
                        : conv.query_text;
                    
                    const timestamp = document.createElement('div');
                    timestamp.className = 'timestamp';
                    const date = new Date(conv.created_at);
                    timestamp.textContent = date.toLocaleString();
                    
                    convItem.appendChild(queryPreview);
                    convItem.appendChild(timestamp);
                    
                    // Add click event to load the conversation
                    convItem.addEventListener('click', function() {
                        const messagesContainer = document.getElementById('messages-container');
                        if (messagesContainer) {
                            messagesContainer.innerHTML = '';
                            appendMessage('user', conv.query_text);
                            appendMessage('ai', conv.response.replace(/\n/g, '<br>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/`(.*?)`/g, '<code>$1</code>'));
                        }
                    });
                    
                    recentConversationsContainer.appendChild(convItem);
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
                    <small>Failed to load conversations</small>
                </div>
            `;
        });
}
