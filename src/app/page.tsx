import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";

export default function Home() {
  return (
    <>
      <RedirectToSignIn />

      <SignedIn>
        {/* Votre contenu pour utilisateurs authentifiés */}
        <div>Bienvenue sur l'application!</div>
      </SignedIn>
    </>
  );
}
