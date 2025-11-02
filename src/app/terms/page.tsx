import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation - Grouped Order",
  description: "Conditions d'utilisation de Grouped Order",
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">
        Conditions d'utilisation
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            1. Acceptation des conditions
          </h2>
          <p>
            En accédant et en utilisant Grouped Order, vous acceptez d'être lié
            par ces conditions d'utilisation. Si vous n'acceptez pas ces
            conditions, veuillez ne pas utiliser notre service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">2. Description du service</h2>
          <p>
            Grouped Order est une plateforme permettant de gérer des commandes
            groupées. Nous nous réservons le droit de modifier ou d'interrompre
            le service à tout moment.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">3. Compte utilisateur</h2>
          <p>
            Pour utiliser certaines fonctionnalités, vous devez créer un compte.
            Vous êtes responsable de :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintenir la confidentialité de votre mot de passe</li>
            <li>Toutes les activités effectuées sous votre compte</li>
            <li>
              Nous informer immédiatement de toute utilisation non autorisée
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">4. Utilisation acceptable</h2>
          <p>Vous acceptez de ne pas :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utiliser le service à des fins illégales</li>
            <li>Violer les droits d'autrui</li>
            <li>Transmettre des virus ou du code malveillant</li>
            <li>Tenter d'accéder aux systèmes de manière non autorisée</li>
            <li>Harceler ou nuire à d'autres utilisateurs</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            5. Propriété intellectuelle
          </h2>
          <p>
            Le contenu, les fonctionnalités et les marques de Grouped Order sont
            protégés par des droits de propriété intellectuelle. Vous ne pouvez
            pas copier, modifier ou distribuer notre contenu sans autorisation.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            6. Limitation de responsabilité
          </h2>
          <p>
            Grouped Order est fourni "tel quel". Nous ne garantissons pas que le
            service sera ininterrompu ou sans erreur. Dans toute la mesure
            permise par la loi, nous déclinons toute responsabilité pour les
            dommages directs ou indirects.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">7. Résiliation</h2>
          <p>
            Nous nous réservons le droit de suspendre ou de résilier votre accès
            au service à tout moment, sans préavis, en cas de violation de ces
            conditions.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            8. Modifications des conditions
          </h2>
          <p>
            Nous pouvons modifier ces conditions à tout moment. Les
            modifications entreront en vigueur dès leur publication sur cette
            page. Votre utilisation continue du service constitue une
            acceptation des nouvelles conditions.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">9. Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige sera
            soumis à la juridiction exclusive des tribunaux français.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">10. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation,
            veuillez nous contacter à :
          </p>
          <p className="mt-4">
            <strong>Email :</strong>{" "}
            <a
              href="mailto:support@grouped-order.com"
              className="text-primary hover:underline"
            >
              support@grouped-order.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
