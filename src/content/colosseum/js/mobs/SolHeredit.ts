"use strict";

import { MagicWeapon } from "../../../../sdk/weapons/MagicWeapon";
import { MeleeWeapon } from "../../../../sdk/weapons/MeleeWeapon";
import { Mob, AttackIndicators } from "../../../../sdk/Mob";
import { UnitBonuses } from "../../../../sdk/Unit";
import { Collision } from "../../../../sdk/Collision";
import { EntityName } from "../../../../sdk/EntityName";
import { Projectile } from "../../../../sdk/weapons/Projectile";
import { Sound, SoundCache } from "../../../../sdk/utils/SoundCache";

import { GLTFModel } from "../../../../sdk/rendering/GLTFModel";
import { Assets } from "../../../../sdk/utils/Assets";
import { Random } from "../../../../sdk/Random";
import _ from "lodash";
import { DelayedAction } from "../../../../sdk/DelayedAction";
import { SolGroundSlam } from "../entities/SolGroundSlam";

export const SolHereditModel = Assets.getAssetUrl("models/sol.glb");

import SpearStart from "../../assets/sounds/8147_spear.ogg";
import SpearEnd from "../../assets/sounds/8047_spear_swing.ogg";
import ShieldStart from "../../assets/sounds/8150_shield_start.ogg";
import ShieldEnd from "../../assets/sounds/8145_shield_stomp.ogg";

enum SolAnimations {
  Idle = 0,
  Walk = 1,
  SpearFast = 2,
  SpearSlow = 3,
  Grapple = 4,
  Shield = 5,
  TripleAttack = 6,
  TripleAttackFast = 7,
  Death = 8,
}

enum AttackDirection {
  West,
  East,
  North,
  South,
  NorthEast,
  NorthWest,
  SouthEast,
  SouthWest,
}

const DIRECTIONS = [
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
];

const SPEAR_START = new Sound(SpearStart, 0.1);
const SPEAR_END = new Sound(SpearEnd, 0.1);
const SHIELD_START = new Sound(ShieldStart, 0.1);
const SHIELD_END = new Sound(ShieldEnd, 0.1);
export class SolHeredit extends Mob {
  shouldRespawnMobs: boolean;
  // public for testing
  firstSpear = true;
  firstShield = true;

  lastLocation = { ...this.location };

  stationaryTimer = 0;

  mobName(): EntityName {
    return EntityName.SOL_HEREDIT;
  }

  shouldChangeAggro(projectile: Projectile) {
    return this.aggro != projectile.from && this.autoRetaliate;
  }

  get combatLevel() {
    return 1200;
  }

  get healthScale() {
    return this.stats.hitpoint;
  }

  visible() {
    return true;
  }

  dead() {
    super.dead();
  }

  setStats() {
    this.stunned = 1;
    this.weapons = {
      stab: new MeleeWeapon(),
    };

    this.stats = {
      attack: 350,
      strength: 400,
      defence: 200,
      range: 350,
      magic: 300,
      hitpoint: 1500,
    };

    // with boosts
    this.currentStats = JSON.parse(JSON.stringify(this.stats));
  }

  get bonuses(): UnitBonuses {
    return {
      attack: {
        stab: 250,
        slash: 0,
        crush: 0,
        magic: 80,
        range: 150,
      },
      defence: {
        stab: 65,
        slash: 5,
        crush: 30,
        magic: 750,
        range: 825,
      },
      other: {
        meleeStrength: 0,
        rangedStrength: 5,
        magicDamage: 1.0,
        prayer: 0,
      },
    };
  }

  get attackSpeed() {
    // irrelevant
    return 7;
  }

  get attackRange() {
    return 1;
  }

