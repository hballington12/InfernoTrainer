import { Player } from "../../src/sdk/Player";
import { World } from "../../src/sdk/World";
import { Viewport } from "../../src/sdk/Viewport";
import { TestRegion } from "../utils/TestRegion";
import { SolHeredit } from "../../src/content/colosseum/js/mobs/SolHeredit";
import { forceRandom } from "../setupFiles";
import { FourTickDummyWeapon } from "../../src/content/weapons/FourTickDummyWeapon";
import { ScytheOfVitur } from "../../src/content/weapons/ScytheOfVitur";
import { CollisionType } from "../../src/sdk/Collision";

// sol heredit movement tests
describe("sol heredit attacks", () => {
  let region: TestRegion;
  let world: World;
  let player: Player;
  let boss: SolHeredit;

  beforeEach(() => {
    region = new TestRegion(30, 30);
    world = new World();
    region.world = world;
    world.addRegion(region);
    Viewport.setupViewport(region, true);
    player = new Player(region, { x: 15, y: 15 });
    boss = new SolHeredit(region, { x: 13, y: 20 }, { aggro: player });
    boss.stunned = 0;
    region.addPlayer(player);
    Viewport.viewport.setPlayer(player);
  });

  // checking the timing between the attack sequence starting and taking damage
  test("check timing of damage is correct", () => {
    boss.setAggro(player);
    region.addMob(boss);

    // < 0.5 shield, else spear
    forceRandom(1.0);
    world.tickWorld();
    expect(boss.firstSpear).toEqual(false);
    world.tickWorld(2);
    expect(player.currentStats.hitpoint).toEqual(99);
    world.tickWorld();
    // player got hit
    expect(player.currentStats.hitpoint).toBeLessThan(99);
    const hp = player.currentStats.hitpoint;
    world.tickWorld(3);
    forceRandom(1.0);
    expect(boss.firstSpear).toEqual(false);
    world.tickWorld();
    expect(boss.firstSpear).toEqual(true);
    world.tickWorld();
    expect(player.currentStats.hitpoint).toEqual(hp);
    world.tickWorld(2);
    // player got hit again
    expect(player.currentStats.hitpoint).toBeLessThan(hp);
  });

  test("check boss must be adjacent for one tick to attack", () => {
    boss.setAggro(player);
    region.addMob(boss);
    boss.setLocation({ x: 13, y: 24 });

    world.tickWorld();
    expect(boss.location.y).toEqual(22);
    expect(boss.hasLOS).toEqual(false);
    expect(boss.attackDelay).toBeLessThan(0);
    world.tickWorld();
    expect(boss.location.y).toEqual(20);
    expect(boss.hasLOS).toEqual(true);
    // does not attack here
    expect(boss.attackDelay).toBeLessThan(0);
    world.tickWorld();
    expect(boss.location.y).toEqual(20);
    expect(boss.attackDelay).toBeGreaterThan(0);
  });

  test("check moving one tick at a time delays attack", () => {
    boss.setAggro(player);
    region.addMob(boss);
    boss.setLocation({ x: 13, y: 23 });
    world.tickWorld();
    expect(boss.location.y).toEqual(21);

    for (let yy = 14; yy > 5; --yy) {
      player.moveTo(13, yy);
      world.tickWorld();
      expect(boss.location.y).toEqual(yy + 6);
      expect(boss.hasLOS).toEqual(true);
      expect(boss.attackDelay).toBeLessThan(0);
    }
  });
});
