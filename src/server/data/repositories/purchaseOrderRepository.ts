import { DataStore } from '../DataStore';

export interface PurchaseOrderRecord {
  id: string;
  businessId?: string;
  product: string;
  sku: string;
  quantity: number;
  amount: number;
  supplier: string;
  status: 'draft' | 'pending' | 'approved' | 'created' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export class PurchaseOrderRepository {
  public static getAll(businessId?: string): PurchaseOrderRecord[] {
    const state = DataStore.getState() as any;
    const pos: PurchaseOrderRecord[] = state.purchaseOrders || [];
    if (!businessId) return pos;
    return pos.filter((po) => po.businessId === businessId || !po.businessId);
  }

  public static create(po: Omit<PurchaseOrderRecord, 'id' | 'createdAt'>, businessId?: string): PurchaseOrderRecord {
    if (po.quantity <= 0) {
      throw new Error('Purchase order quantity must be greater than 0');
    }
    if (po.amount < 0) {
      throw new Error('Purchase order amount cannot be negative');
    }

    const newPO: PurchaseOrderRecord = {
      ...po,
      businessId: businessId || po.businessId,
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    DataStore.updateState((state: any) => {
      const existingPOs = state.purchaseOrders || [];
      return {
        ...state,
        purchaseOrders: [newPO, ...existingPOs],
      };
    });

    return newPO;
  }
}
