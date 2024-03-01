/* global ui, game */

export const MigrateItemImages = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    // Fix image data across items (v4.0.0)
    for (const actor of actorsList) {
      const actorItems = actor.items
      let updatedItems = []
      let hasFixedItems = false

      for (const item of actorItems) {
        // Check if there are any instances of /systems/vtm5e/assets/icons/powers/ in the actor data
        if (countInstances(item.img, '/systems/vtm5e/assets/icons/powers/') > 0) {
          hasFixedItems = true

          // Create a new object with the updated 'img' property
          const updatedItem = {
            _id: item._id, // Preserve the original _id
            ...item.toObject(),
            img: item.img.replace(/\/systems\/vtm5e\/assets\/icons\/powers\//, '/systems/vtm5e/assets/icons/items/')
          }

          // Push the updated item to the array
          updatedItems.push(updatedItem)
        }
      }

      if (hasFixedItems) {
        // Update the actor's data with the new information
        actor.updateEmbeddedDocuments('Item', updatedItems)
        ui.notifications.info(`Fixing actor ${actor.name}: Migrating image data.`)
      }

      // Increase the counter and continue
      counter++

      // Only resolve when we're finished going through all the actors.
      if (counter === totalIterations) {
        resolve(migrationIDs)
      }
    }

    // Function to search through the given string
    function countInstances (string) {
      let count = 0

      // Regex
      const regex = new RegExp(/\/systems\/vtm5e\/assets\/icons\/powers\//, 'g')
      const matches = string.match(regex)

      // So long as there's some matches, increase the count
      if (matches !== null) {
        count += matches.length
      }

      return count
    }
  })
}
