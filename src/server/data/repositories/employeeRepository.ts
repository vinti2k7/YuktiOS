import { DataStore } from '../DataStore';
import { Employee } from '../../../types';

export class EmployeeRepository {
  public static getAll(businessId?: string): Employee[] {
    const employees = DataStore.getState().employees;
    if (!businessId) return employees;
    return employees.filter((e: any) => e.businessId === businessId || !e.businessId);
  }

  public static getById(id: string, businessId?: string): Employee | undefined {
    return this.getAll(businessId).find((e) => e.id === id);
  }

  public static update(id: string, updates: Partial<Employee>, businessId?: string): Employee {
    let updated: Employee | undefined;

    DataStore.updateState((state) => {
      const updatedEmployees = state.employees.map((e: any) => {
        if (e.id === id && (!businessId || e.businessId === businessId || !e.businessId)) {
          updated = { ...e, ...updates };
          return updated;
        }
        return e;
      });

      return { ...state, employees: updatedEmployees };
    });

    if (!updated) {
      throw new Error(`Employee ${id} not found.`);
    }

    return updated;
  }
}
