// PDF generation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle generate PDF button in transactions section
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', function() {
            generateTransactionsPdf();
        });
    }
    
    // Handle download report PDF button in reports section
    const downloadReportPdf = document.getElementById('downloadReportPdf');
    if (downloadReportPdf) {
        downloadReportPdf.addEventListener('click', function() {
            const reportType = document.getElementById('reportType').value;
            const reportMonth = document.getElementById('reportMonth').value;
            const reportYear = document.getElementById('reportYear').value;
            
            generateReportPdf(reportType, reportMonth, reportYear);
        });
    }
    
    // Function to generate transactions PDF
    function generateTransactionsPdf() {
        // Get filtered transactions
        const transactions = getFilteredTransactions();
        
        if (transactions.length === 0) {
            alert('Não há transações para gerar o PDF.');
            return;
        }
        
        // Get filter values for title
        const filterMonth = document.getElementById('filterMonth').value;
        const filterYear = document.getElementById('filterYear').value;
        const filterType = document.getElementById('filterType').value;
        const filterCategory = document.getElementById('filterCategory').value;
        
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font size and styles
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        
        // Add title
        doc.text('Relatório de Transações', 105, 20, { align: 'center' });
        
        // Add subtitle with filter information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        let subtitle = '';
        
        if (filterMonth !== 'all') {
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            subtitle += `Mês: ${monthNames[parseInt(filterMonth) - 1]} `;
        }
        
        if (filterYear) {
            subtitle += `Ano: ${filterYear} `;
        }
        
        if (filterType !== 'all') {
            subtitle += `Tipo: ${filterType === 'income' ? 'Receitas' : 'Despesas'} `;
        }
        
        if (filterCategory !== 'all') {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            const category = categories.find(c => c.id === filterCategory);
            if (category) {
                subtitle += `Categoria: ${category.name}`;
            }
        }
        
        if (subtitle) {
            doc.text(subtitle, 105, 30, { align: 'center' });
        }
        
        // Add generation date
        const now = new Date();
        doc.setFontSize(10);
        doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 105, 40, { align: 'center' });
        
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
        
        // Add summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo:', 20, 55);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Total de Receitas: ${formatCurrency(totalIncome)}`, 20, 65);
        doc.text(`Total de Despesas: ${formatCurrency(totalExpense)}`, 20, 75);
        doc.text(`Saldo: ${formatCurrency(balance)}`, 20, 85);
        
        // Add transactions table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Transações:', 20, 100);
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 105, 170, 10, 'F');
        
        doc.setFontSize(10);
        doc.text('Data', 25, 112);
        doc.text('Descrição', 55, 112);
        doc.text('Categoria', 105, 112);
        doc.text('Valor', 165, 112, { align: 'right' });
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        
        let y = 125;
        const rowHeight = 10;
        const pageHeight = doc.internal.pageSize.height;
        
        transactions.forEach((transaction, index) => {
            // Add new page if needed
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
                
                // Add table headers on new page
                doc.setFillColor(240, 240, 240);
                doc.rect(20, y, 170, 10, 'F');
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Data', 25, y + 7);
                doc.text('Descrição', 55, y + 7);
                doc.text('Categoria', 105, y + 7);
                doc.text('Valor', 165, y + 7, { align: 'right' });
                
                doc.setFont('helvetica', 'normal');
                y += 20;
            }
            
            // Add zebra striping
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, y - 7, 170, rowHeight, 'F');
            }
            
            // Format date
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            // Get category name
            const categoryName = getCategoryName(transaction.categoryId);
            
            // Format amount
            const amountPrefix = transaction.type === 'income' ? '' : '-';
            const formattedAmount = `${amountPrefix}${formatCurrency(transaction.amount)}`;
            
            // Add row data
            doc.text(formattedDate, 25, y);
            
            // Handle long descriptions
            const description = transaction.description;
            if (doc.getTextWidth(description) > 45) {
                doc.text(description.substring(0, 20) + '...', 55, y);
            } else {
                doc.text(description, 55, y);
            }
            
            doc.text(categoryName, 105, y);
            doc.text(formattedAmount, 165, y, { align: 'right' });
            
            y += rowHeight;
        });
        
        // Save the PDF
        doc.save('transacoes.pdf');
    }
    
    // Function to generate report PDF
    function generateReportPdf(reportType, month, year) {
        // Get transactions for the selected month and year
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        const filteredTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() + 1 === parseInt(month) && 
                   date.getFullYear() === parseInt(year);
        });
        
        if (filteredTransactions.length === 0) {
            alert('Não há transações para gerar o relatório.');
            return;
        }
        
        // Get month name
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthName = monthNames[parseInt(month) - 1];
        
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font size and styles
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        
        // Add title based on report type
        let title = '';
        switch (reportType) {
            case 'monthly':
                title = 'Relatório Mensal';
                break;
            case 'category':
                title = 'Relatório por Categoria';
                break;
            case 'payment':
                title = 'Relatório por Método de Pagamento';
                break;
        }
        
        doc.text(title, 105, 20, { align: 'center' });
        
        // Add subtitle with month and year
        doc.setFontSize(14);
        doc.text(`${monthName} de ${year}`, 105, 30, { align: 'center' });
        
        // Add generation date
        const now = new Date();
        doc.setFontSize(10);
        doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 105, 40, { align: 'center' });
        
        // Calculate totals
        let totalIncome = 0;
        let totalExpense = 0;
        
        filteredTransactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                totalExpense += parseFloat(transaction.amount);
            }
        });
        
        const balance = totalIncome - totalExpense;
        
        // Add summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo Financeiro:', 20, 55);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Total de Receitas: ${formatCurrency(totalIncome)}`, 20, 65);
        doc.text(`Total de Despesas: ${formatCurrency(totalExpense)}`, 20, 75);
        doc.text(`Saldo: ${formatCurrency(balance)}`, 20, 85);
        
        // Generate specific report content based on type
        switch (reportType) {
            case 'monthly':
                generateMonthlyReportContent(doc, filteredTransactions);
                break;
            case 'category':
                generateCategoryReportContent(doc, filteredTransactions);
                break;
            case 'payment':
                generatePaymentReportContent(doc, filteredTransactions);
                break;
        }
        
        // Save the PDF
        doc.save(`relatorio_${reportType}_${month}_${year}.pdf`);
    }
    
    // Function to generate monthly report content
    function generateMonthlyReportContent(doc, transactions) {
        // Add transactions table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Transações do Período:', 20, 100);
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 105, 170, 10, 'F');
        
        doc.setFontSize(10);
        doc.text('Data', 25, 112);
        doc.text('Descrição', 55, 112);
        doc.text('Categoria', 105, 112);
        doc.text('Valor', 165, 112, { align: 'right' });
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        
        let y = 125;
        const rowHeight = 10;
        const pageHeight = doc.internal.pageSize.height;
        
        // Sort transactions by date
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        transactions.forEach((transaction, index) => {
            // Add new page if needed
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
                
                // Add table headers on new page
                doc.setFillColor(240, 240, 240);
                doc.rect(20, y, 170, 10, 'F');
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Data', 25, y + 7);
                doc.text('Descrição', 55, y + 7);
                doc.text('Categoria', 105, y + 7);
                doc.text('Valor', 165, y + 7, { align: 'right' });
                
                doc.setFont('helvetica', 'normal');
                y += 20;
            }
            
            // Add zebra striping
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, y - 7, 170, rowHeight, 'F');
            }
            
            // Format date
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            // Get category name
            const categoryName = getCategoryName(transaction.categoryId);
            
            // Format amount
            const amountPrefix = transaction.type === 'income' ? '' : '-';
            const formattedAmount = `${amountPrefix}${formatCurrency(transaction.amount)}`;
            
            // Add row data
            doc.text(formattedDate, 25, y);
            
            // Handle long descriptions
            const description = transaction.description;
            if (doc.getTextWidth(description) > 45) {
                doc.text(description.substring(0, 20) + '...', 55, y);
            } else {
                doc.text(description, 55, y);
            }
            
            doc.text(categoryName, 105, y);
            doc.text(formattedAmount, 165, y, { align: 'right' });
            
            y += rowHeight;
        });
    }
    
    // Function to generate category report content
    function generateCategoryReportContent(doc, transactions) {
        // Get categories
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Group transactions by category
        const transactionsByCategory = {};
        
        transactions.forEach(transaction => {
            if (!transactionsByCategory[transaction.categoryId]) {
                transactionsByCategory[transaction.categoryId] = {
                    income: 0,
                    expense: 0,
                    transactions: []
                };
            }
            
            if (transaction.type === 'income') {
                transactionsByCategory[transaction.categoryId].income += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                transactionsByCategory[transaction.categoryId].expense += parseFloat(transaction.amount);
            }
            
            transactionsByCategory[transaction.categoryId].transactions.push(transaction);
        });
        
        // Add category summary table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo por Categoria:', 20, 100);
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 105, 170, 10, 'F');
        
        doc.setFontSize(10);
        doc.text('Categoria', 25, 112);
        doc.text('Tipo', 75, 112);
        doc.text('Receitas', 100, 112);
        doc.text('Despesas', 130, 112);
        doc.text('Saldo', 165, 112, { align: 'right' });
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        
        let y = 125;
        const rowHeight = 10;
        
        let index = 0;
        for (const categoryId in transactionsByCategory) {
            const category = categories.find(c => c.id === categoryId);
            if (!category) continue;
            
            // Add zebra striping
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, y - 7, 170, rowHeight, 'F');
            }
            
            const income = transactionsByCategory[categoryId].income;
            const expense = transactionsByCategory[categoryId].expense;
            const balance = income - expense;
            
            // Add row data
            doc.text(category.name, 25, y);
            doc.text(category.type === 'income' ? 'Receita' : 'Despesa', 75, y);
            doc.text(formatCurrency(income), 100, y);
            doc.text(formatCurrency(expense), 130, y);
            doc.text(formatCurrency(balance), 165, y, { align: 'right' });
            
            y += rowHeight;
            index++;
            
            // Add new page if needed
            if (y > doc.internal.pageSize.height - 20 && index < Object.keys(transactionsByCategory).length) {
                doc.addPage();
                y = 20;
                
                // Add table headers on new page
                doc.setFillColor(240, 240, 240);
                doc.rect(20, y, 170, 10, 'F');
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Categoria', 25, y + 7);
                doc.text('Tipo', 75, y + 7);
                doc.text('Receitas', 100, y + 7);
                doc.text('Despesas', 130, y + 7);
                doc.text('Saldo', 165, y + 7, { align: 'right' });
                
                doc.setFont('helvetica', 'normal');
                y += 20;
            }
        }
    }
    
    // Function to generate payment method report content
    function generatePaymentReportContent(doc, transactions) {
        // Group transactions by payment method
        const transactionsByPaymentMethod = {};
        
        transactions.forEach(transaction => {
            if (!transaction.paymentMethod) return;
            
            if (!transactionsByPaymentMethod[transaction.paymentMethod]) {
                transactionsByPaymentMethod[transaction.paymentMethod] = {
                    count: 0,
                    total: 0,
                    transactions: []
                };
            }
            
            transactionsByPaymentMethod[transaction.paymentMethod].count++;
            transactionsByPaymentMethod[transaction.paymentMethod].total += parseFloat(transaction.amount);
            transactionsByPaymentMethod[transaction.paymentMethod].transactions.push(transaction);
        });
        
        // Calculate total
        let total = 0;
        Object.values(transactionsByPaymentMethod).forEach(value => {
            total += value.total;
        });
        
        // Add payment method summary table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo por Método de Pagamento:', 20, 100);
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 105, 170, 10, 'F');
        
        doc.setFontSize(10);
        doc.text('Método de Pagamento', 25, 112);
        doc.text('Quantidade', 90, 112);
        doc.text('Total', 130, 112);
        doc.text('Percentual', 165, 112, { align: 'right' });
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        
        let y = 125;
        const rowHeight = 10;
        
        // Payment method labels
        const paymentMethodLabels = {
            'money': 'Dinheiro',
            'debit': 'Cartão de Débito',
            'credit': 'Cartão de Crédito',
            'transfer': 'Transferência',
            'other': 'Outro'
        };
        
        let index = 0;
        for (const method in transactionsByPaymentMethod) {
            // Add zebra striping
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, y - 7, 170, rowHeight, 'F');
            }
            
            const count = transactionsByPaymentMethod[method].count;
            const methodTotal = transactionsByPaymentMethod[method].total;
            const percentage = (methodTotal / total * 100).toFixed(2);
            
            // Add row data
            doc.text(paymentMethodLabels[method] || method, 25, y);
            doc.text(count.toString(), 90, y);
            doc.text(formatCurrency(methodTotal), 130, y);
            doc.text(`${percentage}%`, 165, y, { align: 'right' });
            
            y += rowHeight;
            index++;
            
            // Add new page if needed
            if (y > doc.internal.pageSize.height - 20 && index < Object.keys(transactionsByPaymentMethod).length) {
                doc.addPage();
                y = 20;
                
                // Add table headers on new page
                doc.setFillColor(240, 240, 240);
                doc.rect(20, y, 170, 10, 'F');
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Método de Pagamento', 25, y + 7);
                doc.text('Quantidade', 90, y + 7);
                doc.text('Total', 130, y + 7);
                doc.text('Percentual', 165, y + 7, { align: 'right' });
                
                doc.setFont('helvetica', 'normal');
                y += 20;
            }
        }
    }
    
    // Function to get filtered transactions
    function getFilteredTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
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
        
        return filteredTransactions;
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
