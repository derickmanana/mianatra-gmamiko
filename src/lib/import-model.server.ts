// Modèle standard d'analyse d'importation Chine -> Madagascar (serveur uniquement).
// Sert de gabarit unique pour l'assistant IA et l'analyse de produits.

/** Règles de calcul imposées à l'IA pour toute importation chinoise. */
export const IMPORT_CALC_RULES = `## FITSIPIKA FIKAJIANA (tsy azo ihodivirana)
1. Vidiny sinoa : soraty amin'ny ¥ (CNY) ary ovay ho Ar. Lazao mazava ny taux ampiasainao ary marihina hoe "taux mety hiova".
2. Lanja fakturé aérien = max(lanja marina, lanja volumétrique). Lanja volumétrique (kg) = (L x l x H en cm) / 6000. Raha tsy misy dimensions, vinavino ary soraty "LANJA VINAVINA".
3. Maritime : kajio amin'ny m³ = (L x l x H en cm) / 1 000 000. Misy minimum matetika (0,5 m³ na 1 m³) : marihina.
4. Sarany fitaterana = tarif transitaire voatahiry x lanja/volume. Ampitahao farafahakeliny 2 transitaire ao amin'ny base.
5. Sarany fanampiny tsy maintsy tanisaina : frais plateforme/livraison interne Chine, frais mandefa (groupage), frais transitaire eto Madagasikara, fitaterana an-tanàna, fatiantoka (casse/perte) 3–5 %.
6. TSY manao kajy droits de douane : ny transitaire no mikarakara izany. Marihina fotsiny hoe "tafiditra amin'ny sarany transitaire".
7. Vidiny totaly débarqué isaky ny singa = (vidiny fividianana + fitaterana + sarany rehetra) / isan'ny entana.
8. Vidiny fivarotana atoro = vidiny débarqué x coefficient araka ny sokajy : 1,8–2,2 (produits volumineux), 2,2–2,8 (accessoires/mode), 2,8–3,5 (petits objets légers).
9. Tombony = vidiny fivarotana − vidiny débarqué. Aseho amin'ny Ar sy amin'ny %.
10. Aseho hatrany ny hypothèses rehetra nampiasaina (taux, lanja, tarif, coefficient).`;

/** Gabarit markdown obligatoire du rapport d'analyse produit. */
export const IMPORT_REPORT_TEMPLATE = `## RAFITRY NY TATITRA (arahaba tsy ovaina, markdown)

### 1. Famintinana
Fehezanteny 2–3 : inona ilay produit, mendrika ve, sarany totaly, tombony.

### 2. Mombamomba ny produit
Tabilao : Anarana | Plateforme | Rohy | Vidiny fividianana (¥ / Ar) | Isa | Lanja (marina na VINAVINA) | Habe/dimensions

### 3. Safidy fitaterana
Tabilao mampitaha : Transitaire | Fomba (aérien/maritime) | Tarif voatahiry | Fe-potoana | Sarany kajiana ho an'ity commande ity | Hevitra
Farano amin'ny hoe : **Fitaterana atoro : …** sy ny antony.

### 4. Sarany rehetra (débarqué)
Tabilao : Singa saran-karena | Sanda (Ar) | Fanamarihana. Ampidiro ny total sy ny vidiny isaky ny singa.

### 5. Varotra eto Madagasikara
Vidiny fivarotana atoro (fourchette), coefficient nampiasaina, fifaninanana, mpanjifa kendrena.

### 6. Tombony
Tombony isaky ny singa (Ar), tombony totaly (Ar), marge %, seuil de rentabilité (isan'ny entana tsy maintsy amidy).

### 7. Loza & fepetra manokana
Marefo (fragile), bateria (lithium — voafetra aérien), ranoka, aroma, marika (contrefaçon), volume be, saisonnalité. Marihina izay mihatra ihany.

### 8. Fanapahan-kevitra farany
Iray amin'ireto: **✅ Azo vidiana** / **⚠️ Azo vidiana saingy mitandrema** / **❌ Tsy azo vidiana** — miaraka amin'ny antony 2–3.

### 9. Dingana manaraka
3 hetsika mazava ho an'ny mpianatra (ohatra : mangataka échantillon, manamarina tarif amin'ny transitaire, manontany lanja amin'ny mpivarotra).

Farano amin'ny "Fahatokisana : AVO / ANTONONY / AMBANY" sy ny lisitry ny hypothèses.`;

/** Bloc complet à injecter dans un prompt d'analyse produit. */
export const IMPORT_MODEL_BLOCK = `${IMPORT_CALC_RULES}\n\n${IMPORT_REPORT_TEMPLATE}`;
