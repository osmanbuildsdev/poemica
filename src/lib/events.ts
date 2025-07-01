

export type EventType = 'profile-updated' | 'avatar-changed' | 'session-refresh';

export interface ProfileUpdatedEvent {
  type: 'profile-updated';
  userId: string;
  newImage?: string | null;
  newName?: string;
}

export interface AvatarChangedEvent {
  type: 'avatar-changed';
  userId: string;
  newImageUrl: string;
}

export interface SessionRefreshEvent {
  type: 'session-refresh';
}

export type AppEvent = ProfileUpdatedEvent | AvatarChangedEvent | SessionRefreshEvent;

class EventEmitter {
  private listeners: { [key in EventType]?: ((event: AppEvent) => void)[] } = {};

  on(eventType: EventType, callback: (event: AppEvent) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType]!.push(callback);


    return () => {
      const callbacks = this.listeners[eventType];
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: AppEvent) {
    const callbacks = this.listeners[event.type];
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  off(eventType: EventType, callback: (event: AppEvent) => void) {
    const callbacks = this.listeners[eventType];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}


export const appEvents = new EventEmitter();


export function emitProfileUpdated(userId: string, newImage?: string | null, newName?: string) {
  appEvents.emit({
    type: 'profile-updated',
    userId,
    newImage,
    newName
  });
}

export function emitAvatarChanged(userId: string, newImageUrl: string) {
  appEvents.emit({
    type: 'avatar-changed',
    userId,
    newImageUrl
  });
}

export function emitSessionRefresh() {
  appEvents.emit({
    type: 'session-refresh'
  });
}
