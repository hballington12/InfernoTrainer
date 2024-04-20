"use strict";

import { MagicWeapon } from "../../../../sdk/weapons/MagicWeapon";
import { MeleeWeapon } from "../../../../sdk/weapons/MeleeWeapon";
import { Mob, AttackIndicators } from "../../../../sdk/Mob";
import AttackSound from "../../../../assets/sounds/scythe_swing_2524.ogg";
import { UnitBonuses } from "../../../../sdk/Unit";
import { Collision } from "../../../../sdk/Collision";
import { EntityName } from "../../../../sdk/EntityName";
import { Projectile } from "../../../../sdk/weapons/Projectile";
import { Sound } from "../../../../sdk/utils/SoundCache";
import HitSound from "../../../../assets/sounds/dragon_hit_410.ogg";

import { GLTFModel } from "../../../../sdk/rendering/GLTFModel";
import { Assets } from "../../../../sdk/utils/Assets";
import { Random } from "../../../../sdk/Random";
import _ from "lodash";

export const SolHereditModel = Assets.getAssetUrl("models/sol.glb");

export class SolHeredit extends Mob {
  shouldRespawnMobs: boolean;

  mobName(): EntityName {
    return EntityName.SOL_HEREDIT;
  }

  shouldChangeAggro(projectile: Projectile) {
    return this.aggro != projectile.from && this.autoRetaliate;
  }

  get combatLevel() {
    return 1200;
  }

  dead() {
    super.dead();
  }

  setStats() {
    this.stunned = 1;

    this.weapons = {
      stab: new MeleeWeapon(),
    };

    // non boosted numbers
    this.stats = {
      attack: 370,
      strength: 510,
      defence: 260,
      range: 510,
      magic: 300,
      hitpoint: 1200,
    };

    // with boosts
    this.currentStats = JSON.parse(JSON.stringify(this.stats));
  }

  get bonuses(): UnitBonuses {
    return {
      attack: {
        stab: 0,
        slash: 0,
        crush: 0,
        magic: 80,
        range: 0,
      },
      defence: {
        stab: 0,
        slash: 0,
        crush: 0,
        magic: 0,
        range: 0,
      },
      other: {
        meleeStrength: 0,
        rangedStrength: 0,
        magicDamage: 1.0,
        prayer: 0,
      },
    };
  }

  get attackSpeed() {
    return 7;
  }

  get attackRange() {
    return 1;
  }

  get size() {
    return 5;
  }

  get sound() {
    return new Sound(AttackSound);
  }

  hitSound(damaged) {
    return new Sound(HitSound, 0.1);
  }

  attackStyleForNewAttack() {
    return "stab" as const;
  }

  canMeleeIfClose() {
    return "stab" as const;
  }

  magicMaxHit() {
    return 70;
  }

  get maxHit() {
    return 70;
  }

  attackAnimation(tickPercent: number, context) {
    context.rotate(tickPercent * Math.PI * 2);
  }

  respawnLocation(mobToResurrect: Mob) {
    for (let x = 15 + 11; x < 22 + 11; x++) {
      for (let y = 10 + 14; y < 23 + 14; y++) {
        if (!Collision.collidesWithAnyMobs(this.region, x, y, mobToResurrect.size)) {
          if (!Collision.collidesWithAnyEntities(this.region, x, y, mobToResurrect.size)) {
            return { x, y };
          }
        }
      }
    }

    return { x: 21, y: 22 };
  }

  attackIfPossible() {
    this.attackStyle = this.attackStyleForNewAttack();

    this.attackFeedback = AttackIndicators.NONE;

    this.hadLOS = this.hasLOS;
    this.setHasLOS();

    if (this.canAttack() === false) {
      return;
    }

    const isUnderAggro = Collision.collisionMath(
      this.location.x,
      this.location.y,
      this.size,
      this.aggro.location.x,
      this.aggro.location.y,
      1,
    );

    if (!isUnderAggro && this.hasLOS && this.attackDelay <= 0) {
      this.attack() && this.didAttack();
    }
  }

  create3dModel() {
    return GLTFModel.forRenderable(this, SolHereditModel, 0.02);
  }

  override get idlePoseId() {
    return 0;
  }

  override get walkingPoseId() {
    return 1;
  }

  override get attackAnimationId() {
    return 2;
  }

  get maxSpeed() {
    return 2;
  }

  override getNextMovementStep() {
    if (!this.aggro) {
      return { dx: this.location.x, dy: this.location.y };
    }
    const { x: tx, y: ty } = this.aggro.location;
    const closestTile = this.getClosestTileTo(tx, ty);
    const originLocation = { x: closestTile[0], y: closestTile[1] };
    const maxSpeed = Math.min(
      this.maxSpeed,
      Math.max(Math.abs(originLocation.x - tx) - 1, Math.abs(originLocation.y - ty) - 1),
    );
    let dx = this.location.x + _.clamp(tx - originLocation.x, -maxSpeed, maxSpeed);
    let dy = this.location.y + _.clamp(ty - originLocation.y, -maxSpeed, maxSpeed);

    if (
      Collision.collisionMath(
        this.location.x,
        this.location.y,
        this.size,
        this.aggro.location.x,
        this.aggro.location.y,
        1,
      )
    ) {
      // Random movement if player is under the mob.
      if (Random.get() < 0.5) {
        dy = this.location.y;
        if (Random.get() < 0.5) {
          dx = this.location.x + 1;
        } else {
          dx = this.location.x - 1;
        }
      } else {
        dx = this.location.x;
        if (Random.get() < 0.5) {
          dy = this.location.y + 1;
        } else {
          dy = this.location.y - 1;
        }
      }
    }
    return { dx, dy };
  }

  override get drawTrueTile() {
    return true;
  }
}
