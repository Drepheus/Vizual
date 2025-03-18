
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('toolSearch');
    const toolCards = document.querySelectorAll('.tool-list li');

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        toolCards.forEach(card => {
            const toolName = card.textContent.toLowerCase();
            if (toolName.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