  get size() {
    return 5;
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

  attackIfPossible() {
    this.attackStyle = this.attackStyleForNewAttack();

    this.attackFeedback = AttackIndicators.NONE;
    if (!this.aggro) {
      return;
    }

    this.hadLOS = this.hasLOS;
    // override LOS check to attack melee diagonally
    const [tx, ty] = this.getClosestTileTo(this.aggro.location.x, this.aggro.location.y);
    const dx = this.aggro.location.x - tx,
      dy = this.aggro.location.y - ty;
    const isAdjacent = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    this.hasLOS = isAdjacent;

    if (this.canAttack() === false) {
      return;
    }

    if (this.hasLOS && this.attackDelay <= 0 && this.stationaryTimer > 0) {
      const nextDelay = (Random.get() < 0.5) ? this.attackShield() : this.attackSpear();
      this.didAttack();
      this.attackDelay = nextDelay;
    }
  }

  private attackSpear() {
    this.freeze(4);
    this.playAnimation(SolAnimations.SpearSlow);
    SoundCache.play(SPEAR_START);
    DelayedAction.registerDelayedAction(
      new DelayedAction(this.firstSpear ? this.doFirstSpear.bind(this) : this.doSecondSpear.bind(this), 2),
    );
    DelayedAction.registerDelayedAction(new DelayedAction(() => SoundCache.play(SPEAR_END), 3));
    this.firstSpear = !this.firstSpear;
    this.firstShield = true;
    return 7;
  }

  private attackShield() {
    this.freeze(4);
    this.playAnimation(SolAnimations.Shield);
    SoundCache.play(SHIELD_START);
    DelayedAction.registerDelayedAction(
      new DelayedAction(this.firstShield ? this.doFirstShield.bind(this) : this.doSecondShield.bind(this), 2),
    );
    DelayedAction.registerDelayedAction(new DelayedAction(() => SoundCache.play(SHIELD_END), 3));
    this.firstSpear = true;
    this.firstShield = !this.firstShield;
    return 6;
  }

  private fillRect(fromX: number, fromY: number, toX: number, toY: number, exceptRadius = null) {
    if (!this.aggro) {
      return;
    }
    const midX = (toX - fromX + 1) / 2;
    const midY = (toY - fromY + 1) / 2;
    for (let xx = fromX; xx < toX; ++xx) {
      for (let yy = toY; yy > fromY; --yy) {
        const radX = Math.abs(midX - xx + fromX);
        const radY = Math.abs(midY - yy + fromY);
        if ((radX === exceptRadius && radY <= exceptRadius) || (radY === exceptRadius && radX <= exceptRadius)) {
          continue;
        }
        this.region.addEntity(new SolGroundSlam(this.region, { x: xx, y: yy }, this, this.aggro));
      }
    }
  }

  // Bresenham's line algorirthm
  private fillLine(fromX: number, fromY: number, direction: AttackDirection, length: number) {
    if (!this.aggro) {
      return;
    }
    const toX = fromX + DIRECTIONS[direction].dx * length;
    const toY = fromY + DIRECTIONS[direction].dy * length;
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    const sx = Math.sign(toX - fromX);
    const sy = Math.sign(toY - fromY);
    let err = dx - dy;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.region.addEntity(new SolGroundSlam(this.region, { x: fromX, y: fromY }, this, this.aggro));
      if (fromX === toX && fromY === toY) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        fromX += sx;
      }
      if (e2 < dx) {
        err += dx;
        fromY += sy;
      }
    }
  }

  private doFirstSpear() {
    const LINE_LENGTH = 7;
    // slam under boss
    this.fillRect(this.location.x, this.location.y - this.size, this.location.x + this.size, this.location.y);
    const direction = this.getAttackDirection();
    // slam line facing player
    switch (direction) {
      case AttackDirection.West:
        this.fillRect(this.location.x - 1, this.location.y - this.size, this.location.x, this.location.y);
        this.fillLine(this.location.x - 2, this.location.y - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x - 2, this.location.y - 3, direction, LINE_LENGTH);
        break;
      case AttackDirection.East:
        this.fillRect(
          this.location.x + this.size,
          this.location.y - this.size,
          this.location.x + this.size + 1,
          this.location.y,
        );
        this.fillLine(this.location.x + this.size + 1, this.location.y - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size + 1, this.location.y - 3, direction, LINE_LENGTH);
        break;
      case AttackDirection.North:
        this.fillRect(
          this.location.x,
          this.location.y - this.size - 1,
          this.location.x + this.size,
          this.location.y - this.size,
        );
        this.fillLine(this.location.x + 1, this.location.y - this.size - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 3, this.location.y - this.size - 1, direction, LINE_LENGTH);
        break;
      case AttackDirection.South:
        this.fillRect(this.location.x, this.location.y, this.location.x + this.size, this.location.y + 1);
        this.fillLine(this.location.x + 1, this.location.y + 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 3, this.location.y + 2, direction, LINE_LENGTH);
        break;
      case AttackDirection.NorthEast:
        this.fillLine(this.location.x + this.size - 1, this.location.y - this.size, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size, this.location.y - this.size + 1, direction, LINE_LENGTH);
        break;
      case AttackDirection.SouthEast:
        this.fillLine(this.location.x + this.size, this.location.y, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size - 1, this.location.y + 1, direction, LINE_LENGTH);
        break;
      case AttackDirection.SouthWest:
        this.fillLine(this.location.x - 1, this.location.y, direction, LINE_LENGTH);
        this.fillLine(this.location.x, this.location.y + 1, direction, LINE_LENGTH);
        break;
      case AttackDirection.NorthWest:
        this.fillLine(this.location.x - 1, this.location.y - this.size + 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x, this.location.y - this.size, direction, LINE_LENGTH);
        break;
    }
  }

  private doSecondSpear() {
    const LINE_LENGTH = 7;
    // slam under boss
    this.fillRect(
      this.location.x - 1,
      this.location.y - this.size - 1,
      this.location.x + this.size + 1,
      this.location.y + 1,
    );
    const direction = this.getAttackDirection();
    // slam line facing player
    switch (direction) {
      case AttackDirection.West:
        this.fillRect(this.location.x - 1, this.location.y - this.size, this.location.x, this.location.y);
        this.fillLine(this.location.x - 2, this.location.y, direction, LINE_LENGTH);
        this.fillLine(this.location.x - 2, this.location.y - 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x - 2, this.location.y - 4, direction, LINE_LENGTH);
        break;
      case AttackDirection.East:
        this.fillRect(
          this.location.x + this.size,
          this.location.y - this.size,
          this.location.x + this.size + 1,
          this.location.y,
        );
        this.fillLine(this.location.x + this.size + 1, this.location.y, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size + 1, this.location.y - 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size + 1, this.location.y - 4, direction, LINE_LENGTH);
        break;
      case AttackDirection.North:
        this.fillRect(
          this.location.x,
          this.location.y - this.size - 1,
          this.location.x + this.size,
          this.location.y - this.size,
        );
        this.fillLine(this.location.x, this.location.y - this.size - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 2, this.location.y - this.size - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 4, this.location.y - this.size - 1, direction, LINE_LENGTH);
        break;
      case AttackDirection.South:
        this.fillRect(this.location.x, this.location.y, this.location.x + this.size, this.location.y + 1);
        this.fillLine(this.location.x, this.location.y + 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 2, this.location.y + 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 4, this.location.y + 2, direction, LINE_LENGTH);
        break;
      case AttackDirection.NorthEast:
        this.fillLine(this.location.x + this.size + 1, this.location.y - this.size - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size - 2, this.location.y - this.size - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size + 1, this.location.y - this.size + 2, direction, LINE_LENGTH);
        break;
      case AttackDirection.SouthEast:
        this.fillLine(this.location.x + this.size + 1, this.location.y - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size + 1, this.location.y + 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x + this.size - 2, this.location.y + 2, direction, LINE_LENGTH);
        break;
      case AttackDirection.SouthWest:
        this.fillLine(this.location.x - 2, this.location.y + 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x - 2, this.location.y - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 1, this.location.y + 2, direction, LINE_LENGTH);
        break;
      case AttackDirection.NorthWest:
        this.fillLine(this.location.x - 2, this.location.y - this.size + 2, direction, LINE_LENGTH);
        this.fillLine(this.location.x - 2, this.location.y - this.size - 1, direction, LINE_LENGTH);
        this.fillLine(this.location.x + 1, this.location.y - this.size - 1, direction, LINE_LENGTH);
        break;
    }
  }

  private doFirstShield() {
    this.fillRect(this.location.x - 8, this.location.y - 12, this.location.x + 11, this.location.y + 7, 4);
  }

  private doSecondShield() {
    this.fillRect(this.location.x - 8, this.location.y - 12, this.location.x + 11, this.location.y + 7, 5);
  }

  private getAttackDirection() {
    const [closestX, closestY] = this.getClosestTileTo(this.aggro.location.x, this.aggro.location.y);
    const dx = this.aggro.location.x - closestX;
    const dy = this.aggro.location.y - closestY;
    if (dx < 0 && dy === 0) {
      return AttackDirection.West;
    } else if (dx < 0 && dy < 0) {
      return AttackDirection.NorthWest;
    } else if (dx === 0 && dy < 0) {
      return AttackDirection.North;
    } else if (dx > 0 && dy < 0) {
      return AttackDirection.NorthEast;
    } else if (dx > 0 && dy === 0) {
      return AttackDirection.East;
    } else if (dx > 0 && dy > 0) {
      return AttackDirection.SouthEast;
    } else if (dx === 0 && dy > 0) {
      return AttackDirection.South;
    } else {
      // technically also if dx = 0 and dy = 0, i.e. you're under the boss
      return AttackDirection.SouthWest;
    }
  }

  create3dModel() {
    return GLTFModel.forRenderable(this, SolHereditModel, 0.02);
  }

  override get idlePoseId() {
    return SolAnimations.Idle;
  }

  override get walkingPoseId() {
    return SolAnimations.Walk;
  }

  override get attackAnimationId() {
    // controlled separately
    return null;
  }

  override get deathAnimationId() {
    return SolAnimations.Death;
  }

  override get deathAnimationLength() {
    return 8;
  }

  get maxSpeed() {
    return 2;
  }

  override movementStep() {
    super.movementStep();
    if (this.lastLocation.x === this.location.x && this.lastLocation.y === this.location.y) {
      ++this.stationaryTimer;
    } else {
      this.stationaryTimer = 0;
    }
    this.lastLocation = { ...this.location };
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
    // if maxSpeed is zero, i.e. you are on the corners, allow it move horizontally
    const maxSpeedX = Math.max(1, maxSpeed);
    let dx = this.location.x + _.clamp(tx - originLocation.x, -maxSpeedX, maxSpeedX);
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
