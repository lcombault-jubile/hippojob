/*
 * Tests de non-régression — HippoJob.
 *
 * Why: index.html est un fichier unique sans build ni framework, et la règle du projet
 * interdit d'ajouter une dépendance. Ce script extrait les fonctions PURES d'index.html
 * par leur nom et les évalue dans un contexte minimal (pas de DOM). Il ne teste donc que
 * ce qui ne touche pas au document — ce qui couvre exactement les points où une
 * régression détruirait des données : normalisation, import CSV, compilation de modèle.
 *
 * Lancement : node tests/non-regression.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

/**
 * Extrait le code source d'une fonction déclarée au premier niveau du <script>.
 * @param {string} name - Nom de la fonction
 * @returns {string} Son code source complet
 */
function extractFunction(name) {
  const start = html.indexOf(`\n    function ${name}(`);
  if (start === -1) throw new Error(`Fonction introuvable dans index.html : ${name}`);
  const end = html.indexOf('\n    }\n', start);
  if (end === -1) throw new Error(`Fin de fonction introuvable : ${name}`);
  return html.slice(start, end + '\n    }'.length);
}

/**
 * Extrait une déclaration `const NOM = ...;` du <script>.
 * @param {string} name - Nom de la constante
 * @returns {string} Sa déclaration complète
 */
function extractConst(name) {
  const start = html.indexOf(`\n    const ${name} = `);
  if (start === -1) throw new Error(`Constante introuvable : ${name}`);
  const end = html.indexOf(';\n', start);
  return html.slice(start, end + 1);
}

const sandbox = { uid: (p) => `${p}_test`, console };
vm.createContext(sandbox);
vm.runInContext([
  extractConst('STATUTS'),
  extractConst('ORIGINES'),
  extractConst('RELANCE_JOURS'),
  extractFunction('normalizeStatut'),
  extractFunction('normalizeOrigine'),
  extractFunction('estRecommandee'),
  extractFunction('phraseRecommandation'),
  extractFunction('parseArguments'),
  extractFunction('rowsToEntries'),
  extractFunction('compileTemplate'),
  // `const` reste lexical dans vm.runInContext : sans réexport explicite, la constante
  // ne serait pas visible depuis le sandbox.
  'globalThis.STATUTS = STATUTS; globalThis.ORIGINES = ORIGINES; globalThis.RELANCE_JOURS = RELANCE_JOURS;'
].join('\n'), sandbox);

const {
  normalizeStatut, normalizeOrigine, estRecommandee, phraseRecommandation,
  parseArguments, rowsToEntries, compileTemplate, RELANCE_JOURS
} = sandbox;

let failed = 0;
let passed = 0;

function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { passed++; return; }
  failed++;
  console.error(`✗ ${label}\n    attendu : ${e}\n    obtenu  : ${a}`);
}

// ---------------------------------------------------------------- normalizeStatut
// Rétrocompatibilité : ces valeurs existent dans des sauvegardes réelles.
check('statut vide → À traiter', normalizeStatut(''), 'À traiter');
check('statut absent → À traiter', normalizeStatut(undefined), 'À traiter');
check('statut exact conservé', normalizeStatut('Relancé'), 'Relancé');
check('statut Sheets « envoyée »', normalizeStatut('envoyée'), 'Envoyé');
check('statut « Interview »', normalizeStatut('Interview'), 'Entretien');
check('statut inconnu → À traiter', normalizeStatut('bla'), 'À traiter');

// ---------------------------------------------------------------- normalizeOrigine
check('origine absente → Annonce', normalizeOrigine(undefined), 'Annonce');
check('origine vide → Annonce', normalizeOrigine(''), 'Annonce');
check('origine inconnue → Annonce', normalizeOrigine('n/a'), 'Annonce');
check('origine Annonce conservée', normalizeOrigine('Annonce'), 'Annonce');
check('origine Spontanée conservée', normalizeOrigine('Spontanée'), 'Spontanée');
check('origine sans accent', normalizeOrigine('spontanee'), 'Spontanée');
check('origine casse libre', normalizeOrigine('  SPONTANÉE '), 'Spontanée');

