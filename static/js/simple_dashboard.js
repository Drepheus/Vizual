// Handle image creation button
    if (imageCreationButton) {
        imageCreationButton.addEventListener('click', function() {
            console.log("Image creation button clicked");

            try {
                // Try to open Leonardo AI in a new tab instead of popup
                window.location.href = 'https://app.leonardo.ai/realtime-gen';

                // Alternative: try to open in a new tab
                // const leonardoWindow = window.open('https://app.leonardo.ai/realtime-gen', '_blank');

                // Provide feedback to the user
                const feedback = document.createElement('div');
                feedback.className = 'popup-blocked-notification';
                feedback.innerHTML = `
                    <div class="notification-content">
                        <p><i class="fas fa-check-circle"></i> Opening Leonardo AI image generation...</p>
                    </div>
                `;

                document.body.appendChild(feedback);

                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(feedback)) {
                        document.body.removeChild(feedback);
                    }
                }, 3000);

            } catch (error) {
                console.error("Error opening Leonardo AI:", error);

                // Show error notification
                const errorNotification = document.createElement('div');
                errorNotification.className = 'popup-blocked-notification';
                errorNotification.innerHTML = `
                    <div class="notification-content error-notification">
                        <p><i class="fas fa-exclamation-triangle"></i> Could not open Leonardo AI. Please try again or check your browser settings.</p>
                        <button class="notification-close">Dismiss</button>
                    </div>
                `;

                document.body.appendChild(errorNotification);

                // Add dismiss functionality
                const closeBtn = errorNotification.querySelector('.notification-close');
                closeBtn.addEventListener('click', function() {
                    document.body.removeChild(errorNotification);
                });

                // Auto-dismiss after 10 seconds
                setTimeout(() => {
                    if (document.body.contains(errorNotification)) {
                        document.body.removeChild(errorNotification);
                    }
                }, 10000);
            }
        });
    } else {
        console.error("Image creation button not found in the DOM");
    }