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
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    // TODO: confirm that I can finish and use this list
    const BLOOD_POTENCY = [
      {
        "surge": game.i18n.localize("VTM5E.None"),
        "mend": game.i18n.localize("VTM5E.1SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.None"),
        "rouse": game.i18n.localize("VTM5E.None"),
        "bane": "0",
        "feeding": game.i18n.localize("VTM5E.NoEffect")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add1Dice"),
        "mend": game.i18n.localize("VTM5E.1SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.None"),
        "rouse": game.i18n.localize("VTM5E.Level1"),
        "bane": "1",
        "feeding": game.i18n.localize("VTM5E.NoEffect")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add1Dice"),
        "mend": game.i18n.localize("VTM5E.2SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add1Dice"),
        "rouse": game.i18n.localize("VTM5E.Level1"),
        "bane": "1",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty1")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add2Dice"),
        "mend": game.i18n.localize("VTM5E.2SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add1Dice"),
        "rouse": game.i18n.localize("VTM5E.Level2"),
        "bane": "2",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty2")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add2Dice"),
        "mend": game.i18n.localize("VTM5E.3SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add2Dice"),
        "rouse": game.i18n.localize("VTM5E.Level2"),
        "bane": "2",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty3")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add3Dice"),
        "mend": game.i18n.localize("VTM5E.3SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add2Dice"),
        "rouse": game.i18n.localize("VTM5E.Level3"),
        "bane": "3",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty4")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add3Dice"),
        "mend": game.i18n.localize("VTM5E.3SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add3Dice"),
        "rouse": game.i18n.localize("VTM5E.Level3"),
        "bane": "3",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty5")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add4Dice"),
        "mend": game.i18n.localize("VTM5E.3SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add3Dice"),
        "rouse": game.i18n.localize("VTM5E.Level4"),
        "bane": "4",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty5")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add4Dice"),
        "mend": game.i18n.localize("VTM5E.4SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add4Dice"),
        "rouse": game.i18n.localize("VTM5E.Level4"),
        "bane": "4",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty6")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add5Dice"),
        "mend": game.i18n.localize("VTM5E.4SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add4Dice"),
        "rouse": game.i18n.localize("VTM5E.Level5"),
        "bane": "5",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty6")
      },
      {
        "surge": game.i18n.localize("VTM5E.Add5Dice"),
        "mend": game.i18n.localize("VTM5E.5SuperficialDamage"),
        "power": game.i18n.localize("VTM5E.Add5Dice"),
        "rouse": game.i18n.localize("VTM5E.Level5"),
        "bane": "5",
        "feeding": game.i18n.localize("VTM5E.FeedingPenalty7")
      }
    ]
    data.dtypes = ["String", "Number", "Boolean"];

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    data.blood_potency = BLOOD_POTENCY

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
      "oblivion": [],
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
          if (!this.actor.data.data.disciplines[i.data.discipline].visible){
            this.actor.update({[`data.disciplines.${i.data.discipline}.visible`]: true});
          }
        }
      }
    }

    // Assign and return
    actorData.specialties = specialties;
    actorData.gear = gear;
    actorData.features = features;
    actorData.disciplines_list = disciplines;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Make Discipline visible
    html.find('.discipline-create').click(this._onShowDiscipline.bind(this));

    // Make Discipline hidden
    html.find('.discipline-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset;
      this.actor.update({[`data.disciplines.${data.discipline}.visible`]: false});
    });

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

    // Rollable Vampire abilities.
    html.find('.power-rollable').click(this._onVampireRoll.bind(this));

    // Drag events for macros.
    // if (this.actor.owner) {
    //   let handler = ev => this._onDragItemStart(ev);
    //   html.find('li.item').each((i, li) => {
    //     if (li.classList.contains("inventory-header")) return;
    //     li.setAttribute("draggable", true);
    //     li.addEventListener("dragstart", handler, false);
    //   });
    // }
  }

  /**
   * Handle making a discipline visible
   * @param {Event} event   The originating click event
   * @private
   */
  _onShowDiscipline(event){
    event.preventDefault();
    let options = '';
    for (const [key, value] of Object.entries(this.actor.data.data.disciplines)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`);
    }

    let template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectDiscipline')}</label>
              <select id="disciplineSelect">${options}</select>
          </div>
      </form>`;
  
    let buttons = {};
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const discipline = html.find('#disciplineSelect')[0].value;
          this.actor.update({[`data.disciplines.${discipline}.visible`]: true});
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel'),
      },
    };
  
    new Dialog({
      title: game.i18n.localize('VTM5E.AddDiscipline'),
      content: template,
      buttons: buttons,
      default: 'draw',
    }).render(true);
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
      let roll_result = roll.evaluate();

      let success = 0;
      let crit_success = 0;
      let fail = 0;

      roll_result.terms[0].results.forEach((dice, index) => {
        if (dice.success){
          if (dice.result == 10){
            crit_success++;
          }else{
            success++;
          }
        }else{
          fail++
        }
      });

      let total_crit_success = 0
      total_crit_success = Math.floor(crit_success/2);
      let total_success = (total_crit_success * 2) + success + crit_success;

      let label = dataset.label ? `<p class="roll-label uppercase">${dataset.label}</p>` : '';

      if (total_crit_success){
        label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.CriticalSuccess')}</p>`;
      }
  
      label = label + `<p class="roll-label">${game.i18n.localize('VTM5E.Successes')}: ${total_success}</p>`;

      for (var i = 0, j = crit_success; i < j; i++) {
        label = label + `<img src="systems/vtm5e/assets/images/normal-crit.png" alt="Normal Crit" class="roll-img">`;
      }
      for (var i = 0, j = success; i < j; i++) {
        label = label + `<img src="systems/vtm5e/assets/images/normal-success.png" alt="Normal Success" class="roll-img">`;
      }
      for (var i = 0, j = fail; i < j; i++) {
        label = label + `<img src="systems/vtm5e/assets/images/normal-fail.png" alt="Normal Fail" class="roll-img">`;
      }

      roll_result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      }); 
    }
  }

  //roll helper
  _vampireRoll(num_dice, actor, label = "", difficulty = 0){
    let roll = new Roll(num_dice + "d10cs>5", actor.data.data);
    let roll_result = roll.evaluate();
    let hunger_dice = actor.data.data.hunger.value;

    let resultRoll = `<span></span>`;
    let success = 0;
    let hunger_success = 0;
    let crit_success = 0;
    let hunger_crit_success = 0;
    let fail = 0;
    let hunger_fail = 0;
    let hunger_crit_fail = 0;

    roll_result.terms[0].results.forEach((dice, index) => {
      if (dice.success){
        if (dice.result == 10){
          if ((index + 1) <= hunger_dice){
            hunger_crit_success++;
          }else{
            crit_success++;
          }
        }else if ((index + 1) <= hunger_dice){
          hunger_success++;
        }else{
          success++;
        }
      }else{
        if ((index + 1) <= hunger_dice){
          if (dice.result == 1){
            hunger_crit_fail++;
          }else{
            hunger_fail++;
          }
        }else{
          fail++
        }
      }
    });

    let total_crit_success = 0
    total_crit_success = Math.floor((crit_success + hunger_crit_success)/2);
    let total_success = (total_crit_success * 2) + success + hunger_success + crit_success + hunger_crit_success;
    let successRoll = false;
    if (difficulty != 0) {
      successRoll = total_success >= difficulty;
      resultRoll = `( <span class="danger">${game.i18n.localize('VTM5E.Fail')}</span> )`;
      if (successRoll) {
        resultRoll = `( <span class="success">${game.i18n.localize('VTM5E.Success')}</span> )`;
      }
    }

    label = `<p class="roll-label uppercase">${label}</p>`

    if (hunger_crit_success && total_crit_success){
      label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.MessyCritical')}</p>`;
    }
    else if (total_crit_success){
      label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.CriticalSuccess')}</p>`;
    }
    if (hunger_crit_fail && !successRoll && difficulty > 0){
      label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.BestialFailure')}</p>`;
    }
    if (hunger_crit_fail && !successRoll && difficulty == 0){
      label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.PossibleBestialFailure')}</p>`;
    }

    label = label + `<p class="roll-label">${game.i18n.localize('VTM5E.Successes')}: ${total_success} ${resultRoll}</p>`;

    for (var i = 0, j = crit_success; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/normal-crit.png" alt="Normal Crit" class="roll-img">`;
    }
    for (var i = 0, j = success; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/normal-success.png" alt="Normal Success" class="roll-img">`;
    }
    for (var i = 0, j = fail; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/normal-fail.png" alt="Normal Fail" class="roll-img">`;
    }

    label = label + `<br>`

    for (var i = 0, j = hunger_crit_success; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/red-crit.png" alt="Hunger Crit" class="roll-img">`;
    }
    for (var i = 0, j = hunger_success; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/red-success.png" alt="Hunger Success" class="roll-img">`;
    }
    for (var i = 0, j = hunger_crit_fail; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/bestial-fail.png" alt="Bestial Fail" class="roll-img">`;
    }
    for (var i = 0, j = hunger_fail; i < j; i++) {
      label = label + `<img src="systems/vtm5e/assets/images/red-fail.png" alt="Hunger Fail" class="roll-img">`;
    }

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
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`);
    }

    let template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectAbility')}</label>
              <select id="abilitySelect">${options}</select>
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="0">
          </div>
      </form>`;
  
    let buttons = {};
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Roll'),
        callback: async (html) => {
          const ability = html.find('#abilitySelect')[0].value;
          const modifier = parseInt(html.find('#inputMod')[0].value || 0);
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0);
          const ability_val = this.actor.data.data.abilities[ability].value
          const ability_name = game.i18n.localize(this.actor.data.data.abilities[ability].name)
          let num_dice = ability_val + parseInt(dataset.roll) + modifier
          this._vampireRoll(num_dice, this.actor, `${dataset.label} + ${ability_name}`, difficulty);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel'),
      },
    };
  
    new Dialog({
      title: game.i18n.localize('VTM5E.Rolling') + ` ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw',
    }).render(true);
  }

  _onVampireRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let item = this.actor.items.get(dataset.id)
    let discipline_value = this.actor.data.data.disciplines[item.data.data.discipline].value
    let dice1 = item.data.data.dice1 == "discipline" ? discipline_value : this.actor.data.data.abilities[item.data.data.dice1].value
    let dice2 = item.data.data.dice2 == "discipline" ? discipline_value : this.actor.data.data.abilities[item.data.data.dice2].value
    let dice_pool = dice1 + dice2
    this._vampireRoll(dice_pool, this.actor, `${item.data.name}`);
  }
}
