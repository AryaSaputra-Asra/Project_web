document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded!');
    
    initializeWebsite();
    setupEventListeners();
    setupStatusManagement();
    loadSavedStatus();
    
    // Initialize page-specific functions
    if (document.querySelector('.profile-card')) {
        addProfileAnimations();
        setupProfilePage();
    }
    
    if (document.querySelector('.hero')) {
        addHomepageAnimations();
        setupHomepage();
    }
    
    if (document.getElementById('contactForm')) {
        setupContactForm();
    }
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
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    return icons[type] || 'ℹ️';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'info': '#007bff',
        'warning': '#ffc107'
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
        
        if (closeModal) closeModal.addEventListener('click', closeStatusModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeStatusModal);
        if (confirmBtn) confirmBtn.addEventListener('click', confirmStatusChange);
        
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

// Contact Form System
function setupContactForm() {
    const form = document.getElementById("contactForm");
    const iframe = document.getElementById("hidden_iframe");

    if (!form) return;

    // simple real-time remove error class
    form.querySelectorAll("input, textarea").forEach(el => {
        el.addEventListener("input", () => el.classList.remove("input-error"));
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        // basic validation
        let valid = true;
        form.querySelectorAll("input, textarea").forEach(el => {
            if (!el.value.trim()) {
                el.classList.add("input-error");
                valid = false;
            }
        });
        if (!valid) {
            alert("Form belum lengkap!");
            return;
        }

        const btn = form.querySelector("button[type='submit']");
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = "Mengirim...";

        const onLoad = function() {
            const status = document.getElementById("contactStatus");
            if (status) status.style.display = "block";

            form.reset();
            btn.disabled = false;
            btn.innerHTML = original;

            iframe.removeEventListener("load", onLoad);
        };

        iframe.addEventListener("load", onLoad);

        form.submit();
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Field ini wajib diisi';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Format email tidak valid';
        }
    }
    
    // Name validation (minimum 2 characters)
    if (field.id === 'name' && value && value.length < 2) {
        isValid = false;
        errorMessage = 'Nama minimal 2 karakter';
    }
    
    // Subject validation (minimum 5 characters)
    if (field.id === 'subject' && value && value.length < 5) {
        isValid = false;
        errorMessage = 'Subjek minimal 5 karakter';
    }
    
    // Message validation (minimum 10 characters)
    if (field.id === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = 'Pesan minimal 10 karakter';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        // Show success style for valid fields
        field.style.borderColor = '#28a745';
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#dc3545';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.style.borderColor = '#e9ecef';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function validateContactForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function handleContactFormSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Create loading spinner
    submitBtn.innerHTML = `
        <span class="loading-spinner" style="
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
        "></span>
        Mengirim...
    `;
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success notification
        showNotification('Pesan berhasil dikirim! Saya akan membalas secepatnya 📩', 'success');
        
        // Show success message in form
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #c3e6cb;
        `;
        successMessage.innerHTML = `
            <strong>✅ Pesan Terkirim!</strong>
            <p style="margin: 0.5rem 0 0 0;">Terima kasih telah menghubungi saya. Saya akan membalas pesan Anda dalam 1x24 jam.</p>
        `;
        
        form.parentNode.insertBefore(successMessage, form);
        
        // Reset form
        form.reset();
        
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Reset field borders
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#e9ecef';
        });
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.remove();
            }
        }, 5000);
        
    }, 2000);
}

// Profile Page Functions
function setupProfilePage() {
    // Animate progress bars
    animateProgressBars();
    
    // Setup tech tag interactions
    setupTechTags();
    
    // Setup target interactions
    setupTargetItems();
    
    // Initialize stats counter
    animateStatsCounter();
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1.5s ease-in-out';
            bar.style.width = targetWidth;
        }, 500);
    });
}

function setupTechTags() {
    const techTags = document.querySelectorAll('.tech-tag');
    techTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const techName = this.textContent;
            showNotification(`Teknologi: ${techName} 🚀`, 'info');
            
            // Add pulse effect
            this.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });
}

function setupTargetItems() {
    const targetItems = document.querySelectorAll('.target-item:not(.completed)');
    targetItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('completed')) {
                const targetText = this.querySelector('span:last-child').textContent;
                const confirmComplete = confirm(`Tandai "${targetText}" sebagai selesai?`);
                
                if (confirmComplete) {
                    this.classList.add('completed');
                    this.querySelector('.target-icon').textContent = '✅';
                    this.querySelector('span:last-child').style.color = 'white';
                    
                    showNotification(`Target "${targetText}" berhasil diselesaikan! 🎉`, 'success');
                    
                    // Update completed targets count
                    updateStatsCounter();
                }
            }
        });
    });
}

function animateStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const targetNumber = parseInt(stat.textContent);
        const duration = 2000;
        const steps = 60;
        const step = targetNumber / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= targetNumber) {
                current = targetNumber;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, duration / steps);
    });
}

function updateStatsCounter() {
    const completedTargets = document.querySelectorAll('.target-item.completed').length;
    const totalTargets = document.querySelectorAll('.target-item').length;
    const progressPercentage = Math.round((completedTargets / totalTargets) * 100);
    
    // Update stats
    const completedStat = document.querySelector('.stat-number');
    if (completedStat) {
        completedStat.textContent = completedTargets;
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    // Update percentage text
    const progressPercentageElement = document.querySelector('.progress-percentage');
    if (progressPercentageElement) {
        progressPercentageElement.textContent = `${progressPercentage}%`;
    }
}

// Add pulse animation to CSS
function addProfileAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .profile-card {
            animation: fadeInUp 0.8s ease-out;
        }
        
        .detail-section {
            animation: fadeInUp 0.6s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// Homepage Specific Functions
function setupHomepage() {
    // Initialize typing animation
    setupTypingAnimation();
    
    // Initialize stats counter
    setupStatsCounter();
    
    // Initialize scroll animations
    setupScrollAnimations();
    
    // Initialize particle effect
    setupParticleEffect();
    
    // Initialize interactive elements
    setupInteractiveElements();
}

function setupTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        const text = typingElement.textContent;
        typingElement.textContent = '';
        typingElement.style.borderRight = '3px solid #667eea';
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                // Keep cursor blinking
                setInterval(() => {
                    typingElement.style.borderRight = typingElement.style.borderRight === '3px solid #667eea' ? '3px solid transparent' : '3px solid #667eea';
                }, 500);
            }
        }, 100);
    }
}

function setupHomepageStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    statNumbers.forEach(stat => {
        const targetNumber = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const steps = 60;
        const step = targetNumber / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= targetNumber) {
                current = targetNumber;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, duration / steps);
    });
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all animate-on-scroll elements
    document.querySelectorAll('.stat-card, .feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

function setupParticleEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    hero.appendChild(particlesContainer);

    // Create particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #667eea;
            border-radius: 50%;
            opacity: 0.3;
        `;
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        
        // Animation
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        
        particlesContainer.appendChild(particle);
    }
}

