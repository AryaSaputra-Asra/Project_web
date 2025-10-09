document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded!');
    
    initializeWebsite();
    setupEventListeners();
    setupStatusManagement();
    loadSavedStatus();
});

// Custom Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'info': '#007bff'
    };
    return colors[type] || '#007bff';
}

// Status Management System
let currentModule = null;

function setupStatusManagement() {
    // Module badge clicks - ONLY for project page
    if (document.querySelector('.module-badge')) {
        const moduleBadges = document.querySelectorAll('.module-badge');
        moduleBadges.forEach(badge => {
            badge.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openStatusModal(this);
            });
        });
    }
    
    // Status option clicks - ONLY if modal exists
    if (document.getElementById('statusModal')) {
        const statusOptions = document.querySelectorAll('.status-option');
        statusOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                statusOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        // Modal events
        const modal = document.getElementById('statusModal');
        const closeModal = document.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancelStatus');
        const confirmBtn = document.getElementById('confirmStatus');
        
        closeModal.addEventListener('click', closeStatusModal);
        cancelBtn.addEventListener('click', closeStatusModal);
        confirmBtn.addEventListener('click', confirmStatusChange);
        
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeStatusModal();
            }
        });
    }
}

function openStatusModal(badgeElement) {
    currentModule = badgeElement.getAttribute('data-module');
    
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(opt => opt.classList.remove('selected'));
    
    const currentStatus = getCurrentStatus(badgeElement);
    if (currentStatus) {
        const currentOption = document.querySelector(`.status-option[data-status="${currentStatus}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }
    
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    currentModule = null;
}

function confirmStatusChange() {
    const selectedOption = document.querySelector('.status-option.selected');
    if (!selectedOption || !currentModule) {
        showNotification('Pilih status terlebih dahulu!', 'error');
        return;
    }
    
    const newStatus = selectedOption.getAttribute('data-status');
    const badge = document.querySelector(`.module-badge[data-module="${currentModule}"]`);
    
    if (badge) {
        // Update badge
        badge.className = 'module-badge ' + newStatus;
        badge.textContent = getStatusText(newStatus);
        
        // Save to localStorage
        saveStatus(currentModule, newStatus);
        
        // Show custom notification
        const statusMessages = {
            'completed': 'Modul telah diselesaikan! 🎉',
            'in-progress': 'Sedang mengerjakan modul! 🔄', 
            'coming-soon': 'Modul akan datang! ⏳'
        };
        showNotification(statusMessages[newStatus], 'success');
    }
    
    closeStatusModal();
}

function getCurrentStatus(badgeElement) {
    if (badgeElement.classList.contains('completed')) return 'completed';
    if (badgeElement.classList.contains('in-progress')) return 'in-progress';
    if (badgeElement.classList.contains('coming-soon')) return 'coming-soon';
    return null;
}

function getStatusText(status) {
    const texts = {
        'completed': 'Completed',
        'in-progress': 'In Progress',
        'coming-soon': 'Coming Soon'
    };
    return texts[status] || status;
}

function saveStatus(moduleId, status) {
    const statusData = JSON.parse(localStorage.getItem('moduleStatus') || '{}');
    statusData[moduleId] = status;
    localStorage.setItem('moduleStatus', JSON.stringify(statusData));
}

function loadSavedStatus() {
    const statusData = JSON.parse(localStorage.getItem('moduleStatus') || '{}');
    
    Object.keys(statusData).forEach(moduleId => {
        const badge = document.querySelector(`.module-badge[data-module="${moduleId}"]`);
        if (badge) {
            const status = statusData[moduleId];
            badge.className = 'module-badge ' + status;
            badge.textContent = getStatusText(status);
        }
    });
}

// General Website Functions
function initializeWebsite() {
    setTimeout(() => {
        animateElements('.project-card', 'fadeIn');
        animateElements('.module-card', 'fadeIn');
    }, 100);
}

function setupEventListeners() {
    // Smooth scroll - ONLY for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }
    });
    
    // Form handling - ONLY for contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    }
    
    setActiveNav();
}

function handleFormSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = 'Mengirim...';
    submitBtn.disabled = true;
    
    // Simple validation
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#28a745';
        }
    });
    
    if (isValid) {
        setTimeout(() => {
            showNotification('Pesan berhasil dikirim! Saya akan membalas secepatnya 📩', 'success');
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Reset border colors
            inputs.forEach(input => {
                input.style.borderColor = '#e9ecef';
            });
        }, 2000);
    } else {
        showNotification('Harap isi semua field yang wajib diisi!', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.color = '#007bff';
            link.style.background = 'rgba(0, 123, 255, 0.1)';
        }
    });
}

function animateElements(selector, animation) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
}