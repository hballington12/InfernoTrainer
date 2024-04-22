import { remove } from "lodash";

export class DelayedAction {
  // actions to be played after npc action (before players)
  static delayedNpcActions: DelayedAction[] = [];
  // actions to be played after player action
  static delayedActions: DelayedAction[] = [];
  action: () => void;
  delay: number;
  identifier: number;
  constructor(action: () => void, delay: number) {
    this.action = action;
    this.delay = delay + 1;
    this.identifier = Math.random() * 1000000;
  }

  static registerDelayedNpcAction(delayedAction: DelayedAction): number {
    DelayedAction.delayedNpcActions.push(delayedAction);
    return delayedAction.identifier;
  }

  static registerDelayedAction(delayedAction: DelayedAction): number {
    DelayedAction.delayedActions.push(delayedAction);
    return delayedAction.identifier;
  }

  static afterNpcTick() {
    const executedActions: DelayedAction[] = [];
    DelayedAction.delayedNpcActions.forEach((delayedAction) => {
      delayedAction.delay--;
      if (delayedAction.delay === 0) {
        delayedAction.action();
        executedActions.push(delayedAction);
      }
    });

    executedActions.forEach((executedActions: DelayedAction) => {
      remove(DelayedAction.delayedNpcActions, executedActions);
    });
  }

  static tick() {
    const executedActions: DelayedAction[] = [];
    DelayedAction.delayedActions.forEach((delayedAction) => {
      delayedAction.delay--;
      if (delayedAction.delay === 0) {
        delayedAction.action();
        executedActions.push(delayedAction);
      }
    });

    executedActions.forEach((executedActions: DelayedAction) => {
      remove(DelayedAction.delayedActions, executedActions);
    });
  }
}
