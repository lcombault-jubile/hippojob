# Candidatures spontanées (avec ou sans recommandation)

Date : 2026-08-19
Statut : validé, prêt pour implémentation

## Problème

Le pipeline actuel part toujours d'une annonce : on colle le lien et le texte de l'offre,
l'IA en extrait un JSON, le formulaire s'ouvre pré-rempli. Une candidature spontanée n'a pas
d'annonce. Le formulaire `draftPanel` n'est atteignable qu'en sortie d'analyse : il n'existe
aujourd'hui aucun moyen de créer un dossier à la main.

Le réseau visé est celui de Rubika (anciens élèves), sur une liste d'environ 200 studios
fournie par l'école. La liste **reste hors de l'outil** (Google Sheet séparé) : HippoJob
n'enregistre que les candidatures réellement envoyées. Aucun import de cibles n'est prévu.

Quand un tiers recommande, il **autorise à être cité** — il ne transmet pas lui-même le
dossier. Il n'y a donc pas d'état amont à suivre : une spontanée recommandée est une
spontanée dont la lettre cite un nom.

## Décisions

### 1. Modèle de données

Trois champs ajoutés à une entrée :

| Champ | Valeurs | Rôle |
|---|---|---|
| `origine` | `'Annonce'` (défaut) / `'Spontanée'` | D'où vient la candidature |
| `recommandant` | texte libre | Vide = spontanée froide |
| `recommandantRole` | texte libre | Sert à construire la phrase de recommandation |

Pas de troisième valeur d'`origine` pour le cas recommandé : « spontanée recommandée » est une
valeur **dérivée** (`origine === 'Spontanée' && recommandant`), pas un état à maintenir.

Les `STATUTS` ne changent pas. Une spontanée suit le même cycle de vie.

`normalizeOrigine(raw)` est le pendant de `normalizeStatut` : toute valeur inconnue,
absente ou importée retombe sur `'Annonce'`. C'est ce qui garantit la rétrocompatibilité —
les dossiers existants, qui n'ont pas le champ, sont traités comme des réponses à annonce.

### 2. Parcours de création

Bouton **« ✋ Candidature spontanée »** dans la section *Analyser une offre*. Il ouvre le
`draftPanel` vide avec `origine = 'Spontanée'`.

Le panneau gagne un bloc conditionnel, visible uniquement en mode spontané :
- recommandant (nom)
- rôle / lien du recommandant avec le studio
- bouton **📋 Copier le prompt de recherche studio**

En mode spontané, le champ « Lien de l'annonce » est masqué (il n'existe pas).
En mode annonce, le bloc recommandation est masqué.

### 3. Prompt de recherche studio

Réutilise **le contrat JSON existant** (`studio`, `poste`, `reel`, `motsCles`, `priorite`,
`note`, `accroche`, `argumentsLettre`). `applyAnalysisResponse()` et tout l'aval sont donc
inchangés. Seules les instructions amont diffèrent :

- entrée = nom du studio + poste visé + recommandant, au lieu du texte d'une annonce ;
- `accroche` s'appuie sur ce que le studio **fait**, pas sur ce qu'il demande ;
- `reel` devient un conseil argumenté selon le pipeline du studio ;
- **garde-fou** : interdiction d'inventer titres de production, chiffres, noms ; tout élément
  supposé doit être préfixé « à vérifier : » ; si le studio est inconnu de l'IA, elle le dit
  dans `note` et rend une accroche générique plutôt qu'inventée.

Ce prompt reste **distinct** de celui de prépa entretien : l'un produit du JSON exploitable
par le formulaire, l'autre du texte long. Les fusionner imposerait un prompt à deux modes,
plus fragile pour un gain nul.

### 4. Bandeau d'avertissement

Tout dossier `origine === 'Spontanée'` affiche dans le générateur un avertissement permanent :

> Aucune annonce ne sert de source. Vérifier sur le site du studio toute production ou
> information citée avant l'envoi.

Non refermable, non conditionné à la présence d'une `note`.

### 5. Lettre : une variable, pas un second jeu de modèles

Nouvelle variable `{recommandation}`, insérable comme les autres :

- `recommandant` renseigné → « <Nom>, <rôle>, m'a suggéré de vous écrire. »
- vide → chaîne vide, et `compileTemplate()` supprime la ligne orpheline (comportement déjà
  en place pour `{accroche}` et `{motsCles}`).

