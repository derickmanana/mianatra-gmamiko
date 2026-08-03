# LearnHub Manager

Créer une application Android (APK) moderne et compatible tous les téléphones Android ou iphone ( version 7 - 14 ) , simple, fluide et responsive, destinée à la gestion et à la consultation de cours, tutoriels et documents. L'application doit comporter deux interfaces distinctes : une Interface Administrateur et une Interface Étudiant.



=========================

1. INTERFACE D'ACCUEIL

=========================



Au lancement de l'application, afficher deux boutons :



• Administrateur

• Étudiant



=========================

2. INTERFACE ADMINISTRATEUR

=========================



L'accès à cette interface doit être protégé par un code d'accès.



Code Administrateur :

99910021



Si le code est incorrect :

Afficher le message :

"Code administrateur incorrect."



Si le code est correct :

Ouvrir le Tableau de Bord Administrateur.



=========================

TABLEAU DE BORD ADMIN

=========================



L'administrateur doit pouvoir :



✓ Créer un dossier



Exemple :



Pinduoduo



Taobao



1688



Alibaba



Marketing



Business



etc.



Chaque dossier doit être représenté sous forme de carte avec son nom.



L'administrateur peut :



• Ouvrir un dossier

• Modifier son nom

• Supprimer le dossier

• Ajouter un code d'accès au dossier (facultatif)



Exemple :



Code du dossier :

123456



Si aucun code n'est défini, le dossier est public.



=========================

3. CONTENU D'UN DOSSIER

=========================



Lorsqu'un dossier est ouvert, l'administrateur peut créer plusieurs Blocs.



Exemple :



Bloc 1 : Introduction



Bloc 2 : Tutoriel 1



Bloc 3 : Tutoriel 2



Bloc 4 : Astuces



Bloc 5 : Documents



etc.



Chaque bloc peut être :



• créé

• renommé

• supprimé

• réorganisé par glisser-déposer



=========================

4. CONTENU D'UN BLOC

=========================



Chaque bloc peut contenir plusieurs éléments.



L'administrateur peut ajouter autant d'éléments qu'il souhaite.



Types d'éléments acceptés :



• Image



• PDF



• Document Word (.doc/.docx)



• Lien Internet



• Texte riche



Les éléments peuvent être mélangés librement.



Exemple :



Image



Description



Image



PDF



Description



Lien



Word



Image



Description



etc.



Aucune limite.



=========================

5. GESTION DES IMAGES

=========================



Chaque image doit permettre :



• téléchargement depuis le téléphone



• affichage en grande taille



• zoom avec les doigts



• déplacement pendant le zoom



Sous chaque image :



Une très longue description.



Cette description doit accepter plusieurs milliers de caractères.



Exemple :



explications



cours



notes



astuces



observations



etc.



Le texte doit être lisible.



L'étudiant doit pouvoir :



• zoomer le texte



• augmenter la taille de lecture



• faire défiler facilement



=========================

6. PDF

=========================



Lorsqu'un PDF est ajouté :



Il doit être lisible directement dans l'application.



Ne pas télécharger le fichier.



Ouvrir directement le PDF dans un lecteur intégré.



Fonctions :



• zoom



• recherche



• défilement



=========================

7. DOCUMENT WORD

=========================



Même fonctionnement que le PDF.



Le document doit s'ouvrir directement dans l'application.



Sans téléchargement obligatoire.



=========================

8. LIENS

=========================



L'administrateur peut ajouter des liens.



Exemple :



https://...



Lorsqu'un étudiant clique :



Le lien s'ouvre dans le navigateur ou dans un WebView intégré.



=========================

9. MODIFICATION

=========================



L'administrateur peut :



Modifier



Supprimer



Ajouter



Réorganiser



Déplacer



Tous les contenus.



Chaque modification doit être sauvegardée.



=========================

10. SAUVEGARDE

=========================



Prévoir un bouton :



Enregistrer



Toutes les modifications doivent être sauvegardées automatiquement.



=========================

11. INTERFACE ÉTUDIANT

=========================



L'étudiant ne possède aucun accès administrateur.



Il peut uniquement consulter les contenus.



Page principale :



Liste de tous les dossiers créés.



Exemple :



📁 Pinduoduo



📁 Taobao



📁 Alibaba



📁 Marketing



etc.



=========================

12. DOSSIERS PROTÉGÉS

=========================



Si un dossier possède un code :



Avant de l'ouvrir :



Demander :



"Saisissez le code d'accès"



Si le code est bon :



ouvrir le dossier.



Sinon :



Afficher :



"Code incorrect."



=========================

13. CONSULTATION

=========================



Dans chaque bloc, l'étudiant peut :



Voir les images



Zoomer les images



Lire les longues descriptions



Zoomer les descriptions



Lire les PDF directement



Lire les documents Word directement



Ouvrir les liens



Faire défiler librement



=========================

14. DESIGN

=========================



Créer une interface moderne.



Style Material Design 3.



Couleurs :



Blanc



Bleu



Gris clair



Icônes modernes.



Animations fluides.



Responsive.



Optimisé pour smartphone Android.



=========================

15. BASE DE DONNÉES

=========================



Utiliser Supabase ou Firebase.



Les données doivent être synchronisées en temps réel.



Structure :



Dossiers



→ Blocs



→ Contenus



→ Images



→ Descriptions



→ PDF



→ Documents



→ Liens



=========================

16. FONCTIONS SUPPLÉMENTAIRES

=========================



Ajouter :



Recherche de dossiers



Recherche de blocs



Recherche de contenu



Confirmation avant suppression



Messages de succès



Messages d'erreur



Chargement avec indicateur (Loading)



Gestion des erreurs



=========================

17. OBJECTIF

=========================



Créer une petite application APK très simple à utiliser, rapide, stable et professionnelle, permettant à un administrateur de créer des dossiers de formation contenant des blocs, des images avec de longues explications, des fichiers PDF, des documents Word et des liens, tandis que les étudiants peuvent consulter facilement tous les contenus avec un affichage confortable, le zoom sur les images et le texte, ainsi qu'une lecture intégrée des documents, sans possibilité de modifier les données.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mianatra-gmamiko.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/063157a3-124e-4818-b2b6-755df1ae085e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
