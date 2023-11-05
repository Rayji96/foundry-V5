/* global ui, game, foundry */

import { MigrateLegacySheets } from './migrate-legacy-sheets.js'
import { MigrateLocalization } from './migrate-localization.js'

let worldVersion

export const migrateWorld = async () => {
  // Only allow the Game Master to run this script
  if (!game.user.isGM) return

  // Store current version
  const currentVersion = game.system.version

  try {
    worldVersion = game.settings.get('vtm5e', 'worldVersion')
  } catch (e) {
    worldVersion = '1.5' // No version detected - Default to current 1.5
  }

  console.log('Current SchreckNet Layer v' + worldVersion)

  // If the world version is old, then push updates
  if (worldVersion !== currentVersion || worldVersion === '1.5') {
    const updates = []

    ui.notifications.info('New version detected; Updating SchreckNet, please wait.')
    console.log('Obtaining SchreckNet Layer v' + currentVersion)

    // Promise chain to go through the migration functions here
    // Migrate legacy sheets
    MigrateLegacySheets()
      .then(migrationIDs => {
        // Merge any legacy sheet updates so we can count them
        updates.concat(migrationIDs)

        // Migrate localization
        return MigrateLocalization()
      })
      .then(migrationIDs => {
        // Merge any localization updates so we can count them
        updates.concat(migrationIDs)

        // Only reload if there's 1 or more updates
        if (updates.length > 0) {
          ui.notifications.info('Upgrade complete! Foundry will now refresh in 10 seconds...')

          // Reload to implement the fixes after 10 seconds
          setTimeout(function () {
            foundry.utils.debouncedReload()
          }, 10000)
        } else {
          ui.notifications.info('No changes necessary! Welcome to version ' + currentVersion)
        }
      })

    // Update game version
    game.settings.set('vtm5e', 'worldVersion', currentVersion)
  }
}
