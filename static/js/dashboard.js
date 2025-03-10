document.addEventListener('DOMContentLoaded', function() {
    // Common elements
    const queryForm = document.getElementById('queryForm');
    const queryInput = document.getElementById('queryInput');
    const responseArea = document.getElementById('responseArea');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const recentConversationsList = document.getElementById('recentConversationsList');

    // Gov Dashboard specific elements
    const samSearchForm = document.getElementById('samSearchForm');
    const searchResults = document.getElementById('searchResults');
    const samStatusCard = document.getElementById('samStatusCard');
    const contractAwardsCard = document.getElementById('contractAwardsCard');

    // Initialize recent conversations
    fetchRecentConversations();

    // Initialize Gov Dashboard components if they exist
    if (window.location.pathname.includes('dashboard') && !window.location.pathname.includes('simple')) {
        initGovDashboard();
    }

    // Query form submission
    if (queryForm) {
        queryForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const query = queryInput.value.trim();

            if (!query) return;

            // Show loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.remove('d-none');
            }

            try {
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query })
                });

                const data = await response.json();

                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.classList.add('d-none');
                }

                if (data.error) {
                    console.log("API Error:", data.error);

                    // Check if it's a rate limit error
                    if (data.error === 'Free tier query limit reached') {
                        showUpgradeModal(data.message, data.subscription_options, data.upgrade_url);
                    } else {
                        // Show error message
                        displayAIResponse({
                            role: 'assistant',
                            content: `Sorry, I encountered an error. Please try again.`,
                            error: true
                        });
                    }
                } else {
                    // Display AI response
                    displayAIResponse({
                        role: 'assistant',
                        content: data.ai_response
                    });

                    // Clear input
                    queryInput.value = '';

                    // Update recent conversations
                    fetchRecentConversations();
                }
            } catch (error) {
                console.log("Error:", error);

                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.classList.add('d-none');
                }

                // Show error message
                displayAIResponse({
                    role: 'assistant',
                    content: 'Sorry, there was an error processing your request. Please try again.',
                    error: true
                });
            }
        });
    }

    function displayAIResponse(message) {
        if (!responseArea) return;

        const responseCard = document.createElement('div');
        responseCard.className = 'card dashboard-card response-card mb-4';

        const timestamp = new Date().toLocaleTimeString();

        // Create a formatted display for the AI response with Markdown-like formatting
        const formattedContent = formatMessageContent(message.content);

        responseCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-start mb-3">
                    <div class="me-3">
                        <div class="avatar">
                            <i class="fas ${message.error ? 'fa-exclamation-circle text-danger' : 'fa-robot text-primary'}"></i>
                        </div>
                    </div>
                    <div>
                        <h5 class="mb-1">Omi AI ${message.error ? '(Error)' : ''}</h5>
                        <div class="text-muted small">${timestamp}</div>
                    </div>
                </div>
                <div class="ai-response formatted-content">
                    ${formattedContent}
                </div>
            </div>
        `;

        responseArea.appendChild(responseCard);

        // Scroll to the latest response
        responseCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    function formatMessageContent(content) {
        if (!content) return '';

        // Convert URLs to links
        content = content.replace(/https?:\/\/\S+/g, url => `<a href="${url}" target="_blank">${url}</a>`);

        // Convert markdown-style formatting to HTML
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code

        // Convert line breaks to <br> tags
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    function fetchRecentConversations() {
        if (!recentConversationsList) return;

        fetch('/api/recent_conversations')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.conversations) {
                    updateRecentConversations(data.conversations);
                }
            })
            .catch(error => {
                console.error('Error fetching recent conversations:', error);
            });
    }

    function updateRecentConversations(conversations) {
        if (!recentConversationsList) return;

        // Clear existing items
        recentConversationsList.innerHTML = '';

        if (conversations.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'list-group-item bg-dark border-0 text-muted';
            emptyItem.textContent = 'No conversations yet';
            recentConversationsList.appendChild(emptyItem);
            return;
        }

        // Add conversations to the list
        conversations.forEach(conversation => {
            const item = document.createElement('li');
            item.className = 'list-group-item bg-dark border-0 conversation-item';

            // Format timestamp
            const date = new Date(conversation.created_at);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="conversation-preview">
                        <div class="conversation-text">${conversation.query_text.substring(0, 50)}${conversation.query_text.length > 50 ? '...' : ''}</div>
                        <div class="text-muted small">${formattedDate}</div>
                    </div>
                    <button class="btn btn-sm conversation-button" data-query="${conversation.query_text}">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            `;

            // Add event listener to retry this query
            const retryButton = item.querySelector('.conversation-button');
            retryButton.addEventListener('click', function() {
                if (queryInput) {
                    queryInput.value = this.dataset.query;
                    queryForm.dispatchEvent(new Event('submit'));
                }
            });

            recentConversationsList.appendChild(item);
        });
    }

    // Show upgrade modal
    function showUpgradeModal(message, options, upgradeUrl) {
        const modalHTML = `
            <div class="modal fade" id="upgradeModal" tabindex="-1" aria-labelledby="upgradeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content bg-dark text-light">
                        <div class="modal-header border-0">
                            <h5 class="modal-title" id="upgradeModalLabel">Upgrade Your Account</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning" role="alert">
                                ${message}
                            </div>
                            <div class="row g-4 mt-2">
                                ${Object.entries(options).map(([plan, details]) => `
                                    <div class="col-md-6">
                                        <div class="card bg-dark border">
                                            <div class="card-body text-center">
                                                <h5 class="card-title">${plan.charAt(0).toUpperCase() + plan.slice(1)}</h5>
                                                <div class="price-tag mb-3">${details.price}</div>
                                                <p class="card-text">${details.features}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No Thanks</button>
                            <a href="${upgradeUrl}" class="btn btn-primary">Upgrade Now</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Initialize and show the modal
        const modal = new bootstrap.Modal(document.getElementById('upgradeModal'));
        modal.show();

        // Clean up when the modal is hidden
        document.getElementById('upgradeModal').addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalContainer);
        });
    }

    // Initialize Government Dashboard functionality
    function initGovDashboard() {
        // Load SAM.gov status
        loadSamGovStatus();

        // Load recent contract awards
        loadContractAwards();

        // Setup SAM.gov search form
        if (samSearchForm) {
            samSearchForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    performSamSearch(searchInput.value.trim());
                }
            });
        }

        // Setup document upload if it exists
        const documentUploadForm = document.getElementById('documentUploadForm');
        if (documentUploadForm) {
            documentUploadForm.addEventListener('submit', function(event) {
                event.preventDefault();

                const fileInput = document.getElementById('documentFile');
                const documentQuery = document.getElementById('documentQuery');

                if (fileInput && fileInput.files.length > 0) {
                    uploadAndAnalyzeDocuments(fileInput.files, documentQuery ? documentQuery.value : '');
                }
            });
        }
    }

    // Load SAM.gov Status
    function loadSamGovStatus() {
        if (!samStatusCard) return;

        const samStatusLoading = document.getElementById('samStatusLoading');
        const samStatusContent = document.getElementById('samStatusContent');
        const samDataContent = document.getElementById('samDataContent');

        if (!samStatusLoading || !samStatusContent || !samDataContent) return;

        // Show loading state
        samStatusLoading.classList.remove('d-none');
        samStatusContent.classList.add('d-none');

        // Fetch SAM.gov status
        fetch('/api/sam/status')
            .then(response => response.json())
            .then(data => {
                // Hide loading state
                samStatusLoading.classList.add('d-none');
                samStatusContent.classList.remove('d-none');

                if (data.status === 'success' && data.entities) {
                    // Format and display entities
                    samDataContent.innerHTML = '';

                    data.entities.forEach(entity => {
                        const entityCard = document.createElement('div');
                        entityCard.className = 'sam-entity-card p-2 mb-2 border-bottom';

                        entityCard.innerHTML = `
                            <div class="d-flex justify-content-between">
                                <div>
                                    <strong>${entity.entity_name}</strong>
                                    <div class="small">DUNS: ${entity.duns}</div>
                                </div>
                                <div>
                                    <span class="badge bg-success">${entity.status}</span>
                                    <div class="small">Expires: ${entity.expiration_date}</div>
                                </div>
                            </div>
                        `;

                        samDataContent.appendChild(entityCard);
                    });
                } else {
                    samDataContent.innerHTML = '<div class="alert alert-warning">Unable to fetch SAM.gov data</div>';
                }

                // Update last updated timestamp
                const samLastUpdate = document.getElementById('samLastUpdate');
                if (samLastUpdate) {
                    samLastUpdate.textContent = new Date().toLocaleString();
                }
            })
            .catch(error => {
                console.error('Error fetching SAM.gov status:', error);

                // Hide loading state
                samStatusLoading.classList.add('d-none');
                samStatusContent.classList.remove('d-none');

                // Show error message
                samDataContent.innerHTML = '<div class="alert alert-danger">Failed to connect to SAM.gov</div>';
            });
    }

    // Load Contract Awards
    function loadContractAwards() {
        if (!contractAwardsCard) return;

        const awardsLoading = document.getElementById('awardsLoading');
        const awardsContent = document.getElementById('awardsContent');

        if (!awardsLoading || !awardsContent) return;

        // Show loading state
        awardsLoading.classList.remove('d-none');
        awardsContent.classList.add('d-none');

        // Fetch recent contract awards
        fetch('/api/sam/awards')
            .then(response => response.json())
            .then(data => {
                // Hide loading state
                awardsLoading.classList.add('d-none');
                awardsContent.classList.remove('d-none');

                if (data.status === 'success' && data.awards) {
                    // Format and display awards
                    awardsContent.innerHTML = '';

                    data.awards.forEach(award => {
                        const awardCard = document.createElement('div');
                        awardCard.className = 'award-card p-2 mb-2 border-bottom';

                        const formattedAmount = parseInt(award.award_amount).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                        });

                        awardCard.innerHTML = `
                            <div>
                                <strong>${award.title}</strong>
                                <div class="d-flex justify-content-between mt-1">
                                    <div class="small">${award.awardee}</div>
                                    <div class="small fw-bold">${formattedAmount}</div>
                                </div>
                                <div class="d-flex justify-content-between mt-1">
                                    <div class="small text-muted">${award.solicitation_number}</div>
                                    <div class="small text-muted">${award.award_date}</div>
                                </div>
                            </div>
                        `;

                        awardsContent.appendChild(awardCard);
                    });
                } else {
                    awardsContent.innerHTML = '<div class="alert alert-warning">No recent awards found</div>';
                }
            })
            .catch(error => {
                console.error('Error fetching contract awards:', error);

                // Hide loading state
                awardsLoading.classList.add('d-none');
                awardsContent.classList.remove('d-none');

                // Show error message
                awardsContent.innerHTML = '<div class="alert alert-danger">Failed to load contract awards</div>';
            });
    }

    // Perform SAM.gov Search
    function performSamSearch(query) {
        if (!searchResults) return;

        // Show loading state in the search results area
        searchResults.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Searching...</span>
                </div>
                <p class="mt-3 text-muted">Searching SAM.gov for "${query}"...</p>
            </div>
        `;

        // Send search query to the backend
        fetch('/api/sam/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.results && data.results.length > 0) {
                // Format and display search results
                searchResults.innerHTML = `
                    <h5 class="mb-3">Search Results (${data.count})</h5>
                    <div class="search-results-container"></div>
                `;

                const resultsContainer = searchResults.querySelector('.search-results-container');

                data.results.forEach(result => {
                    const resultCard = document.createElement('div');
                    resultCard.className = 'card mb-3 search-result-card';

                    resultCard.innerHTML = `
                        <div class="card-body">
                            <h6 class="card-title mb-2">${result.title}</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">${result.agency}</span>
                                <span class="text-muted small">${result.solicitation_number}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span class="badge bg-info me-2">Posted: ${result.posted_date}</span>
                                    <span class="badge bg-warning">Due: ${result.due_date}</span>
                                </div>
                                <a href="${result.url}" target="_blank" class="btn btn-sm btn-primary">
                                    <i class="fas fa-external-link-alt me-1"></i> View
                                </a>
                            </div>
                        </div>
                    `;

                    resultsContainer.appendChild(resultCard);
                });
            } else if (data.status === 'warning') {
                // No results found
                searchResults.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${data.message}
                    </div>
                    <p class="text-muted">Try a different search term or browse categories instead.</p>
                `;
            } else {
                // Error occurred
                searchResults.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        An error occurred during your search
                    </div>
                    <p class="text-muted">Please try again in a moment.</p>
                `;
            }
        })
        .catch(error => {
            console.error('Error performing SAM.gov search:', error);

            // Show error message
            searchResults.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Search request failed
                </div>
                <p class="text-muted">Please check your connection and try again.</p>
            `;
        });
    }

    // Upload and Analyze Documents
    function uploadAndAnalyzeDocuments(files, query) {
        if (!responseArea) return;

        // Show loading state
        if (loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }

        // Create a FormData object to send files
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        if (query) {
            formData.append('query', query);
        }

        // Upload files
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display a success message
                displayAIResponse({
                    role: 'assistant',
                    content: `I've successfully received your document${files.length > 1 ? 's' : ''}. I'll analyze ${files.length > 1 ? 'them' : 'it'} and provide insights based on your request: "${query || 'Analyze the document contents'}".`
                });

                // In a real implementation, you would now query the AI with the uploaded document content
                // But for this demo, we'll just show a confirmation

                // Clear file input
                const fileInput = document.getElementById('documentFile');
                if (fileInput) {
                    fileInput.value = '';
                }

                const documentQuery = document.getElementById('documentQuery');
                if (documentQuery) {
                    documentQuery.value = '';
                }
            } else {
                // Display error message
                displayAIResponse({
                    role: 'assistant',
                    content: `Sorry, there was an error uploading your document${files.length > 1 ? 's' : ''}. ${data.error || 'Please try again.'}`,
                    error: true
                });
            }

            // Hide loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        })
        .catch(error => {
            console.error('Error uploading documents:', error);

            // Display error message
            displayAIResponse({
                role: 'assistant',
                content: 'Sorry, there was an error uploading your documents. Please try again later.',
                error: true
            });

            // Hide loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        });
    }
});