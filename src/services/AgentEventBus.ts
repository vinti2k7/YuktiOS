export interface AgentEvent {
  id: string;
  type: string;
  sourceAgent: string;
  timestamp: string;
  payload: Record<string, any>;
}

type EventHandler = (event: AgentEvent) => void;

class AgentEventBusService {
  private handlers: Record<string, EventHandler[]> = {};
  private processedEventIds = new Set<string>();

  /**
   * Subscribe a handler to a specific event type or wildcard '*'
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }

  /**
   * Unsubscribe a handler from a specific event type
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers[eventType]) return;
    this.handlers[eventType] = this.handlers[eventType].filter((h) => h !== handler);
  }

  /**
   * Emit an event to all subscribed handlers with duplicate protection
   */
  emit(event: AgentEvent): boolean {
    if (this.processedEventIds.has(event.id)) {
      console.warn(`[AgentEventBus] Duplicate event ignored: ${event.id} (${event.type})`);
      return false;
    }

    this.processedEventIds.add(event.id);

    // Limit memory set size
    if (this.processedEventIds.size > 200) {
      const firstKey = Array.from(this.processedEventIds)[0];
      this.processedEventIds.delete(firstKey);
    }

    console.log(`[AgentEventBus] EMIT: ${event.type} from ${event.sourceAgent}`, event.payload);

    // Trigger type-specific handlers
    if (this.handlers[event.type]) {
      this.handlers[event.type].forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[AgentEventBus] Error in handler for ${event.type}:`, err);
        }
      });
    }

    // Trigger wildcard handlers
    if (this.handlers['*']) {
      this.handlers['*'].forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[AgentEventBus] Error in wildcard handler:`, err);
        }
      });
    }

    return true;
  }
}

export const AgentEventBus = new AgentEventBusService();
