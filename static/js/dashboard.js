
// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard script loaded");

    // Determine which dashboard we're on and initialize accordingly
    if (document.querySelector('.simple-dashboard')) {
        console.log("Initializing Simple Dashboard");
        initializeSimpleDashboard();
    } else if (document.querySelector('.gov-dashboard')) {
        console.log("Initializing GovCon Dashboard");
        initializeGovConDashboard();
    }

    // Load recent conversations
    loadRecentConversations();
});

// Simple Dashboard functionality
function initializeSimpleDashboard() {
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const voiceModeButton = document.getElementById('voice-mode-button');
    const imageCreationButton = document.getElementById('image-creation-button');

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

    // Disable query examples feature for stability
    console.log("Query examples feature has been disabled for stability reasons.");

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
            if (typingIndicator) {
                typingIndicator.style.display = 'block';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            // Send query to API
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => response.json())
            .then(data => {
                // Hide typing indicator
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }

                if (data.error === 'Free tier query limit reached') {
                    // Handle free tier limit
                    appendMessage('ai', `${data.message} <a href="${data.upgrade_url}" class="btn btn-sm btn-outline-primary mt-2">Upgrade Now</a>`);
                } else if (data.error) {
                    // Handle other errors
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
                        const queriesRemaining = document.createElement('div');
                        queriesRemaining.className = 'queries-remaining text-muted mt-2';
                        queriesRemaining.textContent = `Queries remaining: ${data.queries_remaining}`;
                        messagesContainer.lastChild.querySelector('.message-content').appendChild(queriesRemaining);
                    }
                }

                // Update recent conversations
                loadRecentConversations();
            })
            .catch(error => {
                console.log("API Error:", error.message);
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }
                appendMessage('ai', `I apologize, but I encountered an error. Please try again.`);
            });
        });
    }

    // Helper function to add messages to the chat
    function appendMessage(role, content) {
        if (!messagesContainer) return;

        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${role}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (role === 'ai') {
            const header = document.createElement('div');
            header.className = 'ai-response-header';
            header.textContent = 'Omi';
            messageContent.appendChild(header);
        }

        const messageText = document.createElement('div');
        messageText.innerHTML = content;
        messageContent.appendChild(messageText);

        messageBubble.appendChild(messageContent);
        messagesContainer.appendChild(messageBubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// GovCon Dashboard functionality
function initializeGovConDashboard() {
    const samSearchForm = document.getElementById('samSearchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const responseArea = document.getElementById('responseArea');
    const govConChatForm = document.getElementById('govConChatForm');
    const govConQueryInput = document.getElementById('govConQueryInput');

    // Handle GovCon Query Form if present
    if (govConChatForm) {
        govConChatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!govConQueryInput) return;

            const query = govConQueryInput.value.trim();
            if (!query) return;

            // Clear previous response if any
            if (responseArea) {
                responseArea.innerHTML = '<div class="loading-indicator"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2 text-muted">Processing your query...</p></div>';
            }

            // Send query to API
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => response.json())
            .then(data => {
                if (responseArea) {
                    if (data.error === 'Free tier query limit reached') {
                        // Handle free tier limit
                        responseArea.innerHTML = `
                            <div class="card dashboard-card mb-4">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <i class="fas fa-exclamation-circle me-2 text-warning"></i>
                                        <h4 class="card-title mb-0">Limit Reached</h4>
                                    </div>
                                    <div class="alert alert-warning">
                                        ${data.message}
                                    </div>
                                    <a href="${data.upgrade_url}" class="btn btn-primary">Upgrade Now</a>
                                </div>
                            </div>
                        `;
                    } else if (data.error) {
                        // Handle other errors
                        responseArea.innerHTML = `
                            <div class="card dashboard-card mb-4">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <i class="fas fa-exclamation-triangle me-2 text-danger"></i>
                                        <h4 class="card-title mb-0">Error</h4>
                                    </div>
                                    <div class="alert alert-danger">
                                        ${data.error}
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        // Display AI response
                        responseArea.innerHTML = `
                            <div class="card dashboard-card mb-4">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <i class="fas fa-robot me-2 text-primary"></i>
                                        <h4 class="card-title mb-0">Omi Response</h4>
                                    </div>
                                    <div class="ai-response">
                                        ${data.ai_response.replace(/\n/g, '<br>')}
                                    </div>
                                    ${data.queries_remaining !== undefined ? 
                                        `<div class="queries-remaining text-muted mt-3">
                                            Queries remaining: ${data.queries_remaining}
                                        </div>` : ''}
                                </div>
                            </div>
                        `;
                    }
                }

                // Update recent conversations
                loadRecentConversations();
            })
            .catch(error => {
                console.log("API Error:", error.message);
                if (responseArea) {
                    responseArea.innerHTML = `
                        <div class="card dashboard-card mb-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fas fa-exclamation-triangle me-2 text-danger"></i>
                                    <h4 class="card-title mb-0">Error</h4>
                                </div>
                                <div class="alert alert-danger">
                                    ${error.message}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        });
    }

    // SAM.gov search functionality
    if (samSearchForm) {
        samSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();

            if (!query) return;

            if (searchResults) {
                searchResults.innerHTML = '<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
            }

            try {
                const response = await fetch('/api/sam/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query })
                });
                
                const data = await response.json();
                
                if (searchResults) {
                    if (data.status === 'success' && data.results && data.results.length > 0) {
                        let resultsHTML = `
                            <div class="alert alert-success">
                                Found ${data.count} solicitations matching your criteria.
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Agency</th>
                                            <th>Number</th>
                                            <th>Posted</th>
                                            <th>Due</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;
                        
                        data.results.forEach(item => {
                            resultsHTML += `
                                <tr>
                                    <td>${item.title}</td>
                                    <td>${item.agency}</td>
                                    <td>${item.solicitation_number}</td>
                                    <td>${item.posted_date}</td>
                                    <td>${item.due_date}</td>
                                    <td>
                                        <a href="${item.url}" target="_blank" class="btn btn-sm btn-primary">
                                            <i class="fas fa-external-link-alt"></i> View
                                        </a>
                                    </td>
                                </tr>
                            `;
                        });
                        
                        resultsHTML += `
                                    </tbody>
                                </table>
                            </div>
                        `;
                        
                        searchResults.innerHTML = resultsHTML;
                    } else if (data.status === 'warning') {
                        searchResults.innerHTML = `
                            <div class="alert alert-warning">
                                ${data.message}
                            </div>
                        `;
                    } else {
                        searchResults.innerHTML = `
                            <div class="alert alert-danger">
                                ${data.error || 'An unknown error occurred'}
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error("Error searching SAM.gov:", error);
                if (searchResults) {
                    searchResults.innerHTML = `
                        <div class="alert alert-danger">
                            Failed to search SAM.gov. Please try again later.
                        </div>
                    `;
                }
            }
        });
    }

    // Load SAM.gov status data
    loadSamStatus();
    loadContractAwards();
}

// Load SAM.gov status
function loadSamStatus() {
    const samDataContent = document.getElementById('samDataContent');
    if (!samDataContent) return;

    fetch('/api/sam/status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.entities && data.entities.length > 0) {
                let contentHTML = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Entity Name</th><th>DUNS</th><th>Status</th><th>Expires</th></tr></thead><tbody>';
                
                data.entities.forEach(entity => {
                    contentHTML += `
                        <tr>
                            <td>${entity.entity_name}</td>
                            <td>${entity.duns}</td>
                            <td><span class="badge bg-success">${entity.status}</span></td>
                            <td>${entity.expiration_date}</td>
                        </tr>
                    `;
                });
                
                contentHTML += '</tbody></table></div>';
                samDataContent.innerHTML = contentHTML;
            } else {
                samDataContent.innerHTML = '<div class="alert alert-warning">No entity data available.</div>';
            }
        })
        .catch(error => {
            console.error("Error loading SAM.gov status:", error);
            samDataContent.innerHTML = '<div class="alert alert-danger">Failed to load SAM.gov data.</div>';
        });
}

