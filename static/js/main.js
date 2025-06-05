/**
 * Main JavaScript for Smart Water Meter Application
 * Handles general UI interactions and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Enable Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Enable Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Initialize any charts on the page
    initializeCharts();
    
    // Handle form validation
    initializeFormValidation();
    
    // Initialize any date pickers
    initializeDatePickers();
});

/**
 * Initialize any Chart.js charts on the page
 */
function initializeCharts() {
    // This function will be called by individual chart initializers
    // that are defined in their respective template files
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    // Fetch all forms that need validation
    const forms = document.querySelectorAll('.needs-validation');
    
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Initialize date pickers
 */
function initializeDatePickers() {
    // Flatpickr can be initialized here if needed
    // Example: flatpickr(".datepicker", { dateFormat: "Y-m-d" });
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - The size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Toggle password visibility
 * @param {HTMLElement} button - The button that was clicked
 */
function togglePassword(button) {
    const input = button.previousElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Show a loading spinner
 * @param {HTMLElement} element - The element to show the spinner in
 * @param {string} [text='Loading...'] - The text to display with the spinner
 */
function showLoading(element, text = 'Loading...') {
    element.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            ${text}
        </div>
    `;
    element.disabled = true;
}

/**
 * Reset a button to its original state
 * @param {HTMLElement} button - The button to reset
 * @param {string} originalText - The original button text
 */
function resetButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} [type='info'] - The type of toast (info, success, warning, error)
 * @param {number} [duration=3000] - How long to show the toast in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Check if toast container exists, if not create it
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1100';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: duration
    });
    
    // Show toast
    bsToast.show();
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
    
    return toastId;
}

/**
 * Handle AJAX form submission
 * @param {HTMLFormElement} form - The form to submit via AJAX
 * @param {Function} [callback] - Callback function to run on success
 */
function submitFormAjax(form, callback) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Show loading state
    showLoading(submitButton, 'Saving...');
    
    fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': formData.get('csrfmiddlewaretoken') || ''
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message || 'Operation completed successfully', 'success');
            if (typeof callback === 'function') {
                callback(data);
            }
            
            // If there's a redirect URL, navigate to it
            if (data.redirect_url) {
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 1500);
            }
            
            // If the form should be reset on success
            if (data.reset_form) {
                form.reset();
            }
        } else {
            showToast(data.message || 'An error occurred', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred while processing your request', 'error');
    })
    .finally(() => {
        // Reset button state
        resetButton(submitButton, originalButtonText);
    });
}

// Make functions available globally
window.app = {
    formatBytes,
    formatDate,
    togglePassword,
    showLoading,
    resetButton,
    showToast,
    submitFormAjax
};

// Initialize any charts that might be on the page
initializeCharts();
