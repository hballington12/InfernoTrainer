import { Player } from "../../src/sdk/Player";
import { World } from "../../src/sdk/World";
import { Viewport } from "../../src/sdk/Viewport";
import { TestRegion } from "../utils/TestRegion";
import { SolHeredit } from "../../src/content/colosseum/js/mobs/SolHeredit";

// sol heredit movement tests
describe("sol heredit movement", () => {
  let region: TestRegion;
  let world: World;
  let player: Player;
  let boss: SolHeredit;

  beforeAll(() => {
    region = new TestRegion(30, 30);
    world = new World();
    region.world = world;
    world.addRegion(region);
    Viewport.setupViewport(region, true);
    player = new Player(region, { x: 15, y: 15 });
    boss = new SolHeredit(region, { x: 13, y: 23 }, { aggro: player });
    boss.stunned = 0;
    region.addPlayer(player);
    Viewport.viewport.setPlayer(player);
  });

  test("sol takes two steps towards player", () => {
    boss.setAggro(player);
    region.addMob(boss);

    world.tickWorld();
    expect(player.location).toEqual({ x: 15, y: 15 });
    expect(boss.location).toEqual({ x: 13, y: 21 });
  });

  test("sol takes one step towards player", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 15, y: 15 });
    expect(boss.location).toEqual({ x: 13, y: 20 });
  });

  test("sol moves horizontally when player is at corner", () => {
    player.setLocation({ x: 12, y: 21 });
    player.moveTo(12, 21);
    world.tickWorld();
    expect(player.location).toEqual({ x: 12, y: 21 });
    expect(boss.location).toEqual({ x: 12, y: 20 });
  });

  test("sol moves diagonally when player is at corner", () => {
    player.setLocation({ x: 0, y: 0 });
    player.moveTo(0, 0);
    world.tickWorld();
    expect(player.location).toEqual({ x: 0, y: 0 });
    expect(boss.location).toEqual({ x: 10, y: 18 });
  });
});
