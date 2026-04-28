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