// ---------------------------------------------------------------- recommandation
check('recommandée vraie', estRecommandee({ origine: 'Spontanée', recommandant: 'Julie' }), true);
check('recommandant blanc ne compte pas', estRecommandee({ origine: 'Spontanée', recommandant: '   ' }), false);
check('annonce jamais recommandée', estRecommandee({ origine: 'Annonce', recommandant: 'Julie' }), false);
check('dossier historique non recommandé', estRecommandee({ studio: 'X' }), false);
check('phrase sans recommandant', phraseRecommandation({}), '');
check('phrase avec rôle', phraseRecommandation({ recommandant: 'Julie Martin', recommandantRole: 'rigger chez eux' }),
  "Julie Martin, rigger chez eux, m'a suggéré de vous écrire.");
check('phrase sans rôle', phraseRecommandation({ recommandant: 'Julie Martin' }),
  "Julie Martin m'a suggéré de vous écrire.");

// ---------------------------------------------------------------- parseArguments
check('arguments multi-lignes', parseArguments('Une phrase.\n- Deux.'), ['Une phrase.', 'Deux.']);
check('arguments une ligne à virgules', parseArguments('a, b, c'), ['a', 'b', 'c']);
check('arguments vides', parseArguments(''), []);

// ---------------------------------------------------------------- import CSV
// Format historique à 16 colonnes, tel que produit par « Copier pour Sheet » avant cette
// version. Aucune colonne d'origine : tout doit retomber sur Annonce, sans décalage.
const HEADER_16 = ['Studio', 'Poste', 'Reel', 'Priorité', 'Mots-clés', 'À mettre en avant', 'Statut',
  'Date Envoi', 'Relance', 'Date Réponse', 'Date Entretien', 'Notes', 'Lien', 'Contact',
  'Email contact', 'Accroche'];
const ROW_16 = ['Mac Guff', 'Rigger', 'Rigging', 'Haute', 'Maya | Python', 'Arg 1 | Arg 2', 'Envoyé',
  '2026-01-05', '2026-01-12', '', '', 'RAS', 'https://ex.com', 'Mme Dupont',
  'rh@ex.com', 'Mon accroche'];
const [old16] = rowsToEntries([HEADER_16, ROW_16]);

// Format intermédiaire : la colonne Ville existe, pas encore l'origine.
const HEADER_17 = [...HEADER_16.slice(0, 13), 'Ville', ...HEADER_16.slice(13)];
const ROW_17 = [...ROW_16.slice(0, 13), 'Angoulême', ...ROW_16.slice(13)];
const [old17] = rowsToEntries([HEADER_17, ROW_17]);

check('CSV 16 col — studio', old16.studio, 'Mac Guff');
check('CSV 16 col — poste', old16.poste, 'Rigger');
check('CSV 16 col — reel', old16.reel, 'Rigging');
check('CSV 16 col — priorité', old16.priorite, 'Haute');
check('CSV 16 col — mots-clés', old16.motsCles, ['Maya', 'Python']);
check('CSV 16 col — arguments', old16.argumentsLettre, ['Arg 1', 'Arg 2']);
check('CSV 16 col — statut', old16.statut, 'Envoyé');
check('CSV 16 col — date envoi', old16.dateEnvoi, '2026-01-05');
check('CSV 16 col — relance', old16.relance, '2026-01-12');
check('CSV 16 col — notes', old16.notesEntretien, 'RAS');
check('CSV 16 col — lien', old16.lien, 'https://ex.com');
check('CSV 16 col — contact nom', old16.contact, 'Mme Dupont');
check('CSV 16 col — contact email', old16.contactEmail, 'rh@ex.com');
check('CSV 16 col — accroche', old16.accroche, 'Mon accroche');
check('CSV 16 col — origine par défaut', old16.origine, 'Annonce');
check('CSV 16 col — recommandant vide', old16.recommandant, '');
check('CSV 16 col — rôle vide', old16.recommandantRole, '');
check('CSV 16 col — ville absente', old16.ville, '');

