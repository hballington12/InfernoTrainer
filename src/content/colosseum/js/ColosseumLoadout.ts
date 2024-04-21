import { UnitOptions } from "../../../sdk/Unit";

import { NecklaceOfAnguish } from "../../equipment/NecklaceOfAnguish";
import { PegasianBoots } from "../../equipment/PegasianBoots";
import { OccultNecklace } from "../../equipment/OccultNecklace";
import { RingOfSufferingImbued } from "../../equipment/RingOfSufferingImbued";
import { DragonArrows } from "../../equipment/DragonArrows";
import { StaminaPotion } from "../../items/StaminaPotion";
import { SaradominBrew } from "../../items/SaradominBrew";
import { SuperRestore } from "../../items/SuperRestore";
import { ZaryteVambraces } from "../../equipment/ZaryteVambraces";
import { MasoriMaskF } from "../../equipment/MasoriMaskF";
import { MasoriBodyF } from "../../equipment/MasoriBodyF";
import { MasoriChapsF } from "../../equipment/MasoriChapsF";
import { DizanasQuiver } from "../../equipment/DizanasQuiver";
import { BastionPotion } from "../../items/BastionPotion";

import { TwistedBow } from "../../weapons/TwistedBow";
import { Player } from "../../../sdk/Player";
import { ScytheOfVitur } from "../../weapons/ScytheOfVitur";
import { TorvaFullhelm } from "../../equipment/TorvaFullhelm";
import { InfernalCape } from "../../equipment/InfernalCape";
import { TorvaPlatebody } from "../../equipment/TorvaPlatebody";
import { TorvaPlatelegs } from "../../equipment/TorvaPlatelegs";
import { PrimordialBoots } from "../../equipment/PrimordialBoots";
import { FourTickDummyWeapon } from "../../weapons/FourTickDummyWeapon";

export class ColosseumLoadout {
  loadoutType: string;

  constructor(loadoutType: string) {
    this.loadoutType = loadoutType;
  }

  loadoutMaxMelee() {
    return {
      equipment: {
        weapon: new ScytheOfVitur(),
        offhand: null,
        helmet: new TorvaFullhelm(),
        necklace: new OccultNecklace(), // TODO
        cape: new InfernalCape(),
        ammo: new DragonArrows(),
        chest: new TorvaPlatebody(),
        legs: new TorvaPlatelegs(),
        feet: new PrimordialBoots(),
        gloves: new ZaryteVambraces(), // TODO
        ring: new RingOfSufferingImbued(), // TODO
      },
      inventory: [
        new TwistedBow(),
        new MasoriBodyF(),
        new DizanasQuiver(),
        new PegasianBoots(),
        new NecklaceOfAnguish(),
        new MasoriChapsF(),
        new MasoriMaskF(),
        new FourTickDummyWeapon(),
        new SaradominBrew(),
        new SaradominBrew(),
        new SuperRestore(),
        new SuperRestore(),
        new SaradominBrew(),
        new SaradominBrew(),
        new SuperRestore(),
        new SuperRestore(),
        new SaradominBrew(),
        new SaradominBrew(),
        new SuperRestore(),
        new SuperRestore(),
        new SaradominBrew(),
        new SaradominBrew(),
        new SuperRestore(),
        new SuperRestore(),
        new BastionPotion(),
        new StaminaPotion(),
        new SuperRestore(),
        new SuperRestore(),
      ],
    };
  }

  setStats(player: Player) {
    player.stats.prayer = 99;
    player.currentStats.prayer = 99;
    player.stats.defence = 99;
    player.currentStats.defence = 99;
  }

  getLoadout(): UnitOptions {
    let loadout: UnitOptions;
    switch (this.loadoutType) {
      case "max_melee":
        loadout = this.loadoutMaxMelee();
        break;
    }
    return loadout;
  }
}
