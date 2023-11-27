# World of Darkness 5e Changelog


## In the Latest Release (3.0.1)

### From a player's side
* None, yet!

### From a developer's side
* Shifted various parts of main.js into their own files. [Veilza]

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