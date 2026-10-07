import { DataStore } from '../DataStore';
import { Customer } from '../../../types';

export class CustomerRepository {
  public static getAll(businessId?: string): Customer[] {
    const customers = DataStore.getState().customers;
    if (!businessId) return customers;
    return customers.filter((c: any) => c.businessId === businessId || !c.businessId);
  }

  public static getById(id: string, businessId?: string): Customer | undefined {
    return this.getAll(businessId).find((c) => c.id === id);
  }

  public static update(id: string, updates: Partial<Customer>, businessId?: string): Customer {
    let updated: Customer | undefined;

    DataStore.updateState((state) => {
      const updatedCustomers = state.customers.map((c: any) => {
        if (c.id === id && (!businessId || c.businessId === businessId || !c.businessId)) {
          updated = { ...c, ...updates };
          return updated;
        }
        return c;
      });
      return { ...state, customers: updatedCustomers };
    });

    if (!updated) {
      throw new Error(`Customer ${id} not found.`);
    }

    return updated;
  }
}
