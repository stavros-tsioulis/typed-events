import type NodeEventEmitter from "node:events";

export type OnlyStringSymbolKeys<T> = { [K in keyof T]: K extends string | symbol ? K : never }[keyof T];

export type EventName<AllEvents extends { [K: string]: any[] }> =
  | OnlyStringSymbolKeys<AllEvents>
  | "newListener"
  | "removeListener"
  | symbol;

export type EventArgs<
  E extends EventName<any>,
  Events extends { [K: string | symbol]: any[] },
> = E extends "newListener"
  ? [listener: Function]
  : E extends "removeListener"
    ? [listener: Function]
    : E extends OnlyStringSymbolKeys<Events>
      ? Events[E]
      : never;

export type Listener<
  E extends EventName<any>,
  Events extends { [K: string | symbol]: any[] },
> = ((...args: EventArgs<E, Events>) => void) & { listener?: Function };

export let defaultMaxListeners = 10;

enum Position {
  END,
  START
}

export class EventEmitter<Events extends { [K: string]: any[] }> implements NodeEventEmitter {
  private _events = new Map<EventName<Events>, Function[]>();
  private _eventsCount = 0;
  private _maxListeners = defaultMaxListeners;

  private addListenerToPosition<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>, position: Position): this {
    this._eventsCount++;

    if (!this._events.has(eventName)) this._events.set(eventName, [listener]);
    else {
      const listeners = this._events.get(eventName);
      position === Position.END ? listeners?.push(listener) : listeners?.unshift(listener);
      const listenersCount = listeners?.length ?? 0;
      if (listenersCount > this._maxListeners)
        console.warn(`Max listeners (${this._maxListeners}) have been reached. ${listenersCount} listeners were added to event ${String(eventName)}. This may cause a memory leak.`);
    }

    this.emit("newListener", listener.listener ?? listener);
    return this;
  }

  addListener<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    return this.addListenerToPosition(eventName, listener, Position.END)
  }

  prependListener<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    return this.addListenerToPosition(eventName, listener, Position.START)
  }

  prependOnceListener<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    return this.prependListener(eventName, this.createOnceWrapper(eventName, listener));
  }

  removeListener<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    const _events = this._events.get(eventName);
    const index = _events?.indexOf(listener) ?? -1;
    if (index === -1) return this;

    _events?.splice(index, 1);
    this.emit("removeListener", listener.listener ?? listener);
    return this;
  }

  removeAllListeners(eventName?: EventName<Events> | undefined): this {
    if (eventName) this._events.delete(eventName);
    else this._events.clear();
    return this;
  }

  listeners<E extends EventName<Events>>(eventName: E): Listener<E, Events>[] {
    return this.rawListeners(eventName).map((l) => l.listener ?? l) as Listener<E, Events>[];
  }

  rawListeners<E extends EventName<Events>>(eventName: E): Listener<E, Events>[] {
    return Array.from(this._events.get(eventName) ?? []) as ((...args: EventArgs<E, Events>) => any)[];
  }

  emit<E extends EventName<Events>>(eventName: E, ...args: EventArgs<E, Events>): boolean {
    const listeners = this.rawListeners(eventName);

    for (const listener of listeners)
      try {
        listener(...args);
      } catch {}

    return listeners.length > 0;
  }

  getMaxListeners(): number {
    return this._maxListeners;
  }

  setMaxListeners(n: number): this {
    this._maxListeners = n;
    return this;
  }

  listenerCount(eventName: EventName<Events>, listener?: Function | undefined): number {
    const listeners = this.listeners(eventName);
    if (listener) return listeners.filter((l) => l === listener).length;
    else return listeners.length;
  }

  off<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    return this.removeListener(eventName, listener);
  }

  on<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    return this.addListener(eventName, listener);
  }

  once<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): this {
    return this.addListener(eventName, this.createOnceWrapper(eventName, listener));
  }

  private createOnceWrapper<E extends EventName<Events>>(eventName: E, listener: Listener<E, Events>): Listener<E, Events> {
    const onceWrapper: Listener<E, Events> = (...args: EventArgs<E, Events>) => {
      this.removeListener(eventName, onceWrapper);
      listener(...args);
    };

    onceWrapper.listener = listener;
    return onceWrapper
  }

  eventNames(): EventName<Events>[] {
    return Array.from(this._events.keys());
  }
}
