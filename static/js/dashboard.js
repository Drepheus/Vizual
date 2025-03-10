document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard or simple dashboard
    const isDashboard = document.getElementById('response-area') !== null;
    const isSimpleDashboard = document.getElementById('messages-container') !== null;

    // Store conversation history
    let currentConversationId = null;
    let conversations = [];
    let shouldStopTyping = false;
    let isTyping = false;

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

        // Handle stop button
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                shouldStopTyping = true;
                stopBtn.classList.add('d-none');
                if (submitBtn) submitBtn.disabled = false;
            });
        }

        // Dashboard query handling
        if (queryInput && submitBtn) {
            submitBtn.addEventListener('click', function() {
                sendQuery();
            });

            queryInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery();
                }
            });

            function sendQuery() {
                const query = queryInput.value.trim();
                if (!query || isTyping) return;

                submitBtn.disabled = true;
                if (stopBtn) stopBtn.classList.remove('d-none');
                shouldStopTyping = false;

                // Append user query card
                const userCard = `
                    <div class="card dashboard-card user-card mb-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="user-icon me-2"><i class="fas fa-user"></i></div>
                                <h5 class="card-title mb-0">You</h5>
                            </div>
                            <div class="card-text">${query}</div>
                        </div>
                    </div>
                `;
                responseArea.innerHTML += userCard;

                // Append typing indicator
                responseArea.innerHTML += createTypingCard();

                // Add message to current conversation
                if (currentConversationId && conversations) {
                    const conversation = conversations.find(c => c.id === currentConversationId);
                    if (conversation) {
                        conversation.messages.push({
                            role: 'user',
                            content: query,
                            timestamp: new Date().toISOString()
                        });
                        saveConversations();
                    }
                }

                // Send query to API
                fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query })
                })
                .then(response => response.json())
                .then(data => {
                    // Remove all typing indicators completely
                    clearAllTypingIndicators();
                    
                    // Additional cleanup for any remaining elements
                    document.querySelectorAll('.typing-indicator, .typing-dots, .message-bubble.ai.typing').forEach(el => {
                        el.remove();
                    });

                    // Append AI response
                    const responseCard = `
                        <div class="card dashboard-card response-card mb-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="response-icon me-2"><i class="fas fa-robot"></i></div>
                                    <h5 class="card-title mb-0">Omi</h5>
                                </div>
                                <div class="card-text ai-response">${formatResponseToHTML(data.ai_response)}</div>
                            </div>
                        </div>
                    `;
                    responseArea.innerHTML += responseCard;

                    submitBtn.disabled = false;
                    if (stopBtn) stopBtn.classList.add('d-none');
                    queryInput.value = '';

                    // Auto-scroll to bottom
                    window.scrollTo(0, document.body.scrollHeight);

                    // Update query history if it exists
                    const queryHistory = document.getElementById('query-history');
                    if (queryHistory) {
                        updateQueryHistory();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);

                    // Remove typing indicator
                    const typingCard = document.querySelector('.typing-indicator');
                    if (typingCard && typingCard.closest('.card')) {
                        responseArea.removeChild(typingCard.closest('.card'));
                    }

                    // Show error message
                    responseArea.innerHTML += `
                        <div class="card dashboard-card response-card mb-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="response-icon me-2"><i class="fas fa-exclamation-triangle"></i></div>
                                    <h5 class="card-title mb-0">Error</h5>
                                </div>
                                <div class="card-text">Sorry, there was an error processing your request. Please try again.</div>
                            </div>
                        </div>
                    `;

                    submitBtn.disabled = false;
                    if (stopBtn) stopBtn.classList.add('d-none');
                });
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
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Helper function to format AI responses (convert linebreaks, URLs, etc.)
            function formatResponseToHTML(text) {
                if (!text) return '';

                // Convert URLs to clickable links
                text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

                // Convert line breaks to <br>
                text = text.replace(/\n/g, '<br>');

                return text;
            }

            // Function to update query history (if it exists)
            function updateQueryHistory() {
                fetch('/api/history')
                    .then(response => response.json())
                    .then(data => {
                        if (data.queries && data.queries.length > 0) {
                            const queryHistory = document.getElementById('query-history');
                            if (queryHistory) {
                                queryHistory.innerHTML = '';
                                data.queries.forEach(query => {
                                    const accordion = document.createElement('div');
                                    accordion.className = 'accordion-item';
                                    accordion.innerHTML = `
                                        <h2 class="accordion-header" id="heading-${query.id}">
                                            <button class="accordion-button collapsed" type="button" 
                                                data-bs-toggle="collapse" data-bs-target="#collapse-${query.id}">
                                                ${query.query_text.substring(0, 50)}${query.query_text.length > 50 ? '...' : ''}
                                            </button>
                                        </h2>
                                        <div id="collapse-${query.id}" class="accordion-collapse collapse" 
                                            data-bs-parent="#query-history">
                                            <div class="accordion-body">
                                                <div class="query-details">
                                                    <h6 class="text-muted mb-2">Query:</h6>
                                                    <p>${query.query_text}</p>
                                                    <h6 class="text-muted mb-2">Response:</h6>
                                                    <p>${formatResponseToHTML(query.response)}</p>
                                                    <small class="text-muted d-block mt-2">
                                                        <i class="fas fa-clock me-1"></i>
                                                        ${new Date(query.created_at).toLocaleString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                    queryHistory.appendChild(accordion);
                                });
                            }
                        }
                    })
                    .catch(error => console.error('Error updating query history:', error));
            }
        }
    }

    // Simple dashboard functionality
    if (isSimpleDashboard) {
        const queryForm = document.getElementById('query-form');
        const queryInput = document.getElementById('query-input');
        const messagesContainer = document.getElementById('messages-container');
        const stopBtn = document.getElementById('stop-generation');

        // Handle message display
        function addMessage(content, role) {
            const messageClass = role === 'user' ? 'user' : 'ai';
            const message = document.createElement('div');
            message.className = `message-bubble ${messageClass}`;

            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';

            if (role === 'assistant') {
                const header = document.createElement('div');
                header.className = 'ai-response-header';
                header.textContent = 'Omi';
                messageContent.appendChild(header);
            }

            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = formatMessage(content);
            messageContent.appendChild(contentDiv);

            message.appendChild(messageContent);
            messagesContainer.appendChild(message);

            // Add to conversation history
            if (currentConversationId && conversations) {
                const conversation = conversations.find(c => c.id === currentConversationId);
                if (conversation) {
                    conversation.messages.push({
                        role: role,
                        content: content,
                        timestamp: new Date().toISOString()
                    });
                    saveConversations();
                }
            }

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function formatMessage(text) {
            if (!text) return '';

            // Convert URLs to links
            text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

            // Convert newlines to <br>
            text = text.replace(/\n/g, '<br>');

            return text;
        }

        function showTypingIndicator() {
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message-bubble ai typing';
            typingIndicator.innerHTML = `
                <div class="message-content">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function clearAllTypingIndicators() {
            // Clear ALL possible typing indicators
            const typingSelectors = [
                '.message-bubble.ai.typing',
                '.typing-indicator',
                '.typing-dots',
                '.card .typing-indicator',
                '.card-body .typing-indicator',
                '.message-content .typing-dots'
            ];
            
            typingSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    // Try to remove the entire bubble if possible
                    const bubble = el.closest('.message-bubble');
                    if (bubble) {
                        bubble.remove();
                    } else {
                        el.remove();
                    }
                });
            });
            
            // Also hide any typing cursors
            document.querySelectorAll('.typing-cursor').forEach(cursor => {
                cursor.classList.add('d-none');
            });
        }
        
        function processQuery(query) {
            isTyping = true;
            
            // Clear any existing typing indicators first
            clearAllTypingIndicators();

            // Add user message
            addMessage(query, 'user');

            // Show typing indicator
            showTypingIndicator();

            // Create a new conversation if none exists
            if (!currentConversationId) {
                currentConversationId = 'conv_' + Date.now();
                conversations.push({
                    id: currentConversationId,
                    title: query.substring(0, 30) + (query.length > 30 ? '...' : ''),
                    messages: [{
                        role: 'user',
                        content: query,
                        timestamp: new Date().toISOString()
                    }],
                    created_at: new Date().toISOString()
                });
                saveConversations();
            }

            // Send query to API
            fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            })
            .then(response => response.json())
            .then(data => {
                // Remove typing indicator
                const typingMsg = messagesContainer.querySelector('.message.typing');
                if (typingMsg) {
                    messagesContainer.removeChild(typingMsg);
                }

                // Add response to UI
                if (data.error) {
                    addMessage('Error: ' + data.error, 'assistant');
                } else {
                    addMessage(data.ai_response, 'assistant');
                }

                isTyping = false;
            })
            .catch(error => {
                console.error('Error:', error);

                // Remove typing indicator
                const typingMsg = messagesContainer.querySelector('.message.typing');
                if (typingMsg) {
                    messagesContainer.removeChild(typingMsg);
                }

                // Show error message
                addMessage('Sorry, there was an error processing your request. Please try again.', 'assistant');
                isTyping = false;
            });
        }

        // Save conversations to localStorage
        function saveConversations() {
            try {
                localStorage.setItem('conversations', JSON.stringify(conversations));
            } catch (e) {
                console.error('Error saving conversations to localStorage:', e);
            }
        }

        // Handle file upload
        const fileUploadInput = document.getElementById('file-upload');
        if (fileUploadInput) {
            fileUploadInput.addEventListener('change', function() {
                if (fileUploadInput.files.length > 0) {
                    const formData = new FormData();
                    formData.append('file', fileUploadInput.files[0]);

                    // Show uploading message
                    addMessage(`Uploading file "${fileUploadInput.files[0].name}"...`, 'system');

                    fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            addMessage('Error uploading file: ' + data.error, 'assistant');
                        } else {
                            addMessage(`File "${fileUploadInput.files[0].name}" uploaded successfully.`, 'system');
                            // Automatically ask about the file
                            processQuery(`Can you analyze this file: ${fileUploadInput.files[0].name}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        addMessage('Error uploading file. Please try again.', 'assistant');
                    });

                    // Reset the file input
                    fileUploadInput.value = '';
                }
            });
        }

        // Handle query form submission
        if (queryForm) {
            queryForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (!queryInput) return;

                const query = queryInput.value.trim();
                if (!query || isTyping) return;

                processQuery(query);
                queryInput.value = '';
            });
        }

        // Handle stop button if it exists
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                shouldStopTyping = true;
                stopBtn.classList.add('d-none');
            });
        }
    }
    // Initialize SAM.gov data loading
    loadSamGovStatus();
    loadContractAwards();

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