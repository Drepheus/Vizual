document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('queryForm');
    const queryInput = document.getElementById('queryInput');
    const responseArea = document.getElementById('responseArea');
    const loadingSpinner = document.getElementById('loadingSpinner');

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
                    // Convert markdown to HTML before displaying
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

                    <div class="sam-data-header">
                        <i class="fas fa-database fa-2x"></i>
                        <h4 class="mb-0">SAM.gov Data</h4>
                    </div>
                    <div class="ai-response">
                        ${formatSamData(data.sam_data)}
                    </div>
                    <div class="response-metadata">
                        <i class="fas fa-info-circle me-2"></i>
                        Response generated using GPT-3.5 Turbo
                    </div>
                </div>
            </div>
        `;
        responseArea.innerHTML = responseHtml;
    }

    function formatResponse(text) {
        // Convert newlines to <br> and wrap paragraphs
        return text.split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    function formatSamData(samData) {
        if (!samData || samData.error) {
            return '<p class="text-muted">No relevant SAM.gov data found</p>';
        }

        return samData.map(entity => `
            <div class="card dashboard-card sam-data-card mb-3">
                <div class="card-body">
                    <p><strong>Entity:</strong> ${entity.entity_name || 'N/A'}</p>
                    <p><strong>DUNS:</strong> ${entity.duns || 'N/A'}</p>
                    <p><strong>Status:</strong> ${entity.status || 'N/A'}</p>
                </div>
            </div>
        `).join('');
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