/* global ui, game, Actor */

let worldVersion

export const migrateWorld = async () => {
  const currentVersion = game.data.system.data.version
  try {
    worldVersion = game.settings.get('vtm5e', 'worldVersion')
  } catch (e) {
    worldVersion = '1.5' // No version detected - Default to current 1.5
  }
  console.log('Current SchreckNet Layer : ' + worldVersion)
  console.log('Obtaining SchreckNet Layer : ' + currentVersion)
  if (worldVersion !== currentVersion &&
    worldVersion === '1.5' &&
    game.user.isGM) {
    ui.notifications.info('New version detected; Updating SchreckNet, please wait.')
    const updates = []
    for (const a of game.actors) {
      if (a.data.type !== 'character') continue
      updates.push({ _id: a.id, type: 'vampire' })
    }
    await Actor.updateDocuments(updates)
    game.settings.set('vtm5e', 'worldVersion', currentVersion)
    ui.notifications.info('Upgrade complete!')
  }
}
