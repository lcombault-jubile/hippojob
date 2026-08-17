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

Bouton **🎯 Prépa** sur la ligne concernée. Il ouvre l'onglet *Prépa entretien* du générateur :

1. **📋 Copier le prompt de recherche studio** — le prompt embarque tout le contexte du dossier
   (poste, studio, mots-clés de l'annonce, arguments et accroche réellement envoyés, reel choisi,
   notes déjà prises) et demande un dossier en 8 sections : synthèse du studio, pipeline et
   technique, « pourquoi eux / pourquoi moi », 8 questions probables avec l'intention du
   recruteur, 5 questions techniques pièges, points faibles à assumer, questions à poser,
   logistique (quels plans du reel commenter, quels chiffres savoir citer).
2. Coller dans Claude.ai ou Gemini, puis **recoller la réponse dans la zone de texte**.
3. Le dossier est enregistré automatiquement à la frappe, et reste attaché à la candidature.
4. **📥 Télécharger en Word** produit `Prepa_Entretien_<Studio>_<Poste>.docx`, à relire la veille.

> Le prompt interdit explicitement à l'IA d'inventer des titres de production ou des chiffres,
> et lui demande de distinguer ce qu'elle sait de ce qu'elle suppose. **Vérifier malgré tout les
> faits sur le site du studio avant l'entretien** : citer une production qui n'est pas la leur
> est pire que de ne rien citer.

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

### ⚠️ Safari et iPhone : le stockage est effacé au bout de 7 jours

Safari, sur iOS comme sur macOS, **supprime le stockage local des sites qui n'ont pas été
visités depuis sept jours**. Ce n'est pas un bug, c'est le fonctionnement normal de sa
protection anti-traçage, et cela s'applique à ce site comme aux autres.

Conséquences directes :

- **Sur iPhone, ne jamais considérer les données comme durables.** Une semaine sans ouvrir le
  site pendant les vacances, et le suivi est vide au retour.
- Le bloc « À faire aujourd'hui » affiche donc un **rappel de sauvegarde en rouge** dès que la
  dernière sauvegarde JSON date de plus de sept jours, ou n'a jamais eu lieu. Il disparaît une
  fois la sauvegarde faite.
- **Ajouter le site à l'écran d'accueil** (Partager ▸ Sur l'écran d'accueil) donne un stockage
  plus durable qu'un simple onglet Safari — mais ce stockage est *séparé* de celui de l'onglet :
  les données ne sont pas partagées entre les deux.

### Deux appareils = deux jeux de données séparés

Le PC Windows et l'iPhone ont chacun leur propre `localStorage`. **Rien ne circule
automatiquement entre eux.** Le seul pont est le fichier JSON : sauvegarder d'un côté,
importer de l'autre (l'import fusionne, il n'écrase pas).

En pratique, choisir **un appareil de référence** et s'y tenir. Le PC Windows est le bon
choix : c'est là qu'on rédige les lettres et qu'on récupère les `.docx`. L'iPhone sert à
consulter les relances du jour, pas à saisir.

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
- Le modèle appelé est `gemini-2.5-flash` (constante dans `analyzeWithGemini()`).

### Règles de création et d'usage d'une clé API

Ces règles ne sont pas propres à ce projet : elles valent pour toute clé d'API, quel que soit le
fournisseur. Elles existent parce qu'une clé est un **mot de passe qui engage un compte, et
souvent un moyen de paiement**.

**Avant de créer la clé**

1. **Se demander si elle est nécessaire.** Ici, non : « Copier le prompt » fait le même travail
   sans clé. Une clé qui n'existe pas ne peut pas fuiter.
2. **Une clé par usage.** Ne jamais réutiliser pour ce site une clé qui sert déjà ailleurs :
   en cas de fuite, on révoque une seule chose sans casser le reste.
3. **La nommer explicitement** dans la console du fournisseur (`hippojob-navigateur`), pour
   savoir quoi révoquer six mois plus tard.
4. **Plafonner la dépense** dans la console du fournisseur avant le premier appel — quota,
   budget, alerte de facturation. C'est le seul filet en cas d'usage détourné.
5. **Ne créer que des clés à portée restreinte** quand le fournisseur le permet : limitation par
   API, par domaine référent, par adresse IP.

**Où une clé peut vivre**

| Emplacement | Verdict |
|---|---|
| Console du fournisseur, machine personnelle | ✅ |
| `localStorage` d'un navigateur personnel | ⚠️ Acceptable pour une clé plafonnée à faible privilège, comme ici |
| Fichier `.env` **non versionné** | ✅ |
| Dépôt Git, même privé | ❌ Jamais |
| Code source, HTML, capture d'écran, ticket, message | ❌ Jamais |
| Ordinateur partagé, poste de l'école, machine d'un tiers | ❌ Jamais |

