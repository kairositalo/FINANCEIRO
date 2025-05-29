// Reports functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateReport();
        });
    }
    
    // Handle download report PDF button
    const downloadReportPdf = document.getElementById('downloadReportPdf');
    if (downloadReportPdf) {
        downloadReportPdf.addEventListener('click', function() {
            downloadReportAsPdf();
        });
    }
    
    // Function to generate report
    function generateReport() {
        const reportType = document.getElementById('reportType').value;
        const reportMonth = document.getElementById('reportMonth').value;
        const reportYear = document.getElementById('reportYear').value;
        
        const reportResults = document.getElementById('reportResults');
        if (!reportResults) return;
        
        // Get transactions
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        // Filter transactions by month and year
        const filteredTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() + 1 === parseInt(reportMonth) && 
                   date.getFullYear() === parseInt(reportYear);
        });
        
        if (filteredTransactions.length === 0) {
            reportResults.innerHTML = '<p class="text-center">Nenhuma transação encontrada para o período selecionado.</p>';
            return;
        }
        
        // Generate report based on type
        switch (reportType) {
            case 'monthly':
                generateMonthlyReport(filteredTransactions, reportMonth, reportYear);
                break;
            case 'category':
                generateCategoryReport(filteredTransactions, reportMonth, reportYear);
                break;
            case 'payment':
                generatePaymentMethodReport(filteredTransactions, reportMonth, reportYear);
                break;
        }
    }
    
    // Function to generate monthly report
    function generateMonthlyReport(transactions, month, year) {
        const reportResults = document.getElementById('reportResults');
        
        // Calculate totals
        let totalIncome = 0;
        let totalExpense = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                totalExpense += parseFloat(transaction.amount);
            }
        });
        
        const balance = totalIncome - totalExpense;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        
        // Get month name
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthName = monthNames[parseInt(month) - 1];
        
        // Create report HTML
        let html = `
            <div class="report-header">
                <h2>Relatório Mensal - ${monthName} de ${year}</h2>
                <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <span>Total de Receitas:</span>
                    <span class="positive">${formatCurrency(totalIncome)}</span>
                </div>
                <div class="summary-item">
                    <span>Total de Despesas:</span>
                    <span class="negative">${formatCurrency(totalExpense)}</span>
                </div>
                <div class="summary-item total">
                    <span>Saldo do Período:</span>
                    <span class="${balanceClass}">${formatCurrency(balance)}</span>
                </div>
            </div>
            
            <div class="report-section">
                <h3>Transações do Período</h3>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Sort transactions by date
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Add transactions to table
        transactions.forEach(transaction => {
            const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
            const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
            const amountPrefix = transaction.type === 'income' ? '' : '-';
            
            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${transaction.description}</td>
                    <td>${getCategoryName(transaction.categoryId)}</td>
                    <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        reportResults.innerHTML = html;
    }
    
    // Function to generate category report
    function generateCategoryReport(transactions, month, year) {
        const reportResults = document.getElementById('reportResults');
        
        // Get categories
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Group transactions by category
        const transactionsByCategory = {};
        
        transactions.forEach(transaction => {
            if (!transactionsByCategory[transaction.categoryId]) {
                transactionsByCategory[transaction.categoryId] = {
                    income: 0,
                    expense: 0
                };
            }
            
            if (transaction.type === 'income') {
                transactionsByCategory[transaction.categoryId].income += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                transactionsByCategory[transaction.categoryId].expense += parseFloat(transaction.amount);
            }
        });
        
        // Calculate totals
        let totalIncome = 0;
        let totalExpense = 0;
        
        Object.values(transactionsByCategory).forEach(value => {
            totalIncome += value.income;
            totalExpense += value.expense;
        });
        
        const balance = totalIncome - totalExpense;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        
        // Get month name
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthName = monthNames[parseInt(month) - 1];
        
        // Create report HTML
        let html = `
            <div class="report-header">
                <h2>Relatório por Categoria - ${monthName} de ${year}</h2>
                <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <span>Total de Receitas:</span>
                    <span class="positive">${formatCurrency(totalIncome)}</span>
                </div>
                <div class="summary-item">
                    <span>Total de Despesas:</span>
                    <span class="negative">${formatCurrency(totalExpense)}</span>
                </div>
                <div class="summary-item total">
                    <span>Saldo do Período:</span>
                    <span class="${balanceClass}">${formatCurrency(balance)}</span>
                </div>
            </div>
            
            <div class="report-section">
                <h3>Resumo por Categoria</h3>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Tipo</th>
                                <th>Receitas</th>
                                <th>Despesas</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Add categories to table
        for (const categoryId in transactionsByCategory) {
            const category = categories.find(c => c.id === categoryId);
            if (!category) continue;
            
            const income = transactionsByCategory[categoryId].income;
            const expense = transactionsByCategory[categoryId].expense;
            const balance = income - expense;
            const balanceClass = balance >= 0 ? 'positive' : 'negative';
            
            html += `
                <tr>
                    <td>${category.name}</td>
                    <td>${category.type === 'income' ? 'Receita' : 'Despesa'}</td>
                    <td class="positive">${formatCurrency(income)}</td>
                    <td class="negative">${formatCurrency(expense)}</td>
                    <td class="${balanceClass}">${formatCurrency(balance)}</td>
                </tr>
            `;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        reportResults.innerHTML = html;
    }
    
    // Function to generate payment method report
    function generatePaymentMethodReport(transactions, month, year) {
        const reportResults = document.getElementById('reportResults');
        
        // Group transactions by payment method
        const transactionsByPaymentMethod = {};
        
        transactions.forEach(transaction => {
            if (!transaction.paymentMethod) return;
            
            if (!transactionsByPaymentMethod[transaction.paymentMethod]) {
                transactionsByPaymentMethod[transaction.paymentMethod] = {
                    count: 0,
                    total: 0
                };
            }
            
            transactionsByPaymentMethod[transaction.paymentMethod].count++;
            transactionsByPaymentMethod[transaction.paymentMethod].total += parseFloat(transaction.amount);
        });
        
        // Calculate total
        let total = 0;
        Object.values(transactionsByPaymentMethod).forEach(value => {
            total += value.total;
        });
        
        // Get month name
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthName = monthNames[parseInt(month) - 1];
        
        // Create report HTML
        let html = `
            <div class="report-header">
                <h2>Relatório por Método de Pagamento - ${monthName} de ${year}</h2>
                <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-item total">
                    <span>Total de Transações:</span>
                    <span>${transactions.length}</span>
                </div>
                <div class="summary-item total">
                    <span>Valor Total:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
            </div>
            
            <div class="report-section">
                <h3>Resumo por Método de Pagamento</h3>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Método de Pagamento</th>
                                <th>Quantidade</th>
                                <th>Total</th>
                                <th>Percentual</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Payment method labels
        const paymentMethodLabels = {
            'money': 'Dinheiro',
            'debit': 'Cartão de Débito',
            'credit': 'Cartão de Crédito',
            'transfer': 'Transferência',
            'other': 'Outro'
        };
        
        // Add payment methods to table
        for (const method in transactionsByPaymentMethod) {
            const count = transactionsByPaymentMethod[method].count;
            const methodTotal = transactionsByPaymentMethod[method].total;
            const percentage = (methodTotal / total * 100).toFixed(2);
            
            html += `
                <tr>
                    <td>${paymentMethodLabels[method] || method}</td>
                    <td>${count}</td>
                    <td>${formatCurrency(methodTotal)}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        reportResults.innerHTML = html;
    }
    
    // Function to download report as PDF
    function downloadReportAsPdf() {
        // This will be implemented in the PDF generation module
        alert('Função de download de PDF será implementada em breve!');
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
