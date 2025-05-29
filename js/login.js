// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // User credentials
    const users = [
        { username: 'italo', password: 'italo123', displayName: 'Italo Amorim' },
        { username: 'maely', password: 'maely123', displayName: 'Maely Amorim' }
    ];

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.toLowerCase();
            const password = document.getElementById('password').value;
            
            // Check credentials
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Set login status in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('displayName', user.displayName);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                loginMessage.textContent = 'Usuário ou senha incorretos. Tente novamente.';
                loginMessage.classList.add('error');
                loginMessage.style.display = 'block';
            }
        });
    }
});
