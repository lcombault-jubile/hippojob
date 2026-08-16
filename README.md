# HippoJob — suivi de candidatures Animation 3D / Rigging

Outil personnel de recherche d'emploi pour Hippolyte Combault (Rubika, animation 3D & rigging).
Page HTML unique, sans serveur, sans compte à créer : on ouvre l'adresse et ça fonctionne.

- **Fichier unique** : [`index.html`](index.html) (HTML + CSS + JS, aucune étape de build)
- **Dépendance externe** : la librairie `docx` (via unpkg) pour l'export Word. Tout le reste est autonome.
- **Données** : stockées dans le navigateur (`localStorage`). Rien n'est envoyé nulle part.

---

## 1. Mode d'emploi

### Première utilisation — à faire une seule fois

Le panneau **👤 Profil** s'ouvre automatiquement au premier lancement. Il faut le remplir :
nom, téléphone, email, lien du portfolio, lien du CV.

> **Important** : ces informations remplacent les variables `{nom}`, `{telephone}`, `{email}`,
> `{portfolio}` et `{cv}` dans les lettres. Tant qu'elles sont vides, un avertissement rouge
> s'affiche dans le générateur — une lettre partie avec un numéro manquant est pire que pas
> de lettre du tout.

### Le rituel quotidien

1. **Ouvrir la page.** Le bloc **« À faire aujourd'hui »** en haut liste ce qui est en retard :
   relances dues, entretiens dans les 7 jours, candidatures jamais envoyées.
2. **Traiter ces actions.** Chaque ligne a un bouton qui ouvre directement le bon document.
3. **Passer la veille.** Section *Veille du jour* : des recherches déjà filtrées sur LinkedIn,
   Indeed, ArtStation, Hitmarker, VES.

### Répondre à une annonce

