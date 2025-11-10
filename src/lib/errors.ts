/**
 * Extrait un message d'erreur lisible depuis une erreur quelconque
 * @param error - L'erreur à formater
 * @param fallback - Message par défaut si l'erreur n'est pas un objet Error
 * @returns Un message d'erreur string
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Une erreur est survenue",
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}
