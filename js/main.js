// Main JavaScript file for the application
document.addEventListener('DOMContentLoaded', function() {
    // Handle sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-menu li[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the corresponding content section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Handle sidebar toggle on mobile
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Handle "View All Transactions" button
    const viewAllTransactionsBtn = document.getElementById('viewAllTransactionsBtn');
    if (viewAllTransactionsBtn) {
        viewAllTransactionsBtn.addEventListener('click', function() {
            // Switch to transactions section
            sidebarLinks.forEach(l => l.classList.remove('active'));
            const transactionsLink = document.querySelector('.sidebar-menu li[data-section="transactions-section"]');
            if (transactionsLink) {
                transactionsLink.classList.add('active');
            }
            
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('transactions-section').classList.add('active');
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Set current month in filter
    const filterMonth = document.getElementById('filterMonth');
    if (filterMonth) {
        const currentMonth = new Date().getMonth() + 1;
        filterMonth.value = currentMonth;
    }
    
    // Set current month in report
    const reportMonth = document.getElementById('reportMonth');
    if (reportMonth) {
        const currentMonth = new Date().getMonth() + 1;
        reportMonth.value = currentMonth;
    }
});
