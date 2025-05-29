// Transactions functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default categories if none exist
    initializeDefaultCategories();
    
    // Populate category dropdowns
    populateCategoryDropdowns();
    
    // Populate year dropdowns
    populateYearDropdowns();
    
    // Load all transactions
    loadTransactions();
    
    // Handle transaction form submission
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTransaction();
        });
    }
    
    // Handle edit transaction form submission
    const editTransactionForm = document.getElementById('editTransactionForm');
    if (editTransactionForm) {
        editTransactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateTransaction();
        });
    }
    
    // Handle delete transaction button
    const deleteTransactionBtn = document.getElementById('deleteTransactionBtn');
    if (deleteTransactionBtn) {
        deleteTransactionBtn.addEventListener('click', function() {
            deleteTransaction();
        });
    }
    
    // Handle payment method change to show/hide credit card details
    const transactionPaymentMethod = document.getElementById('transactionPaymentMethod');
    if (transactionPaymentMethod) {
        transactionPaymentMethod.addEventListener('change', function() {
            toggleCreditCardDetails();
        });
    }
    
    // Handle edit payment method change
    const editTransactionPaymentMethod = document.getElementById('editTransactionPaymentMethod');
    if (editTransactionPaymentMethod) {
        editTransactionPaymentMethod.addEventListener('change', function() {
            toggleEditCreditCardDetails();
        });
    }
    
    // Handle filter changes
    const filterMonth = document.getElementById('filterMonth');
    const filterYear = document.getElementById('filterYear');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    
    if (filterMonth) filterMonth.addEventListener('change', loadTransactions);
    if (filterYear) filterYear.addEventListener('change', loadTransactions);
    if (filterType) filterType.addEventListener('change', loadTransactions);
    if (filterCategory) filterCategory.addEventListener('change', loadTransactions);
    
    // Handle generate PDF button
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generateTransactionsPdf);
    }
    
    // Function to initialize default categories
    function initializeDefaultCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        if (categories.length === 0) {
            const defaultCategories = [
                { id: generateId(), name: 'Salário', type: 'income', description: 'Rendimentos do trabalho' },
                { id: generateId(), name: 'Investimentos', type: 'income', description: 'Rendimentos de investimentos' },
                { id: generateId(), name: 'Outros', type: 'income', description: 'Outras receitas' },
                { id: generateId(), name: 'Alimentação', type: 'expense', description: 'Gastos com alimentação' },
                { id: generateId(), name: 'Moradia', type: 'expense', description: 'Aluguel, condomínio, etc.' },
                { id: generateId(), name: 'Transporte', type: 'expense', description: 'Combustível, transporte público, etc.' },
                { id: generateId(), name: 'Saúde', type: 'expense', description: 'Medicamentos, consultas, etc.' },
                { id: generateId(), name: 'Educação', type: 'expense', description: 'Cursos, material escolar, etc.' },
                { id: generateId(), name: 'Lazer', type: 'expense', description: 'Entretenimento, viagens, etc.' },
                { id: generateId(), name: 'Outros', type: 'expense', description: 'Outras despesas' }
            ];
            
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }
    }
    
    // Function to populate category dropdowns
    function populateCategoryDropdowns() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Populate transaction form dropdown
        const transactionCategory = document.getElementById('transactionCategory');
        if (transactionCategory) {
            transactionCategory.innerHTML = '';
            
            // Group categories by type
            const incomeCategories = categories.filter(c => c.type === 'income');
            const expenseCategories = categories.filter(c => c.type === 'expense');
            
            // Add income categories
            if (incomeCategories.length > 0) {
                const incomeGroup = document.createElement('optgroup');
                incomeGroup.label = 'Receitas';
                
                incomeCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    incomeGroup.appendChild(option);
                });
                
                transactionCategory.appendChild(incomeGroup);
            }
            
            // Add expense categories
            if (expenseCategories.length > 0) {
                const expenseGroup = document.createElement('optgroup');
                expenseGroup.label = 'Despesas';
                
                expenseCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    expenseGroup.appendChild(option);
                });
                
                transactionCategory.appendChild(expenseGroup);
            }
        }
        
        // Populate edit form dropdown
        const editTransactionCategory = document.getElementById('editTransactionCategory');
        if (editTransactionCategory) {
            editTransactionCategory.innerHTML = '';
            
            // Group categories by type
            const incomeCategories = categories.filter(c => c.type === 'income');
            const expenseCategories = categories.filter(c => c.type === 'expense');
            
            // Add income categories
            if (incomeCategories.length > 0) {
                const incomeGroup = document.createElement('optgroup');
                incomeGroup.label = 'Receitas';
                
                incomeCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    incomeGroup.appendChild(option);
                });
                
                editTransactionCategory.appendChild(incomeGroup);
            }
            
            // Add expense categories
            if (expenseCategories.length > 0) {
                const expenseGroup = document.createElement('optgroup');
                expenseGroup.label = 'Despesas';
                
                expenseCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    expenseGroup.appendChild(option);
                });
                
                editTransactionCategory.appendChild(expenseGroup);
            }
        }
        
        // Populate filter dropdown
        const filterCategory = document.getElementById('filterCategory');
        if (filterCategory) {
            // Save selected value
            const selectedValue = filterCategory.value;
            
            filterCategory.innerHTML = '<option value="all">Todas</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                filterCategory.appendChild(option);
            });
            
            // Restore selected value
            if (selectedValue) {
                filterCategory.value = selectedValue;
            }
        }
    }
    
    // Function to populate year dropdowns
    function populateYearDropdowns() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        // Add current year and 4 previous years
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        
        // Populate filter year dropdown
        const filterYear = document.getElementById('filterYear');
        if (filterYear) {
            filterYear.innerHTML = '';
            
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                filterYear.appendChild(option);
            });
            
            // Set current year as default
            filterYear.value = currentYear;
        }
        
        // Populate report year dropdown
        const reportYear = document.getElementById('reportYear');
        if (reportYear) {
            reportYear.innerHTML = '';
            
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                reportYear.appendChild(option);
            });
            
            // Set current year as default
            reportYear.value = currentYear;
        }
    }
    
    // Function to load transactions
    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const transactionsBody = document.getElementById('transactionsBody');
        
        if (!transactionsBody) return;
        
        // Clear existing rows
        transactionsBody.innerHTML = '';
        
        // Get filter values
        const filterMonth = document.getElementById('filterMonth').value;
        const filterYear = document.getElementById('filterYear').value;
        const filterType = document.getElementById('filterType').value;
        const filterCategory = document.getElementById('filterCategory').value;
        
        // Filter transactions
        let filteredTransactions = [...transactions];
        
        if (filterMonth !== 'all') {
            const month = parseInt(filterMonth);
            filteredTransactions = filteredTransactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() + 1 === month;
            });
        }
        
        if (filterYear) {
            const year = parseInt(filterYear);
            filteredTransactions = filteredTransactions.filter(t => {
                const date = new Date(t.date);
                return date.getFullYear() === year;
            });
        }
        
        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
        }
        
        if (filterCategory !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.categoryId === filterCategory);
        }
        
        // Sort transactions by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredTransactions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">Nenhuma transação encontrada</td>';
            transactionsBody.appendChild(row);
            return;
        }
        
        // Add transactions to the table
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
            const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
            const amountPrefix = transaction.type === 'income' ? '' : '-';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td>${getCategoryName(transaction.categoryId)}</td>
                <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
                <td>
                    <button class="btn btn-text edit-transaction" data-id="${transaction.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            
            transactionsBody.appendChild(row);
        });
        
        // Add event listeners to edit buttons
        const editButtons = document.querySelectorAll('.edit-transaction');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const transactionId = this.getAttribute('data-id');
                openEditTransactionModal(transactionId);
            });
        });
        
        // Update dashboard if the function exists in global scope
        if (typeof window.updateDashboard === 'function') {
            window.updateDashboard();
        }
    }
    
    // Function to save a new transaction
    function saveTransaction() {
        const date = document.getElementById('transactionDate').value;
        const type = document.getElementById('transactionType').value;
        const description = document.getElementById('transactionDescription').value;
        const categoryId = document.getElementById('transactionCategory').value;
        const amount = document.getElementById('transactionAmount').value;
        const paymentMethod = document.getElementById('transactionPaymentMethod').value;
        const notes = document.getElementById('transactionNotes').value;
        
        // Credit card details
        let creditCardName = '';
        let installments = 1;
        
        if (paymentMethod === 'credit') {
            creditCardName = document.getElementById('creditCardName').value;
            installments = document.getElementById('installments').value;
        }
        
        // Create transaction object
        const transaction = {
            id: generateId(),
            date,
            type,
            description,
            categoryId,
            amount,
            paymentMethod,
            creditCardName,
            installments,
            notes
        };
        
        // Save to localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Reset form
        document.getElementById('transactionForm').reset();
        
        // Reload transactions
        loadTransactions();
        
        // Trigger storage event for cross-tab updates
        window.dispatchEvent(new Event('storage'));
        
        // Show success message (could be implemented with a toast or alert)
        alert('Transação salva com sucesso!');
    }
    
    // Function to open edit transaction modal
    function openEditTransactionModal(transactionId) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;
        
        // Fill form fields
        document.getElementById('editTransactionId').value = transaction.id;
        document.getElementById('editTransactionDate').value = transaction.date;
        document.getElementById('editTransactionType').value = transaction.type;
        document.getElementById('editTransactionDescription').value = transaction.description;
        document.getElementById('editTransactionCategory').value = transaction.categoryId;
        document.getElementById('editTransactionAmount').value = transaction.amount;
        document.getElementById('editTransactionPaymentMethod').value = transaction.paymentMethod;
        document.getElementById('editTransactionNotes').value = transaction.notes;
        
        // Fill credit card details if applicable
        if (transaction.paymentMethod === 'credit') {
            document.getElementById('editCreditCardName').value = transaction.creditCardName || '';
            document.getElementById('editInstallments').value = transaction.installments || 1;
            document.querySelector('.edit-credit-card-details').style.display = 'flex';
        } else {
            document.querySelector('.edit-credit-card-details').style.display = 'none';
        }
        
        // Show modal
        const modal = document.getElementById('editTransactionModal');
        modal.style.display = 'block';
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Function to update transaction
    function updateTransaction() {
        const transactionId = document.getElementById('editTransactionId').value;
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index === -1) return;
        
        // Get form values
        const date = document.getElementById('editTransactionDate').value;
        const type = document.getElementById('editTransactionType').value;
        const description = document.getElementById('editTransactionDescription').value;
        const categoryId = document.getElementById('editTransactionCategory').value;
        const amount = document.getElementById('editTransactionAmount').value;
        const paymentMethod = document.getElementById('editTransactionPaymentMethod').value;
        const notes = document.getElementById('editTransactionNotes').value;
        
        // Credit card details
        let creditCardName = '';
        let installments = 1;
        
        if (paymentMethod === 'credit') {
            creditCardName = document.getElementById('editCreditCardName').value;
            installments = document.getElementById('editInstallments').value;
        }
        
        // Update transaction
        transactions[index] = {
            id: transactionId,
            date,
            type,
            description,
            categoryId,
            amount,
            paymentMethod,
            creditCardName,
            installments,
            notes
        };
        
        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Close modal
        document.getElementById('editTransactionModal').style.display = 'none';
        
        // Reload transactions
        loadTransactions();
        
        // Trigger storage event for cross-tab updates
        window.dispatchEvent(new Event('storage'));
        
        // Show success message
        alert('Transação atualizada com sucesso!');
    }
    
    // Function to delete transaction
    function deleteTransaction() {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        
        const transactionId = document.getElementById('editTransactionId').value;
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        // Filter out the transaction to delete
        transactions = transactions.filter(t => t.id !== transactionId);
        
        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Close modal
        document.getElementById('editTransactionModal').style.display = 'none';
        
        // Reload transactions
        loadTransactions();
        
        // Trigger storage event for cross-tab updates
        window.dispatchEvent(new Event('storage'));
        
        // Show success message
        alert('Transação excluída com sucesso!');
    }
    
    // Function to toggle credit card details
    function toggleCreditCardDetails() {
        const paymentMethod = document.getElementById('transactionPaymentMethod').value;
        const creditCardDetails = document.querySelector('.credit-card-details');
        
        if (paymentMethod === 'credit') {
            creditCardDetails.style.display = 'flex';
        } else {
            creditCardDetails.style.display = 'none';
        }
    }
    
    // Function to toggle edit credit card details
    function toggleEditCreditCardDetails() {
        const paymentMethod = document.getElementById('editTransactionPaymentMethod').value;
        const creditCardDetails = document.querySelector('.edit-credit-card-details');
        
        if (paymentMethod === 'credit') {
            creditCardDetails.style.display = 'flex';
        } else {
            creditCardDetails.style.display = 'none';
        }
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
    
    // Helper function to generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
});
