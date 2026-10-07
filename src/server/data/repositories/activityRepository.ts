import { DataStore } from '../DataStore';
import { EventLogItem } from '../../../types';

export class ActivityRepository {
  public static getAll(businessId?: string): EventLogItem[] {
    const logs = DataStore.getState().eventLogs;
    if (!businessId) return logs;
    return logs.filter((e: any) => e.businessId === businessId || !e.businessId);
  }

  public static create(event: Omit<EventLogItem, 'id' | 'timestamp'>, businessId?: string): EventLogItem {
    const newEvent: EventLogItem = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    (newEvent as any).businessId = businessId;

    DataStore.updateState((state) => ({
      ...state,
      eventLogs: [newEvent, ...state.eventLogs],
    }));

    return newEvent;
  }
}
