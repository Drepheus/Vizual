document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('queryForm');
    const queryInput = document.getElementById('queryInput');
    const responseArea = document.getElementById('responseArea');
    const documentUploadForm = document.getElementById('documentUploadForm');
    let isTyping = false;
    let shouldStopTyping = false;

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

        queryForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const query = queryInput.value.trim();
            if (!query) return;

            const submitBtn = this.querySelector('button[type="submit"]');
            const stopBtn = this.querySelector('.btn-danger');

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

                await displayResponseWithTyping(data.ai_response);
                if (!shouldStopTyping) {
                    updateQueryHistory(query, data.ai_response);
                }
            } catch (error) {
                console.error('Query error:', error);
                displayError(error.message || 'An unexpected error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
                stopBtn.classList.add('d-none');
                shouldStopTyping = false;
            }
        });
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

        // Split response into characters for typing effect
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