export type VehicleType = 'Carro' | 'Moto' | 'Camioneta / SUV' | 'Bicicleta';

export type CellStatus = 'free' | 'occupied' | 'blocked';

export interface ParkingCell {
  id: string; // e.g. 'A-01'
  zone: 'Zona A' | 'Zona B';
  category: VehicleType;
  status: CellStatus;
  plate?: string;
  entryTime?: string;
  entryTimestamp?: number;
  duration?: string;
  currentTotal?: number;
  ratePerHour: number;
  maintenanceReason?: string;
  notes?: string;
  ticketId?: string;
}

export interface Movement {
  id: string;
  ticketId: string;
  plate: string;
  vehicleType: VehicleType;
  cellId: string;
  type: 'Entrada' | 'Salida';
  time: string;
  timestamp: number;
  amount?: number;
}

export interface Transaction {
  id: string; // e.g. '#TK-89421'
  plate: string;
  vehicleType: VehicleType;
  cellId: string;
  entryTime: string;
  entryTimestamp: number;
  exitTime?: string;
  exitTimestamp?: number;
  duration: string;
  snapshotRate: number;
  totalPaid: number;
  paymentMethod: 'Efectivo' | 'Bancolombia' | 'QR Nequi/Davi' | 'Datáfono' | 'Exento / Gracia' | 'Pendiente';
  operator: string;
  status: 'Completado' | 'En Curso' | 'Anulado';
  notes?: string;
}

export interface TariffScheme {
  category: VehicleType;
  ratePerHour: number;
  minFraction: number; // 0-30 min
  capacity: number;
  snapshotVersion: string;
}

export type AlertSoundType = 'beep' | 'chime' | 'alarm';

export interface CapacityThresholdSettings {
  warningThreshold: number; // e.g. 75 (%)
  criticalThreshold: number; // e.g. 90 (%)
  enableVisualAlert: boolean; // Visual banner and pulsing badges
  enableSoundAlert: boolean; // Audio alert when critical capacity is reached
  soundType: AlertSoundType;
  soundVolume: number; // 0.1 to 1.0 (e.g. 0.7)
  autoBlockOnMax: boolean; // Block express entries if 100% capacity
  alertOnZoneCritical: boolean; // Also alert if individual zone hits critical
  soundRepeatInterval: number; // 0 for once, or seconds e.g. 60
}

export type ActiveView = 
  | 'panel-operativo'
  | 'registro-de-entrada'
  | 'salida-y-cobro'
  | 'tarifas-y-celdas'
  | 'reportes-y-auditoria';