// Load contract awards
function loadContractAwards() {
    const awardsContent = document.getElementById('awardsContent');
    const awardsLoading = document.getElementById('awardsLoading');
    
    if (!awardsContent) return;

    fetch('/api/sam/awards')
        .then(response => response.json())
        .then(data => {
            if (awardsLoading) {
                awardsLoading.style.display = 'none';
            }

            if (data.status === 'success' && data.awards && data.awards.length > 0) {
                let contentHTML = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Title</th><th>Solicitation #</th><th>Amount</th><th>Date</th><th>Awardee</th></tr></thead><tbody>';
                
                data.awards.forEach(award => {
                    contentHTML += `
                        <tr>
                            <td>${award.title}</td>
                            <td>${award.solicitation_number}</td>
                            <td>$${award.award_amount}</td>
                            <td>${award.award_date}</td>
                            <td>${award.awardee}</td>
                        </tr>
                    `;
                });
                
                contentHTML += '</tbody></table></div>';
                awardsContent.innerHTML = contentHTML;
                awardsContent.classList.remove('d-none');
            } else {
                awardsContent.innerHTML = '<div class="alert alert-warning">No recent contract awards found.</div>';
                awardsContent.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error("Error loading contract awards:", error);
            if (awardsLoading) {
                awardsLoading.style.display = 'none';
            }
            awardsContent.innerHTML = '<div class="alert alert-danger">Failed to load contract awards.</div>';
            awardsContent.classList.remove('d-none');
        });
}

// Function to load recent conversations
function loadRecentConversations() {
    const recentConversationsDiv = document.getElementById('recent-conversations');
    if (!recentConversationsDiv) return;

    fetch('/api/recent-conversations')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.conversations && data.conversations.length > 0) {
                recentConversationsDiv.innerHTML = '';
                
                data.conversations.forEach(conversation => {
                    const formattedDate = new Date(conversation.created_at).toLocaleString();
                    const conversationPreview = document.createElement('div');
                    conversationPreview.className = 'conversation-preview';
                    
                    conversationPreview.innerHTML = `
                        <div class="preview-title">${truncateText(conversation.query_text, 40)}</div>
                        <div class="preview-snippet">${truncateText(conversation.response, 60)}</div>
                        <div class="conversation-time">${formattedDate}</div>
                    `;
                    
                    conversationPreview.addEventListener('click', function() {
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
                                    <div class="formatted-content">${conversation.query_text}</div>
                                </div>
                            `;
                            messagesContainer.appendChild(messageDiv);
                            
                            // Add the response as an AI message
                            const responseDiv = document.createElement('div');
                            responseDiv.className = 'message-bubble ai';
                            responseDiv.innerHTML = `
                                <div class="message-content">
                                    <div class="ai-response-header">Omi</div>
                                    <div class="formatted-content">${marked ? marked.parse(conversation.response) : conversation.response}</div>
                                </div>
                            `;
                            messagesContainer.appendChild(responseDiv);
                            
                            // Scroll to the bottom of the messages container
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            
                            // Set the query in the input field
                            queryInput.value = conversation.query_text;
                            queryInput.focus();
                        } else if (queryInput) {
                            // Fallback if message container isn't found
                            queryInput.value = conversation.query_text;
                            queryInput.focus();
                        }
                    });
                    
                    recentConversationsDiv.appendChild(conversationPreview);
                });
            } else {
                recentConversationsDiv.innerHTML = '<div class="text-center py-3 text-muted"><small>No recent conversations</small></div>';
            }
        })
        .catch(error => {
            console.error("Error loading recent conversations:", error);
            recentConversationsDiv.innerHTML = '<div class="text-center py-3 text-danger"><small>Failed to load conversations</small></div>';
        });
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
