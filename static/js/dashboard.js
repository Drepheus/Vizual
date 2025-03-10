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
            typingIndicator.style.display = 'flex';

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
            .then(response => response.json())
            .then(data => {
                // Mark that we received a response
                aiResponseReceived = true;

                if (data.error) {
                    // Handle any errors from the API
                    console.error('API Error:', data.error);

                    // Check for subscription limit error
                    if (data.message && data.message.includes('query limit')) {
                        const errorMsg = `
                            <div class="message-bubble ai">
                                <div class="message-content">
                                    <div class="ai-response-header">
                                        Omi
                                    </div>
                                    <p>${data.message}</p>
                                    <p><a href="${data.upgrade_url}" class="btn btn-primary btn-sm mt-2">Upgrade Now</a></p>
                                </div>
                            </div>
                        `;
                        messagesContainer.innerHTML += errorMsg;
                    } else {
                        // Generic error
                        const errorMsg = `
                            <div class="message-bubble ai">
                                <div class="message-content">
                                    <div class="ai-response-header">
                                        Omi
                                    </div>
                                    <p>I'm sorry, but there was an error: ${data.error}</p>
                                </div>
                            </div>
                        `;
                        messagesContainer.innerHTML += errorMsg;
                    }
                } else {
                    // Process successful response
                    const formattedResponse = data.ai_response.replace(/\n/g, '<br>');

                    const aiMsg = `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <p>${formattedResponse}</p>
                                ${data.queries_remaining !== undefined ? 
                                `<div class="queries-remaining mt-2 text-muted">
                                    <small>Queries remaining today: ${data.queries_remaining}</small>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                    messagesContainer.innerHTML += aiMsg;
                }

                // Hide typing indicator and scroll to bottom
                typingIndicator.style.display = 'none';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Refresh conversation history
                loadConversationHistory();
            })
            .catch(error => {
                console.error('Error:', error);
                typingIndicator.style.display = 'none';

                // Only show error message if no AI response was received
                if (!aiResponseReceived) {
                    const errorMsg = `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <p>Sorry, I encountered an error. Please try again.</p>
                            </div>
                        </div>
                    `;
                    messagesContainer.innerHTML += errorMsg;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            });
        });
    }

    // Handle file upload if available
    const fileUploadInput = document.getElementById('file-upload');
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                const fileInfo = document.getElementById('file-info');
                if (fileInfo) {
                    fileInfo.textContent = fileName;
                }
            }
        });
    }

    // Add mobile-friendly file upload trigger
    const mobileUploadBtn = document.getElementById('mobile-upload-btn');
    if (mobileUploadBtn && fileUploadInput) {
        mobileUploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fileUploadInput.click();
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
                                        <p>${conv.response.replace(/\n/g, '<br>')}</p>
                                    </div>
                                </div>
                            `;

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
});