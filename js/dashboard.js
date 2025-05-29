// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Display current date
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString('pt-BR', options);
    }

    // Initialize dashboard data
    updateDashboardSummary();
    loadRecentTransactions();
    initializeCharts();

    // Expose dashboard update functions globally
    window.updateDashboardSummary = updateDashboardSummary;
    window.loadRecentTransactions = loadRecentTransactions;
    window.initializeCharts = initializeCharts;

    // Add event listener for storage changes to update dashboard in real-time
    window.addEventListener('storage', function(e) {
        if (e.key === 'transactions' || e.key === 'categories') {
            updateDashboardSummary();
            loadRecentTransactions();
            initializeCharts();
        }
    });

    // Create a custom event for dashboard updates
    window.updateDashboard = function() {
        updateDashboardSummary();
        loadRecentTransactions();
        initializeCharts();
    };

    // Function to update dashboard summary
    function updateDashboardSummary() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        let totalIncome = 0;
        let totalExpense = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                totalExpense += parseFloat(transaction.amount);
            }
        });
        
        const totalBalance = totalIncome - totalExpense;
        
        // Update summary cards
        const totalIncomeElement = document.getElementById('totalIncome');
        const totalExpenseElement = document.getElementById('totalExpense');
        const totalBalanceElement = document.getElementById('totalBalance');
        
        if (totalIncomeElement) totalIncomeElement.textContent = formatCurrency(totalIncome);
        if (totalExpenseElement) totalExpenseElement.textContent = formatCurrency(totalExpense);
        if (totalBalanceElement) {
            totalBalanceElement.textContent = formatCurrency(totalBalance);
            
            // Apply color to balance based on value
            if (totalBalance >= 0) {
                totalBalanceElement.classList.add('positive');
                totalBalanceElement.classList.remove('negative');
            } else {
                totalBalanceElement.classList.add('negative');
                totalBalanceElement.classList.remove('positive');
            }
        }

        // Update available balance section
        updateAvailableBalance(totalIncome, totalExpense);
    }

    // Function to update available balance
    function updateAvailableBalance(totalIncome, totalExpense) {
        const availableBalanceAmount = document.getElementById('availableBalanceAmount');
        const availableBalanceBar = document.getElementById('availableBalanceBar');
        const totalIncomeDetail = document.getElementById('totalIncomeDetail');
        const totalExpenseDetail = document.getElementById('totalExpenseDetail');
        const expensePercentage = document.getElementById('expensePercentage');
        
        if (!availableBalanceAmount || !availableBalanceBar || !totalIncomeDetail || 
            !totalExpenseDetail || !expensePercentage) return;
        
        const availableBalance = totalIncome - totalExpense;
        const percentSpent = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
        const percentRemaining = 100 - percentSpent;
        
        // Update text values
        availableBalanceAmount.textContent = formatCurrency(availableBalance);
        totalIncomeDetail.textContent = formatCurrency(totalIncome);
        totalExpenseDetail.textContent = formatCurrency(totalExpense);
        expensePercentage.textContent = `${percentSpent.toFixed(1)}%`;
        
        // Update progress bar
        availableBalanceBar.style.width = `${percentRemaining}%`;
        
        // Apply color to available balance based on percentage spent
        if (percentSpent < 50) {
            availableBalanceBar.className = 'available-balance-bar good';
            availableBalanceAmount.className = 'positive';
        } else if (percentSpent < 80) {
            availableBalanceBar.className = 'available-balance-bar warning';
            availableBalanceAmount.className = 'warning';
        } else {
            availableBalanceBar.className = 'available-balance-bar danger';
            availableBalanceAmount.className = 'negative';
        }
    }

    // Function to load recent transactions
    function loadRecentTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const recentTransactionsBody = document.getElementById('recentTransactionsBody');
        
        if (!recentTransactionsBody) return;
        
        // Clear existing rows
        recentTransactionsBody.innerHTML = '';
        
        // Sort transactions by date (newest first) and take the first 5
        const recentTransactions = [...transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentTransactions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="text-center">Nenhuma transação registrada</td>';
            recentTransactionsBody.appendChild(row);
            return;
        }
        
        // Add recent transactions to the table
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
            const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
            const amountPrefix = transaction.type === 'income' ? '' : '-';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td>${getCategoryName(transaction.categoryId)}</td>
                <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
            `;
            
            recentTransactionsBody.appendChild(row);
        });
    }

    // Function to initialize charts
    function initializeCharts() {
        initializeExpensesByCategoryChart();
        initializeIncomeVsExpenseChart();
    }

    // Function to initialize expenses by category chart
    function initializeExpensesByCategoryChart() {
        const ctx = document.getElementById('expensesByCategoryChart');
        if (!ctx) return;
        
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Filter expenses only
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Group expenses by category
        const expensesByCategory = {};
        expenses.forEach(expense => {
            const categoryId = expense.categoryId;
            if (!expensesByCategory[categoryId]) {
                expensesByCategory[categoryId] = 0;
            }
            expensesByCategory[categoryId] += parseFloat(expense.amount);
        });
        
        // Prepare data for chart
        const labels = [];
        const data = [];
        const backgroundColors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#34495e', '#7f8c8d', '#c0392b'
        ];
        
        let colorIndex = 0;
        for (const categoryId in expensesByCategory) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                labels.push(category.name);
                data.push(expensesByCategory[categoryId]);
                colorIndex = (colorIndex + 1) % backgroundColors.length;
            }
        }
        
        // Create chart
        if (window.expensesByCategoryChart) {
            window.expensesByCategoryChart.destroy();
        }
        
        window.expensesByCategoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    // Function to initialize income vs expense chart
    function initializeIncomeVsExpenseChart() {
        const ctx = document.getElementById('incomeVsExpenseChart');
        if (!ctx) return;
        
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        // Get last 6 months
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(month);
        }
        
        // Calculate income and expense for each month
        const incomeData = [];
        const expenseData = [];
        const labels = [];
        
        months.forEach(month => {
            const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });
            const year = month.getFullYear();
            labels.push(`${monthName} ${year}`);
            
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === month.getMonth() && 
                       transactionDate.getFullYear() === month.getFullYear();
            });
            
            const monthIncome = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
            const monthExpense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
            incomeData.push(monthIncome);
            expenseData.push(monthExpense);
        });
        
        // Create chart
        if (window.incomeVsExpenseChart) {
            window.incomeVsExpenseChart.destroy();
        }
        
        window.incomeVsExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: '#2ecc71',
                        borderColor: '#27ae60',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    // Helper function to get category name by ID
    function getCategoryName(categoryId) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Sem categoria';
    }

    // Helper function to format currency
    function formatCurrency(value) {
        return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
    }
});
