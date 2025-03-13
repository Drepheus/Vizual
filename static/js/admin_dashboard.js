
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the admin dashboard
    loadUserActivity();
    loadRecentQueries();
    
    // Set up event listeners
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadUserActivity();
        loadRecentQueries();
    });
    
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

function loadUserActivity(page = 1, searchTerm = '') {
    fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderUsersTable(data.users);
            renderPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error fetching user activity:', error);
            showError('Failed to load user activity. Please try again.');
        });
}

function loadRecentQueries() {
    fetch('/api/admin/recent-queries')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderQueriesTable(data.queries);
        })
        .catch(error => {
            console.error('Error fetching recent queries:', error);
            showError('Failed to load recent queries. Please try again.');
        });
}

function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">No users found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Calculate time since last active
        const lastActive = new Date(user.last_active);
        const now = new Date();
        const diffTime = Math.abs(now - lastActive);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        let lastActiveStr;
        if (diffDays > 0) {
            lastActiveStr = `${diffDays}d ${diffHours}h ago`;
        } else if (diffHours > 0) {
            lastActiveStr = `${diffHours}h ${diffMinutes}m ago`;
        } else {
            lastActiveStr = `${diffMinutes}m ago`;
        }
        
        // Get status color
        const statusClass = user.is_active ? 'text-success' : 'text-danger';
        const statusText = user.is_active ? 'Active' : 'Inactive';
        
        // Get plan badge color
        let planBadgeClass = 'bg-secondary';
        if (user.subscription_type === 'pro') {
            planBadgeClass = 'bg-primary';
        } else if (user.subscription_type === 'premium') {
            planBadgeClass = 'bg-warning text-dark';
        }
        
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td><span class="badge ${planBadgeClass}">${user.subscription_type}</span></td>
            <td>${user.queries_today}</td>
            <td>${user.total_queries}</td>
            <td>${lastActiveStr}</td>
            <td>
                <button class="btn btn-sm btn-info view-details-btn" data-user-id="${user.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Attach event listeners to view details buttons
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            showUserDetails(userId);
        });
    });
}

function renderQueriesTable(queries) {
    const tableBody = document.getElementById('queries-table-body');
    tableBody.innerHTML = '';
    
    if (queries.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" class="text-center">No recent queries</td>';
        tableBody.appendChild(row);
        return;
    }
    
    queries.forEach(query => {
        const row = document.createElement('tr');
        
        // Format time
        const queryTime = new Date(query.created_at);
        const timeStr = queryTime.toLocaleString();
        
        row.innerHTML = `
            <td>${query.username}</td>
            <td>${query.query_text}</td>
            <td>${timeStr}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function renderPagination(pagination) {
    const paginationElement = document.getElementById('activity-pagination');
    paginationElement.innerHTML = '';
    
    if (pagination.total_pages <= 1) {
        return;
    }
    
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'User activity pagination');
    
    const ul = document.createElement('ul');
    ul.className = 'pagination';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${pagination.current_page === 1 ? 'disabled' : ''}`;
    
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo;';
    if (pagination.current_page > 1) {
        prevLink.addEventListener('click', function(e) {
            e.preventDefault();
            loadUserActivity(pagination.current_page - 1, document.getElementById('search-input').value);
        });
    }
    
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= pagination.total_pages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === pagination.current_page ? 'active' : ''}`;
        
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = i;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadUserActivity(i, document.getElementById('search-input').value);
        });
        
        li.appendChild(link);
        ul.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}`;
    
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerHTML = '&raquo;';
    if (pagination.current_page < pagination.total_pages) {
        nextLink.addEventListener('click', function(e) {
            e.preventDefault();
            loadUserActivity(pagination.current_page + 1, document.getElementById('search-input').value);
        });
    }
    
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);
    
    nav.appendChild(ul);
    paginationElement.appendChild(nav);
}

function showUserDetails(userId) {
    fetch(`/api/admin/user/${userId}/details`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const modalBody = document.getElementById('user-detail-content');
            
            // Format registration date
            const registeredDate = new Date(data.user.created_at);
            const registeredStr = registeredDate.toLocaleDateString();
            
            // Create HTML for user details
            let html = `
                <div class="user-profile mb-4">
                    <h4>${data.user.username}</h4>
                    <p><strong>Email:</strong> ${data.user.email}</p>
                    <p><strong>Status:</strong> <span class="${data.user.is_active ? 'text-success' : 'text-danger'}">${data.user.is_active ? 'Active' : 'Inactive'}</span></p>
                    <p><strong>Subscription:</strong> ${data.user.subscription_type}</p>
                    <p><strong>Registered:</strong> ${registeredStr}</p>
                    <p><strong>Total Queries:</strong> ${data.user.total_queries}</p>
                </div>
                
                <h5>Recent Activity</h5>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Query</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            if (data.activity.length === 0) {
                html += '<tr><td colspan="2" class="text-center">No recent activity</td></tr>';
            } else {
                data.activity.forEach(item => {
                    const activityTime = new Date(item.created_at);
                    const timeStr = activityTime.toLocaleString();
                    
                    html += `
                        <tr>
                            <td>${item.query_text}</td>
                            <td>${timeStr}</td>
                        </tr>
                    `;
                });
            }
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            modalBody.innerHTML = html;
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            showError('Failed to load user details. Please try again.');
        });
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value;
    loadUserActivity(1, searchTerm);
}

function showError(message) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x mt-3';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.role = 'alert';
    
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
}
