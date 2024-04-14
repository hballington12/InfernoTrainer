import ScytheInventImage from "../../assets/images/weapons/scytheOfVitur.png";
import { MeleeWeapon } from "../../sdk/weapons/MeleeWeapon";
import { ItemName } from "../../sdk/ItemName";
import { AttackStyle, AttackStyleTypes } from "../../sdk/AttackStylesController";
import { Assets } from "../../sdk/utils/Assets";
import { PlayerAnimationIndices } from "../../sdk/rendering/GLTFAnimationConstants";
import { Sound } from "../../sdk/utils/SoundCache";

import ScytheAttackSound from "../../assets/sounds/scythe_swing_2524.ogg";

export class ScytheOfVitur extends MeleeWeapon {
  constructor() {
    super();

    this.bonuses = {
      attack: {
        stab: 70,
        slash: 125,
        crush: 30,
        magic: -6,
        range: 0,
      },
      defence: {
        stab: -2,
        slash: 8,
        crush: 10,
        magic: 0,
        range: 0,
      },
      other: {
        meleeStrength: 75,
        rangedStrength: 0,
        magicDamage: 0,
        prayer: 0,
      },
      targetSpecific: {
        undead: 0,
        slayer: 0,
      },
    };
  }

  attackStyles() {
    return [AttackStyle.REAP, AttackStyle.AGGRESSIVESLASH, AttackStyle.AGGRESSIVECRUSH, AttackStyle.DEFENSIVE];
  }

  attackStyleCategory(): AttackStyleTypes {
    return AttackStyleTypes.SCYTHE;
  }

  defaultStyle(): AttackStyle {
    return AttackStyle.AGGRESSIVESLASH;
  }

  get itemName(): ItemName {
    return ItemName.SCYTHE_OF_VITUR;
  }

  get isTwoHander(): boolean {
    return true;
  }

  hasSpecialAttack(): boolean {
    return false;
  }

  get attackRange() {
    return 1;
  }

  get attackSpeed() {
    return 5;
  }

  get inventoryImage() {
    return ScytheInventImage;
  }
  
  override get model() {
    return Assets.getAssetUrl("models/player_sanguine_scythe_of_vitur.glb");
  }

  override get attackAnimationId() {
    return PlayerAnimationIndices.ScytheSwing;
  }

  override get idleAnimationId() {
    return PlayerAnimationIndices.ScytheIdle;
  }

  get attackSound() {
    return new Sound(ScytheAttackSound, 0.1);
  }
}
