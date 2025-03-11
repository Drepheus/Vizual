// GovCon Dashboard specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log("GovCon Dashboard script loaded");
    initializeGovConDashboard();
});

function initializeGovConDashboard() {
    const queryForm = document.getElementById('queryForm');
    const responseArea = document.getElementById('responseArea');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const samSearchForm = document.getElementById('samSearchForm');
    const searchResults = document.getElementById('searchResults');

    // Initialize SAM.gov status card
    loadSamStatus();

    // Initialize recent awards
    loadRecentAwards();

    // Handle SAM.gov search form submission
    if (samSearchForm) {
        samSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) return;

            const query = searchInput.value.trim();
            if (!query) return;

            // Show loading state
            searchResults.innerHTML = `
                <div class="text-center my-4">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Searching...</span>
                    </div>
                    <p class="text-muted mt-2">Searching SAM.gov for "${query}"...</p>
                </div>
            `;

            // Send search request
            fetch('/api/sam/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.results && data.results.length > 0) {
                    let resultsHtml = `
                        <h5 class="mb-3">Found ${data.count} results for "${query}"</h5>
                        <div class="list-group">
                    `;

                    data.results.forEach(result => {
                        resultsHtml += `
                            <a href="${result.url}" target="_blank" class="list-group-item list-group-item-action">
                                <div class="d-flex justify-content-between">
                                    <h6 class="mb-1">${result.title}</h6>
                                    <small>${result.posted_date}</small>
                                </div>
                                <p class="mb-1">Agency: ${result.agency}</p>
                                <small>Due: ${result.due_date} | Solicitation #: ${result.solicitation_number}</small>
                            </a>
                        `;
                    });

                    resultsHtml += `</div>`;
                    searchResults.innerHTML = resultsHtml;
                } else {
                    searchResults.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            ${data.message || 'No results found. Try different keywords.'}
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                searchResults.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Failed to search SAM.gov. Please try again later.
                    </div>
                `;
            });
        });
    }

    // Handle query form submission
    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const queryInput = document.getElementById('queryInput');
            if (!queryInput) return;

            const query = queryInput.value.trim();
            if (!query) return;

            // Show loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.remove('d-none');
            }

            // Clear previous response
            if (responseArea) {
                responseArea.innerHTML = '';
            }

            // Send query to server
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            })
            .then(response => response.json())
            .then(data => {
                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.classList.add('d-none');
                }

                if (data.error) {
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
                } else if (data.limit_reached) {
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
                } else {
                    // Display AI response
                    // Convert markdown to HTML (basic formatting)
                    let formattedResponse = data.ai_response
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code>$1</code>');

                    responseArea.innerHTML = `
                        <div class="card dashboard-card mb-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fas fa-robot me-2 text-primary"></i>
                                    <h4 class="card-title mb-0">Omi Response</h4>
                                </div>
                                <div class="ai-response">
                                    ${formattedResponse}
                                </div>
                                ${data.queries_remaining !== undefined ?
                                `<div class="mt-3 text-muted queries-remaining">
                                    <small>${data.queries_remaining} queries remaining</small>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.classList.add('d-none');
                }

                responseArea.innerHTML = `
                    <div class="card dashboard-card mb-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-exclamation-circle me-2 text-danger"></i>
                                <h4 class="card-title mb-0">Error</h4>
                            </div>
                            <div class="alert alert-danger">
                                Failed to process your query. Please try again later.
                            </div>
                        </div>
                    </div>
                `;
            });
        });
    }

    // Handle document upload form if it exists
    const documentUploadForm = document.getElementById('documentUploadForm');
    if (documentUploadForm) {
        documentUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Document analysis feature is coming soon!');
        });
    }
}

function loadSamStatus() {
    const samStatusLoading = document.getElementById('samStatusLoading');
    const samStatusContent = document.getElementById('samStatusContent');
    const samDataContent = document.getElementById('samDataContent');
    const samLastUpdate = document.getElementById('samLastUpdate');

    if (!samStatusLoading || !samStatusContent || !samDataContent) return;

    fetch('/api/sam/status')
        .then(response => response.json())
        .then(data => {
            samStatusLoading.classList.add('d-none');
            samStatusContent.classList.remove('d-none');

            if (data.status === 'success' && data.entities && data.entities.length > 0) {
                let entitiesHtml = '<h6 class="mb-3">Registered Entities</h6><div class="sam-entities">';

                data.entities.forEach(entity => {
                    entitiesHtml += `
                        <div class="sam-entity mb-2">
                            <div class="d-flex justify-content-between">
                                <span><strong>${entity.entity_name}</strong></span>
                                <span class="badge bg-success">Active</span>
                            </div>
                            <small class="text-muted">DUNS: ${entity.duns}</small>
                        </div>
                    `;
                });

                entitiesHtml += '</div>';
                samDataContent.innerHTML = entitiesHtml;

                if (samLastUpdate) {
                    samLastUpdate.textContent = new Date().toLocaleString();
                }
            } else {
                samDataContent.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No entity data available.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            samStatusLoading.classList.add('d-none');
            samStatusContent.classList.remove('d-none');

            samDataContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Failed to load SAM.gov data. Please try again later.
                </div>
            `;
        });
}

function loadRecentAwards() {
    const awardsLoading = document.getElementById('awardsLoading');
    const awardsContent = document.getElementById('awardsContent');

    if (!awardsLoading || !awardsContent) return;

    fetch('/api/sam/awards')
        .then(response => response.json())
        .then(data => {
            awardsLoading.classList.add('d-none');
            awardsContent.classList.remove('d-none');

            if (data.status === 'success' && data.awards && data.awards.length > 0) {
                let awardsHtml = '<div class="list-group">';

                data.awards.forEach(award => {
                    awardsHtml += `
                        <a href="${award.url}" target="_blank" class="list-group-item list-group-item-action">
                            <div class="d-flex justify-content-between">
                                <h6 class="mb-1">${award.title}</h6>
                                <span class="badge bg-success">$${parseInt(award.award_amount).toLocaleString()}</span>
                            </div>
                            <p class="mb-1">Awarded to: ${award.awardee}</p>
                            <small class="text-muted">${award.award_date} | #${award.solicitation_number}</small>
                        </a>
                    `;
                });

                awardsHtml += '</div>';
                awardsContent.innerHTML = awardsHtml;
            } else {
                awardsContent.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No recent awards available.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            awardsLoading.classList.add('d-none');
            awardsContent.classList.remove('d-none');

            awardsContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Failed to load recent awards. Please try again later.
                </div>
            `;
        });
}