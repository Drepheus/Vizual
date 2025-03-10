document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard or simple dashboard
    const isDashboard = document.getElementById('response-area') !== null;
    const isSimpleDashboard = document.getElementById('messages-container') !== null;

    // Store conversation history
    let currentConversationId = null;
    let conversations = [];
    
    // Load conversations from localStorage
    if (localStorage.getItem('conversations')) {
        try {
            conversations = JSON.parse(localStorage.getItem('conversations'));
        } catch (e) {
            console.error('Error parsing conversations from localStorage:', e);
            conversations = [];
        }
    }

    if (isDashboard) {
        const queryInput = document.getElementById('query-input');
        const responseArea = document.getElementById('response-area');
        const submitBtn = document.getElementById('submit-query');
        const stopBtn = document.getElementById('stop-generation');
        let shouldStopTyping = false;
        let isTyping = false;

        // Handle stop button
        stopBtn.addEventListener('click', function() {
            shouldStopTyping = true;
            stopBtn.classList.add('d-none');
            submitBtn.disabled = false;
        });

        // Handle form submission
        document.getElementById('query-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const query = queryInput.value.trim();
            if (!query) return;

            try {
                // Clear previous response and show typing indicator
                responseArea.innerHTML = createTypingCard();
                submitBtn.disabled = true;
                stopBtn.classList.remove('d-none');
                shouldStopTyping = false;

                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response. Please try again.');
                }

                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Failed to parse server response');
                }

                if (!response.ok) {
                    throw new Error(data.error || `Server error: ${response.status}`);
                }

                if (!data.ai_response) {
                    throw new Error('Invalid response format from server');
                }

                // Type out the response gradually
                typeResponse(data.ai_response, query);
                queryInput.value = '';

            } catch (error) {
                console.error('Error:', error);
                responseArea.innerHTML = createErrorCard(error.message);
                submitBtn.disabled = false;
                stopBtn.classList.add('d-none');
            }
        });

        // Function to type response gradually
        function typeResponse(text, query) {
            isTyping = true;
            let i = 0;
            const typingSpeed = 20; // ms per character
            const htmlContent = formatResponseToHTML(text);

            const responseHTML = `
                <div class="card dashboard-card response-card mb-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="response-icon me-2"><i class="fas fa-robot"></i></div>
                            <h5 class="card-title mb-0">Omi</h5>
                        </div>
                        <div class="query-text mb-3">
                            <strong>Query:</strong> ${query}
                        </div>
                        <div class="ai-response-content"></div>
                    </div>
                </div>
            `;

            responseArea.innerHTML = responseHTML;
            const responseContentEl = responseArea.querySelector('.ai-response-content');

            function typeNextChar() {
                if (i < htmlContent.length && !shouldStopTyping) {
                    responseContentEl.innerHTML = htmlContent.substring(0, i + 1);
                    i++;
                    setTimeout(typeNextChar, typingSpeed);
                } else {
                    // Complete the response immediately if stopped
                    if (shouldStopTyping) {
                        responseContentEl.innerHTML = htmlContent;
                    }

                    submitBtn.disabled = false;
                    stopBtn.classList.add('d-none');
                    isTyping = false;

                    // Update query history if it exists
                    const queryHistory = document.getElementById('query-history');
                    if (queryHistory) {
                        updateQueryHistory();
                    }
                }
            }

            typeNextChar();
        }

        function formatResponseToHTML(text) {
            // Convert markdown-like text to HTML
            return text
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
        }

        function createTypingCard() {
            return `
                <div class="card dashboard-card response-card mb-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="response-icon me-2"><i class="fas fa-robot"></i></div>
                            <h5 class="card-title mb-0">Omi</h5>
                        </div>
                        <div class="typing-indicator">
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                        </div>
                    </div>
                </div>
            `;
        }

        function createErrorCard(errorMessage) {
            return `
                <div class="card dashboard-card response-card mb-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="response-icon me-2"><i class="fas fa-exclamation-triangle text-danger"></i></div>
                            <h5 class="card-title mb-0">Error</h5>
                        </div>
                        <div class="error-message text-danger">
                            ${errorMessage}
                        </div>
                    </div>
                </div>
            `;
        }

        function updateQueryHistory() {
            fetch('/api/history')
                .then(response => response.json())
                .then(data => {
                    if (data.queries && data.queries.length > 0) {
                        const queryHistoryEl = document.getElementById('query-history');
                        queryHistoryEl.innerHTML = '';

                        data.queries.forEach(query => {
                            const accordionItem = document.createElement('div');
                            accordionItem.className = 'accordion-item';
                            accordionItem.innerHTML = `
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#query-${query.id}">
                                        ${query.query_text.substring(0, 50)}${query.query_text.length > 50 ? '...' : ''}
                                    </button>
                                </h2>
                                <div id="query-${query.id}" class="accordion-collapse collapse">
                                    <div class="accordion-body">
                                        <p><strong>Query:</strong> ${query.query_text}</p>
                                        <p><strong>Response:</strong> ${query.response.replace(/\n/g, '<br>')}</p>
                                        <p class="text-muted small">Asked on ${new Date(query.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            `;
                            queryHistoryEl.appendChild(accordionItem);
                        });
                    }
                })
                .catch(error => console.error('Error fetching history:', error));
        }
    }

    // Simple Dashboard chat functionality
    if (isSimpleDashboard) {
        const queryForm = document.getElementById('query-form');
        const queryInput = document.getElementById('query-input');
        const messagesContainer = document.getElementById('messages-container');
        const typingIndicator = document.getElementById('typing-indicator');
        const recentConversationsContainer = document.getElementById('recent-conversations');
        const fileUpload = document.getElementById('file-upload');
        const fileList = document.getElementById('file-list');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('conversation-sidebar');
        const chatMainArea = document.getElementById('chat-main-area');
        const newChatBtn = document.getElementById('new-chat-btn');
        
        // Store conversations
        let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        let currentConversationId = localStorage.getItem('currentConversationId');
        let selectedFiles = [];
        
        // Function to format date
        function formatDate(date) {
            const now = new Date();
            const messageDate = new Date(date);
            
            if (now.toDateString() === messageDate.toDateString()) {
                return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        }
        
        // Toggle sidebar
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                if (sidebar.classList.contains('collapsed')) {
                    sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    chatMainArea.classList.remove('col-md-9');
                    chatMainArea.classList.add('col-md-11');
                } else {
                    sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
                    chatMainArea.classList.remove('col-md-11');
                    chatMainArea.classList.add('col-md-9');
                }
            });
        }
        
        // Start a new chat
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                startNewConversation();
            });
        }
        
        // Function to start a new conversation
        function startNewConversation() {
            const newConversation = {
                id: Date.now().toString(),
                title: 'New Conversation',
                messages: [{
                    role: 'assistant',
                    content: 'Hello! How can I assist you today?',
                    timestamp: new Date().toISOString()
                }],
                createdAt: new Date().toISOString()
            };
            
            conversations.unshift(newConversation);
            currentConversationId = newConversation.id;
            
            saveConversations();
            loadRecentConversations();
            loadCurrentConversation();
        }
        
        // Save conversations to localStorage
        function saveConversations() {
            localStorage.setItem('conversations', JSON.stringify(conversations));
            localStorage.setItem('currentConversationId', currentConversationId);
        }
        
        // Load and display recent conversations
        function loadRecentConversations() {
            if (!conversations || conversations.length === 0) {
                recentConversationsContainer.innerHTML = `
                    <div class="text-center py-3 text-muted">
                        <small>No recent conversations</small>
                    </div>
                `;
                return;
            }
            
            recentConversationsContainer.innerHTML = conversations.map(conv => {
                const isActive = conv.id === currentConversationId ? 'active' : '';
                return `
                    <div class="conversation-item ${isActive}" data-id="${conv.id}">
                        <i class="fas fa-comment-alt me-2"></i>
                        <span class="conversation-title">${conv.title}</span>
                    </div>
                `;
            }).join('');
            
            // Add click event listeners
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.addEventListener('click', () => {
                    currentConversationId = item.dataset.id;
                    loadCurrentConversation();
                    saveConversations();
                    loadRecentConversations(); // Refresh to update active state
                });
            });
        }
        
        // Load the current conversation
        function loadCurrentConversation() {
            if (!currentConversationId || !conversations.length) {
                startNewConversation();
                return;
            }
            
            const conversation = conversations.find(c => c.id === currentConversationId);
            if (!conversation) {
                startNewConversation();
                return;
            }
            
            messagesContainer.innerHTML = conversation.messages.map(msg => {
                if (msg.role === 'assistant') {
                    return `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <p>${msg.content}</p>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="message-bubble user">
                            <div class="message-content">
                                <p>${msg.content}</p>
                            </div>
                        </div>
                    `;
                }
            }).join('');
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Handle file upload
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                selectedFiles = [...selectedFiles, ...files];
                updateFileList();
            });
        }
        
        // Update the file list display
        function updateFileList() {
            if (!selectedFiles.length) {
                fileList.innerHTML = '';
                return;
            }
            
            fileList.innerHTML = selectedFiles.map((file, index) => {
                return `
                    <span class="file-item">
                        <i class="fas fa-file me-1"></i>
                        ${file.name}
                        <span class="file-remove" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </span>
                    </span>
                `;
            }).join('');
            
            // Add remove file listeners
            document.querySelectorAll('.file-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    selectedFiles.splice(index, 1);
                    updateFileList();
                });
            });
        }
        
        // Handle form submission
        if (queryForm) {
            queryForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const query = queryInput.value.trim();
                if (!query && selectedFiles.length === 0) return;
                
                // Add user message to the conversation
                addMessageToConversation('user', query);
                
                // Clear input
                queryInput.value = '';
                
                // Show typing indicator
                typingIndicator.style.display = 'block';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                try {
                    let response;
                    
                    if (selectedFiles.length > 0) {
                        // Handle file upload with query
                        const formData = new FormData();
                        formData.append('query', query);
                        selectedFiles.forEach(file => {
                            formData.append('document', file);
                        });
                        
                        response = await fetch('/api/document/upload', {
                            method: 'POST',
                            body: formData
                        });
                        
                        // Clear selected files
                        selectedFiles = [];
                        updateFileList();
                    } else {
                        // Standard query without files
                        response = await fetch('/api/query', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ query: query })
                        });
                    }
                    
                    const data = await response.json();
                    
                    // Hide typing indicator
                    typingIndicator.style.display = 'none';
                    
                    if (data.error) {
                        addMessageToConversation('assistant', `Error: ${data.error}`);
                    } else {
                        const aiResponse = data.ai_response;
                        addMessageToConversation('assistant', aiResponse);
                        
                        // Update conversation title if it's a new conversation
                        const currentConversation = conversations.find(c => c.id === currentConversationId);
                        if (currentConversation && currentConversation.title === 'New Conversation' && currentConversation.messages.length <= 3) {
                            // Use the first few words of the user's first message as the title
                            currentConversation.title = query.split(' ').slice(0, 4).join(' ') + '...';
                            saveConversations();
                            loadRecentConversations();
                        }
                    }
                } catch (error) {
                    console.error('Error:', error);
                    typingIndicator.style.display = 'none';
                    addMessageToConversation('assistant', 'Sorry, there was an error processing your request.');
                }
            });
        }
        
        // Add message to current conversation
        function addMessageToConversation(role, content) {
            const conversation = conversations.find(c => c.id === currentConversationId);
            
            if (conversation) {
                conversation.messages.push({
                    role,
                    content,
                    timestamp: new Date().toISOString()
                });
                
                saveConversations();
                
                // Update the UI
                if (role === 'user') {
                    messagesContainer.innerHTML += `
                        <div class="message-bubble user">
                            <div class="message-content">
                                <p>${content}</p>
                            </div>
                        </div>
                    `;
                } else {
                    messagesContainer.innerHTML += `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <p>${content}</p>
                            </div>
                        </div>
                    `;
                }
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
        
        // Initialize
        loadRecentConversations();
        loadCurrentConversation();

            recentConversationsContainer.innerHTML = '';
            
            // Sort conversations by last message date
            const sortedConversations = [...conversations].sort((a, b) => {
                const aLastDate = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp) : new Date(a.createdAt);
                const bLastDate = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp) : new Date(b.createdAt);
                return bLastDate - aLastDate;
            });

            sortedConversations.forEach(conv => {
                const lastMessage = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
                const previewTitle = conv.title || 'Conversation';
                const previewText = lastMessage ? (lastMessage.content.length > 40 ? lastMessage.content.substring(0, 40) + '...' : lastMessage.content) : 'No messages';
                const timestamp = lastMessage ? formatDate(lastMessage.timestamp) : formatDate(conv.createdAt);
                
                const conversationEl = document.createElement('div');
                conversationEl.className = 'conversation-preview';
                conversationEl.dataset.id = conv.id;
                conversationEl.innerHTML = `
                    <div class="preview-title">${previewTitle}</div>
                    <div class="preview-snippet">${previewText}</div>
                    <div class="conversation-time">${timestamp}</div>
                `;
                
                conversationEl.addEventListener('click', () => {
                    loadConversation(conv.id);
                });
                
                recentConversationsContainer.appendChild(conversationEl);
            });
        }

        // Load a conversation by ID
        function loadConversation(conversationId) {
            const conversation = conversations.find(c => c.id === conversationId);
            if (!conversation) return;
            
            currentConversationId = conversationId;
            messagesContainer.innerHTML = '';
            
            // Display all messages in the conversation
            conversation.messages.forEach(message => {
                const messageEl = document.createElement('div');
                messageEl.className = `message-bubble ${message.role}`;
                
                messageEl.innerHTML = `
                    <div class="message-content">
                        ${message.role === 'ai' ? '<div class="ai-response-header">Omi</div>' : ''}
                        <p>${message.content}</p>
                    </div>
                `;
                
                messagesContainer.appendChild(messageEl);
            });
            
            // Scroll to bottom of messages
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Update active conversation in UI
            document.querySelectorAll('.conversation-preview').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.id === conversationId) {
                    el.classList.add('active');
                }
            });
        }

        // Create a new conversation
        function createNewConversation(firstMessage, response) {
            const conversationId = 'conv_' + Date.now();
            const conversation = {
                id: conversationId,
                title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
                createdAt: new Date().toISOString(),
                messages: [
                    {
                        role: 'user',
                        content: firstMessage,
                        timestamp: new Date().toISOString()
                    },
                    {
                        role: 'ai',
                        content: response,
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            conversations.push(conversation);
            saveConversations();
            currentConversationId = conversationId;
            
            return conversation;
        }

        // Add message to current conversation
        function addMessageToConversation(role, content) {
            if (!currentConversationId) {
                // If no conversation is active, create one
                if (role === 'user') {
                    // We'll add the AI response later
                    const conversation = {
                        id: 'conv_' + Date.now(),
                        title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                        createdAt: new Date().toISOString(),
                        messages: [
                            {
                                role: 'user',
                                content: content,
                                timestamp: new Date().toISOString()
                            }
                        ]
                    };
                    
                    conversations.push(conversation);
                    currentConversationId = conversation.id;
                    saveConversations();
                }
                return;
            }
            
            const conversation = conversations.find(c => c.id === currentConversationId);
            if (!conversation) return;
            
            conversation.messages.push({
                role: role,
                content: content,
                timestamp: new Date().toISOString()
            });
            
            saveConversations();
        }

        // Save conversations to localStorage
        function saveConversations() {
            try {
                localStorage.setItem('conversations', JSON.stringify(conversations));
            } catch (e) {
                console.error('Error saving conversations to localStorage:', e);
            }
            loadRecentConversations();
        }

        // Add a message to the UI
        function addMessageToUI(role, content) {
            const messageEl = document.createElement('div');
            messageEl.className = `message-bubble ${role}`;
            
            messageEl.innerHTML = `
                <div class="message-content">
                    ${role === 'ai' ? '<div class="ai-response-header">Omi</div>' : ''}
                    <p>${content}</p>
                </div>
            `;
            
            messagesContainer.appendChild(messageEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Initialize
        loadRecentConversations();
        
        // If no conversation is loaded, show the welcome message
        if (!currentConversationId) {
            messagesContainer.innerHTML = `
                <div class="message-bubble ai">
                    <div class="message-content">
                        <div class="ai-response-header">Omi</div>
                        <p>Hello! How can I assist you today?</p>
                    </div>
                </div>
            `;
        }

        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const query = queryInput.value.trim();
            if (!query) return;

            // Add user message to UI
            addMessageToUI('user', query);
            addMessageToConversation('user', query);
            
            // Clear input
            queryInput.value = '';

            // Show typing indicator
            typingIndicator.style.display = 'flex';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Send query to API
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Hide typing indicator
                typingIndicator.style.display = 'none';
                
                if (data.error) {
                    addMessageToUI('ai', 'Error: ' + data.error);
                    addMessageToConversation('ai', 'Error: ' + data.error);
                } else {
                    addMessageToUI('ai', data.ai_response);
                    addMessageToConversation('ai', data.ai_response);
                }
                
                // Update recent conversations
                loadRecentConversations();
            })
            .catch(error => {
                typingIndicator.style.display = 'none';
                addMessageToUI('ai', 'Sorry, there was an error processing your request.');
                addMessageToConversation('ai', 'Sorry, there was an error processing your request.');
                console.error('Error:', error);
            });
        });

                if (data.error) {
                    aiResponseContent.textContent = 'Error: ' + data.error;
                } else {
                    aiResponseContent.textContent = data.ai_response;
                }

                // Clear input
                queryInput.value = '';
            })
            .catch(error => {
                typingIndicator.style.display = 'none';
                aiResponseContent.style.display = 'block';
                aiResponseContent.textContent = 'Sorry, there was an error processing your request.';
                console.error('Error:', error);
            });
        });
    }
    // Initialize SAM.gov data loading
    loadSamGovStatus();
    loadContractAwards();

    if (queryForm) {
        // Add stop button after the submit button
        const submitButton = queryForm.querySelector('button[type="submit"]');
        const stopButton = document.createElement('button');
        stopButton.type = 'button';
        stopButton.className = 'btn btn-danger ms-2 d-none';
        stopButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
        stopButton.onclick = stopTyping;
        submitButton.parentNode.insertBefore(stopButton, submitButton.nextSibling);

    }


    function stopTyping() {
        shouldStopTyping = true;
        const submitBtn = queryForm.querySelector('button[type="submit"]');
        const stopBtn = queryForm.querySelector('.btn-danger');
        submitBtn.disabled = false;
        stopBtn.classList.add('d-none');

        // Clear the current response
        const responseCard = document.querySelector('.response-card');
        if (responseCard) {
            responseCard.querySelector('.typing-cursor').classList.add('d-none');
        }
    }

    async function displayResponseWithTyping(response) {
        const responseCard = document.querySelector('.response-card');
        const responseContent = responseCard.querySelector('.ai-response');
        const cursor = responseCard.querySelector('.typing-cursor');
        isTyping = true;

        responseContent.style.opacity = "0";
        responseContent.style.transform = "translateY(10px)";
        responseContent.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        setTimeout(() => {
            responseContent.style.opacity = "1";
            responseContent.style.transform = "translateY(0)";
        }, 100);

        // Split response into characters for typing effect with variable speed
        const characters = response.split('');
        let currentText = '';

        for (const char of characters) {
            if (shouldStopTyping) {
                cursor.classList.add('d-none');
                isTyping = false;
                return;
            }
            currentText += char;
            responseContent.innerHTML = formatResponse(currentText);
            // Random delay between 10ms and 30ms for natural typing feel
            await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
        }

        // Remove cursor after typing is complete
        cursor.classList.add('d-none');
        isTyping = false;
    }

    function createTypingCard() {
        return `
            <div class="card dashboard-card response-card mb-4">
                <div class="card-body">
                    <div class="ai-response-header">
                        <i class="fas fa-robot fa-2x"></i>
                        <h4 class="mb-0">AI Response</h4>
                    </div>
                    <div class="ai-response">
                        <span class="typing-cursor">▎</span>
                    </div>
                    <div class="response-metadata">
                        <i class="fas fa-info-circle me-2"></i>
                        Response generated using GPT-4
                    </div>
                </div>
            </div>
        `;
    }

    function formatResponse(text) {
        if (!text) return '<p>No response received. Please try again.</p>';

        return text
            .split('\n\n')
            .map(para => {
                // Add special styling for our formatted sections
                para = para
                    .replace(/🎯 Direct Answer:/g, '<div class="response-section direct-answer"><strong>Direct Answer:</strong>')
                    .replace(/📝 Details:/g, '<div class="response-section details"><strong>Details:</strong>')
                    .replace(/⚡ Next Steps:/g, '<div class="response-section next-steps"><strong>Next Steps:</strong>')
                    // Close the div tags we opened
                    .replace(/\n(?=🎯|📝|⚡)/g, '</div>')
                    // Add closing div for the last section
                    + (para.match(/🎯|📝|⚡/) ? '</div>' : '');

                // Format bullet points
                para = para.replace(/•\s/g, '<span class="bullet-point">•</span> ');

                // Format URLs to be clickable
                para = para.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

                // Format SAM.gov data sections
                if (para.includes('SAM.GOV DATA RETRIEVED') || para.includes('Title:') && para.includes('Solicitation Number:')) {
                    para = `<div class="sam-data-section">${para}</div>`;
                }

                // Remove any remaining markdown-style bold formatting
                para = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                return `<p>${para}</p>`;
            })
            .join('');
    }

    function displayError(message) {
        responseArea.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
            </div>
        `;
    }

    function updateQueryHistory(query, response) {
        const historyContainer = document.getElementById('queryHistory');
        if (!historyContainer) return;

        const historyItem = document.createElement('div');
        historyItem.className = 'card dashboard-card mb-3';
        historyItem.innerHTML = `
            <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Query:</h6>
                <p>${query}</p>
                <h6 class="card-subtitle mb-2 text-muted">Response:</h6>
                <p>${response}</p>
                <small class="text-muted">${new Date().toLocaleString()}</small>
            </div>
        `;

        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    }

    if (documentUploadForm) {
        documentUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const fileInput = document.getElementById('documentFile');
            const submitBtn = this.querySelector('button[type="submit"]');

            if (!fileInput.files.length) {
                displayError('Please select at least one file to upload');
                return;
            }

            try {
                // Show loading state
                submitBtn.disabled = true;
                responseArea.innerHTML = createTypingCard();

                console.log('Uploading documents:', fileInput.files.length, 'files'); // Debug log

                const response = await fetch('/api/document/upload', {
                    method: 'POST',
                    body: formData
                });

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response. Please try again.');
                }

                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Failed to parse server response');
                }

                if (!response.ok) {
                    throw new Error(data.error || `Server error: ${response.status}`);
                }

                let statusMessage = '';
                if (data.uploaded_documents && data.uploaded_documents.length > 0) {
                    statusMessage = `Successfully processed ${data.uploaded_documents.length} documents:\n`;
                    data.uploaded_documents.forEach(doc => {
                        statusMessage += `- ${doc.filename}\n`;
                    });
                }
                if (data.failed_documents && data.failed_documents.length > 0) {
                    statusMessage += `\nFailed to process ${data.failed_documents.length} documents:\n`;
                    data.failed_documents.forEach(doc => {
                        statusMessage += `- ${doc.filename}: ${doc.error}\n`;
                    });
                }

                await displayResponseWithTyping(data.ai_response + '\n\n' + statusMessage);
                updateQueryHistory(
                    `Document Analysis: ${fileInput.files.length} files`,
                    data.ai_response + '\n\n' + statusMessage
                );

                // Reset form
                documentUploadForm.reset();
            } catch (error) {
                console.error('Document upload error:', error);
                displayError(error.message || 'An unexpected error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
    async function loadSamGovStatus() {
        const statusCard = document.getElementById('samStatusCard');
        const loadingElement = document.getElementById('samStatusLoading');
        const contentElement = document.getElementById('samStatusContent');
        const dataContentElement = document.getElementById('samDataContent');

        try {
            const response = await fetch('/api/sam/status');
            const data = await response.json();

            if (response.ok && data.entities) {
                dataContentElement.innerHTML = formatSamData(data.entities);
                loadingElement.classList.add('d-none');
                contentElement.classList.remove('d-none');
            } else {
                throw new Error(data.error || 'Failed to load SAM.gov status');
            }
        } catch (error) {
            loadingElement.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;
        }
    }

    async function loadContractAwards() {
        const awardsCard = document.getElementById('contractAwardsCard');
        const loadingElement = document.getElementById('awardsLoading');
        const contentElement = document.getElementById('awardsContent');

        try {
            const response = await fetch('/api/sam/awards');
            const data = await response.json();

            if (response.ok && data.awards) {
                contentElement.innerHTML = formatAwards(data.awards);
                loadingElement.classList.add('d-none');
                contentElement.classList.remove('d-none');
            } else {
                throw new Error(data.error || 'Failed to load contract awards');
            }
        } catch (error) {
            loadingElement.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;
        }
    }

    function formatSamData(entities) {
        if (!entities || entities.length === 0) {
            return '<p class="text-muted">No relevant SAM.gov data found</p>';
        }

        return entities.map(entity => `
            <div class="card dashboard-card sam-data-card mb-3">
                <div class="card-body">
                    <p class="mb-1"><strong>Entity:</strong> ${entity.entity_name || 'N/A'}</p>
                    <p class="mb-1"><strong>DUNS/UEI:</strong> ${entity.duns || 'N/A'}</p>
                    <p class="mb-1"><strong>Status:</strong> ${entity.status || 'N/A'}</p>
                    <p class="mb-0"><strong>Expires:</strong> ${entity.expiration_date || 'N/A'}</p>
                </div>
            </div>
        `).join('');
    }

    function formatAwards(awards) {
        if (!awards || awards.length === 0) {
            return '<p class="text-muted">No recent contract awards available</p>';
        }

        return awards.map(award => `
            <div class="card dashboard-card award-card mb-3">
                <div class="card-body">
                    <p class="mb-1"><strong>Title:</strong> ${award.title || 'N/A'}</p>
                    <p class="mb-1"><strong>Solicitation #:</strong> ${award.solicitation_number || 'N/A'}</p>
                    <p class="mb-1"><strong>Amount:</strong> $${award.award_amount || 'N/A'}</p>
                    <p class="mb-1"><strong>Awardee:</strong> ${award.awardee || 'N/A'}</p>
                    <p class="mb-0"><strong>Award Date:</strong> ${award.award_date || 'N/A'}</p>
                </div>
            </div>
        `).join('');
    }

    const samSearchForm = document.getElementById('samSearchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (samSearchForm) {
        samSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const query = searchInput.value.trim();
            if (!query) return;

            const submitBtn = this.querySelector('button[type="submit"]');

            try {
                // Show loading state
                submitBtn.disabled = true;
                searchResults.innerHTML = `
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Searching...</span>
                        </div>
                        <p class="mt-2">Searching SAM.gov...</p>
                    </div>
                `;

                const response = await fetch('/api/sam/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success' && data.results.length > 0) {
                    const resultsHtml = data.results.map(result => `
                        <div class="card dashboard-card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${result.title}</h5>
                                <p class="card-text">
                                    <strong>Agency:</strong> ${result.agency}<br>
                                    <strong>Solicitation #:</strong> ${result.solicitation_number}<br>
                                    <strong>Posted:</strong> ${result.posted_date}<br>
                                    <strong>Due:</strong> ${result.due_date}
                                </p>
                                <a href="${result.url}" target="_blank" class="btn btn-primary">
                                    <i class="fas fa-external-link-alt me-2"></i>View on SAM.gov
                                </a>
                            </div>
                        </div>
                    `).join('');

                    searchResults.innerHTML = `
                        <h4 class="mb-3">Found ${data.count} solicitation${data.count !== 1 ? 's' : ''}</h4>
                        ${resultsHtml}
                    `;
                } else {
                    searchResults.innerHTML = `
                        <div class="alert alert-warning" role="alert">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            ${data.message || 'No solicitations found matching your search criteria.'}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Search error:', error);
                searchResults.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Failed to search SAM.gov. Please try again later.
                    </div>
                `;
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
});