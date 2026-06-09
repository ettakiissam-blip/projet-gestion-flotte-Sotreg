// ============================================
// INITIALISATION RAPIDE - Charger AVANT les autres scripts
// ============================================

(function() {
  'use strict';
  
  console.log('[Navigation] Initialisation rapide démarrée');
  
  // Fonction pour restaurer rapidement si les données sont disponibles
  function quickRestore() {
    try {
      // Vérifier le hash d'abord (plus rapide)
      const hash = window.location.hash;
      if (hash && hash.includes('tab=')) {
        const params = new URLSearchParams(hash.substring(1));
        const targetTab = params.get('tab');
        const targetSubTab = params.get('subtab');
        
        if (targetTab) {
          console.log('[Navigation] Tentative de restauration rapide:', { tab: targetTab, subtab: targetSubTab });
          
          // Attendre que le DOM soit prêt
          function tryRestore() {
            try {
              // Attendre que les éléments existent
              const tabElement = document.getElementById(targetTab);
              const menuLink = document.querySelector(`[data-target="${targetTab}"]`);
              
              if (tabElement && menuLink && typeof menuLink.click === 'function') {
                console.log('[Navigation] Restauration rapide en cours...');
                menuLink.click();
                
                // Restaurer le sous-onglet si présent
                if (targetSubTab) {
                  setTimeout(() => {
                    const subTabBtn = document.querySelector(`[data-sub-target="${targetSubTab}"]`);
                    if (subTabBtn && typeof subTabBtn.click === 'function') {
                      console.log('[Navigation] Restauration du sous-onglet:', targetSubTab);
                      subTabBtn.click();
                    }
                  }, 200);
                }
              } else {
                // Réessayer dans 100ms
                setTimeout(tryRestore, 100);
              }
            } catch(e) {
              console.error('[Navigation] Erreur lors de la restauration rapide:', e);
            }
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryRestore, { once: true });
          } else {
            tryRestore();
          }
        }
      }
    } catch(e) {
      console.error('[Navigation] Erreur dans quickRestore:', e);
    }
  }
  
  // Lancer la restauration rapide
  quickRestore();
})();