import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Grouped Order",
  description: "Politique de confidentialité de Grouped Order",
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">
        Politique de confidentialité
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Bienvenue sur Grouped Order. Nous respectons votre vie privée et
            nous nous engageons à protéger vos données personnelles. Cette
            politique de confidentialité vous informe sur la manière dont nous
            collectons, utilisons et protégeons vos informations.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            2. Données que nous collectons
          </h2>
          <p>Nous collectons les types de données suivants :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Informations de compte :</strong> Nom, adresse email,
              photo de profil (si vous vous connectez via Facebook)
            </li>
            <li>
              <strong>Données d'authentification :</strong> Informations de
              connexion via email/mot de passe ou Facebook
            </li>
            <li>
              <strong>Données d'utilisation :</strong> Informations sur votre
              utilisation de l'application
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            3. Comment nous utilisons vos données
          </h2>
          <p>Nous utilisons vos données pour :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Créer et gérer votre compte utilisateur</li>
            <li>
              Vous permettre d'utiliser les fonctionnalités de l'application
            </li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
            <li>
              Vous envoyer des notifications importantes concernant votre compte
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            4. Authentification via Facebook
          </h2>
          <p>
            Lorsque vous vous connectez via Facebook, nous collectons uniquement
            les informations publiques de votre profil Facebook (nom, email,
            photo de profil) avec votre consentement. Nous n'avons pas accès à
            vos autres données Facebook.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">5. Partage de données</h2>
          <p>
            Nous ne vendons jamais vos données personnelles. Nous ne partageons
            vos données qu'avec :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Les fournisseurs de services nécessaires au fonctionnement de
              l'application (hébergement, base de données)
            </li>
            <li>Les autorités légales si la loi l'exige</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">6. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et
            organisationnelles appropriées pour protéger vos données contre tout
            accès non autorisé, modification, divulgation ou destruction.
          </p>
        </section>

        <section className="mt-8" id="data-deletion">
          <h2 className="text-2xl font-semibold">
            7. Suppression de vos données
          </h2>
          <p>Vous avez le droit de :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accéder à vos données personnelles</li>
            <li>Corriger vos données personnelles</li>
            <li>Supprimer votre compte et toutes vos données</li>
          </ul>
          <p className="mt-4">
            Pour supprimer votre compte et toutes vos données associées, vous
            pouvez :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Accéder aux paramètres de votre compte et cliquer sur "Supprimer
              le compte"
            </li>
            <li>
              Nous contacter directement à l'adresse email indiquée ci-dessous
            </li>
          </ul>
          <p className="mt-4">
            La suppression de votre compte entraînera la suppression définitive
            de toutes vos données personnelles dans un délai de 30 jours.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">8. Cookies</h2>
          <p>
            Nous utilisons des cookies essentiels pour le fonctionnement de
            l'application, notamment pour maintenir votre session de connexion.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">9. Vos droits</h2>
          <p>
            Conformément au RGPD (si applicable), vous disposez des droits
            suivants :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification de vos données</li>
            <li>Droit à l'effacement de vos données</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            10. Modifications de cette politique
          </h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité de
            temps en temps. Nous vous informerons de tout changement important
            en publiant la nouvelle politique sur cette page.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">11. Nous contacter</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou
            vos données personnelles, veuillez nous contacter à :
          </p>
          <p className="mt-4">
            <strong>Email :</strong>{" "}
            <a
              href="mailto:privacy@grouped-order.com"
              className="text-primary hover:underline"
            >
              privacy@grouped-order.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
