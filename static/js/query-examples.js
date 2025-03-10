
document.addEventListener('DOMContentLoaded', function() {
  const queryInput = document.getElementById('query-input');
  if (!queryInput) return;
  
  // Example queries that will be shown in rotation
  const exampleQueries = [
    "Find government contracting opportunities in healthcare",
    "How do I respond to an RFP?",
    "Explain SAM.gov registration process",
    "What are the requirements for a CAGE code?",
    "How to find small business set-aside contracts?",
    "Analyze this RFP for key requirements",
    "What's the difference between GSA and IDIQ contracts?",
    "Help me understand NAICS codes",
    "How to create a capability statement?",
    "What are past performance references?",
    "Guide me through bid/no-bid decision process",
    "Search for cybersecurity contracts"
  ];
  
  let currentIndex = 0;
  let currentTypingIndex = 0;
  let isDeleting = false;
  let typingTimer;
  
  // Start the animation when the input is not focused
  function handleFocusState() {
    if (document.activeElement !== queryInput) {
      startTypingAnimation();
    } else {
      stopTypingAnimation();
    }
  }
  
  function startTypingAnimation() {
    if (typingTimer) return; // Already running
    
    typingTimer = setInterval(typeCharacter, 100);
  }
  
  function stopTypingAnimation() {
    clearInterval(typingTimer);
    typingTimer = null;
    queryInput.placeholder = "Ask a question...";
    queryInput.value = "";
  }
  
  function typeCharacter() {
    const currentExample = exampleQueries[currentIndex];
    
    if (!isDeleting) {
      // Typing forward
      queryInput.placeholder = currentExample.substring(0, currentTypingIndex) + "▌";
      currentTypingIndex++;
      
      // If we've completed typing the example
      if (currentTypingIndex > currentExample.length) {
        isDeleting = true;
        // Pause at the end of typing before deleting
        clearInterval(typingTimer);
        typingTimer = setTimeout(function() {
          typingTimer = setInterval(typeCharacter, 50); // Faster deletion
        }, 2000);
      }
    } else {
      // Deleting
      queryInput.placeholder = currentExample.substring(0, currentTypingIndex) + "▌";
      currentTypingIndex--;
      
      // If we've deleted the entire example
      if (currentTypingIndex === 0) {
        isDeleting = false;
        // Move to next example
        currentIndex = (currentIndex + 1) % exampleQueries.length;
        // Pause before typing the next example
        clearInterval(typingTimer);
        typingTimer = setTimeout(function() {
          typingTimer = setInterval(typeCharacter, 100); // Normal typing speed
        }, 500);
      }
    }
  }
  
  // Start animation initially if input is not focused
  handleFocusState();
  
  // Add event listeners to handle focus state
  queryInput.addEventListener('focus', function() {
    stopTypingAnimation();
  });
  
  queryInput.addEventListener('blur', function() {
    if (!queryInput.value.trim()) {
      startTypingAnimation();
    }
  });
  
  // Stop animation when user starts typing
  queryInput.addEventListener('input', function() {
    if (queryInput.value.trim()) {
      stopTypingAnimation();
    }
  });
});
