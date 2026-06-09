// ============================================
// EXTENSIONS SÉCURISÉES DU LOCALSTORAGE
// ============================================

function safeLocalStorageGet(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return JSON.parse(value);
  } catch (e) {
    logError(`Erreur lors de la lecture du localStorage pour "${key}"`, e);
    return defaultValue;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showNotification('Stockage local plein - impossible de sauvegarder', 'error');
      logError('Quota localStorage dépassé', e);
    } else {
      showNotification('Erreur lors de la sauvegarde locale', 'error');
      logError('Erreur localStorage.setItem', e);
    }
    return false;
  }
}

// ============================================
// WRAPPERS SÉCURISÉS DES FONCTIONS CRITIQUES
// ============================================

function safeEnregistrerDonnies() {
  try {
    const success = 
      safeLocalStorageSet('conducteurs', conducteursSOTREG) &&
      safeLocalStorageSet('vehicules', vehiculesSOTREG) &&
      safeLocalStorageSet('trajets', trajetsSOTREG) &&
      safeLocalStorageSet('planning', planningSOTREG);
    
    if (success) {
      precalculerOptionsListes();
      showNotification('✅ Données sauvegardées avec succès', 'success', 3000);
    }
  } catch (e) {
    logError('Erreur dans safeEnregistrerDonnies', e);
    showNotification('❌ Erreur lors de la sauvegarde', 'error');
  }
}

function safeChargerConducteurs() {
  try {
    const tbody = document.getElementById('drivers-table-body');
    if (!tbody) {
      logError('Element "drivers-table-body" non trouvé');
      return;
    }
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(conducteursSOTREG)) {
      throw new Error('conducteursSOTREG n\'est pas un tableau');
    }
    
    conducteursSOTREG.forEach(c => {
      try {
        const badge = c.statut === 'En mission' ? 'status-on' : 'status-off';
        tbody.innerHTML += `<tr data-site="${c.site || ''}" data-provider="${c.prestataire || ''}">
          <td><b>${c.nom || 'N/A'}</b> <small style="color:#64748b; font-weight:700; display:block;">Mle: ${c.matricule || 'N/A'}</small></td>
          <td><span class="provider-badge">${c.prestataire || 'N/A'}</span></td>
          <td><span class="site-badge">${c.site || 'N/A'}</span></td>
          <td>${obtenirBadgeStatut(c.permis)}</td>
          <td>${obtenirBadgeStatut(c.visite)}</td>
          <td>${obtenirBadgeStatut(c.prof)}</td>
          <td><span class="status-badge ${badge}">${c.statut || 'N/A'}</span></td>
          <td class="text-center"><div class="action-buttons">
            <button class="btn-action" onclick="editerConducteur(${c.id})">📝</button>
            <button class="btn-action" onclick="supprimerConducteur(${c.id})">🗑️</button>
          </div></td>
        </tr>`;
      } catch (rowError) {
        logError('Erreur lors du rendu d\'une ligne conducteur', rowError);
      }
    });
    
    mettreAJourKPIs();
  } catch (e) {
    logError('Erreur dans safeChargerConducteurs', e);
    showNotification('❌ Erreur lors du chargement des conducteurs', 'error');
  }
}

function safeEditerConducteur(id) {
  try {
    const c = conducteursSOTREG.find(x => x.id === id);
    if (!c) {
      showNotification('⚠️ Conducteur non trouvé', 'warning');
      return;
    }
    
    const newNom = prompt('Nom complet:', c.nom);
    if (newNom === null) return;
    if (!newNom.trim()) {
      showNotification('⚠️ Le nom ne peut pas être vide', 'warning');
      return;
    }
    c.nom = newNom.trim();
    
    const newMatricule = prompt('Matricule (Mle):', c.matricule);
    if (newMatricule === null) return;
    if (!newMatricule.trim()) {
      showNotification('⚠️ Le matricule ne peut pas être vide', 'warning');
      return;
    }
    c.matricule = newMatricule.trim();
    
    const newPrestataire = prompt('Prestataire:', c.prestataire);
    if (newPrestataire !== null && newPrestataire.trim()) {
      c.prestataire = newPrestataire.toUpperCase().trim();
    }
    
    safeEnregistrerDonnies();
    safeChargerConducteurs();
    showNotification('✅ Conducteur modifié avec succès', 'success');
  } catch (e) {
    logError('Erreur lors de l\'édition d\'un conducteur', e);
    showNotification('❌ Erreur lors de la modification', 'error');
  }
}

function safeSupprimerConducteur(id) {
  try {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce conducteur ?')) return;
    
    const initialLength = conducteursSOTREG.length;
    conducteursSOTREG = conducteursSOTREG.filter(c => c.id !== id);
    
    if (conducteursSOTREG.length === initialLength) {
      showNotification('⚠️ Conducteur non trouvé', 'warning');
      return;
    }
    
    safeEnregistrerDonnies();
    safeChargerConducteurs();
    showNotification('✅ Conducteur supprimé avec succès', 'success');
  } catch (e) {
    logError('Erreur lors de la suppression d\'un conducteur', e);
    showNotification('❌ Erreur lors de la suppression', 'error');
  }
}

// ============================================
// WRAPPING CONSOLE ERRORS
// ============================================

(function() {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    originalError.apply(console, args);
    // En production, vous pourriez envoyer cela à un service de log
  };
  
  console.warn = function(...args) {
    originalWarn.apply(console, args);
  };
})();

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

window.addEventListener('error', (event) => {
  logError(`Erreur globale: ${event.message}`, new Error(event.filename + ':' + event.lineno));
  showNotification(`❌ Erreur: ${event.message}`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  logError('Promise rejetée non gérée', event.reason);
  showNotification('❌ Erreur asynchrone non gérée', 'error');
});
