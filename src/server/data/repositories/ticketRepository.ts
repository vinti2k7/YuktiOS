import { DataStore } from '../DataStore';
import { SupportTicket } from '../../../types';

export class TicketRepository {
  public static getAll(businessId?: string): SupportTicket[] {
    const tickets = DataStore.getState().supportTickets;
    if (!businessId) return tickets;
    return tickets.filter((t: any) => t.businessId === businessId || !t.businessId);
  }

  public static update(id: string, updates: Partial<SupportTicket>, businessId?: string): SupportTicket {
    let updated: SupportTicket | undefined;

    DataStore.updateState((state) => {
      const updatedTickets = state.supportTickets.map((t: any) => {
        if (t.id === id && (!businessId || t.businessId === businessId || !t.businessId)) {
          updated = { ...t, ...updates };
          return updated;
        }
        return t;
      });
      return { ...state, supportTickets: updatedTickets };
    });

    if (!updated) {
      throw new Error(`Ticket ${id} not found.`);
    }

    return updated;
  }
}
