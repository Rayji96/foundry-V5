/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BoilerplateActorSheet extends ActorSheet {

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
    const features = [];
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
        features.push(i);
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
    html.find('.vrollable').click(this._onVampireRoll.bind(this));

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
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

    /**
   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onVampireRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.roll) {
      let roll = new Roll(dataset.roll + "d10cs>5", this.actor.data.data);
      let label = dataset.label ? dataset.label : '';
      let roll_result = roll.evaluate();
      let hunger_dice = this.actor.data.data.hunger.value;
      let success = 0;
      let hunger_success = 0;
      roll_result.terms[0].results.forEach((dice, index) => {
        if (dice.success){
          if ((index + 1) > hunger_dice){
            success++
          }else{
            hunger_success++
          }
        }
      });

      label = label + `\nSuccesses: ${success}\nHunger Successes: ${hunger_success}\n`;

      roll_result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }
}
