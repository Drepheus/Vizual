document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const recentConversationsContainer = document.getElementById('recent-conversations'); // Added element for recent conversations

    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const query = queryInput.value.trim();
            if (!query) return;

            // Add user message to UI
            const userMessageHtml = `
                <div class="message-bubble user">
                    <div class="message-content">
                        <div class="user-response-header">
                            You
                        </div>
                        <p>${query}</p>
                    </div>
                </div>
            `;
            messagesContainer.innerHTML += userMessageHtml;

            // Clear input
            queryInput.value = '';

            // Show typing indicator
            typingIndicator.style.display = 'block';

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Send query to server
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    // Handle any errors from the API
                    console.error('API Error:', data.error);

                    // Show a message to the user
                    addMessageToUI('Sorry, I encountered an error. Please try again.', false);
                    return;
                }

                typingIndicator.style.display = 'none';

                // Add the AI response to the UI
                addMessageToUI(data.ai_response, false);

                // Clear the input field for the next query
                queryInput.value = '';

                // Enable the form for the next query
                enableForm();

                // Reload recent conversations to show the new one
                loadRecentConversations();
            })
            .catch(error => {
                console.error('Error:', error);
                typingIndicator.style.display = 'none';

                const errorMsg = `
                    <div class="message-bubble ai">
                        <div class="message-content">
                            <div class="ai-response-header">
                                Omi
                            </div>
                            <p>Sorry, there was an error processing your request. Please try again.</p>
                        </div>
                    </div>
                `;
                messagesContainer.innerHTML += errorMsg;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
        });
    }

    // File upload button functionality
    const fileUploadButton = document.getElementById('file-upload-button');
    const fileUploadInput = document.getElementById('file-upload-input');
    const fileUploadStatus = document.getElementById('file-upload-status');

    if (fileUploadButton && fileUploadInput) {
        fileUploadButton.addEventListener('click', function() {
            fileUploadInput.click();
        });

        fileUploadInput.addEventListener('change', function() {
            if (fileUploadInput.files.length > 0) {
                const file = fileUploadInput.files[0];
                fileUploadStatus.textContent = `Uploading: ${file.name}...`;

                const formData = new FormData();
                formData.append('file', file);

                fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fileUploadStatus.textContent = `File uploaded: ${file.name}`;
                        queryInput.value = `I've uploaded ${file.name}. Please analyze this document.`;
                    } else {
                        fileUploadStatus.textContent = `Error: ${data.error}`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    fileUploadStatus.textContent = 'Error uploading file. Please try again.';
                });
            }
        });
    }

    // Voice mode button - placeholder
    const voiceModeButton = document.getElementById('voice-mode-button');
    if (voiceModeButton) {
        voiceModeButton.addEventListener('click', function() {
            alert('Voice mode coming soon!');
        });
    }

    // Image creation button - placeholder
    const imageCreationButton = document.getElementById('image-creation-button');
    if (imageCreationButton) {
        imageCreationButton.addEventListener('click', function() {
            alert('Image creation coming soon!');
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

    // Function to load recent conversations
    function loadRecentConversations() {
        fetch('/api/recent_conversations')
            .then(response => response.json())
            .then(data => {
                if (data.conversations && data.conversations.length > 0) {
                    recentConversationsContainer.innerHTML = ''; // Clear placeholder

                    data.conversations.forEach(conv => {
                        const conversationDiv = document.createElement('div');
                        conversationDiv.className = 'conversation-preview';
                        conversationDiv.setAttribute('data-id', conv.id);

                        const titleDiv = document.createElement('div');
                        titleDiv.className = 'preview-title';
                        titleDiv.textContent = truncateText(conv.query_text, 40);

                        const snippetDiv = document.createElement('div');
                        snippetDiv.className = 'preview-snippet';
                        snippetDiv.textContent = truncateText(conv.response, 60);

                        const timeDiv = document.createElement('div');
                        timeDiv.className = 'conversation-time';
                        timeDiv.textContent = formatDate(new Date(conv.created_at));

                        conversationDiv.appendChild(titleDiv);
                        conversationDiv.appendChild(snippetDiv);
                        conversationDiv.appendChild(timeDiv);

                        // Add click event to load the conversation
                        conversationDiv.addEventListener('click', function() {
                            // Clear current messages
                            messagesContainer.innerHTML = '';

                            // Add the conversation messages
                            addMessageToUI(conv.query_text, true);
                            addMessageToUI(conv.response, false);
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
                    <div class="text-center py-3 text-muted">
                        <small>Could not load conversations</small>
                    </div>
                `;
            });
    }

    // Helper function to truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Helper function to format date
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

    // Initialize the page
    function initPage() {
        // Load recent conversations when the page loads
        loadRecentConversations();
    }

    // Call the init function when the page loads
    initPage();
});