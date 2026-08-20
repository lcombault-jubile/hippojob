/*
 * Tests de bout en bout — HippoJob.
 *
 * Why: tests/non-regression.mjs ne couvre que les fonctions pures. Tout ce qui touche au
 * DOM — bascule de mode, bandeau d'avertissement, filtres, contenu réellement exporté —
 * n'était vérifié qu'à la main. Ces tests couvrent les parcours où une régression est à la
 * fois invisible et coûteuse : une lettre partie avec la mauvaise phrase d'ouverture, une
 * recommandation perdue, un dossier historique mal migré.
 *
 * Lancement : npm run test:e2e
 */
import { test, expect } from '@playwright/test';

/** Profil complet : sans lui, le générateur affiche des avertissements qui parasitent les assertions. */
const PROFIL = {
  nom: 'Hippolyte Combault',
  telephone: '06 00 00 00 00',
  email: 'hippolyte@example.com',
  portfolio: 'https://portfolio.example.com',
  cv: 'https://cv.example.com',
  reelAnimation: 'https://reel.example.com/animation',
  reelRigging: 'https://reel.example.com/rigging'
};

/**
 * Dossier tel qu'il existe dans une sauvegarde antérieure à cette version : ni `origine`,
 * ni `recommandant`. C'est le cas de rétrocompatibilité qui compte.
 */
const DOSSIER_HISTORIQUE = {
  id: 'old1', studio: 'Ancien Studio', poste: 'Rigger', reel: 'Rigging', priorite: 'Haute',
  motsCles: ['Maya'], argumentsLettre: ['Argument historique.'], statut: 'Envoyé',
  dateEnvoi: '2026-01-01', relance: '', dateReponse: '', dateEntretien: '',
  notesEntretien: '', lien: '', accroche: 'Accroche historique.',
  contact: 'Mme Ancienne', contactEmail: 'rh@ancien.fr'
};

/**
 * Charge la page avec un stockage local pré-rempli.
 * @param {import('@playwright/test').Page} page
 * @param {Object[]} entries - Dossiers à injecter avant le chargement du script
 */
async function ouvrir(page, entries = []) {
  await page.addInitScript(([e, p]) => {
    localStorage.setItem('candidatures-list', JSON.stringify(e));
    localStorage.setItem('candidatures-profil', JSON.stringify(p));
    localStorage.setItem('candidatures-derniere-sauvegarde', new Date().toISOString().slice(0, 10));
  }, [entries, PROFIL]);
  await page.goto('/index.html');
  await expect(page.locator('#section-suivi')).toBeVisible();
}

/**
 * Remplit et valide le formulaire spontané, puis ouvre le générateur.
 * @param {import('@playwright/test').Page} page
 * @param {{studio: string, poste: string, recommandant?: string, role?: string}} data
 */
async function creerSpontanee(page, data) {
  await page.click('#spontaneeBtn');
  await page.fill('#dStudio', data.studio);
  await page.fill('#dPoste', data.poste);
  if (data.recommandant) await page.fill('#dRecommandant', data.recommandant);
  if (data.role) await page.fill('#dRecommandantRole', data.role);
  await page.fill('#dAccroche', 'Accroche de test.');
  await page.fill('#dArguments', 'Argument un.\nArgument deux.');
  await page.fill('#dContactNom', 'Mme Dupont');
  await page.fill('#dContactEmail', 'rh@studio.fr');
  await page.click('#addAndWriteBtn');
  await expect(page.locator('#docGeneratorPanel')).toBeVisible();
}

/**
 * Lit les dossiers réellement enregistrés en localStorage.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Object[]>}
 */
function dossiers(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('candidatures-list') || '[]'));
}

// ---------------------------------------------------------------- rétrocompatibilité

test('un dossier antérieur au champ origine reste affiché et compte comme réponse à annonce', async ({ page }) => {
  await ouvrir(page, [DOSSIER_HISTORIQUE]);

  await expect(page.locator('#sheetBody tr')).toHaveCount(1);
  await expect(page.locator('#sheetBody')).toContainText('Ancien Studio');
  // Aucun marqueur d'origine : le dossier n'est pas une spontanée.
  await expect(page.locator('#sheetBody')).not.toContainText('✋ Spontanée');

  // Le statut historique n'a pas été réinitialisé par la migration.
  await expect(page.locator('#sheetBody select.statut')).toHaveValue('Envoyé');

  // Le filtre « Réponses à annonce » le retient.
  await page.selectOption('#filterOrigine', 'Annonce');
  await expect(page.locator('#sheetBody tr')).toHaveCount(1);
  await page.selectOption('#filterOrigine', 'Spontanée');
  await expect(page.locator('#sheetBody tr')).toHaveCount(0);
});

