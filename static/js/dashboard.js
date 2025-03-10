document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');

    // Track AI response status
    let aiResponseReceived = false;

    // Initialize conversation history display
    loadConversationHistory();
    loadRecentConversations(); // Added to load conversations on page load

    // Handle query submission
    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Reset response status for new query
            aiResponseReceived = false;

            const query = queryInput.value.trim();
            if (query === '') return;

            // Clear input and show typing indicator
            queryInput.value = '';
            typingIndicator.style.display = 'block';

            // Add user message to UI
            const userMsg = `
                <div class="message-bubble user">
                    <div class="message-content">
                        <p>${query}</p>
                    </div>
                </div>
            `;
            messagesContainer.innerHTML += userMsg;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Send API request
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 429) {
                        return response.json().then(data => {
                            throw new Error(data.message || 'Free tier query limit reached');
                        });
                    }
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Hide typing indicator
                typingIndicator.style.display = 'none';

                if (data.error) {
                    // Handle error response
                    let errorMessage = data.message || 'Sorry, I encountered an error. Please try again.';

                    const errorMsg = `
                        <div class="message-bubble ai error">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Error
                                </div>
                                <p>${errorMessage}</p>
                            </div>
                        </div>
                    `;
                    messagesContainer.innerHTML += errorMsg;
                } else {
                    // Process successful response
                    const formattedResponse = data.ai_response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');

                    const aiMsg = `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <div class="formatted-content">${formattedResponse}</div>
                                ${data.queries_remaining !== undefined ? 
                                `<div class="queries-remaining mt-2 text-muted">
                                    <small>Queries remaining today: ${data.queries_remaining}</small>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                    messagesContainer.innerHTML += aiMsg;
                }

                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Update recent conversations
                loadRecentConversations();
            })
            .catch(error => {
                console.error('API Error:', error.message);
                typingIndicator.style.display = 'none';

                const errorMsg = `
                    <div class="message-bubble ai error">
                        <div class="message-content">
                            <div class="ai-response-header">
                                Error
                            </div>
                            <p>${error.message || 'Sorry, I encountered an error. Please try again.'}</p>
                        </div>
                    </div>
                `;
                messagesContainer.innerHTML += errorMsg;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
        });
    }

    // Load conversation history
    function loadConversationHistory() {
        const historyContainer = document.getElementById('conversation-history');
        if (!historyContainer) return;

        fetch('/api/recent_conversations')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.conversations && data.conversations.length > 0) {
                    historyContainer.innerHTML = '';

                    data.conversations.forEach(conv => {
                        const item = document.createElement('div');
                        item.className = 'history-item';
                        item.innerHTML = `
                            <div class="history-query">${conv.query_text}</div>
                            <div class="history-date">${new Date(conv.created_at).toLocaleString()}</div>
                        `;
                        item.addEventListener('click', function() {
                            // Add the conversation to the current chat
                            const userMsg = `
                                <div class="message-bubble user">
                                    <div class="message-content">
                                        <p>${conv.query_text}</p>
                                    </div>
                                </div>
                            `;

                            const aiMsg = `
                                <div class="message-bubble ai">
                                    <div class="message-content">
                                        <div class="ai-response-header">
                                            Omi
                                        </div>
                                        <div class="formatted-content">${conv.response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</div>
                                    </div>
                                </div>
                            `;

                            const messagesContainer = document.querySelector('.messages-container');
                            if (messagesContainer) {
                                messagesContainer.innerHTML += userMsg + aiMsg;
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }
                        });

                        historyContainer.appendChild(item);
                    });
                } else {
                    historyContainer.innerHTML = '<p class="text-muted">No conversation history yet.</p>';
                }
            })
            .catch(error => {
                console.error('Error loading conversation history:', error);
                if (historyContainer) {
                    historyContainer.innerHTML = '<p class="text-danger">Failed to load conversation history.</p>';
                }
            });
    }

    function addMessageToUI(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${isUser ? 'user' : 'ai'}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (!isUser) {
            const aiHeader = document.createElement('div');
            aiHeader.className = 'ai-response-header';
            aiHeader.textContent = 'Omi';
            messageContent.appendChild(aiHeader);
        }

        const messagePara = document.createElement('p');
        messagePara.textContent = text;
        messageContent.appendChild(messagePara);

        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        // Scroll to the bottom of the messages container
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function formatDate(date) {
        const now = new Date();
        const diff = now - date;

        // If less than 24 hours, show time
        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    }


    // Fetch recent conversations
    function loadRecentConversations() {
        const recentConversationsContainer = document.getElementById('recent-conversations');
        if (!recentConversationsContainer) return;

        fetch('/api/recent_conversations')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success' && data.conversations && data.conversations.length > 0) {
                    recentConversationsContainer.innerHTML = '';

                    data.conversations.forEach(conv => {
                        const convHtml = `
                            <div class="conversation-item mb-3">
                                <div class="query-bubble">
                                    <div class="query-text">${conv.query_text}</div>
                                    <div class="query-time small text-muted">${new Date(conv.created_at).toLocaleString()}</div>
                                </div>
                                <div class="message-bubble ai">
                                    <div class="message-content">
                                        <div class="ai-response-header">
                                            Omi
                                        </div>
                                        <div class="formatted-content">${conv.response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                        recentConversationsContainer.innerHTML += convHtml;
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
                console.error('Error loading conversations:', error);
                const recentConversationsContainer = document.getElementById('recent-conversations');
                if (recentConversationsContainer) {
                    recentConversationsContainer.innerHTML = `
                        <div class="text-center py-3 text-danger">
                            <small>Error loading conversations: ${error.message}</small>
                        </div>
                    `;
                }
            });
    }

    // SAM.gov search form handler if available
    const samSearchForm = document.getElementById('sam-search-form');
    if (samSearchForm) {
        samSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('sam-search-input');
            if (!searchInput || searchInput.value.trim() === '') return;

            // Handle SAM.gov search logic here
            // This is just a placeholder
            console.log('Searching SAM.gov for:', searchInput.value);
        });
    }
});