Un seul jeu de modèles à maintenir. Le cas recommandé n'est pas une branche de code.
La variable est ajoutée aux quatre profils prédéfinis, juste avant `{accroche}`.

**Ajout en cours d'implémentation** : une seconde variable `{ouverture}` s'est révélée
nécessaire. Les quatre modèles ouvraient sur une clause propre à l'annonce — « je vous écris au
sujet de votre offre de poste de X », « je réponds à votre offre ». Rendue telle quelle dans une
candidature spontanée, cette phrase est factuellement fausse : elle invente une offre qui
n'existe pas. La clause devient donc une variable :

- `origine === 'Annonce'` → « au sujet de votre offre de poste de {poste} »
- `origine === 'Spontanée'` → « spontanément, pour un poste de {poste} »

Même logique que `{recommandation}` : une variable, pas une branche, et un seul jeu de modèles.

Le `{poste}` d'une spontanée est le poste **visé**, saisi à la main.

### 6. Relance : J+21 pour le spontané

`RELANCE_JOURS = { Annonce: 7, 'Spontanée': 21 }`, plus `RELANCE_JOURS_RELANCE = 14`
(inchangé). Sans échéance côté studio, relancer à une semaine ne signale que l'impatience.

**Hors périmètre** : la relance longue à 3–4 mois. Elle imposerait une seconde échéance par
dossier — second champ, second tri, seconde ligne dans « À faire aujourd'hui ». À rouvrir si
le besoin se confirme.

### 7. Stats et filtre

La section Stats gagne une ventilation par origine — envoyées / réponses / entretiens — en
trois lignes : Annonce, Spontanée froide, Spontanée recommandée. Sans elle, la première vague
de spontanées froides écrase le taux de réponse global et rend la section inutilisable.

Le tableau gagne un filtre par origine, sur la mécanique du filtre par statut existant.

## Rétrocompatibilité

C'est le point sensible : des données réelles existent déjà en `localStorage` et dans un
Google Sheet.

1. **Entrées existantes** — `loadEntries()` applique `origine: normalizeOrigine(e.origine)`,
   donc `'Annonce'` pour tout dossier antérieur. `recommandant` et `recommandantRole`
   défaillent sur `''`.
2. **Import JSON ancien** — même normalisation, appliquée dans `mergeEntries`/`loadEntries`.
3. **Import CSV à 16 colonnes** — `rowsToEntries()` repère les colonnes par leur **nom**
   (`getIdx`), pas par leur position. Un fichier sans colonne « Origine » donne
   `idxOrigine === -1` et retombe sur `'Annonce'`. Aucun décalage possible.
4. **Export Sheets** — passe de 16 à 19 colonnes (Origine, Recommandant, Rôle recommandant),
   ajoutées **en fin de ligne** pour ne déplacer aucune colonne existante dans la feuille.
5. **Modèles enregistrés** — un modèle personnalisé déjà sauvegardé en `localStorage` ne
   contient pas `{recommandation}` : il continue de fonctionner à l'identique, sans la phrase
   de recommandation. Seuls les modèles par défaut et les quatre profils la portent.
6. **Cycle de vie** — aucun statut ajouté ni renommé : `normalizeStatut` est intouché.

## Tests de non-régression

Pas de framework, pas de dépendance nouvelle (règle du projet). Un script Node autonome,
`tests/non-regression.mjs`, extrait les fonctions pures d'`index.html` par leur nom et les
évalue dans un contexte minimal. Il couvre :

- `normalizeStatut` : les valeurs historiques rendent toujours le même statut ;
- `normalizeOrigine` : vide / inconnu / accentué / importé → `'Annonce'` ou `'Spontanée'` ;
- `rowsToEntries` : un CSV à 16 colonnes (format actuel) s'importe sans décalage et avec
  `origine === 'Annonce'` ; un CSV à 19 colonnes relit les trois nouveaux champs ;
- `compileTemplate` : `{recommandation}` vide supprime sa ligne ; renseignée, elle est
  substituée ; un modèle sans la variable est rendu inchangé ; `{ouverture}` est substituée ;
- `parseArguments` : comportement inchangé sur les deux formats.

Lancement : `node tests/non-regression.mjs`. Sortie non nulle en cas d'échec.

## Hors périmètre

- Import des 200 cibles Rubika (la liste reste dans un Google Sheet).
- Suivi des demandes d'introduction (le tiers ne transmet pas lui-même).
- Relance longue à 3–4 mois.
- Second jeu de modèles pour le spontané.