// ---------------------------------------------------------------- parcours spontané

test('une spontanée recommandée produit une lettre citant le recommandant, sans parler d’offre', async ({ page }) => {
  await ouvrir(page);
  await creerSpontanee(page, {
    studio: 'Illumination Mac Guff', poste: 'Junior Rigger',
    recommandant: 'Julie Martin', role: 'rigger dans votre équipe'
  });

  const lettre = await page.inputValue('#genDocText');
  expect(lettre).toContain("Julie Martin, rigger dans votre équipe, m'a suggéré de vous écrire.");
  expect(lettre).toContain('je vous écris spontanément, pour un poste de Junior Rigger');
  // Le piège que cette feature existe pour éviter : inventer une offre inexistante.
  expect(lettre).not.toContain('votre offre');

  await expect(page.locator('#docGenWarning'))
    .toContainText('Vérifier sur le site du studio');

  const [e] = await dossiers(page);
  expect(e.origine).toBe('Spontanée');
  expect(e.recommandant).toBe('Julie Martin');
  expect(e.lien).toBe('');
});

test('une spontanée froide n’ajoute aucune phrase de recommandation ni ligne orpheline', async ({ page }) => {
  await ouvrir(page);
  await creerSpontanee(page, { studio: 'Studio Froid', poste: 'Animateur 3D' });

  const lettre = await page.inputValue('#genDocText');
  expect(lettre).not.toContain("m'a suggéré de vous écrire");
  expect(lettre).toContain('je vous écris spontanément, pour un poste de Animateur 3D');
  // La ligne vide de {recommandation} ne doit pas laisser de trou dans la mise en page.
  expect(lettre).not.toMatch(/\n{3,}/);

  const [e] = await dossiers(page);
  expect(e.origine).toBe('Spontanée');
  expect(e.recommandant).toBe('');
});

test('la relance d’une spontanée est planifiée à J+21', async ({ page }) => {
  await ouvrir(page);
  await creerSpontanee(page, { studio: 'Studio Delai', poste: 'Rigger' });
  await page.click('#markSentBtn');

  const [e] = await dossiers(page);
  expect(e.statut).toBe('Envoyé');
  const jours = Math.round((new Date(e.relance) - new Date(e.dateEnvoi)) / 86400000);
  expect(jours).toBe(21);
});

// ---------------------------------------------------------------- non-régression annonce

test('le parcours réponse à annonce est inchangé : lien, ouverture, relance à J+7', async ({ page }) => {
  await ouvrir(page);

  await page.fill('#jobLink', 'https://exemple.com/offre');
  await page.fill('#jobText', 'Nous recherchons un Rigger junior.');
  await page.click('#copyPromptBtn');

  await page.fill('#manualResponseText', JSON.stringify({
    studio: 'Studio Annonce', poste: 'Rigger', reel: 'Rigging', motsCles: ['Maya'],
    argumentsLettre: ['Argument.'], priorite: 'Haute', note: 'Note.', accroche: 'Accroche annonce.'
  }));
  await page.click('#useManualResponseBtn');

  // Le formulaire s'ouvre en mode annonce : champ lien présent, bloc recommandation absent.
  await expect(page.locator('#dLienWrap')).toBeVisible();
  await expect(page.locator('#dSpontaneeWrap')).toBeHidden();
  await expect(page.locator('#dLien')).toHaveValue('https://exemple.com/offre');

  await page.fill('#dContactNom', 'Mme Recruteuse');
  await page.click('#addAndWriteBtn');

  const lettre = await page.inputValue('#genDocText');
  expect(lettre).toContain('je vous écris au sujet de votre offre de poste de Rigger');
  expect(lettre).not.toContain("m'a suggéré de vous écrire");
  await expect(page.locator('#docGenWarning')).not.toContainText('Candidature spontanée');

  await page.click('#markSentBtn');
  const [e] = await dossiers(page);
  expect(e.origine).toBe('Annonce');
  expect(e.lien).toBe('https://exemple.com/offre');
  const jours = Math.round((new Date(e.relance) - new Date(e.dateEnvoi)) / 86400000);
  expect(jours).toBe(7);
});

// ---------------------------------------------------------------- garde-fou de bascule

