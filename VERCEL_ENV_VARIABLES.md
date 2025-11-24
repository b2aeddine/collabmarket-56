# 🔐 Variables d'Environnement Vercel

## Variables à Ajouter dans Vercel

Copiez-collez ces variables dans votre dashboard Vercel : **Settings** → **Environment Variables**

---

## Variable 1 : VITE_SUPABASE_URL

**Key :**
```
VITE_SUPABASE_URL
```

**Value :**
```
https://vklayzyhocjpicnblwfx.supabase.co
```

**Environments :** All Environments (Production, Preview, Development)

---

## Variable 2 : VITE_SUPABASE_ANON_KEY

**Key :**
```
VITE_SUPABASE_ANON_KEY
```

**Value :**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbGF5enlob2NqcGljbmJsd2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODA4MDMsImV4cCI6MjA2NzM1NjgwM30.pUSBHigrCNULCQAPdYCKixt7OYNICKHCgbBaelFqJE8
```

**Environments :** All Environments (Production, Preview, Development)

---

## 📋 Instructions Rapides (Méthode Import .env - RECOMMANDÉ)

### ⚡ Méthode Rapide : Import .env

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet `collabmarket-56`
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **"Create new"**
5. Cliquez sur le bouton **"Import .env"**
6. Sélectionnez le fichier `vercel.env` à la racine de votre projet
7. Vérifiez que les variables apparaissent correctement
8. Sélectionnez **"All Environments"** dans le dropdown "Environments"
9. Cliquez sur **"Save"** en bas à droite

### 📝 Méthode Manuelle (Alternative)

Si vous préférez ajouter manuellement :
1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet `collabmarket-56`
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **"Create new"**
5. Pour chaque variable :
   - Copiez le **Key** dans le champ "Key"
   - Copiez le **Value** dans le champ "Value"
   - Sélectionnez **"All Environments"** dans le dropdown
   - Cliquez sur **"Add Another"** pour la deuxième variable
6. Cliquez sur **"Save"** en bas à droite

---

## ⚠️ Important

- **Ne mettez PAS d'espaces** avant ou après les valeurs
- **Sélectionnez "All Environments"** pour que ça fonctionne partout
- **Un nouveau déploiement sera nécessaire** après avoir sauvegardé

---

## ✅ Vérification

Après avoir ajouté les variables et redéployé :
1. Testez la connexion sur votre application
2. Vérifiez qu'il n'y a plus d'erreur 400
3. Si ça ne fonctionne toujours pas, vérifiez que le compte existe dans Supabase

---

## 🔍 Où Trouver la Clé ANON_KEY

Si vous avez besoin de retrouver la clé :
1. Allez sur : https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx/settings/api
2. La clé "anon public" est dans la section "Project API keys"

