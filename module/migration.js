/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function() {
  ui.notifications.info(`Applying VtM5e System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});
  // Migrate World Actors
  for ( let a of game.actors.entities ) {
    try {
      const updateData = migrateActorData(a.data);
      if ( !isObjectEmpty(updateData) ) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, {enforceTypes: false});
      }
    } catch(err) {
      err.message = `Failed VtM5e system migration for Actor ${a.name}: ${err.message}`;
      console.error(err);
    }
  }
  ui.notifications.info(`Migration's Complete for version ${game.system.data.version}.`, {permanent: true});
};


/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {object} actor    The actor data object to update
 * @return {Object}         The updateData to apply
 */
export const migrateActorData = function(actor) {
  const updateData = {};
	// ui.notifications.info(`Actor: ${actor.name} now`, {permanent: true});

  // Actor Data Updates
	_migrateActorTrackersToBoxes(actor, updateData);

  return updateData;
};

/* -------------------------------------------- */



/**
 * Migrate actors health/willpower trackers from a numerical wounds system to the box system.
 * Implementation version > 1.3.0
 */
function _migrateActorTrackersToBoxes(actorData, updateData) {
  const ad = actorData.data;
	// Check if Actor Contains old Tracker data:
	const trackers = ["health", "willpower"]
	const states = ['-', '/','x']
	let needsMigration = false;

	for (let tracker of trackers){
		const fields = ["aggravated", "superficial"]
		for (let field of fields) {
			if (typeof ad[tracker][field] !== "undefined") {
				// ui.notifications.info(`Actor: ${actorData.name} Requires Migration`, {permanent: true});
				needsMigration = true;
			}
		}
	}
	if (needsMigration){
		for (let tracker of trackers) {
			const max = 10;
			let current = 10;
			const aggravated = ad[tracker]['aggravated']
			const superficial = ad[tracker]['superficial']
			let boxes = []
			for (let i=0; i < aggravated;i++){
				boxes.push ("x")
				current--
			}
			for (let i=0; i < superficial;i++){
				boxes.push ("/")
				current--
			}
			for (let i=0; i < current;i++){
				boxes.push ("-")
			}
			updateData[`data.${tracker}.max`] = 10;
			updateData[`data.${tracker}.current`] = current;
			updateData[`data.${tracker}.boxes`] = boxes;
			updateData[`data.${tracker}.states`] = states;
			// remove old Tracker Values
			updateData[`data.${tracker}.-=aggravated`] = null;
			updateData[`data.${tracker}.-=superficial`] = null;


		}
	}
  return updateData
}






