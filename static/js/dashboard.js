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

    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = queryInput.value.trim();

            if (!query) return;

            // Add user message to the chat
            addMessageToChat('user', query);

            // Clear input
            queryInput.value = '';

            // Show typing indicator
            typingIndicator.style.display = 'flex';

            // Scroll to bottom
            scrollToBottom();

            // Send query to API
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || data.message || 'Unknown error');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Hide typing indicator
                typingIndicator.style.display = 'none';

                // Add AI response to chat
                if (data.ai_response) {
                    addMessageToChat('ai', data.ai_response);

                    // Update recent conversations
                    loadRecentConversations();
                } else {
                    addMessageToChat('ai', 'Sorry, I couldn\'t generate a response. Please try again.');
                }
            })
            .catch(error => {
                console.log("Error:", error);
                // Hide typing indicator
                typingIndicator.style.display = 'none';

                // Add error message
                addMessageToChat('ai', `Sorry, I encountered an error. Please try again. (${error.message})`);
            })
            .finally(() => {
                // Scroll to bottom
                scrollToBottom();
            });
        });
    }

    // Function to add a message to the chat
    function addMessageToChat(role, content) {
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-bubble', role);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        if (role === 'ai') {
            // Format the AI message content with Markdown or simple HTML
            const formattedContent = formatMessageContent(content);
            messageContent.innerHTML = formattedContent;
        } else {
            messageContent.textContent = content;
        }

        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        // Scroll to the new message
        scrollToBottom();
    }

    // Function to format message content
    function formatMessageContent(content) {
        if (!content) return '';

        // Replace markdown-style formatting with HTML
        let formatted = content
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Handles line breaks
            .replace(/\n/g, '<br>');

        return formatted;
    }

    // Function to scroll the chat to the bottom
    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
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

            // Clear previous response
            if (responseArea) {
                responseArea.innerHTML = `
                    <div class="card dashboard-card mb-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-robot me-2"></i>
                                <h4 class="card-title mb-0">AI Processing...</h4>
                            </div>
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Send the query
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || data.message || 'Unknown error');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Display the AI response
                if (responseArea) {
                    responseArea.innerHTML = `
                        <div class="card dashboard-card mb-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fas fa-robot me-2"></i>
                                    <h4 class="card-title mb-0">AI Response</h4>
                                </div>
                                <div class="formatted-content">
                                    ${formatResponseContent(data.ai_response)}
                                </div>
                            </div>
                        </div>
                    `;
                }
                // Clear input
                govConQueryInput.value = '';

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
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: query })
                });

                const data = await response.json();

                if (searchResults) {
                    if (data.status === 'success' && data.results && data.results.length > 0) {
                        let resultsHtml = `
                            <h5 class="mb-3">Found ${data.count} results</h5>
                            <div class="table-responsive">
                                <table class="table table-sm table-dark table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Solicitation</th>
                                            <th>Agency</th>
                                            <th>Posted Date</th>
                                            <th>Due Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;

                        data.results.forEach(result => {
                            resultsHtml += `
                                <tr>
                                    <td>${result.title}</td>
                                    <td>${result.agency}</td>
                                    <td>${result.posted_date}</td>
                                    <td>${result.due_date}</td>
                                    <td>
                                        <a href="${result.url}" target="_blank" class="btn btn-sm btn-primary">
                                            <i class="fas fa-external-link-alt me-1"></i>View
                                        </a>
                                    </td>
                                </tr>
                            `;
                        });

                        resultsHtml += `
                                    </tbody>
                                </table>
                            </div>
                        `;

                        searchResults.innerHTML = resultsHtml;
                    } else {
                        searchResults.innerHTML = `
                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle me-2"></i>
                                ${data.message || 'No results found matching your search criteria.'}
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error("Error searching SAM.gov:", error);
                if (searchResults) {
                    searchResults.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Error searching SAM.gov. Please try again later.
                        </div>
                    `;
                }
            }
        });
    }
    // Initialize SAM.gov status panel (entity registrations)
    loadSAMStatus();

    // Initialize contract awards panel
    loadContractAwards();

    // Function to load SAM.gov status
    async function loadSAMStatus() {
        const samStatusContainer = document.getElementById('samStatusContainer');
        if (!samStatusContainer) return;

        try {
            const response = await fetch('/api/sam/status');
            const data = await response.json();

            if (response.ok) {
                let html = '';
                data.entities.forEach(entity => {
                    html += `
                    <div class="card mb-3 sam-data-card">
                        <div class="card-body">
                            <h5 class="card-title">${entity.entity_name}</h5>
                            <p class="card-text">DUNS: ${entity.duns}</p>
                            <p class="card-text">Status: <span class="badge bg-success">${entity.status}</span></p>
                            <p class="card-text">Expires: ${entity.expiration_date}</p>
                            <a href="${entity.url}" target="_blank" class="btn btn-sm btn-outline-primary">View Details</a>
                        </div>
                    </div>`;
                });
                samStatusContainer.innerHTML = html;
            } else {
                samStatusContainer.innerHTML = `<div class="alert alert-danger">${data.error || 'Failed to load SAM.gov status'}</div>`;
            }
        } catch (error) {
            console.error('Error:', error);
            samStatusContainer.innerHTML = '<div class="alert alert-danger">Could not connect to the server. Please try again later.</div>';
        }
    }

    // Function to load contract awards
    async function loadContractAwards() {
        const awardsContainer = document.getElementById('awardsContainer');
        if (!awardsContainer) return;

        try {
            const response = await fetch('/api/sam/awards');
            const data = await response.json();

            if (response.ok) {
                let html = '';
                data.awards.forEach(award => {
                    html += `
                    <div class="card mb-3 award-card">
                        <div class="card-body">
                            <h5 class="card-title">${award.title}</h5>
                            <p class="card-text">Solicitation #: ${award.solicitation_number}</p>
                            <p class="card-text">Award: $${parseInt(award.award_amount).toLocaleString()}</p>
                            <p class="card-text">Awardee: ${award.awardee}</p>
                            <p class="card-text"><small class="text-muted">Award Date: ${award.award_date}</small></p>
                            <a href="${award.url}" target="_blank" class="btn btn-sm btn-outline-success">View Details</a>
                        </div>
                    </div>`;
                });
                awardsContainer.innerHTML = html;
            } else {
                awardsContainer.innerHTML = `<div class="alert alert-danger">${data.error || 'Failed to load contract awards'}</div>`;
            }
        } catch (error) {
            console.error('Error:', error);
            awardsContainer.innerHTML = '<div class="alert alert-danger">Could not connect to the server. Please try again later.</div>';
        }
    }
}