1. Section **Analyser une offre** → coller le lien et le texte complet de l'annonce.
2. **📋 Copier le prompt** → coller dans [Claude.ai](https://claude.ai) ou
   [Gemini](https://gemini.google.com) dans un autre onglet.
3. Récupérer le JSON renvoyé → le coller dans « Réponse collée » → **Utiliser cette réponse**.
4. Le formulaire s'ouvre pré-rempli. **Relire l'accroche** : c'est le paragraphe qui rend la
   lettre spécifique à ce studio, et c'est ce qu'un recruteur remarque.
   Lire aussi la **Note** : l'IA doit y signaler les pièges (stage déguisé, séniorité hors de portée).
5. **✍️ Ajouter et rédiger la lettre** → la lettre s'affiche, éditable.
6. Ajuster, puis **📥 Télécharger en Word**, **📋 Copier le texte** ou **✉️ Ouvrir Client Mail**.
7. Une fois parti : **✅ Marquer comme Envoyé & Synchro**. La relance est planifiée à J+7
   automatiquement.

> Le `mailto:` **n'attache aucun fichier** — c'est une limite du protocole. Le CV et la lettre
> `.docx` doivent être joints à la main dans le client mail. Alternative : insérer `{cv}` dans
> le modèle pour envoyer un lien plutôt qu'une pièce jointe.

### Préparer un entretien

Bouton **🎯 Prépa** sur la ligne concernée : copie un prompt contextualisé (studio, poste,
mots-clés de l'annonce, arguments déjà utilisés) à coller dans Claude.ai ou Gemini.

### Mesurer ce qui marche

Section **Stats** : taux de réponse global, taux d'entretien, et surtout **taux de réponse par
reel** (Animation vs Rigging). Après une trentaine de candidatures, ces chiffres disent si le
problème vient du ciblage ou de la lettre.

---

## 2. Sauvegarde — à lire absolument

**Les données ne vivent que dans un seul navigateur, sur une seule machine.** Un nettoyage de
l'historique, un changement d'ordinateur ou un mode navigation privée = tout est perdu.

- **💾 Sauvegarder (JSON)** — un clic, fidèle à 100 % (profil inclus). **À faire chaque semaine.**
- **📂 Importer (JSON / CSV)** — restaure une sauvegarde. L'import **fusionne** : il n'écrase
  jamais les dossiers existants et ignore les doublons (comparaison sur studio + poste).

Un bandeau rouge apparaît si le navigateur bloque l'enregistrement (navigation privée,
cookies désactivés, page ouverte en `file://`). Dans ce cas, **rien n'est conservé**.

### Échanger avec Google Sheets

La feuille doit rester **privée**. L'échange se fait à la main, dans les deux sens :

| Sens | Comment |
|---|---|
| **Vers Sheets** | Bouton **☁️ Copier pour Sheet** → `Ctrl+V` dans la cellule A1 |
| **Depuis Sheets** | Dans la feuille : `Fichier > Télécharger > CSV`, puis **📂 Importer** |

Les 16 colonnes exportées sont relues à l'identique — l'aller-retour ne perd rien.
Pour une sauvegarde de sécurité, préférer quand même le JSON : Sheets reformate les dates et
aplatit les listes de mots-clés.

---

## 3. Obtenir une clé API Gemini (gratuite)

**Ce n'est pas obligatoire.** Le mode recommandé — « Copier le prompt » puis coller dans
Claude.ai ou Gemini — ne nécessite aucune clé et ne coûte rien. La clé sert uniquement au
bouton **⚡ Analyser automatiquement**, qui évite l'aller-retour entre onglets.

### La procédure

1. Aller sur **[aistudio.google.com](https://aistudio.google.com)** et se connecter avec un
   compte Google.
2. Cliquer sur **« Get API key »** / **« Obtenir une clé API »** (en haut à gauche du menu).
3. **« Create API key »** — accepter de créer un nouveau projet Google Cloud si c'est proposé
   (aucune carte bancaire n'est demandée pour le niveau gratuit).
4. Copier la clé : elle commence par `AIzaSy...`.
5. Dans HippoJob : bouton **🔑 Clés API** → coller → **Enregistrer la clé**.

L'interface de Google AI Studio évolue régulièrement ; si les libellés diffèrent, chercher
« API key » dans le menu latéral.

### Ce qu'il faut savoir avant

- Le niveau gratuit impose des **quotas** (nombre de requêtes par minute et par jour). Pour
  quelques analyses d'annonces par jour, c'est très largement suffisant.
- Google peut utiliser les contenus envoyés via le niveau gratuit pour améliorer ses produits.
  Ne pas y coller de données personnelles sensibles — le texte d'une annonce publique ne pose
  pas de problème.
- **La clé est stockée en clair dans le navigateur.** À n'utiliser que sur une machine
  personnelle. Le bouton **« Supprimer la clé de ce navigateur »** la retire à tout moment.
- Le modèle appelé est `gemini-2.5-flash` (constante dans `analyzeWithGemini()`).

> ⚠️ L'appel direct à l'API Anthropic depuis le navigateur a été **retiré volontairement** :
> il exigeait l'en-tête `anthropic-dangerous-direct-browser-access` et une clé secrète en clair
> sur une page publique. Pour utiliser Claude, passer par « Copier le prompt » et claude.ai.

---

## 4. Personnaliser les modèles

Bouton **✉️ Modèles**. Quatre profils prédéfinis (Classique, Rigging, Animation, Court) et un
éditeur libre pour la lettre, le mail de candidature et le mail de relance.

### Variables disponibles

| Variable | Source | Remarque |
|---|---|---|
| `{studio}` `{poste}` `{reel}` | Analyse de l'offre | |
| `{accroche}` | Analyse de l'offre | **La variable clé** : 2-3 phrases propres à ce studio |
| `{argumentsLettre}` | Analyse de l'offre | Paragraphe dans la lettre, puces dans les mails |
| `{motsCles}` | Analyse de l'offre | Rendu « Compétences cibles : … » |
| `{contact}` `{lien}` | Fiche de la candidature | |
| `{dateEnvoi}` `{dateRelance}` | Fiche de la candidature | Formatées en français (« 15 août 2026 ») |
| `{nom}` `{telephone}` `{email}` `{portfolio}` `{cv}` | Panneau Profil | |

Une variable laissée vide ne crée pas de ligne blanche : le texte est recompacté à la
compilation. Si une variable n'est pas reconnue, un avertissement s'affiche avant l'export.

> Les modèles enregistrés **avant** l'ajout de `{accroche}` ne l'utilisent pas. Un toast le
> signale à l'ouverture du panneau ; il suffit de cliquer sur le bouton `{accroche}` pour
> l'insérer, ou de faire **Réinitialiser par Défaut**.

---

## 5. Notes techniques

### Où sont les données

| Clé `localStorage` | Contenu |
|---|---|
| `candidatures-list` | Le tableau de suivi |
| `candidatures-profil` | Coordonnées et liens |
| `candidatures-veille` | Liens de veille |
| `candidatures-studios` | Studios suivis |
| `tpl-lettre`, `tpl-mail-envoi`, `tpl-mail-relance` | Modèles personnalisés |
| `google-sheet-url` | Raccourci vers la feuille (jamais lue par le code) |
| `gemini-api-key` | Clé API, si renseignée |

Tous les accès passent par `lsGet` / `lsSet` / `lsRemove`. **Ne jamais appeler `localStorage`
directement** : il lève une `SecurityError` en navigation privée ou quand les cookies sont
bloqués, et un seul accès non protégé interrompt tout le script.

### Invariants à respecter

- **Aucun import ne doit écraser les données.** Passer par `mergeEntries()` / `mergeLinks()`,
  qui demandent confirmation, dédoublonnent et conservent l'existant.
- **Tout texte inséré dans le DOM passe par `escapeHtml()`**, toute URL rendue par `safeUrl()`
  (qui rejette `javascript:`). Les données viennent de copier-coller et de fichiers CSV.
- **Les statuts venant de l'extérieur passent par `normalizeStatut()`.** Le tableau affiche un
  `<select>` à valeurs fixes ; un statut inconnu serait silencieusement réinitialisé.
- **Pas de clé d'API secrète dans le navigateur**, hormis la clé Gemini assumée comme telle.

### Ce qui n'existe pas (volontairement)

- **Aucune authentification.** L'écran « Google Auth » d'origine enregistrait un Client ID que
  rien ne lisait, et le script Google Identity n'était jamais initialisé — il a été supprimé.
- **Aucune lecture réseau de Google Sheets.** L'export CSV via `/gviz/tq` exigeait de publier la
  feuille sur le web, exposant notes d'entretien et coordonnées des recruteurs à qui connaît
  l'URL. Remplacé par l'import de fichier CSV, feuille privée.
- **Aucune synchronisation multi-appareils.** Si le besoin apparaît, la piste est OAuth Google
  avec le scope étroit `drive.file` — à instruire, la charge de vérification Google étant le
  point à valider en premier.

### Développement

```bash
python3 -m http.server 8777
```

Puis ouvrir `http://localhost:8777/`. Ouvrir le fichier en `file://` **ne fonctionne pas** :
`localStorage` y est indisponible.

---

## 6. Déploiement

Le site est publié via **GitHub Pages** depuis la branche `main`. Aucune étape de build : le
`index.html` poussé est celui qui est servi.

Après un `git push` sur `main`, la mise en ligne prend une à deux minutes.
