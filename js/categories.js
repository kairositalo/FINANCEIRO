// Categories functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load all categories
    loadCategories();
    
    // Handle category form submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCategory();
        });
    }
    
    // Handle edit category form submission
    const editCategoryForm = document.getElementById('editCategoryForm');
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateCategory();
        });
    }
    
    // Handle delete category button
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
    if (deleteCategoryBtn) {
        deleteCategoryBtn.addEventListener('click', function() {
            deleteCategory();
        });
    }
    
    // Function to load categories
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const categoriesBody = document.getElementById('categoriesBody');
        
        if (!categoriesBody) return;
        
        // Clear existing rows
        categoriesBody.innerHTML = '';
        
        if (categories.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="text-center">Nenhuma categoria encontrada</td>';
            categoriesBody.appendChild(row);
            return;
        }
        
        // Sort categories by type and name
        categories.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'income' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
        
        // Add categories to the table
        categories.forEach(category => {
            const row = document.createElement('tr');
            
            const typeLabel = category.type === 'income' ? 'Receita' : 'Despesa';
            const typeClass = category.type === 'income' ? 'positive' : 'negative';
            
            row.innerHTML = `
                <td>${category.name}</td>
                <td class="${typeClass}">${typeLabel}</td>
                <td>${category.description || '-'}</td>
                <td>
                    <button class="btn btn-text edit-category" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            
            categoriesBody.appendChild(row);
        });
        
        // Add event listeners to edit buttons
        const editButtons = document.querySelectorAll('.edit-category');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-id');
                openEditCategoryModal(categoryId);
            });
        });
    }
    
    // Function to save a new category
    function saveCategory() {
        const name = document.getElementById('categoryName').value;
        const type = document.getElementById('categoryType').value;
        const description = document.getElementById('categoryDescription').value;
        
        // Create category object
        const category = {
            id: generateId(),
            name,
            type,
            description
        };
        
        // Save to localStorage
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        categories.push(category);
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Reset form
        document.getElementById('categoryForm').reset();
        
        // Reload categories
        loadCategories();
        
        // Update category dropdowns
        if (typeof populateCategoryDropdowns === 'function') {
            populateCategoryDropdowns();
        }
        
        // Show success message
        alert('Categoria salva com sucesso!');
    }
    
    // Function to open edit category modal
    function openEditCategoryModal(categoryId) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) return;
        
        // Fill form fields
        document.getElementById('editCategoryId').value = category.id;
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryType').value = category.type;
        document.getElementById('editCategoryDescription').value = category.description || '';
        
        // Show modal
        const modal = document.getElementById('editCategoryModal');
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
    
    // Function to update category
    function updateCategory() {
        const categoryId = document.getElementById('editCategoryId').value;
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const index = categories.findIndex(c => c.id === categoryId);
        
        if (index === -1) return;
        
        // Get form values
        const name = document.getElementById('editCategoryName').value;
        const type = document.getElementById('editCategoryType').value;
        const description = document.getElementById('editCategoryDescription').value;
        
        // Update category
        categories[index] = {
            id: categoryId,
            name,
            type,
            description
        };
        
        // Save to localStorage
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Close modal
        document.getElementById('editCategoryModal').style.display = 'none';
        
        // Reload categories
        loadCategories();
        
        // Update category dropdowns
        if (typeof populateCategoryDropdowns === 'function') {
            populateCategoryDropdowns();
        }
        
        // Show success message
        alert('Categoria atualizada com sucesso!');
    }
    
    // Function to delete category
    function deleteCategory() {
        const categoryId = document.getElementById('editCategoryId').value;
        
        // Check if category is in use
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const isInUse = transactions.some(t => t.categoryId === categoryId);
        
        if (isInUse) {
            alert('Esta categoria não pode ser excluída pois está sendo usada em transações.');
            return;
        }
        
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
        
        let categories = JSON.parse(localStorage.getItem('categories')) || [];
        
        // Filter out the category to delete
        categories = categories.filter(c => c.id !== categoryId);
        
        // Save to localStorage
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Close modal
        document.getElementById('editCategoryModal').style.display = 'none';
        
        // Reload categories
        loadCategories();
        
        // Update category dropdowns
        if (typeof populateCategoryDropdowns === 'function') {
            populateCategoryDropdowns();
        }
        
        // Show success message
        alert('Categoria excluída com sucesso!');
    }
    
    // Helper function to generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
});
