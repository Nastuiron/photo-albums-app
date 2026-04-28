# 📸 Photo Albums App

Plateforme web de gestion et de partage d’albums photo.

## 🚀 Objectif du projet

Ce projet a été créé initialement pour répondre à un besoin concret :

👉 Une amie joue sur un serveur GTA RP avec un personnage photographe  
👉 Elle avait besoin d’un moyen simple et professionnel pour :

- organiser ses photos
- créer des albums rapidement
- partager ses photos avec ses clients via un lien
- offrir une expérience propre et crédible (RP)

L’objectif est donc de proposer une **alternative simple, rapide et élégante** à des outils comme Google Drive ou WeTransfer, mais avec une expérience adaptée à un usage "photographe".

---

## ✨ Fonctionnalités

- 📁 Création d’albums photo
- 📤 Upload d’images (JPG, PNG, WEBP)
- 🖼️ Génération automatique de miniatures
- 🔗 Partage public via lien sécurisé
- 🔄 Régénération de lien de partage
- 🔒 Gestion privé / public des albums
- 🗑️ Suppression d’albums et photos
- 📦 Téléchargement complet d’un album (ZIP)
- 🖼️ Choix de la photo de couverture
- ☁️ Stockage des fichiers via Cloudflare R2

---

## 🛠️ Stack technique

- **Frontend / Backend** : Next.js (App Router)
- **Base de données** : PostgreSQL + Prisma
- **Stockage** : Cloudflare R2 (S3 compatible)
- **Containerisation** : Docker
- **UI** : TailwindCSS

---

## ⚙️ Installation (dev)

```bash
git clone <repo>
cd photo-albums-app
npm install
npm run dev
```

Ouvre ensuite :

👉 http://localhost:3000

## 🔧 Variables d’environnement

Exemple :

```bash
DATABASE_URL=...
JWT_SECRET=...
NEXT_PUBLIC_APP_URL=...
STORAGE_DRIVER=r2 ou local

R2_ACCOUNT_ID=...
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

COOKIE_SECURE="false"
```

---

## 🐳 Déploiement Docker

docker compose up -d --build

Puis appliquer les migrations :

```bash
docker compose exec app npx prisma migrate deploy
```

---

## 📈 Vision

Ce projet est pensé pour évoluer vers :

un écosystème de services (multi-apps)
un système de comptes partagé entre projets
une plateforme centralisée (dashboard)
des fonctionnalités avancées (tri, favoris, watermark, etc.)
🤝 Contexte

Projet personnel développé dans une logique :

pratique (répondre à un vrai besoin)
technique (progression fullstack)
produit (créer quelque chose d’utilisable)

## 📌 Statut

🟢 En développement actif
