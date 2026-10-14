/**
 * ParkFlow - Servicio de Comunicación con Backend PHP y Base de Datos MySQL (XAMPP)
 */

import { ParkingCell, Movement, Transaction, TariffScheme, VehicleType } from '../types/parking.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/parkflow-api';

export interface DbStatusResponse {
  connected: boolean;
  message: string;
  database?: string;
  host?: string;
  php_version?: string;
  tables?: string[];
  metrics?: {
    totalCells: number;
    occupiedCells: number;
    freeCells: number;
    blockedCells: number;
    occupancyPercent: number;
    todayRevenue: number;
    todayEntriesCount: number;
  };
}

export const ParkFlowApi = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkStatus(): Promise<DbStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/status.php`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      return {
        connected: false,
        message: 'No se pudo contactar con el backend PHP en XAMPP. Asegúrese de que Apache y MySQL estén iniciados.',
      };
    }
  },

  async setupDatabase(): Promise<{ success: boolean; message: string; counts?: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/setup_db.php`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'Error de conexión al inicializar la base de datos: ' + (err.message || 'Error desconocido'),
      };
    }
  },

  async getCells(): Promise<ParkingCell[]> {
    const response = await fetch(`${API_BASE_URL}/cells.php`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error al obtener celdas');
    }
    return result.data;
  },

  async getTariffs(): Promise<Record<VehicleType, TariffScheme>> {
    const response = await fetch(`${API_BASE_URL}/tariffs.php`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error al obtener tarifas');
    }
    return result.data;
  },

  async getMovements(): Promise<Movement[]> {
    const response = await fetch(`${API_BASE_URL}/movements.php?limit=25`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error al obtener movimientos');
    }
    return result.data;
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions.php?limit=100`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error al obtener transacciones');
    }
    return result.data;
  },

  async registerEntry(plate: string, category: VehicleType, requestedCellId?: string, notes?: string): Promise<{ success: boolean; ticketId?: string; cellId?: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/entry.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate, category, requestedCellId, notes }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Error al registrar entrada en MySQL' };
    }
    return result;
  },

  async processCheckout(cellIdOrPlate: string, paymentMethod: string = 'Efectivo', amountPaid?: number): Promise<{ success: boolean; total?: number; plate?: string; cellId?: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/checkout.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cellIdOrPlate, paymentMethod, amountPaid }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Error al liquidar en MySQL' };
    }
    return result;
  },

  async toggleMaintenance(cellId: string, reason?: string): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/cells.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cellId, action: 'maintenance', reason }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Error al cambiar mantenimiento' };
    }
    return result;
  },

  async updateTariff(category: VehicleType, ratePerHour: number, minFraction: number): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/tariffs.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, ratePerHour, minFraction }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Error al actualizar tarifa' };
    }
    return result;
  },
};
