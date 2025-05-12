// Écouteur de donations via postMessage
window.addEventListener('message', function(event) {
  try {
    // Vérifier si les données contiennent une donation
    if (event.data && event.data.type === 'donation') {
      const donation = event.data;
      const amount = donation.amount;
      
      // Mise à jour de la jauge d'authentification si disponible
      if (window.updateAuthGauge) {
        window.updateAuthGauge(amount);
      }
    }
  } catch (error) {
    // Gestion silencieuse des erreurs pour éviter de remplir la console
    console.error && typeof console.error === 'function' && 
      console.error('Erreur silencieuse dans le traitement du don:', error);
  }
});