test('lancer une analyse d’annonce pendant une saisie spontanée demande confirmation', async ({ page }) => {
  await ouvrir(page);
  await page.click('#spontaneeBtn');
  await page.fill('#dStudio', 'Mac Guff');
  await page.fill('#dRecommandant', 'Julie Martin');
  await page.fill('#jobText', 'Une offre.');

  // Refus : rien ne bouge.
  page.once('dialog', d => d.dismiss());
  await page.click('#copyPromptBtn');
  await expect(page.locator('#dSpontaneeWrap')).toBeVisible();
  await expect(page.locator('#dRecommandant')).toHaveValue('Julie Martin');

  // Acceptation : bascule effective et champs de recommandation vidés.
  page.once('dialog', d => d.accept());
  await page.click('#copyPromptBtn');
  await expect(page.locator('#dSpontaneeWrap')).toBeHidden();
  await expect(page.locator('#dLienWrap')).toBeVisible();
  await expect(page.locator('#dRecommandant')).toHaveValue('');
});

test('un formulaire spontané vierge bascule sans confirmation', async ({ page }) => {
  await ouvrir(page);
  await page.click('#spontaneeBtn');
  await page.fill('#jobText', 'Une offre.');

  let demande = false;
  page.on('dialog', d => { demande = true; d.accept(); });
  await page.click('#copyPromptBtn');
  await expect(page.locator('#dSpontaneeWrap')).toBeHidden();
  expect(demande).toBe(false);
});

// ---------------------------------------------------------------- suivi, filtres, stats

test('le tableau distingue les origines et les stats les ventilent', async ({ page }) => {
  await ouvrir(page, [DOSSIER_HISTORIQUE]);

  await creerSpontanee(page, { studio: 'Studio Reco', poste: 'Rigger', recommandant: 'Julie Martin' });
  await page.click('#markSentBtn');
  await creerSpontanee(page, { studio: 'Studio Froid', poste: 'Animateur' });
  await page.click('#markSentBtn');

  await expect(page.locator('#sheetBody tr')).toHaveCount(3);
  await expect(page.locator('#sheetBody')).toContainText('✋ Spontanée · recommandée par Julie Martin');

  await page.selectOption('#filterOrigine', 'Spontanée recommandée');
  await expect(page.locator('#sheetBody tr')).toHaveCount(1);
  await expect(page.locator('#sheetBody')).toContainText('Studio Reco');

  await page.selectOption('#filterOrigine', 'Spontanée');
  await expect(page.locator('#sheetBody tr')).toHaveCount(2);

  await page.selectOption('#filterOrigine', '');
  const stats = await page.locator('#statsOrigine').innerText();
  expect(stats).toContain('RÉPONSE À ANNONCE');
  expect(stats).toContain('SPONTANÉE FROIDE');
  expect(stats).toContain('SPONTANÉE RECOMMANDÉE');
  // Un envoi par catégorie : le dossier historique, la recommandée, la froide.
  expect(stats.match(/sur 1 envoi/g)).toHaveLength(3);
});

test('l’export vers Sheets ajoute les trois colonnes en fin de ligne, sans décaler les autres', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ouvrir(page, [DOSSIER_HISTORIQUE]);
  await creerSpontanee(page, { studio: 'Studio Reco', poste: 'Rigger', recommandant: 'Julie Martin', role: 'rigger dans votre équipe' });

  await page.click('#copyAllBtn');
  const copie = await page.evaluate(() => navigator.clipboard.readText());
  const lignes = copie.split('\n');
  const entetes = lignes[0].split('\t');

  expect(entetes).toHaveLength(19);
  expect(entetes.slice(0, 16)).toEqual(['Studio', 'Poste', 'Reel', 'Priorité', 'Mots-clés',
    'À mettre en avant', 'Statut', 'Date Envoi', 'Relance', 'Date Réponse', 'Date Entretien',
    'Notes', 'Lien', 'Contact', 'Email contact', 'Accroche']);
  expect(entetes.slice(16)).toEqual(['Origine', 'Recommandant', 'Rôle recommandant']);
  expect(lignes.every(l => l.split('\t').length === 19)).toBe(true);

  const spontanee = lignes.find(l => l.startsWith('Studio Reco')).split('\t');
  expect(spontanee.slice(16)).toEqual(['Spontanée', 'Julie Martin', 'rigger dans votre équipe']);
  const historique = lignes.find(l => l.startsWith('Ancien Studio')).split('\t');
  expect(historique.slice(16)).toEqual(['Annonce', '', '']);
});
