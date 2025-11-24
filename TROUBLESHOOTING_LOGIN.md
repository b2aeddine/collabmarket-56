# 🔐 Guide : Résoudre l'Erreur de Connexion Supabase

## ❌ Erreur Actuelle

```
AuthApiError: Invalid login credentials
Status: 400
URL: vklayzyhocjpicnblwfx.supabase.co/auth/v1/token?grant_type=password
```

## 🔍 Causes Possibles

### 1. Email ou Mot de Passe Incorrect
- Vérifiez que vous utilisez le bon email et mot de passe
- Assurez-vous qu'il n'y a pas d'espaces avant/après
- Vérifiez la casse (majuscules/minuscules)

### 2. Compte N'Existe Pas
- L'utilisateur n'a peut-être pas été créé dans Supabase
- Vérifiez dans le Dashboard Supabase : **Authentication** → **Users**

### 3. Compte Désactivé
- Le compte peut avoir été désactivé
- Vérifiez dans le Dashboard Supabase

### 4. Problème de Configuration
- Les variables d'environnement peuvent être incorrectes
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctes

## ✅ Solutions

### Solution 1 : Vérifier dans le Dashboard Supabase

1. Allez sur : https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx/auth/users
2. Vérifiez si votre utilisateur existe
3. Si l'utilisateur n'existe pas, créez-le ou inscrivez-vous d'abord

### Solution 2 : Créer un Nouveau Compte

Si vous n'avez pas de compte :
1. Allez sur la page d'inscription de votre application
2. Créez un nouveau compte
3. Vérifiez votre email (si la vérification est activée)
4. Connectez-vous avec le nouveau compte

### Solution 3 : Réinitialiser le Mot de Passe

Si vous avez oublié votre mot de passe :
1. Allez sur la page de connexion
2. Cliquez sur "Mot de passe oublié ?"
3. Suivez les instructions pour réinitialiser

### Solution 4 : Vérifier les Variables d'Environnement

Sur Vercel, vérifiez que les variables d'environnement sont configurées :

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que ces variables existent :
   - `VITE_SUPABASE_URL` = `https://vklayzyhocjpicnblwfx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = votre clé anon (commence par `eyJ...`)

### Solution 5 : Vérifier la Configuration Supabase

Dans le Dashboard Supabase :
1. Allez dans **Authentication** → **Settings**
2. Vérifiez que "Enable Email Signup" est activé
3. Vérifiez que "Enable Email Signin" est activé
4. Vérifiez les paramètres de sécurité

## 🧪 Test Rapide

Pour tester si le problème vient de vos identifiants :

1. **Créez un nouveau compte de test** :
   - Allez sur `/signup`
   - Créez un compte avec un email de test
   - Essayez de vous connecter

2. **Si le nouveau compte fonctionne** :
   - Le problème vient de vos identifiants originaux
   - Utilisez "Mot de passe oublié" pour réinitialiser

3. **Si le nouveau compte ne fonctionne pas** :
   - Le problème vient de la configuration Supabase
   - Vérifiez les variables d'environnement sur Vercel

## 📋 Checklist de Diagnostic

- [ ] L'email et le mot de passe sont corrects
- [ ] Le compte existe dans Supabase (Dashboard → Auth → Users)
- [ ] Le compte n'est pas désactivé
- [ ] Les variables d'environnement sont configurées sur Vercel
- [ ] "Enable Email Signin" est activé dans Supabase
- [ ] Vous avez vérifié votre email (si requis)

## 🆘 Si Rien Ne Fonctionne

1. **Vérifiez les logs Supabase** :
   - Dashboard → Logs → Auth Logs
   - Regardez les erreurs détaillées

2. **Vérifiez les logs Vercel** :
   - Dashboard Vercel → Votre déploiement → Logs
   - Regardez les erreurs de build/runtime

3. **Testez en local** :
   - Créez un fichier `.env.local` avec vos variables
   - Testez la connexion en local
   - Si ça fonctionne en local mais pas sur Vercel, c'est un problème de variables d'environnement

## 💡 Note Importante

L'erreur 400 "Invalid login credentials" est une erreur normale quand :
- L'email n'existe pas
- Le mot de passe est incorrect
- Le compte est désactivé

Ce n'est **PAS** un problème de code ou de configuration Supabase, mais plutôt un problème d'identifiants.

