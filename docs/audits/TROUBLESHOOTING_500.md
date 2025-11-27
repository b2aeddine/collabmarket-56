# 🔍 Guide : Résoudre les Erreurs 500

## ✅ Bonne Nouvelle

Tous vos secrets sont configurés ! Le problème vient d'ailleurs.

## 🔍 Diagnostic

Les erreurs **500** indiquent une erreur serveur dans le code des fonctions. Pour identifier le problème exact :

### Méthode 1 : Vérifier les Logs dans le Dashboard

1. Allez sur : https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx/functions
2. Cliquez sur une fonction qui retourne 500 (ex: `capture-payment-and-transfer`)
3. Cliquez sur l'onglet **"Logs"**
4. Regardez les erreurs récentes - elles vous diront exactement ce qui ne va pas

### Méthode 2 : Tester depuis l'Application

Les fonctions fonctionnent probablement depuis l'application car :
- `supabase.functions.invoke()` ajoute automatiquement l'authentification
- Les paramètres sont correctement formatés

**Testez dans votre application** :
1. Connectez-vous
2. Essayez d'utiliser une fonctionnalité qui appelle une fonction
3. Si vous voyez toujours une erreur 404, regardez dans la console du navigateur (F12 → Network)
4. Vérifiez l'URL exacte qui est appelée

## 🎯 Causes Possibles des Erreurs 500

### 1. Authentification Manquante
Certaines fonctions nécessitent un utilisateur connecté. Notre test PowerShell n'a pas de token d'authentification.

**Solution** : Testez depuis l'application où vous êtes connecté.

### 2. Paramètres Manquants
Les fonctions attendent des paramètres spécifiques dans le body.

**Exemple** : `capture-payment-and-transfer` attend `{ orderId: "..." }`

### 3. Erreur dans le Code
Il peut y avoir une erreur dans le code de la fonction.

**Solution** : Vérifiez les logs dans le Dashboard.

## ✅ Vérification Rapide

Pour vérifier si les fonctions fonctionnent vraiment :

1. **Ouvrez votre application**
2. **Connectez-vous**
3. **Essayez une fonctionnalité** (ex: créer une commande, vérifier le statut Stripe)
4. **Regardez la console du navigateur** (F12)

Si ça fonctionne dans l'application, alors les fonctions sont OK ! Le problème était juste que notre test PowerShell n'avait pas d'authentification.

## 🆘 Si ça ne fonctionne toujours pas

1. Vérifiez les logs dans le Dashboard Supabase
2. Vérifiez que vous êtes bien connecté dans l'application
3. Vérifiez la console du navigateur pour voir l'erreur exacte
4. Partagez-moi l'erreur exacte et je vous aiderai à la résoudre