function setupInteractiveElements() {
    // Add click effects to all buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add homepage animations to CSS
function addHomepageAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .hero h1 {
            animation: fadeInUp 0.8s ease-out;
        }
        
        .hero p {
            animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .hero-actions {
            animation: fadeInUp 0.8s ease-out 0.4s both;
        }
    `;
    document.head.appendChild(style);
}

// General Website Functions
function initializeWebsite() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Initialize animations
    setTimeout(() => {
        animateElements('.latihan-card', 'fadeIn');
        animateElements('.gallery-item', 'fadeIn');
        animateElements('.journey-card', 'fadeIn');
        animateElements('.tech-category', 'fadeIn');
    }, 100);
}

function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
        }
    });
    
    // Set active navigation
    setActiveNav();
    
    // Add hover effects to interactive elements
    setupHoverEffects();
}

function setupHoverEffects() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.latihan-card, .journey-card, .tech-category, .gallery-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn, .action-btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
           (currentPage === '' && linkHref === 'index.html') ||
           (currentPage === '/' && linkHref === 'index.html')) {
            link.style.color = '#007bff';
            link.style.background = 'rgba(0, 123, 255, 0.1)';
            link.style.fontWeight = '600';
        } else {
            link.style.color = '';
            link.style.background = '';
            link.style.fontWeight = '';
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

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access (if needed)
window.websiteApp = {
    showNotification,
    validateContactForm,
    handleContactFormSubmission,
    animateElements
};