**Règle absolue : aucune clé secrète côté navigateur.** Une clé placée dans une page web est
lisible par l'utilisateur, par ses extensions et par toute injection de script. C'est pourquoi
seule la clé Gemini est acceptée ici — gratuite, plafonnable, révocable en un clic — et pourquoi
l'appel direct à l'API Anthropic a été **retiré** : il exigeait l'en-tête
`anthropic-dangerous-direct-browser-access` et une clé secrète en clair sur une page publique.
Pour utiliser Claude, passer par « Copier le prompt » et claude.ai.

**Pendant la vie de la clé**

- La **révoquer immédiatement** au moindre doute : capture d'écran partagée, commit accidentel,
  machine prêtée. Une révocation coûte deux minutes, une clé détournée coûte une facture.
- La **faire tourner** si elle sert longtemps.
- **Supprimer celles qui ne servent plus** — le bouton « Supprimer la clé de ce navigateur »
  la retire de HippoJob, mais **ne la révoque pas** chez le fournisseur : les deux gestes sont
  nécessaires.
- **Surveiller la consommation** de temps en temps dans la console du fournisseur : un usage
  anormal est le premier signe d'une fuite.

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
| `{nom}` `{telephone}` `{email}` `{portfolio}` `{cv}` | Panneau Profil | `{portfolio}` = LinkedIn ou site perso |
| `{lienReel}` | Profil + fiche | **Choisit le reel Animation ou Rigging selon le champ « Reel à envoyer » de la candidature** |
| `{reelAnimation}` `{reelRigging}` | Panneau Profil | Pour citer les deux reels explicitement |

Une variable laissée vide ne crée pas de ligne blanche : le texte est recompacté à la
compilation. Mieux, **une ligne entière disparaît** quand toutes ses variables sont vides et
qu'il ne reste qu'un libellé — ainsi `🎬 Demo reel : {lienReel}` s'efface au lieu d'exporter un
« 🎬 Demo reel : » orphelin. Un titre sans variable, comme `Atouts clés :`, est toujours
conservé. Si une variable n'est pas reconnue, un avertissement s'affiche avant l'export.

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

Tout est du JSON sérialisé dans le `localStorage` du navigateur, sur la machine d'Hippolyte.
Aucune base de données, aucun serveur, aucun fichier sur le disque tant qu'il ne clique pas sur
un bouton d'export.

#### Le tableau de suivi (`candidatures-list`)

Un tableau d'objets, un par candidature. Chaque enregistrement porte l'ensemble de son cycle
de vie — il n'y a pas de table séparée, pas de relation :

```js
{
  id: "el5k2x9abc",                     // identifiant local, jamais réutilisé
  studio: "TeamTO", poste: "Character Rigger",
  reel: "Rigging",                      // détermine quel demo reel sera lié
  priorite: "Haute",
  motsCles: ["Maya", "Python"],         // tableaux, pas des chaînes
  argumentsLettre: ["Phrase une.", "Phrase deux."],
  accroche: "2-3 phrases propres à ce studio.",
  statut: "Envoyé",                     // toujours l'une des 7 valeurs de STATUTS
  dateEnvoi: "2026-07-01", relance: "2026-07-08",
  dateReponse: "", dateEntretien: "",
  notesEntretien: "…", prepaEntretien: "…",
  lien: "https://…", contact: "Mme Durand", contactEmail: "rh@teamto.com"
}
```

#### Les lettres et les mails ne sont pas stockés

**C'est un choix de conception, pas un oubli.** Une lettre n'est jamais enregistrée : elle est
**recompilée à chaque affichage** par `compileTemplate()`, à partir de trois sources — le modèle
(`tpl-lettre`), les données de la candidature (`accroche`, `argumentsLettre`, `studio`…) et le
panneau Profil.

Conséquences à connaître :

- Corriger une faute dans un modèle **améliore rétroactivement** toutes les lettres à venir.
  Rien à reprendre dossier par dossier.
- **Les retouches faites à la main dans la zone de texte ne sont pas conservées.** Changer
  d'onglet ou rouvrir le générateur régénère le texte depuis le modèle. Si une formulation
  mérite d'être gardée, il faut soit l'exporter en `.docx`, soit la remonter dans le champ
  *accroche* ou dans les arguments de la candidature, qui eux sont enregistrés.
- La lettre effectivement envoyée n'est donc pas archivée dans l'outil : le `.docx` téléchargé
  fait foi.

#### Le dossier de préparation d'entretien, lui, est stocké

`prepaEntretien` est du texte libre, propre à chaque candidature, **enregistré à la frappe**
(pas besoin de cliquer sur « Enregistrer »). C'est de la saisie manuelle irremplaçable, contrairement
à une lettre régénérable — d'où le traitement différent.

Il est inclus dans la **sauvegarde JSON**, mais **pas dans l'export TSV vers Sheets** : un dossier
de plusieurs milliers de caractères rendrait la feuille illisible. Un réimport depuis Sheets ne
l'efface pas pour autant, puisque la fusion ne touche jamais aux dossiers déjà présents.
**La sauvegarde JSON est donc le seul filet pour ces dossiers.**

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
