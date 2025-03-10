
document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('query-input');
    const isSimpleDashboard = document.querySelector('.simple-dashboard') !== null || 
                            window.location.pathname.includes('simple-dashboard');
    
    if (!queryInput) return; // Exit if query input doesn't exist on this page
    
    // Example queries for simple dashboard
    const exampleQueries = [
        "Help me set up a digital marketing strategy for my small business",
        "What are some effective ways to improve team productivity?",
        "Explain quantum computing in simple terms",
        "Give me tips for improving my public speaking skills",
        "How can I optimize my LinkedIn profile?"
    ];
    
    // Example queries for GovCon dashboard
    const govConExampleQueries = [
        "Find open IT service solicitations on SAM.gov",
        "What are the steps to register as a government contractor?",
        "Explain the differences between RFI, RFP, and RFQ",
        "How can I find subcontracting opportunities?",
        "What is the NAICS code for cybersecurity services?"
    ];
    
    // Choose which set of examples to use based on dashboard type
    const queriesForThisPage = isSimpleDashboard ? exampleQueries : govConExampleQueries;
    
    let currentExampleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingTimeout = null;
    
    // Make sure the input field is empty at the start
    if (queryInput.placeholder) {
        queryInput.placeholder = '';
    }
    
    function typeNextCharacter() {
        const currentExample = queriesForThisPage[currentExampleIndex];
        
        if (isDeleting) {
            // Deleting characters
            if (currentCharIndex > 0) {
                currentCharIndex--;
                queryInput.placeholder = currentExample.substring(0, currentCharIndex);
                typingTimeout = setTimeout(typeNextCharacter, 30);
            } else {
                // Move to next example
                isDeleting = false;
                currentExampleIndex = (currentExampleIndex + 1) % queriesForThisPage.length;
                typingTimeout = setTimeout(typeNextCharacter, 700);
            }
        } else {
            // Typing characters
            if (currentCharIndex < currentExample.length) {
                currentCharIndex++;
                queryInput.placeholder = currentExample.substring(0, currentCharIndex);
                typingTimeout = setTimeout(typeNextCharacter, 100);
            } else {
                // Wait before starting to delete
                isDeleting = true;
                typingTimeout = setTimeout(typeNextCharacter, 2000);
            }
        }
    }
    
    // Start the typing animation
    typeNextCharacter();
    
    // Stop animation when input field is focused
    queryInput.addEventListener('focus', function() {
        clearTimeout(typingTimeout);
        queryInput.placeholder = '';
    });
    
    // Restart animation when input field loses focus and is empty
    queryInput.addEventListener('blur', function() {
        if (!queryInput.value) {
            currentCharIndex = 0;
            isDeleting = false;
            typeNextCharacter();
        }
    });
});
