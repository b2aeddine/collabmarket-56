export function getErrorMessage(error: unknown): string {
  // Cas 1 : Erreur nulle/undefined
  if (!error) {
    return "Une erreur s'est produite. Veuillez réessayer";
  }

  // Cas 2 : Erreur Supabase ou Objet avec code/message
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Email déjà utilisé (Code Postgres 23505)
    if (err.code === '23505' || err.message?.includes('duplicate key')) {
      if (err.message?.includes('email')) {
        return "Cette adresse email est déjà utilisée";
      }
      return "Cette valeur existe déjà";
    }

    // Mot de passe trop court
    if (err.message?.includes('Password should be at least')) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Mauvais identifiants
    if (err.message?.includes('Invalid login credentials')) {
      return "Email ou mot de passe incorrect";
    }

    // Problème réseau
    if (err.message?.includes('Failed to fetch') || err.message?.includes('Network request failed')) {
      return "Erreur de connexion. Vérifiez votre connexion internet";
    }

    // Permission refusée (RLS)
    if (err.code === '42501' || err.message?.includes('permission denied')) {
      return "Vous n'avez pas les droits pour effectuer cette action";
    }

    // Message custom (si pas trop technique)
    if (err.message && typeof err.message === 'string' && !(error instanceof Error)) {
      // On filtre les erreurs SQL brutes pour ne pas effrayer l'utilisateur
      if (err.message.includes('SELECT') || err.message.includes('INSERT') || err.message.includes('UPDATE')) {
        return "Une erreur technique s'est produite. Veuillez réessayer";
      }
      return err.message;
    }
  }

  // Cas 3 : Error standard JS
  if (error instanceof Error) {
    return "Une erreur s'est produite. Veuillez réessayer";
  }

  // Fallback
  return "Une erreur s'est produite. Veuillez réessayer";
}
