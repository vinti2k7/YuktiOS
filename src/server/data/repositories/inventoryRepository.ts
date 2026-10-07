import { DataStore } from '../DataStore';
import { Product } from '../../../types';

export class InventoryRepository {
  public static getAll(businessId?: string): Product[] {
    const products = DataStore.getState().products;
    if (!businessId) return products;
    return products.filter((p: any) => p.businessId === businessId || !p.businessId);
  }

  public static getById(id: string, businessId?: string): Product | undefined {
    return this.getAll(businessId).find((p) => p.id === id || p.sku === id);
  }

  public static update(id: string, updates: Partial<Product>, businessId?: string): Product {
    let updatedProduct: Product | undefined;

    DataStore.updateState((state) => {
      const updatedProducts = state.products.map((p: any) => {
        if ((p.id === id || p.sku === id) && (!businessId || p.businessId === businessId || !p.businessId)) {
          updatedProduct = { ...p, ...updates };
          return updatedProduct;
        }
        return p;
      });

      return { ...state, products: updatedProducts };
    });

    if (!updatedProduct) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    return updatedProduct;
  }

  public static addStock(id: string, quantity: number, businessId?: string): Product {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    const current = this.getById(id, businessId);
    if (!current) {
      throw new Error(`Product ${id} not found`);
    }

    return this.update(current.id, {
      stockQuantity: current.stockQuantity + quantity,
      stockoutRiskScore: Math.max(5, current.stockoutRiskScore - 40),
    }, businessId);
  }
}
