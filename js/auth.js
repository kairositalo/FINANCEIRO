// Authentication and session management
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.setItem('isLoggedIn', 'false');
            window.location.href = 'index.html';
        });
    }

    // Display user's full name
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        const displayName = localStorage.getItem('displayName') || 'Usuário';
        userDisplay.textContent = displayName;
    }
});
