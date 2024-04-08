import { describe, expect, it, vi } from "vitest";
import { EventEmitter } from "..";

describe("EventEmitter", () => {
  it("should add listeners", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    emitter.emit("test", "test");
    expect(listener).toHaveBeenCalledWith("test");
  });

  it("should remove listeners", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    emitter.removeListener("test", listener);
    emitter.emit("test", "test");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should remove all listeners", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    emitter.removeAllListeners("test");
    emitter.emit("test", "test");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should prepend listeners", () => {
    const callers: string[] = [];

    const emitter = new EventEmitter<{ test: [string] }>();
    const listener = vi.fn(() => callers.push("listener"));
    emitter.addListener("test", listener);
    const listener2 = vi.fn(() => callers.push("listener2"));
    emitter.prependListener("test", listener2);
    emitter.emit("test", "test");
    expect(callers).toEqual(["listener2", "listener"]);
  });

  it("should set max listeners", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn");
    const emitter = new EventEmitter<{ test: [string] }>();
    emitter.setMaxListeners(1);
    const listener = vi.fn();
    const listener2 = vi.fn();
    emitter.addListener("test", listener);
    emitter.addListener("test", listener2);
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it("should get max listeners", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    emitter.setMaxListeners(1);
    expect(emitter.getMaxListeners()).toBe(1);
  });

  it("should get event names", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    emitter.addListener("test", () => {});
    expect(emitter.eventNames()).toEqual(["test"]);
  });

  it("should get listener count", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    expect(emitter.listenerCount("test")).toBe(1);
  });

  it("should get listeners", () => {
    const emitter = new EventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    expect(emitter.listeners("test")).toEqual([listener]);
  });

  it('should remove once listener once called', () => {
    const emitter = new EventEmitter<{ test: [string] }>()
    const listener = vi.fn()
    emitter.once('test', listener)
    emitter.emit('test', 'abc')
    emitter.emit('test', 'def')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(emitter.listenerCount('test')).toEqual(0)
  })
});