// Common functionality for both dashboards
function loadRecentConversations() {
    const conversationsList = document.getElementById('conversations-list');
    if (!conversationsList) return;

    fetch('/api/recent-conversations')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.conversations && data.conversations.length > 0) {
                conversationsList.innerHTML = '';

                data.conversations.forEach(conversation => {
                    const formattedDate = new Date(conversation.created_at).toLocaleString();
                    const item = document.createElement('div');
                    item.classList.add('conversation-item');
                    item.innerHTML = `
                        <div class="query-preview">${truncateText(conversation.query_text, 50)}</div>
                        <div class="timestamp">${formattedDate}</div>
                    `;

                    item.addEventListener('click', function() {
                        const queryInput = document.getElementById('query-input') || document.getElementById('govConQueryInput');
                        if (queryInput) {
                            queryInput.value = conversation.query_text;
                            queryInput.focus();
                        }
                    });

                    conversationsList.appendChild(item);
                });
            } else {
                conversationsList.innerHTML = '<div class="p-3 text-center text-muted">No recent conversations found.</div>';
            }
        })
        .catch(error => {
            console.error("Error loading recent conversations:", error);
            conversationsList.innerHTML = '<div class="p-3 text-center text-danger">Error loading conversations.</div>';
        });
}

// Helper functions
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatResponseContent(content) {
    if (!content) return '';

    // Replace markdown-style formatting with HTML
    let formatted = content
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Handle bullet lists
        .replace(/^[\s]*•[\s]+(.*?)$/gm, '<li>$1</li>')
        // Handle numbered lists
        .replace(/^[\s]*(\d+)\.[\s]+(.*?)$/gm, '<li>$2</li>')
        // Handle line breaks
        .replace(/\n/g, '<br>');

    // Wrap lists in ul tags
    if (formatted.includes('<li>')) {
        formatted = formatted.replace(/<br><li>/g, '<li>');
        formatted = formatted.replace(/<li>.*?<li>/g, match => {
            return '<ul>' + match;
        });
        formatted = formatted.replace(/<li>.*?$/g, match => {
            return '<ul>' + match + '</ul>';
        });
    }

    return formatted;
}