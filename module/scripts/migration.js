/* global ui, game, foundry */

import { MigrateLegacySheets } from './migration/migrate-legacy-sheets.js'
import { MigrateLocalization } from './migration/migrate-localization.js'
import { MigrateGamesystem } from './migration/migrate-gamesystem.js'
import { MigrateTrackers } from './migration/migrate-trackers.js'
import { MigrateSpecialties } from './migration/migrate-specialties.js'

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

  async function updateWorld() {
    if (worldVersion !== currentVersion || worldVersion === '1.5') {
      const updates = []
  
      ui.notifications.info('New version detected Updating SchreckNet, please wait.')
      console.log('Obtaining SchreckNet Layer v' + currentVersion)
  
      try {
        // Migrate legacy sheets
        const migrationIDs1 = await MigrateLegacySheets()
        updates.concat(migrationIDs1)
  
        // Migrate localization
        const migrationIDs2 = await MigrateLocalization()
        updates.concat(migrationIDs2)
  
        // Migrate gamesystem data
        const migrationIDs3 = await MigrateGamesystem()
        updates.concat(migrationIDs3)
  
        // Migrate health and willpower tracker data
        const migrationIDs4 = await MigrateTrackers()
        updates.concat(migrationIDs4)

        // Migrate specialties into their respective skills
        const migrationIDs5 = await MigrateSpecialties()
        updates.concat(migrationIDs5)
  
        // Only reload if there's 1 or more updates
        if (updates.length > 0) {
          ui.notifications.info('Upgrade complete! Foundry will now refresh in 10 seconds...')
  
          // Reload to implement the fixes after 10 seconds
          setTimeout(() => {
            foundry.utils.debouncedReload()
          }, 10000)
        } else {
          ui.notifications.info('No changes necessary! Welcome to version ' + currentVersion)
        }
  
        // Update game version
        game.settings.set('vtm5e', 'worldVersion', currentVersion)
      } catch (error) {
        console.error('Error during update:', error)
      }
    }
  }
  
  updateWorld()
}
