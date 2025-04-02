
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('toolSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const toolCards = document.querySelectorAll('.tool-list li');
            
            toolCards.forEach(card => {
                const toolName = card.textContent.toLowerCase();
                if (toolName.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Ensure tool links open in new tab
    document.querySelectorAll('.tool-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            if (url && url !== '#' && url !== 'javascript:void(0)') {
                window.open(url, '_blank');
            }
        });
    });
});
