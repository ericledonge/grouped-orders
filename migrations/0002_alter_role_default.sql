-- Migration pour ajouter une valeur par défaut à la colonne role
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
