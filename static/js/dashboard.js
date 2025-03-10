
document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    
    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = queryInput.value.trim();
            if (!query) return;
            
            // Add user message to UI
            const userMessageHtml = `
                <div class="message-bubble user">
                    <div class="message-content">
                        <div class="user-response-header">
                            You
                        </div>
                        <p>${query}</p>
                    </div>
                </div>
            `;
            messagesContainer.innerHTML += userMessageHtml;
            
            // Clear input
            queryInput.value = '';
            
            // Show typing indicator
            typingIndicator.style.display = 'block';
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Send query to server
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })
            .then(response => response.json())
            .then(data => {
                // Hide typing indicator
                typingIndicator.style.display = 'none';
                
                if (data.error) {
                    const errorMsg = `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <p>Error: ${data.message || data.error}</p>
                            </div>
                        </div>
                    `;
                    messagesContainer.innerHTML += errorMsg;
                } else {
                    // Add AI response to UI
                    const aiResponseHtml = `
                        <div class="message-bubble ai">
                            <div class="message-content">
                                <div class="ai-response-header">
                                    Omi
                                </div>
                                <p>${data.ai_response.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                    `;
                    messagesContainer.innerHTML += aiResponseHtml;
                }
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error);
                typingIndicator.style.display = 'none';
                
                const errorMsg = `
                    <div class="message-bubble ai">
                        <div class="message-content">
                            <div class="ai-response-header">
                                Omi
                            </div>
                            <p>Sorry, there was an error processing your request. Please try again.</p>
                        </div>
                    </div>
                `;
                messagesContainer.innerHTML += errorMsg;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
        });
    }
    
    // File upload button functionality
    const fileUploadButton = document.getElementById('file-upload-button');
    const fileUploadInput = document.getElementById('file-upload-input');
    const fileUploadStatus = document.getElementById('file-upload-status');
    
    if (fileUploadButton && fileUploadInput) {
        fileUploadButton.addEventListener('click', function() {
            fileUploadInput.click();
        });
        
        fileUploadInput.addEventListener('change', function() {
            if (fileUploadInput.files.length > 0) {
                const file = fileUploadInput.files[0];
                fileUploadStatus.textContent = `Uploading: ${file.name}...`;
                
                const formData = new FormData();
                formData.append('file', file);
                
                fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fileUploadStatus.textContent = `File uploaded: ${file.name}`;
                        queryInput.value = `I've uploaded ${file.name}. Please analyze this document.`;
                    } else {
                        fileUploadStatus.textContent = `Error: ${data.error}`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    fileUploadStatus.textContent = 'Error uploading file. Please try again.';
                });
            }
        });
    }
    
    // Voice mode button - placeholder
    const voiceModeButton = document.getElementById('voice-mode-button');
    if (voiceModeButton) {
        voiceModeButton.addEventListener('click', function() {
            alert('Voice mode coming soon!');
        });
    }
    
    // Image creation button - placeholder
    const imageCreationButton = document.getElementById('image-creation-button');
    if (imageCreationButton) {
        imageCreationButton.addEventListener('click', function() {
            alert('Image creation coming soon!');
        });
    }
});
