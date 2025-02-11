document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('queryForm');
    const queryInput = document.getElementById('queryInput');
    const responseArea = document.getElementById('responseArea');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Initialize SAM.gov data loading
    loadSamGovStatus();
    loadContractAwards();

    if (queryForm) {
        queryForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const query = queryInput.value.trim();
            if (!query) return;

            try {
                loadingSpinner.classList.remove('d-none');
                responseArea.innerHTML = '';

                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query })
                });

                const data = await response.json();

                if (response.ok) {
                    const formattedResponse = data.ai_response
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

                    displayResponse({...data, ai_response: formattedResponse});
                    updateQueryHistory(query, formattedResponse);
                } else {
                    throw new Error(data.error || 'Failed to process query');
                }
            } catch (error) {
                displayError(error.message);
            } finally {
                loadingSpinner.classList.add('d-none');
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

    function displayResponse(data) {
        const responseHtml = `
            <div class="card dashboard-card response-card mb-4">
                <div class="card-body">
                    <div class="ai-response-header">
                        <i class="fas fa-robot fa-2x"></i>
                        <h4 class="mb-0">AI Response</h4>
                    </div>
                    <div class="ai-response">
                        ${formatResponse(data.ai_response)}
                    </div>
                    <div class="response-metadata">
                        <i class="fas fa-info-circle me-2"></i>
                        Response generated using GPT-4
                    </div>
                </div>
            </div>
        `;
        responseArea.innerHTML = responseHtml;
    }

    function formatResponse(text) {
        return text.split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
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
});