import type { AuthLocalization } from "@daveyplate/better-auth-ui";

/**
 * Traductions françaises pour Better Auth UI
 * Tous les codes d'erreur et labels de formulaire en français
 */
export const frenchLocalization: Partial<AuthLocalization> = {
  // ============================================
  // CODES D'ERREUR - Authentification de base
  // ============================================
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect",
  INVALID_PASSWORD: "Mot de passe incorrect",
  INVALID_EMAIL: "Email invalide",
  USER_NOT_FOUND: "Aucun compte trouvé avec cet email",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email",
  EMAIL_NOT_VERIFIED: "Veuillez vérifier votre email avant de vous connecter",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères",
  PASSWORD_TOO_LONG: "Le mot de passe est trop long",
  SESSION_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
  REQUEST_FAILED: "Une erreur est survenue. Veuillez réessayer.",

  // Erreurs de création/mise à jour
  FAILED_TO_CREATE_USER: "Impossible de créer le compte",
  FAILED_TO_UPDATE_USER: "Impossible de mettre à jour le compte",
  FAILED_TO_CREATE_SESSION: "Impossible de créer la session",
  FAILED_TO_GET_SESSION: "Impossible de récupérer la session",
  FAILED_TO_GET_USER_INFO:
    "Impossible de récupérer les informations utilisateur",

  // Erreurs de compte
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Compte non trouvé",
  ACCOUNT_NOT_FOUND: "Compte non trouvé",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Ce compte social est déjà lié",
  FAILED_TO_UNLINK_LAST_ACCOUNT:
    "Vous ne pouvez pas dissocier votre dernier compte",
  USER_ALREADY_HAS_PASSWORD:
    "L'utilisateur a déjà un mot de passe. Fournissez-le pour supprimer le compte.",

  // Erreurs de token/provider
  INVALID_TOKEN: "Token invalide",
  PROVIDER_NOT_FOUND: "Fournisseur non trouvé",
  ID_TOKEN_NOT_SUPPORTED: "id_token non supporté",

  // Erreurs d'email
  USER_EMAIL_NOT_FOUND: "Email utilisateur non trouvé",
  EMAIL_CAN_NOT_BE_UPDATED: "L'email ne peut pas être mis à jour",

  // ============================================
  // LABELS DE FORMULAIRE - Connexion
  // ============================================
  SIGN_IN: "Connexion",
  SIGN_IN_ACTION: "Se connecter",
  SIGN_IN_DESCRIPTION: "",
  SIGN_IN_USERNAME_DESCRIPTION:
    "Entrez votre nom d'utilisateur ou email pour vous connecter",
  SIGN_IN_WITH: "Se connecter avec",

  // ============================================
  // LABELS DE FORMULAIRE - Inscription
  // ============================================
  SIGN_UP: "Inscription",
  SIGN_UP_ACTION: "Créer un compte",
  SIGN_UP_DESCRIPTION: "Entrez vos informations pour créer un compte",
  SIGN_UP_EMAIL: "Vérifiez votre email pour le lien de vérification.",

  // ============================================
  // CHAMPS DE FORMULAIRE
  // ============================================
  EMAIL: "Email",
  EMAIL_PLACEHOLDER: "email@exemple.com",
  EMAIL_REQUIRED: "L'email est requis",
  EMAIL_IS_THE_SAME: "L'email est identique",
  EMAIL_DESCRIPTION:
    "Entrez l'adresse email que vous souhaitez utiliser pour vous connecter.",
  EMAIL_INSTRUCTIONS: "Veuillez entrer une adresse email valide.",
  EMAIL_VERIFY_CHANGE:
    "Veuillez vérifier votre email pour confirmer le changement.",
  EMAIL_VERIFICATION:
    "Veuillez vérifier votre email pour le lien de vérification.",

  PASSWORD: "Mot de passe",
  PASSWORD_PLACEHOLDER: "Mot de passe",
  PASSWORD_REQUIRED: "Le mot de passe est requis",
  PASSWORDS_DO_NOT_MATCH: "Les mots de passe ne correspondent pas",

  CONFIRM_PASSWORD: "Confirmer le mot de passe",
  CONFIRM_PASSWORD_PLACEHOLDER: "Confirmer le mot de passe",
  CONFIRM_PASSWORD_REQUIRED: "La confirmation du mot de passe est requise",

  CURRENT_PASSWORD: "Mot de passe actuel",
  CURRENT_PASSWORD_PLACEHOLDER: "Mot de passe actuel",

  NEW_PASSWORD: "Nouveau mot de passe",
  NEW_PASSWORD_PLACEHOLDER: "Nouveau mot de passe",
  NEW_PASSWORD_REQUIRED: "Le nouveau mot de passe est requis",

  NAME: "Nom",
  NAME_PLACEHOLDER: "Nom",
  NAME_DESCRIPTION: "Veuillez entrer votre nom complet ou un nom d'affichage.",
  NAME_INSTRUCTIONS: "Veuillez utiliser 32 caractères maximum.",

  USERNAME: "Nom d'utilisateur",
  USERNAME_PLACEHOLDER: "Nom d'utilisateur",
  SIGN_IN_USERNAME_PLACEHOLDER: "Nom d'utilisateur ou email",
  USERNAME_DESCRIPTION:
    "Entrez le nom d'utilisateur que vous souhaitez utiliser pour vous connecter.",
  USERNAME_INSTRUCTIONS: "Veuillez utiliser 32 caractères maximum.",

  // ============================================
  // MOT DE PASSE OUBLIÉ
  // ============================================
  FORGOT_PASSWORD: "Mot de passe oublié",
  FORGOT_PASSWORD_LINK: "Mot de passe oublié ?",
  FORGOT_PASSWORD_ACTION: "Envoyer le lien de réinitialisation",
  FORGOT_PASSWORD_DESCRIPTION:
    "Entrez votre email pour réinitialiser votre mot de passe",
  FORGOT_PASSWORD_EMAIL:
    "Vérifiez votre email pour le lien de réinitialisation du mot de passe.",

  RESET_PASSWORD: "Réinitialiser le mot de passe",
  RESET_PASSWORD_ACTION: "Enregistrer le nouveau mot de passe",
  RESET_PASSWORD_DESCRIPTION: "Entrez votre nouveau mot de passe ci-dessous",
  RESET_PASSWORD_SUCCESS: "Mot de passe réinitialisé avec succès",

  CHANGE_PASSWORD: "Changer le mot de passe",
  CHANGE_PASSWORD_DESCRIPTION:
    "Entrez votre mot de passe actuel et un nouveau mot de passe.",
  CHANGE_PASSWORD_INSTRUCTIONS: "Veuillez utiliser 8 caractères minimum.",
  CHANGE_PASSWORD_SUCCESS: "Votre mot de passe a été changé.",

  SET_PASSWORD: "Définir un mot de passe",
  SET_PASSWORD_DESCRIPTION:
    "Cliquez sur le bouton ci-dessous pour recevoir un email afin de définir un mot de passe pour votre compte.",

  // ============================================
  // AUTRES OPTIONS
  // ============================================
  REMEMBER_ME: "Se souvenir de moi",
  ALREADY_HAVE_AN_ACCOUNT: "Vous avez déjà un compte ?",
  DONT_HAVE_AN_ACCOUNT: "Vous n'avez pas de compte ?",
  OR_CONTINUE_WITH: "Ou continuer avec",

  // ============================================
  // BOUTONS GÉNÉRAUX
  // ============================================
  CANCEL: "Annuler",
  CONTINUE: "Continuer",
  SAVE: "Enregistrer",
  DELETE: "Supprimer",
  DONE: "Terminé",
  GO_BACK: "Retour",

  // ============================================
  // MESSAGES DE VALIDATION
  // ============================================
  IS_INVALID: "est invalide",
  IS_REQUIRED: "est requis",
  IS_THE_SAME: "est identique",

  UPDATED_SUCCESSFULLY: "mis à jour avec succès",

  // ============================================
  // COMPTE
  // ============================================
  ACCOUNT: "Compte",
  ACCOUNTS: "Comptes",
  ACCOUNTS_DESCRIPTION: "Basculer entre vos comptes actuellement connectés.",
  ACCOUNTS_INSTRUCTIONS: "Connectez-vous à un compte supplémentaire.",
  ADD_ACCOUNT: "Ajouter un compte",

  DELETE_ACCOUNT: "Supprimer le compte",
  DELETE_ACCOUNT_DESCRIPTION:
    "Supprimez définitivement votre compte et tout son contenu. Cette action est irréversible, veuillez donc continuer avec précaution.",
  DELETE_ACCOUNT_INSTRUCTIONS:
    "Veuillez confirmer la suppression de votre compte. Cette action est irréversible, veuillez donc continuer avec précaution.",
  DELETE_ACCOUNT_VERIFY:
    "Veuillez vérifier votre email pour confirmer la suppression de votre compte.",
  DELETE_ACCOUNT_SUCCESS: "Votre compte a été supprimé.",

  // ============================================
  // AVATAR
  // ============================================
  AVATAR: "Avatar",
  AVATAR_DESCRIPTION:
    "Cliquez sur l'avatar pour télécharger une image personnalisée depuis vos fichiers.",
  AVATAR_INSTRUCTIONS: "Un avatar est optionnel mais fortement recommandé.",
  UPLOAD_AVATAR: "Télécharger un avatar",
  DELETE_AVATAR: "Supprimer l'avatar",

  // ============================================
  // SÉCURITÉ
  // ============================================
  SECURITY: "Sécurité",
  SETTINGS: "Paramètres",

  SIGN_OUT: "Se déconnecter",
  SWITCH_ACCOUNT: "Changer de compte",

  SESSIONS: "Sessions",
  CURRENT_SESSION: "Session actuelle",
  SESSIONS_DESCRIPTION: "Gérez vos sessions actives et révoquez l'accès.",

  // ============================================
  // VERIFICATION EMAIL
  // ============================================
  VERIFY_YOUR_EMAIL: "Vérifiez votre email",
  VERIFY_YOUR_EMAIL_DESCRIPTION:
    "Veuillez vérifier votre adresse email. Vérifiez votre boîte de réception pour l'email de vérification. Si vous n'avez pas reçu l'email, cliquez sur le bouton ci-dessous pour le renvoyer.",
  RESEND_VERIFICATION_EMAIL: "Renvoyer l'email de vérification",

  SESSION_NOT_FRESH:
    "Votre session n'est pas récente. Veuillez vous reconnecter.",

  // ============================================
  // FOURNISSEURS SOCIAUX
  // ============================================
  PROVIDERS: "Fournisseurs",
  PROVIDERS_DESCRIPTION: "Connectez votre compte avec un service tiers.",
  LINK: "Lier",
  UNLINK: "Délier",

  // ============================================
  // ORGANISATIONS
  // ============================================
  ORGANIZATION: "Organisation",
  ORGANIZATIONS: "Organisations",
  ORGANIZATIONS_DESCRIPTION: "Gérez vos organisations et vos adhésions.",
  ORGANIZATIONS_INSTRUCTIONS:
    "Créez une organisation pour collaborer avec d'autres utilisateurs.",

  CREATE_ORGANIZATION: "Créer une organisation",
  CREATE_ORGANIZATION_SUCCESS: "Organisation créée avec succès",

  ORGANIZATION_NAME: "Nom",
  ORGANIZATION_NAME_PLACEHOLDER: "Mon Organisation",
  ORGANIZATION_NAME_DESCRIPTION:
    "Ceci est le nom visible de votre organisation.",
  ORGANIZATION_NAME_INSTRUCTIONS: "Veuillez utiliser 32 caractères maximum.",

  ORGANIZATION_SLUG: "URL Slug",
  ORGANIZATION_SLUG_PLACEHOLDER: "mon-organisation",
  ORGANIZATION_SLUG_DESCRIPTION:
    "Ceci est l'espace de noms URL de votre organisation.",
  ORGANIZATION_SLUG_INSTRUCTIONS: "Veuillez utiliser 48 caractères maximum.",

  DELETE_ORGANIZATION: "Supprimer l'organisation",
  DELETE_ORGANIZATION_DESCRIPTION:
    "Supprimez définitivement votre organisation et tout son contenu. Cette action est irréversible — veuillez continuer avec précaution.",
  DELETE_ORGANIZATION_INSTRUCTIONS:
    "Entrez le slug de l'organisation pour continuer :",
  DELETE_ORGANIZATION_SUCCESS: "Organisation supprimée avec succès",

  SLUG_REQUIRED: "Le slug de l'organisation est requis",
  SLUG_DOES_NOT_MATCH: "Le slug ne correspond pas",

  MANAGE_ORGANIZATION: "Gérer l'organisation",
  LEAVE_ORGANIZATION: "Quitter l'organisation",
  LEAVE_ORGANIZATION_CONFIRM:
    "Êtes-vous sûr de vouloir quitter cette organisation ?",
  LEAVE_ORGANIZATION_SUCCESS: "Vous avez quitté l'organisation avec succès.",

  MEMBERS: "Membres",
  MEMBERS_DESCRIPTION: "Ajoutez ou supprimez des membres et gérez leurs rôles.",
  MEMBERS_INSTRUCTIONS: "Invitez de nouveaux membres dans votre organisation.",

  INVITE_MEMBER: "Inviter un membre",
  INVITE_MEMBER_DESCRIPTION:
    "Envoyez une invitation pour ajouter un nouveau membre à votre organisation.",
  SEND_INVITATION: "Envoyer l'invitation",
  SEND_INVITATION_SUCCESS: "Invitation envoyée avec succès",

  REMOVE_MEMBER: "Retirer le membre",
  REMOVE_MEMBER_CONFIRM:
    "Êtes-vous sûr de vouloir retirer ce membre de l'organisation ?",
  REMOVE_MEMBER_SUCCESS: "Membre retiré avec succès",

  ROLE: "Rôle",
  SELECT_ROLE: "Sélectionner un rôle",
  UPDATE_ROLE: "Mettre à jour le rôle",
  UPDATE_ROLE_DESCRIPTION: "Mettre à jour le rôle de ce membre",
  MEMBER_ROLE_UPDATED: "Rôle du membre mis à jour avec succès",

  ADMIN: "Administrateur",
  MEMBER: "Membre",
  OWNER: "Propriétaire",
  GUEST: "Invité",
  USER: "Utilisateur",

  PENDING_INVITATIONS: "Invitations en attente",
  PENDING_INVITATIONS_DESCRIPTION:
    "Gérez les invitations en attente de votre organisation.",
  PENDING_USER_INVITATIONS_DESCRIPTION:
    "Invitations que vous avez reçues d'organisations.",

  ACCEPT_INVITATION: "Accepter l'invitation",
  ACCEPT_INVITATION_DESCRIPTION:
    "Vous avez été invité à rejoindre une organisation.",
  INVITATION_ACCEPTED: "Invitation acceptée avec succès",
  INVITATION_REJECTED: "Invitation rejetée avec succès",
  INVITATION_EXPIRED: "Cette invitation a expiré",
  INVITATION_CANCELLED: "Invitation annulée avec succès",
  CANCEL_INVITATION: "Annuler l'invitation",

  ACCEPT: "Accepter",
  REJECT: "Rejeter",

  PERSONAL_ACCOUNT: "Compte personnel",

  // ============================================
  // DIVERS
  // ============================================
  APP: "Application",
  UNKNOWN: "Inconnu",
  UPLOAD: "Télécharger",
  REVOKE: "Révoquer",

  LOGO: "Logo",
  LOGO_DESCRIPTION:
    "Cliquez sur le logo pour télécharger un logo personnalisé depuis vos fichiers.",
  LOGO_INSTRUCTIONS: "Un logo est optionnel mais fortement recommandé.",
  UPLOAD_LOGO: "Télécharger un logo",
  DELETE_LOGO: "Supprimer le logo",

  PRIVACY_POLICY: "Politique de confidentialité",
  TERMS_OF_SERVICE: "Conditions d'utilisation",
  PROTECTED_BY_RECAPTCHA: "Ce site est protégé par reCAPTCHA.",
  BY_CONTINUING_YOU_AGREE: "En continuant, vous acceptez les",

  COPIED_TO_CLIPBOARD: "Copié dans le presse-papiers",
  COPY_TO_CLIPBOARD: "Copier dans le presse-papiers",
};
