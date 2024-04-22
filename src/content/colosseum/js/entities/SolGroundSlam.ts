"use strict";

import { Unit } from "../../../../sdk/Unit";
import { Projectile, ProjectileOptions } from "../../../../sdk/weapons/Projectile";
import { Location } from "../../../../sdk/Location";
import { Entity } from "../../../../sdk/Entity";
import { CollisionType } from "../../../../sdk/Collision";
import { Weapon, AttackBonuses } from "../../../../sdk/gear/Weapon";
import { LineOfSightMask } from "../../../../sdk/LineOfSight";
import { Random } from "../../../../sdk/Random";
import { Region } from "../../../../sdk/Region";
import { TileMarkerModel } from "../../../../sdk/rendering/TileMarkerModel";
import { BasicModel } from "../../../../sdk/rendering/BasicModel";

class SolGroundSlamWeapon extends Weapon {
  calculateHitDelay(distance: number) {
    return 1;
  }

  static isMeleeAttackStyle(style: string) {
    return true;
  }

  attack(from: Unit, to: Unit, bonuses: AttackBonuses = {}, options: ProjectileOptions = {}): boolean {
    // up to 45? not sure what min hit is
    this.damage = 20 + Math.floor(Random.get() * 25);
    to.addProjectile(new Projectile(this, this.damage, from, to, bonuses.attackStyle, options));
    return true;
  }
}

export class SolGroundSlam extends Entity {
  from: Unit;
  to: Unit;
  weapon = new SolGroundSlamWeapon();

  age = 0;

  constructor(
    region: Region,
    location: Location,
    from: Unit,
    to: Unit,
    private delay: number | null = 0,
  ) {
    super(region, location);
    this.from = from;
    this.to = to;
  }

  create3dModel() {
    return TileMarkerModel.forRenderable(this, false);
  }

  get color() {
    return "#583927";
  }

  get collisionType() {
    return CollisionType.NONE;
  }

  get lineOfSight() {
    return LineOfSightMask.NONE;
  }

  shouldDestroy() {
    return this.dying === 0;
  }

  get drawOutline() {
    return false;
  }

  visible(tickPercent) {
    // makes the sparks appear to shoot forward
    return this.age + tickPercent >= 1 + this.delay / 3;
  }

  tick() {
    --this.dying; // wait what, why isn't this in entity?
    ++this.age;
    if (this.age == 1) {
      if (this.location.x === this.to.location.x && this.location.y === this.to.location.y) {
        this.weapon.attack(this.from, this.to as Unit, {});
      }
      this.dying = 2;
    }
  }

  get size() {
    return 1;
  }
}
