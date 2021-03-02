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

  // Migrate World Items
  // for ( let i of game.items.entities ) {
  //   try {
  //     const updateData = migrateItemData(i.data);
  //     if ( !isObjectEmpty(updateData) ) {
  //       console.log(`Migrating Item entity ${i.name}`);
  //       await i.update(updateData, {enforceTypes: false});
  //     }
  //   } catch(err) {
  //     err.message = `Failed dnd5e system migration for Item ${i.name}: ${err.message}`;
  //     console.error(err);
  //   }
  // }

  // Migrate Actor Override Tokens
  // for ( let s of game.scenes.entities ) {
  //   try {
  //     const updateData = migrateSceneData(s.data);
  //     if ( !isObjectEmpty(updateData) ) {
  //       console.log(`Migrating Scene entity ${s.name}`);
  //       await s.update(updateData, {enforceTypes: false});
  //     }
  //   } catch(err) {
  //     err.message = `Failed dnd5e system migration for Scene ${s.name}: ${err.message}`;
  //     console.error(err);
  //   }
  // }

  // Migrate World Compendium Packs
  // for ( let p of game.packs ) {
  //   if ( p.metadata.package !== "world" ) continue;
  //   if ( !["Actor", "Item", "Scene"].includes(p.metadata.entity) ) continue;
  //   await migrateCompendium(p);
  // }

  // Set the migration as complete
  // game.settings.set("vtm5e", "systemMigrationVersion", game.system.data.version);
  // ui.notifications.info(`VtM5e System Migration to version ${currentVersion} completed!`, {permanent: true});
  // ui.notifications.info(`VtM5e System Migration to version ${game.system.data.version} completed!`, {permanent: true});
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
// export const migrateCompendium = async function(pack) {
//   const entity = pack.metadata.entity;
//   if ( !["Actor", "Item", "Scene"].includes(entity) ) return;
//
//   // Unlock the pack for editing
//   const wasLocked = pack.locked;
//   await pack.configure({locked: false});
//
//   // Begin by requesting server-side data model migration and get the migrated content
//   await pack.migrate();
//   const content = await pack.getContent();
//
//   // Iterate over compendium entries - applying fine-tuned migration functions
//   for ( let ent of content ) {
//     let updateData = {};
//     try {
//       switch (entity) {
//         case "Actor":
//           updateData = migrateActorData(ent.data);
//           break;
//         case "Item":
//           updateData = migrateItemData(ent.data);
//           break;
//         case "Scene":
//           updateData = migrateSceneData(ent.data);
//           break;
//       }
//       if ( isObjectEmpty(updateData) ) continue;
//
//       // Save the entry, if data was changed
//       updateData["_id"] = ent._id;
//       await pack.updateEntity(updateData);
//       console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
//     }
//
//     // Handle migration failures
//     catch(err) {
//       err.message = `Failed dnd5e system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
//       console.error(err);
//     }
//   }
//
//   // Apply the original locked status for the pack
//   pack.configure({locked: wasLocked});
//   console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
// };

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
  ui.notifications.info(`${actor.name}`, {permanent: true});

  // Actor Data Updates
	_migrateActorTrackersToBoxes(actor, updateData);

  return updateData;
};

/* -------------------------------------------- */


/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {Object} actorData    The data object for an Actor
 * @return {Object}             The scrubbed Actor data
 */
function cleanActorData(actorData) {

  // Scrub system data
  const model = game.system.model.Actor[actorData.type];
  actorData.data = filterObject(actorData.data, model);

  // Scrub system flags
  const allowedFlags = CONFIG.DND5E.allowedActorFlags.reduce((obj, f) => {
    obj[f] = null;
    return obj;
  }, {});
  if ( actorData.flags.dnd5e ) {
    actorData.flags.dnd5e = filterObject(actorData.flags.dnd5e, allowedFlags);
  }

  // Return the scrubbed data
  return actorData;
}


/**
 * Migrate actors health/willpower trackers from a numerical wounds system to the box system.
 * Implementation version > 1.3.0
 */
function _migrateActorTrackersToBoxes(actorData, updateData) {
  const ad = actorData.data;
  //
  // // Work is needed if old data is present
  // const old = actorData.type === 'vehicle' ? ad?.attributes?.speed : ad?.attributes?.speed?.value;
  // const hasOld = old !== undefined;
  // if ( hasOld ) {
  //
  //   // If new data is not present, migrate the old data
  //   const hasNew = ad?.attributes?.movement?.walk !== undefined;
  //   if ( !hasNew && (typeof old === "string") ) {
  //     const s = (old || "").split(" ");
  //     if ( s.length > 0 ) updateData["data.attributes.movement.walk"] = Number.isNumeric(s[0]) ? parseInt(s[0]) : null;
  //   }
  //
  //   // Remove the old attribute
  //   updateData["data.attributes.-=speed"] = null;
  // }
  return updateData
}






/**
 * Purge the data model of any inner objects which have been flagged as _deprecated.
 * @param {object} data   The data to clean
 * @private
 */
// export function removeDeprecatedObjects(data) {
//   for ( let [k, v] of Object.entries(data) ) {
//     if ( getType(v) === "Object" ) {
//       if (v._deprecated === true) {
//         console.log(`Deleting deprecated object key ${k}`);
//         delete data[k];
//       }
//       else removeDeprecatedObjects(v);
//     }
//   }
//   return data;
// }
