/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class VampireActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["vtm5e", "sheet", "actor"],
      template: "systems/vtm5e/templates/actor/actor-sheet.html",
      width: 800,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    // for (let attr of Object.values(data.data.attributes)) {
    //   attr.isCheckbox = attr.dtype === "Boolean";
    // }

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const specialties = [];
    const gear = [];
    const features = {
      "merit": [],
      "flaw": []
    };
    const disciplines = {
      "animalism": [],
      "auspex": [],
      "celerity": [],
      "dominate": [],
      "fortitude": [],
      "obfuscate": [],
      "potence": [],
      "presence": [],
      "protean": [],
      "sorcery": [],
      "rituals": [],
      "alchemy": []
    };

    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to specialties.
      if (i.type === 'specialty') {
        specialties.push(i);
      }
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features[i.data.featuretype].push(i);
      }
      // Append to disciplines.
      else if (i.type === 'power') {
        if (i.data.discipline != undefined) {
          disciplines[i.data.discipline].push(i);
        }
      }
    }

    // Assign and return
    actorData.specialties = specialties;
    actorData.gear = gear;
    actorData.features = features;
    actorData.disciplines_list = disciplines;
    console.log(actorData)
    console.log(sheetData.items)
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Rollable Vampire abilities.
    html.find('.vrollable').click(this._onVampireRollDialog.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    if (type == "specialty"){
      data.skill = "" 
    }
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll + "d10cs>5", this.actor.data.data);
      let label = dataset.label ? dataset.label : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  //roll helper
  _vampireRoll(num_dice, actor, label = ""){
    let roll = new Roll(num_dice + "d10cs>5", actor.data.data);
    let roll_result = roll.evaluate();
    let hunger_dice = actor.data.data.hunger.value;

    let success = 0;
    let crit_success = 0;
    let hunger_crit_fail = false;
    let hunger_crit_success = false;

    roll_result.terms[0].results.forEach((dice, index) => {
      if (dice.success){
        success++;
      }
      if (dice.result == 10){
        crit_success++;
      }
      if ((index + 1) <= hunger_dice){
        if (dice.result == 10){
          hunger_crit_success = true;
        }else if (dice.result == 1){
          hunger_crit_fail = true;
        }
      }
    });

    crit_success = Math.floor(crit_success/2);
    success = (crit_success * 2) + success;

    label = `<p class="roll-label uppercase">${label}</p>`

    if (hunger_crit_success && crit_success){
      label = label + `<p class="roll-content">Messy Critical!</p>`;
    }
    else if (crit_success){
      label = label + `<p class="roll-content">Critical Success!</p>`;
    }
    if (hunger_crit_fail){
      label = label + `<p class="roll-content">Possible Bestial Failure!</p>`;
    }

    label = label + `<p class="roll-label">Successes: ${success}</p>`;

    roll_result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: label
    });
  }

  /**
   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onVampireRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let options = '';
    for (const [key, value] of Object.entries(this.actor.data.data.abilities)) {
      options = options.concat(`<option value="${key}">${key}</option>`);
    }

    let template = `
      <form>
          <div class="form-group">
              <label>Select ability</label>
              <select id="abilitySelect">${options}</select>
          </div>  
          <div class="form-group">
              <label>Modifier?</label>
              <input type="text" id="inputMod" value="0">
          </div>
      </form>`;
  
    let buttons = {};
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Roll',
        callback: async (html) => {
          const ability = html.find('#abilitySelect')[0].value;
          const modifier = parseInt(html.find('#inputMod')[0].value || 0);
          const ability_val = this.actor.data.data.abilities[ability].value
          let num_dice = ability_val + parseInt(dataset.roll) + modifier
          this._vampireRoll(num_dice, this.actor, `${dataset.label} + ${ability}`);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: 'Cancel',
      },
    };
  
    new Dialog({
      title: `Rolling ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw',
    }).render(true);
  }

  
  // _onVampireRoll(event) {
  //   event.preventDefault();
  //   const element = event.currentTarget;
  //   const dataset = element.dataset;

  //   if (dataset.roll) {
  //     this._vampireRoll(dataset.roll, this.actor, dataset.label);
  //   }
  // }
}
