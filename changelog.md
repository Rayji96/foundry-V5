# World of Darkness 5e Changelog

## In the Latest Release (3.1.2)

### From a player's side
* Updated Italian translation [Arcadio21]
* Fixed Ghoul sheets being unable to make dialogue rolls [Veilza]
* Updated Werewolf dice to allow willpower rerolling of non-brutal Rage dice [Veilza]
* New disciplines/rituals, gifts/rites, and edges will use icons different from the default item icons now [Veilza]
* Fixed the enrichment of item descriptions, allowing journal entries and other Foundry items to be linked to disciplines, gifts, etc [Veilza]

### From a developer's side
* Reorganized the dice icon paths and centralised where they're obtained from into one file [Veilza]
* Moved dice-so-nice.js into the 'dice' folder [Veilza]
* Fixed an issue where the migration script would get stuck on migrating health/willpower trackers [Veilza]

## 3.1.1
* Removed an unnecessary field on the Hunter biography page [Veilza]
* Fixed an issue that prevented Coterie and Cell sheets from loading [Veilza]
* Add a separate localization for the word "Drive" specific to the Hunter term [Veilza]

## 3.1.0
* Fixed Discipline Rouse rerolls to properly display what was rerolled, and to properly reroll dice twice and keep highest between each roll. [Veilza]
* Add Macro compendium and a couple of useful macros for storytellers [Veilza]
* The navigation bar on sheets will now use the right cursor type and properly expand the active background to either side of the tab. [Veilza]
* Fixed the items on the Features tab being unable to be expanded [Veilza]
* Added the ability for actor health and willpower to be displayed on token bars [Veilza]
* Shifted various parts of main.js into their own files. [Veilza]
* Moved the "gamesystem" definition to the actor template [Veilza]
* Updated "vtm5e.css" to "wod5e.css"
* Moved various parts of the wod5e.css file to other files, for maintainability [Veilza]
* Alterations to the dice faces to make them more colourblind-friendly [LorduFreeman]

## 3.0.0

* Werewolf 5th Edition support [Veilza]
* Overhaul to the sheets' designs, making them more consistent across the different splats [Veilza]
* Fixes to Dark Mode and its various styling [Veilza]
* "Legacy" sheets that were made before a certain version have now been properly migrated to "Vampire" sheets [Veilza]
* Ghouls will now take Aggravated damage upon clicking the "Rouse" button on discipline powers greater than level 1 [Veilza]
* Disciplines now have a "Cost" field to input the number of appropriate Rouse checks. [Veilza]
* Added this Changelog file [Veilza]
* Fix input fields on item sheets being hard to read [Veilza]
* Hunter Edges, Vampire Disciplines/Rituals, and Werewolf Gifts/Rites will now all be sorted by level first and then alphabetically [Veilza]
* Edges, Disciplines/Rituals, and Gifts/Rites will now have a red effect overlayed on their icons if they're rollable. [Veilza]
* Various fields on the Hunter and Vampire sheets will no longer be hidden until the actor fills in Cell/Clan. [Veilza]
* Added Werewolf dice and updated the styling on the other splat's dice [LorduFreeman]
* Various styling fixes [LorduFreeman]
* Rouse checks on Vampire Disciplines will now add hunger for all failed dice [Veilza]
* Rouse checks will now display rerolled dice in chat as greyed out [Veilza]
* Actor banners at the top of character sheets can now be disabled within the settings [Veilza]
* Reorganized sheet partials [Veilza]
* Reworked how the actor dialogue is localized [Veilza]
* Reworked how the various splats' dice are called [Veilza]
* The system now uses "WoDActor" and "WoDItem" as the export classes for base actors/items and their functionality [Veilza]
* Reworked the migration scripts [Veilza]
* All instances of "VTM5E" in localization and CSS classes have now been changed to "WOD5E," with a migration script to fix any sheets made from before this fix [Veilza]

[Veilza]: https://github.com/Veilza
[LorduFreeman]: https://github.com/LorduFreeman
[Arcadio21]: https://github.com/Arcadio21