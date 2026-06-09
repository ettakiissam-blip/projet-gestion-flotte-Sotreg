// ============================================
// SYSTÈME DE PERSISTANCE DE L'ÉTAT DE NAVIGATION
// ============================================

/**
 * Sauvegarde l'état courant (onglet actif et sous-onglet)
 */
function saveNavigationState() {
  try {
    // Trouver l'onglet principal actif
    const activeTab = document.querySelector('.tab-content.active');
    const activeTabId = activeTab ? activeTab.id : 'section-flotte';
    
    // Trouver le sous-onglet actif (s'il existe)
    const activeSubTab = activeTab?.querySelector('.sub-tab-content.active-sub-content');
    const activeSubTabId = activeSubTab ? activeSubTab.id : null;
    
    const navigationState = {
      activeTab: activeTabId,
      activeSubTab: activeSubTabId,
      timestamp: new Date().toISOString()
    };
    
    // Sauvegarder dans localStorage ET URL hash
    safeLocalStorageSet('navigationState', navigationState);
    window.location.hash = `#tab=${activeTabId}${activeSubTabId ? `&subtab=${activeSubTabId}` : ''}`;
    
    console.log('[Navigation] État sauvegardé:', navigationState);
  } catch (e) {
    logError('Erreur lors de la sauvegarde de l\'état de navigation', e);
  }
}

/**
 * Restaure l'état de navigation après un rafraîchissement
 */
function restoreNavigationState() {
  try {
    let navigationState = null;
    
    // D'abord vérifier l'URL hash
    const hash = window.location.hash;
    if (hash && hash.includes('tab=')) {
      const params = new URLSearchParams(hash.substring(1));
      navigationState = {
        activeTab: params.get('tab') || 'section-flotte',
        activeSubTab: params.get('subtab') || null
      };
      console.log('[Navigation] État restauré depuis URL:', navigationState);
    }
    
    // Sinon vérifier localStorage
    if (!navigationState) {
      navigationState = safeLocalStorageGet('navigationState', null);
      if (navigationState) {
        console.log('[Navigation] État restauré depuis localStorage:', navigationState);
      }
    }
    
    if (!navigationState || !navigationState.activeTab) {
      console.log('[Navigation] Pas d\'état sauvegardé, affichage par défaut');
      return;
    }
    
    // Restaurer l'onglet principal
    const tabElement = document.getElementById(navigationState.activeTab);
    if (tabElement) {
      // Simuler un clic sur le lien du menu
      const menuLink = document.querySelector(
        `[data-target="${navigationState.activeTab}"]`
      );
      if (menuLink) {
        console.log('[Navigation] Restauration de l\'onglet:', navigationState.activeTab);
        menuLink.click();
        
        // Restaurer le sous-onglet si présent
        if (navigationState.activeSubTab) {
          setTimeout(() => {
            const subTabBtn = document.querySelector(
              `[data-sub-target="${navigationState.activeSubTab}"]`
            );
            if (subTabBtn) {
              console.log('[Navigation] Restauration du sous-onglet:', navigationState.activeSubTab);
              subTabBtn.click();
            }
          }, 150);
        }
      }
    }
  } catch (e) {
    logError('Erreur lors de la restauration de l\'état de navigation', e);
  }
}

/**
 * Initialise le système de persistance - DOIT être appelé au plus tôt possible
 */
function initNavigationPersistenceEarly() {
  try {
    console.log('[Navigation] Initialisation précoce...');
    
    // Restaurer IMMÉDIATEMENT avant que les autres scripts n'exécutent
    restoreNavigationState();
    
    // Sauvegarder à chaque changement de tab principal
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('menu-link')) {
        setTimeout(saveNavigationState, 100);
      }
    });
    
    // Sauvegarder avant de quitter
    window.addEventListener('beforeunload', saveNavigationState);
    
    // Sauvegarder à intervalles réguliers
    setInterval(saveNavigationState, 15000); // Chaque 15 secondes
    
    console.log('[Navigation] Système initialisé');
  } catch (e) {
    logError('Erreur lors de l\'initialisation du système de persistance', e);
  }
}

// IMPORTANT: Lancer au plus tôt possible
if (document.readyState === 'loading') {
  // Le script est chargé avant que le DOM soit prêt
  document.addEventListener('DOMContentLoaded', initNavigationPersistenceEarly);
} else {
  // Le DOM est déjà prêt
  initNavigationPersistenceEarly();
}

// Override de basculerSousPlanning pour capturer les changements
setTimeout(() => {
  const originalBasculerSousPlanning = window.basculerSousPlanning;
  if (typeof originalBasculerSousPlanning === 'function') {
    window.basculerSousPlanning = function(subTabId, btn) {
      originalBasculerSousPlanning(subTabId, btn);
      setTimeout(saveNavigationState, 100);
    };
    console.log('[Navigation] Hook basculerSousPlanning installé');
  }
}, 500);
