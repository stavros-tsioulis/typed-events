# typed-events

A type-safe EventEmitter implementation compatible with Node.js EventEmitter API.

## Installation

```bash
npm install @stavros-tsioulis/typed-events
# or
pnpm add @stavros-tsioulis/typed-events
# or
yarn add @stavros-tsioulis/typed-events
```

## Usage

```typescript
import { EventEmitter } from 'typed-events';

// Define your event types
type MyEvents = {
  userLogin: [userId: string, timestamp: number];
  userLogout: [userId: string];
  message: [from: string, to: string, content: string];
};

// Create an event emitter with typed events
const emitter = new EventEmitter<MyEvents>();

// Add listeners with full type safety
emitter.on('userLogin', (userId, timestamp) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
});

emitter.on('message', (from, to, content) => {
  console.log(`${from} → ${to}: ${content}`);
});

// Emit events with type checking
emitter.emit('userLogin', 'user123', Date.now());
emitter.emit('message', 'alice', 'bob', 'Hello!');

// TypeScript will catch errors:
// emitter.emit('userLogin', 'user123'); // Error: missing timestamp argument
// emitter.emit('invalidEvent', 'data'); // Error: event doesn't exist
```

## License

MIT
