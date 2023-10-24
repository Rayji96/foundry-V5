/* global ui, game, Actor */

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
    ui.notifications.info('New version detected; Updating SchreckNet, please wait.')
    console.log('Obtaining SchreckNet Layer v' + currentVersion)

    // Collect invalid actors and correct them
    for (const id of game.actors.invalidDocumentIds) {
      const actor = game.actors.getInvalid(id)

      // Migrate any legacy sheets to vampire sheets
      if (actor.type === 'character') {
        ui.notifications.info(`Fixing actor ${actor.name}: Changing Legacy Sheet to Vampire Sheet.`)

        await actor.update({ 'type': 'vampire' })
      }
    }

    // Send notification to the GM
    ui.notifications.info('Upgrade complete! Foundry will now refresh...')

    // Update game version
    game.settings.set('vtm5e', 'worldVersion', currentVersion)
    
    // Reload to implement the fixes after 5 seconds
    await setTimeout(5000)
    foundry.utils.debouncedReload()
  }
}