check('CSV 17 col — ville relue', old17.ville, 'Angoulême');
check('CSV 17 col — contact non décalé', old17.contact, 'Mme Dupont');
check('CSV 17 col — email non décalé', old17.contactEmail, 'rh@ex.com');
check('CSV 17 col — accroche non décalée', old17.accroche, 'Mon accroche');
check('CSV 17 col — origine par défaut', old17.origine, 'Annonce');

// Format complet à 20 colonnes : les trois champs ajoutés sont relus sans confusion entre
// « Recommandant » et « Rôle recommandant ».
const HEADER_20 = [...HEADER_17, 'Origine', 'Recommandant', 'Rôle recommandant'];
const ROW_20 = [...ROW_17, 'Spontanée', 'Julie Martin', 'rigger chez eux'];
const [new20] = rowsToEntries([HEADER_20, ROW_20]);
check('CSV 20 col — origine', new20.origine, 'Spontanée');
check('CSV 20 col — recommandant', new20.recommandant, 'Julie Martin');
check('CSV 20 col — rôle', new20.recommandantRole, 'rigger chez eux');
check('CSV 20 col — accroche intacte', new20.accroche, 'Mon accroche');
check('CSV 20 col — email intact', new20.contactEmail, 'rh@ex.com');
check('CSV 20 col — ville intacte', new20.ville, 'Angoulême');

// Feuille rédigée à la main : une seule colonne Contact contenant une adresse.
const [manuel] = rowsToEntries([['Studio', 'Poste', 'Contact'], ['Illumination', 'Animateur', 'rh@illu.fr']]);
check('CSV manuel — email détecté', manuel.contactEmail, 'rh@illu.fr');
check('CSV manuel — nom vidé', manuel.contact, '');
check('CSV manuel — origine', manuel.origine, 'Annonce');

// ---------------------------------------------------------------- compileTemplate
const TPL = 'Bonjour {contact},\n\n{recommandation}\n\n{accroche}\n\nFin.';
check('modèle — recommandation vide supprime la ligne',
  compileTemplate(TPL, { contact: 'Mme Dupont', recommandation: '', accroche: 'Mon accroche.' }),
  'Bonjour Mme Dupont,\n\n\nMon accroche.\n\nFin.');
check('modèle — recommandation substituée',
  compileTemplate(TPL, { contact: 'Mme Dupont', recommandation: 'Julie m\'a envoyé.', accroche: 'A.' }),
  'Bonjour Mme Dupont,\n\nJulie m\'a envoyé.\n\nA.\n\nFin.');
check('modèle sans la variable rendu inchangé',
  compileTemplate('Bonjour {contact}.', { contact: 'Mme Dupont', recommandation: '' }),
  'Bonjour Mme Dupont.');
check('modèle — variable inconnue laissée telle quelle',
  compileTemplate('Reste {inconnue} ici.', { contact: '' }),
  'Reste {inconnue} ici.');
check('modèle — ouverture annonce',
  compileTemplate('Je vous écris {ouverture}.', { ouverture: 'au sujet de votre offre de poste de Rigger' }),
  'Je vous écris au sujet de votre offre de poste de Rigger.');

// ---------------------------------------------------------------- délais de relance
check('relance annonce inchangée à J+7', RELANCE_JOURS['Annonce'], 7);
check('relance spontanée à J+21', RELANCE_JOURS['Spontanée'], 21);

console.log(`\n${passed} assertions OK, ${failed} en échec.`);
process.exit(failed === 0 ? 0 : 1);
