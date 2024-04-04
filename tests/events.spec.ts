import { describe, expect, it, vi } from "vitest";
import { CompatibleEventEmitter } from "../src/events";

describe("CompatibleEventEmitter", () => {
  it("should be able to add listeners", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    emitter.emit("test", "test");
    expect(listener).toHaveBeenCalledWith("test");
  });

  it("should be able to remove listeners", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    emitter.removeListener("test", listener);
    emitter.emit("test", "test");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should be able to remove all listeners", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    emitter.removeAllListeners("test");
    emitter.emit("test", "test");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should be able to prepend listeners", () => {
    const callers: string[] = [];

    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    const listener = vi.fn(() => callers.push("listener"));
    emitter.addListener("test", listener);
    const listener2 = vi.fn(() => callers.push("listener2"));
    emitter.prependListener("test", listener2);
    emitter.emit("test", "test");
    expect(callers).toEqual(["listener2", "listener"]);
  });

  it("should be able to set max listeners", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn");
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    emitter.setMaxListeners(1);
    const listener = vi.fn();
    const listener2 = vi.fn();
    emitter.addListener("test", listener);
    emitter.addListener("test", listener2);
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it("should be able to get max listeners", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    emitter.setMaxListeners(1);
    expect(emitter.getMaxListeners()).toBe(1);
  });

  it("should be able to get event names", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    emitter.addListener("test", () => {});
    expect(emitter.eventNames()).toEqual(["test"]);
  });

  it("should be able to get listener count", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    expect(emitter.listenerCount("test")).toBe(1);
  });

  it("should be able to get listeners", () => {
    const emitter = new CompatibleEventEmitter<{ test: [string] }>();
    const listener = vi.fn();
    emitter.addListener("test", listener);
    expect(emitter.listeners("test")).toEqual([listener]);
  });
});
