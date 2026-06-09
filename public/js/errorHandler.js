// ============================================
// SYSTÈME DE GESTION DES ERREURS FRONTEND
// ============================================

// Conteneur pour les notifications
let notificationContainer = null;

function initNotifications() {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(notificationContainer);
  }
}

// Afficher une notification (toast)
function showNotification(message, type = 'info', duration = 5000) {
  initNotifications();
  
  const toast = document.createElement('div');
  toast.className = `notification notification-${type}`;
  
  const colors = {
    success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
    error: { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },
    info: { bg: '#dbeafe', border: '#0284c7', text: '#0c4a6e' }
  };
  
  const color = colors[type] || colors.info;
  
  toast.style.cssText = `
    background-color: ${color.bg};
    border: 2px solid ${color.border};
    border-radius: 6px;
    padding: 14px 16px;
    color: ${color.text};
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    margin-left: 12px;
  `;
  
  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  
  toast.appendChild(textSpan);
  toast.appendChild(closeBtn);
  
  notificationContainer.appendChild(toast);
  
  const removeToast = () => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  };
  
  closeBtn.onclick = removeToast;
  
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

// Ajouter les animations CSS
function injectNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// ============================================
// WRAPPER FETCH AVEC GESTION D'ERREURS
// ============================================

async function fetchAPI(url, options = {}) {
  try {
    // Configuration par défaut
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000, // 15 secondes
      ...options
    };
    
    // Ajouter un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Parser la réponse
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
    
    // Vérifier le statut
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Erreur HTTP ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = data;
      throw error;
    }
    
    return {
      success: true,
      data: data,
      status: response.status
    };
    
  } catch (error) {
    // Gérer les différents types d'erreurs
    let errorMessage = 'Une erreur est survenue';
    let errorType = 'error';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Requête timeout (vérifiez votre connexion)';
      errorType = 'warning';
    } else if (error instanceof TypeError) {
      errorMessage = 'Erreur de connexion au serveur';
      errorType = 'error';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée';
      errorType = 'warning';
    } else if (error.status === 400) {
      errorMessage = `Données invalides: ${error.message}`;
      errorType = 'warning';
    } else if (error.status === 413) {
      errorMessage = 'Fichier trop volumineux';
      errorType = 'warning';
    } else if (error.status >= 500) {
      errorMessage = `Erreur serveur: ${error.message}`;
      errorType = 'error';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    console.error('[API Error]', {
      url,
      error: error.message,
      status: error.status,
      response: error.response
    });
    
    return {
      success: false,
      error: errorMessage,
      status: error.status || 500,
      originalError: error
    };
  }
}

// ============================================
// HELPERS POUR VALIDATION
// ============================================

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new Error(`${fieldName} est obligatoire`);
  }
  return true;
}

function validateDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide');
  }
  return true;
}

// Initialiser le système au chargement
document.addEventListener('DOMContentLoaded', injectNotificationStyles);
