import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { ParkingCell, Movement, Transaction, TariffScheme, ActiveView, VehicleType, CapacityThresholdSettings, AlertSoundType } from '../types/parking.ts';
import { playCapacityAlertSound } from '../utils/audioAlert.ts';

interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

interface ParkingContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cells: ParkingCell[];
  movements: Movement[];
  transactions: Transaction[];
  tariffs: Record<VehicleType, TariffScheme>;
  currentTimeString: string;
  totalOccupied: number;
  totalCapacity: number;
  occupancyPercent: number;
  freeCarsCount: number;
  occupiedCarsCount: number;
  freeMotosCount: number;
  occupiedMotosCount: number;
  todayRevenue: number;
  todayEntriesCount: number;
  selectedCellForModal: ParkingCell | null;
  setSelectedCellForModal: (cell: ParkingCell | null) => void;
  quickSearchPlate: string;
  setQuickSearchPlate: (plate: string) => void;
  toasts: ToastData[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  registerEntry: (plate: string, category: VehicleType, requestedCellId?: string, notes?: string) => { success: boolean; ticketId?: string; cellId?: string; error?: string };
  processCheckout: (cellIdOrPlate: string, paymentMethod?: 'Efectivo' | 'Bancolombia' | 'QR Nequi/Davi' | 'Datáfono', amountPaid?: number) => { success: boolean; total?: number; plate?: string; cellId?: string; error?: string };
  toggleCellMaintenance: (cellId: string, reason?: string) => void;
  updateTariff: (category: VehicleType, newRate: number, newMinFraction: number, reason: string) => void;
  exportToCsv: () => void;
  exportToExcel: () => void;
  selectedVehicleForCheckout: {
    cell: ParkingCell;
    calculatedTotal: number;
    hours: number;
    fractionMinutes: number;
  } | null;
  setSelectedVehicleForCheckout: (data: any) => void;
  // Threshold & Notification Settings
  thresholdSettings: CapacityThresholdSettings;
  updateThresholdSettings: (settings: Partial<CapacityThresholdSettings>) => void;
  isCapacityCritical: boolean;
  isCapacityWarning: boolean;
  isAlertDismissed: boolean;
  dismissAlert: () => void;
  playTestAlertSound: (soundType?: AlertSoundType, volume?: number) => void;
  simulateCapacity: (percent: number) => void;
  resetSimulatedCapacity: () => void;
  isSimulatedCapacity: boolean;
}

const defaultThresholdSettings: CapacityThresholdSettings = {
  warningThreshold: 75,
  criticalThreshold: 90,
  enableVisualAlert: true,
  enableSoundAlert: true,
  soundType: 'alarm',
  soundVolume: 0.75,
  autoBlockOnMax: false,
  alertOnZoneCritical: true,
  soundRepeatInterval: 60,
};

const initialTariffs: Record<VehicleType, TariffScheme> = {
  'Carro': { category: 'Carro', ratePerHour: 4500, minFraction: 2500, capacity: 30, snapshotVersion: 'v3.2' },
  'Moto': { category: 'Moto', ratePerHour: 2200, minFraction: 1200, capacity: 20, snapshotVersion: 'v3.2' },
  'Camioneta / SUV': { category: 'Camioneta / SUV', ratePerHour: 6000, minFraction: 3500, capacity: 15, snapshotVersion: 'v3.2' },
  'Bicicleta': { category: 'Bicicleta', ratePerHour: 1000, minFraction: 500, capacity: 10, snapshotVersion: 'v3.2' },
};

function generateInitialCells(): ParkingCell[] {
  const cells: ParkingCell[] = [];

  // Zona A: 30 Carros (A-01 to A-30)
  const zoneAOccupied: Record<string, { plate: string; time: string; duration: string; total: number }> = {
    'A-01': { plate: 'KLO-892', time: '11:15 AM', duration: '2h 17m', total: 13500 },
    'A-03': { plate: 'NVY-402', time: '12:40 PM', duration: '0h 52m', total: 4500 },
    'A-06': { plate: 'TRK-219', time: '09:05 AM', duration: '4h 27m', total: 22500 },
    'A-08': { plate: 'GHI-913', time: '13:10 PM', duration: '0h 22m', total: 4500 },
    'A-10': { plate: 'MKZ-771', time: '10:30 AM', duration: '3h 02m', total: 18000 },
    'A-11': { plate: 'ABC-123', time: '11:20 AM', duration: '2h 45m', total: 13500 },
    'A-13': { plate: 'URB-419', time: '09:00 AM', duration: '4h 30m', total: 22500 },
    'A-14': { plate: 'FGH-456', time: '12:15 PM', duration: '1h 17m', total: 9000 },
    'A-16': { plate: 'JHG-789', time: '11:50 AM', duration: '1h 42m', total: 9000 },
    'A-17': { plate: 'WER-234', time: '13:00 PM', duration: '0h 32m', total: 4500 },
    'A-19': { plate: 'TYU-567', time: '10:15 AM', duration: '3h 17m', total: 18000 },
    'A-20': { plate: 'BNM-890', time: '12:30 PM', duration: '1h 02m', total: 9000 },
    'A-21': { plate: 'QAZ-112', time: '11:40 AM', duration: '1h 52m', total: 9000 },
    'A-22': { plate: 'WSX-334', time: '08:50 AM', duration: '4h 42m', total: 22500 },
    'A-23': { plate: 'EDC-556', time: '12:20 PM', duration: '1h 12m', total: 9000 },
    'A-25': { plate: 'RFV-778', time: '10:45 AM', duration: '2h 47m', total: 13500 },
    'A-26': { plate: 'TGB-990', time: '13:05 PM', duration: '0h 27m', total: 4500 },
    'A-27': { plate: 'YHN-223', time: '11:10 AM', duration: '2h 22m', total: 13500 },
    'A-28': { plate: 'UJM-445', time: '09:30 AM', duration: '4h 02m', total: 22500 },
    'A-29': { plate: 'IKL-667', time: '12:55 PM', duration: '0h 37m', total: 4500 },
    'A-30': { plate: 'OLP-889', time: '10:00 AM', duration: '3h 32m', total: 18000 },
    'A-18': { plate: 'VBN-321', time: '12:10 PM', duration: '1h 22m', total: 9000 },
  };

  for (let i = 1; i <= 30; i++) {
    const id = `A-${i.toString().padStart(2, '0')}`;
    if (id === 'A-05') {
      cells.push({
        id,
        zone: 'Zona A',
        category: 'Carro',
        status: 'blocked',
        ratePerHour: 4500,
        maintenanceReason: 'SENSOR REPARACIÓN',
      });
    } else if (zoneAOccupied[id]) {
      const occ = zoneAOccupied[id];
      cells.push({
        id,
        zone: 'Zona A',
        category: 'Carro',
        status: 'occupied',
        plate: occ.plate,
        entryTime: occ.time,
        entryTimestamp: Date.now() - 3600000 * 2,
        duration: occ.duration,
        currentTotal: occ.total,
        ratePerHour: 4500,
        ticketId: `#TK-89${100 + i}`,
      });
    } else {
      cells.push({
        id,
        zone: 'Zona A',
        category: 'Carro',
        status: 'free',
        ratePerHour: 4500,
      });
    }
  }

  // Zona B: 20 Motocicletas (B-01 to B-20)
  const zoneBOccupied: Record<string, { plate: string; time: string; duration: string; total: number }> = {
    'B-01': { plate: 'WZF-12D', time: '12:00 PM', duration: '1h 32m', total: 4400 },
    'B-03': { plate: 'QAX-89F', time: '13:05 PM', duration: '0h 27m', total: 2200 },
    'B-06': { plate: 'MTO-89F', time: '12:45 PM', duration: '1h 30m', total: 4400 },
    'B-07': { plate: 'KJH-23B', time: '11:30 AM', duration: '2h 02m', total: 6600 },
    'B-09': { plate: 'BKN-032', time: '13:00 PM', duration: '0h 32m', total: 2200 },
    'B-10': { plate: 'PLM-45C', time: '10:20 AM', duration: '3h 12m', total: 8800 },
    'B-11': { plate: 'QWE-67D', time: '12:15 PM', duration: '1h 17m', total: 4400 },
    'B-13': { plate: 'ASD-89E', time: '11:45 AM', duration: '1h 47m', total: 4400 },
    'B-14': { plate: 'ZXC-01F', time: '13:10 PM', duration: '0h 22m', total: 2200 },
    'B-16': { plate: 'RTY-23G', time: '09:40 AM', duration: '3h 52m', total: 8800 },
    'B-17': { plate: 'FGH-45H', time: '12:35 PM', duration: '0h 57m', total: 2200 },
    'B-19': { plate: 'VBN-67J', time: '10:50 AM', duration: '2h 42m', total: 6600 },
  };

  for (let i = 1; i <= 20; i++) {
    const id = `B-${i.toString().padStart(2, '0')}`;
    if (id === 'B-05') {
      cells.push({
        id,
        zone: 'Zona B',
        category: 'Moto',
        status: 'blocked',
        ratePerHour: 2200,
        maintenanceReason: 'LIMPIEZA DE PISO',
      });
    } else if (zoneBOccupied[id]) {
      const occ = zoneBOccupied[id];
      cells.push({
        id,
        zone: 'Zona B',
        category: 'Moto',
        status: 'occupied',
        plate: occ.plate,
        entryTime: occ.time,
        entryTimestamp: Date.now() - 3600000 * 1.5,
        duration: occ.duration,
        currentTotal: occ.total,
        ratePerHour: 2200,
        ticketId: `#TK-89${200 + i}`,
      });
    } else {
      cells.push({
        id,
        zone: 'Zona B',
        category: 'Moto',
        status: 'free',
        ratePerHour: 2200,
      });
    }
  }

  return cells;
}

const initialMovements: Movement[] = [
  { id: 'mov-1', ticketId: '#TK-89421', plate: 'KLO-892', vehicleType: 'Carro', cellId: 'A-01', type: 'Entrada', time: '11:15 AM', timestamp: Date.now() - 7200000 },
  { id: 'mov-2', ticketId: '#TK-89415', plate: 'PLZ-550', vehicleType: 'Carro', cellId: 'A-12', type: 'Salida', time: '11:42 AM', timestamp: Date.now() - 5400000, amount: 9000 },
  { id: 'mov-3', ticketId: '#TK-89420', plate: 'WZF-12D', vehicleType: 'Moto', cellId: 'B-01', type: 'Entrada', time: '12:00 PM', timestamp: Date.now() - 4800000 },
  { id: 'mov-4', ticketId: '#TK-89422', plate: 'NVY-402', vehicleType: 'Carro', cellId: 'A-03', type: 'Entrada', time: '12:40 PM', timestamp: Date.now() - 3200000 },
  { id: 'mov-5', ticketId: '#TK-89416', plate: 'BKN-032', vehicleType: 'Moto', cellId: 'B-08', type: 'Salida', time: '13:00 PM', timestamp: Date.now() - 2400000, amount: 4400 },
];

const initialTransactions: Transaction[] = [
  {
    id: '#TK-89421',
    plate: 'ABC-123',
    vehicleType: 'Carro',
    cellId: 'A-14',
    entryTime: '24/10 11:20:10',
    entryTimestamp: Date.now() - 10000000,
    exitTime: '24/10 14:05:40',
    duration: '2h 45m',
    snapshotRate: 4500,
    totalPaid: 13500,
    paymentMethod: 'Efectivo',
    operator: 'M. Gómez',
    status: 'Completado',
  },
  {
    id: '#TK-89420',
    plate: 'MTO-89F',
    vehicleType: 'Moto',
    cellId: 'M-06',
    entryTime: '24/10 12:45:00',
    entryTimestamp: Date.now() - 6000000,
    exitTime: '24/10 14:15:22',
    duration: '1h 30m',
    snapshotRate: 2200,
    totalPaid: 4400,
    paymentMethod: 'Bancolombia',
    operator: 'M. Gómez',
    status: 'Completado',
  },
  {
    id: '#TK-89419',
    plate: 'KLP-552',
    vehicleType: 'Camioneta / SUV',
    cellId: 'C-02',
    entryTime: '24/10 13:00:15',
    entryTimestamp: Date.now() - 5500000,
    duration: '1h 32m (Activo)',
    snapshotRate: 6000,
    totalPaid: 0,
    paymentMethod: 'Pendiente',
    operator: 'M. Gómez',
    status: 'En Curso',
  },
  {
    id: '#TK-89418',
    plate: 'XTR-901',
    vehicleType: 'Carro',
    cellId: 'B-09',
    entryTime: '24/10 10:15:00',
    entryTimestamp: Date.now() - 15000000,
    exitTime: '24/10 10:19:12',
    duration: '4 min',
    snapshotRate: 4500,
    totalPaid: 0,
    paymentMethod: 'Exento / Gracia',
    operator: 'C. Rojas',
    status: 'Anulado',
    notes: 'Salida antes de gracia (15 min)',
  },
  {
    id: '#TK-89417',
    plate: 'URB-419',
    vehicleType: 'Carro',
    cellId: 'A-03',
    entryTime: '24/10 09:00:20',
    entryTimestamp: Date.now() - 20000000,
    exitTime: '24/10 13:30:10',
    duration: '4h 30m',
    snapshotRate: 4500,
    totalPaid: 22500,
    paymentMethod: 'Datáfono',
    operator: 'C. Rojas',
    status: 'Completado',
  },
];

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('panel-operativo');
  const [cells, setCells] = useState<ParkingCell[]>(generateInitialCells);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tariffs, setTariffs] = useState<Record<VehicleType, TariffScheme>>(initialTariffs);
  const [currentTimeString, setCurrentTimeString] = useState<string>('');
  const [selectedCellForModal, setSelectedCellForModal] = useState<ParkingCell | null>(null);
  const [quickSearchPlate, setQuickSearchPlate] = useState<string>('KLO-892');
  const [todayRevenue, setTodayRevenue] = useState<number>(748500);
  const [todayEntriesCount, setTodayEntriesCount] = useState<number>(142);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [selectedVehicleForCheckout, setSelectedVehicleForCheckout] = useState<any>(null);

  // Threshold & Notification Settings
  const [thresholdSettings, setThresholdSettings] = useState<CapacityThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem('parkflow_thresholds');
      if (saved) {
        return { ...defaultThresholdSettings, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return defaultThresholdSettings;
  });

  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [isSimulatedCapacity, setIsSimulatedCapacity] = useState<boolean>(false);
  const initialBackupCellsRef = useRef<ParkingCell[] | null>(null);

  const lastAlarmPlayedPercentRef = useRef<number | null>(null);
  const lastAlarmTimeRef = useRef<number>(0);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateThresholdSettings = useCallback((newSettings: Partial<CapacityThresholdSettings>) => {
    setThresholdSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('parkflow_thresholds', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
    showToast('Configuración de umbrales y alertas actualizada', 'success');
  }, [showToast]);

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const day = now.getDate();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      setCurrentTimeString(`${hours}:${minutes}:${seconds} - ${day} ${month} ${year}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Occupancy & Stats
  const totalCapacity = cells.length; // 50
  const occupiedCells = cells.filter((c) => c.status === 'occupied');
  const totalOccupied = occupiedCells.length;
  const occupancyPercent = Math.round((totalOccupied / totalCapacity) * 100);

  const carCells = cells.filter((c) => c.zone === 'Zona A');
  const occupiedCarsCount = carCells.filter((c) => c.status === 'occupied').length;
  const freeCarsCount = carCells.filter((c) => c.status === 'free').length;

  const motoCells = cells.filter((c) => c.zone === 'Zona B');
  const occupiedMotosCount = motoCells.filter((c) => c.status === 'occupied').length;
  const freeMotosCount = motoCells.filter((c) => c.status === 'free').length;

  // Capacity threshold calculations
  const isCapacityCritical = occupancyPercent >= thresholdSettings.criticalThreshold;
  const isCapacityWarning = occupancyPercent >= thresholdSettings.warningThreshold && !isCapacityCritical;

  // Auto-reset alert dismissal when occupancy drops below critical
  useEffect(() => {
    if (occupancyPercent < thresholdSettings.criticalThreshold) {
      setIsAlertDismissed(false);
    }
  }, [occupancyPercent, thresholdSettings.criticalThreshold]);

  // Audio alert monitoring
  useEffect(() => {
    if (!thresholdSettings.enableSoundAlert || isAlertDismissed) return;

    const now = Date.now();
    const intervalMs = (thresholdSettings.soundRepeatInterval || 60) * 1000;

    if (isCapacityCritical) {
      const crossedNow = lastAlarmPlayedPercentRef.current === null || lastAlarmPlayedPercentRef.current < thresholdSettings.criticalThreshold;
      const intervalPassed = thresholdSettings.soundRepeatInterval > 0 && (now - lastAlarmTimeRef.current >= intervalMs);

      if (crossedNow || intervalPassed) {
        lastAlarmPlayedPercentRef.current = occupancyPercent;
        lastAlarmTimeRef.current = now;
        playCapacityAlertSound(thresholdSettings.soundType, thresholdSettings.soundVolume);
      }
    } else {
      lastAlarmPlayedPercentRef.current = occupancyPercent;
    }
  }, [isCapacityCritical, occupancyPercent, thresholdSettings, isAlertDismissed]);

  const dismissAlert = useCallback(() => {
    setIsAlertDismissed(true);
    showToast('Alerta de aforo silenciada temporalmente', 'info');
  }, [showToast]);

  const playTestAlertSound = useCallback((soundType?: AlertSoundType, volume?: number) => {
    const chosenType = soundType || thresholdSettings.soundType;
    const chosenVol = volume !== undefined ? volume : thresholdSettings.soundVolume;
    playCapacityAlertSound(chosenType, chosenVol);
    showToast(`Tono '${chosenType.toUpperCase()}' emitido (Vol: ${Math.round(chosenVol * 100)}%)`, 'info');
  }, [thresholdSettings, showToast]);

  const simulateCapacity = useCallback((percent: number) => {
    if (!initialBackupCellsRef.current) {
      initialBackupCellsRef.current = cells.map((c) => ({ ...c }));
    }
    setIsSimulatedCapacity(true);
    const targetCount = Math.min(cells.length, Math.max(0, Math.round((percent / 100) * cells.length)));

    setCells((prev) => {
      const newCells = prev.map((c) => ({ ...c }));
      let currentOccupied = newCells.filter((c) => c.status === 'occupied').length;

      if (currentOccupied < targetCount) {
        for (const cell of newCells) {
          if (currentOccupied >= targetCount) break;
          if (cell.status === 'free') {
            cell.status = 'occupied';
            cell.plate = `SIM-${Math.floor(100 + Math.random() * 899)}`;
            cell.entryTime = '13:30 PM';
            cell.entryTimestamp = Date.now() - 3600000;
            cell.duration = '1h 00m';
            cell.currentTotal = cell.category === 'Moto' ? 2200 : 4500;
            cell.ticketId = `#SIM-${cell.id}`;
            currentOccupied++;
          }
        }
      } else if (currentOccupied > targetCount) {
        for (const cell of newCells) {
          if (currentOccupied <= targetCount) break;
          if (cell.status === 'occupied') {
            cell.status = 'free';
            cell.plate = undefined;
            cell.entryTime = undefined;
            cell.entryTimestamp = undefined;
            cell.duration = undefined;
            cell.currentTotal = undefined;
            cell.ticketId = undefined;
            currentOccupied--;
          }
        }
      }
      return newCells;
    });

    showToast(`Simulación de prueba: Aforo al ${percent}% (${targetCount}/${cells.length} bahías)`, 'warning');
  }, [cells, showToast]);

  const resetSimulatedCapacity = useCallback(() => {
    if (initialBackupCellsRef.current) {
      setCells(initialBackupCellsRef.current);
      initialBackupCellsRef.current = null;
    } else {
      setCells(generateInitialCells());
    }
    setIsSimulatedCapacity(false);
    setIsAlertDismissed(false);
    showToast('Aforo restablecido al estado operativo real', 'success');
  }, [showToast]);

  // Register Entry
  const registerEntry = useCallback(
    (plateInput: string, category: VehicleType, requestedCellId?: string, notes?: string) => {
      if (thresholdSettings.autoBlockOnMax && totalOccupied >= totalCapacity) {
        showToast('BLOQUEO AUTOMÁTICO: Capacidad al 100%. Política de aforo impide nuevos ingresos.', 'error');
        return { success: false, error: 'Aforo completo 100%' };
      }

      const sanitizedPlate = plateInput.trim().toUpperCase();
      if (!sanitizedPlate || sanitizedPlate.length < 3) {
        showToast('Ingrese una placa válida antes de continuar', 'warning');
        return { success: false, error: 'Placa inválida' };
      }

      // Anti-passback check: Check if vehicle is already inside
      const existingInPatio = cells.find((c) => c.status === 'occupied' && c.plate?.toUpperCase() === sanitizedPlate);
      if (existingInPatio) {
        showToast(`ALERTA Anti-Passback: El vehículo ${sanitizedPlate} ya está en la celda ${existingInPatio.id}`, 'error');
        return { success: false, error: 'Vehículo ya en patio' };
      }

      // Determine target cell
      let targetCell: ParkingCell | undefined;
      if (requestedCellId) {
        targetCell = cells.find((c) => c.id === requestedCellId && c.status === 'free');
      }

      if (!targetCell) {
        // Auto-assign: pick first free cell of matching zone
        const targetZone = (category === 'Moto' || category === 'Bicicleta') ? 'Zona B' : 'Zona A';
        targetCell = cells.find((c) => c.zone === targetZone && c.status === 'free');
      }

      if (!targetCell) {
        // fallback to any free cell
        targetCell = cells.find((c) => c.status === 'free');
      }

      if (!targetCell) {
        showToast('No hay celdas disponibles para esta categoría en este momento', 'error');
        return { success: false, error: 'Sin celdas disponibles' };
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
      const ticketNum = `#PF-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const currentTariff = tariffs[category] || tariffs['Carro'];

      // Update cell
      setCells((prev) =>
        prev.map((cell) =>
          cell.id === targetCell!.id
            ? {
                ...cell,
                status: 'occupied',
                plate: sanitizedPlate,
                category,
                entryTime: timeStr,
                entryTimestamp: Date.now(),
                duration: '0h 01m',
                currentTotal: currentTariff.minFraction,
                ratePerHour: currentTariff.ratePerHour,
                ticketId: ticketNum,
                notes,
              }
            : cell
        )
      );

      // Add movement
      const newMovement: Movement = {
        id: `mov-${Date.now()}`,
        ticketId: ticketNum,
        plate: sanitizedPlate,
        vehicleType: category,
        cellId: targetCell.id,
        type: 'Entrada',
        time: timeStr,
        timestamp: Date.now(),
      };
      setMovements((prev) => [newMovement, ...prev.slice(0, 9)]);

      // Add transaction record
      const newTx: Transaction = {
        id: ticketNum,
        plate: sanitizedPlate,
        vehicleType: category,
        cellId: targetCell.id,
        entryTime: `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        entryTimestamp: Date.now(),
        duration: 'En Curso',
        snapshotRate: currentTariff.ratePerHour,
        totalPaid: 0,
        paymentMethod: 'Pendiente',
        operator: 'T-01 (Admin)',
        status: 'En Curso',
        notes,
      };
      setTransactions((prev) => [newTx, ...prev]);

      setTodayEntriesCount((prev) => prev + 1);
      showToast(`¡Ingreso Registrado! Vehículo ${sanitizedPlate} asignado a celda ${targetCell.id}`, 'success');

      return { success: true, ticketId: ticketNum, cellId: targetCell.id };
    },
    [cells, tariffs, showToast]
  );

  // Process Checkout
  const processCheckout = useCallback(
    (cellIdOrPlate: string, paymentMethod: 'Efectivo' | 'Bancolombia' | 'QR Nequi/Davi' | 'Datáfono' = 'Efectivo') => {
      const query = cellIdOrPlate.trim().toUpperCase();
      const targetCell = cells.find(
        (c) => c.status === 'occupied' && (c.id.toUpperCase() === query || c.plate?.toUpperCase() === query)
      );

      if (!targetCell) {
        showToast(`No se encontró vehículo activo con identificador ${query}`, 'error');
        return { success: false, error: 'Vehículo no encontrado' };
      }

      // Calculate fee based on entry rate snapshot
      const ratePerHour = targetCell.ratePerHour || 4500;
      const elapsedMs = targetCell.entryTimestamp ? Date.now() - targetCell.entryTimestamp : 3600000 * 2.5;
      const hoursDecimal = Math.max(0.5, elapsedMs / (1000 * 60 * 60));
      const fullHours = Math.floor(hoursDecimal);
      const remainingMinutes = Math.round((hoursDecimal - fullHours) * 60);

      // Tariff rule: 1/4 fraction rounding
      const fractionQuarter = Math.ceil(remainingMinutes / 15);
      const fractionFee = (fractionQuarter * (ratePerHour / 4));
      const calculatedTotal = Math.round(fullHours * ratePerHour + fractionFee);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

      // Free cell
      setCells((prev) =>
        prev.map((cell) =>
          cell.id === targetCell.id
            ? {
                id: cell.id,
                zone: cell.zone,
                category: cell.category,
                status: 'free',
                ratePerHour: cell.ratePerHour,
              }
            : cell
        )
      );

      // Add exit movement
      const exitMovement: Movement = {
        id: `mov-${Date.now()}`,
        ticketId: targetCell.ticketId || `#TK-${Math.floor(10000 + Math.random() * 90000)}`,
        plate: targetCell.plate || '---',
        vehicleType: targetCell.category,
        cellId: targetCell.id,
        type: 'Salida',
        time: timeStr,
        timestamp: Date.now(),
        amount: calculatedTotal,
      };
      setMovements((prev) => [exitMovement, ...prev.slice(0, 9)]);

      // Update transactions
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.plate === targetCell.plate && tx.status === 'En Curso'
            ? {
                ...tx,
                exitTime: `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
                exitTimestamp: Date.now(),
                duration: `${fullHours}h ${remainingMinutes}m`,
                totalPaid: calculatedTotal,
                paymentMethod,
                status: 'Completado',
              }
            : tx
        )
      );

      setTodayRevenue((prev) => prev + calculatedTotal);
      showToast(`Cobro confirmado: $${calculatedTotal.toLocaleString('es-CO')} COP. Celda ${targetCell.id} liberada.`, 'success');

      return {
        success: true,
        total: calculatedTotal,
        plate: targetCell.plate,
        cellId: targetCell.id,
      };
    },
    [cells, showToast]
  );

  // Toggle Cell Maintenance
  const toggleCellMaintenance = useCallback(
    (cellId: string, reason: string = 'Mantenimiento Preventivo') => {
      setCells((prev) =>
        prev.map((c) => {
          if (c.id === cellId) {
            if (c.status === 'blocked') {
              showToast(`Celda ${cellId} habilitada nuevamente para servicio.`, 'success');
              return { ...c, status: 'free', maintenanceReason: undefined };
            } else if (c.status === 'free') {
              showToast(`Celda ${cellId} bloqueada por: ${reason}`, 'warning');
              return { ...c, status: 'blocked', maintenanceReason: reason };
            } else {
              showToast(`No se puede bloquear la celda ${cellId} porque está ocupada.`, 'error');
              return c;
            }
          }
          return c;
        })
      );
    },
    [showToast]
  );

  // Update Tariffs (with PRD 3.4 Snapshot rule)
  const updateTariff = useCallback(
    (category: VehicleType, newRate: number, newMinFraction: number, reason: string) => {
      const nextVersion = `v${(parseFloat(tariffs[category].snapshotVersion.replace('v', '')) + 0.1).toFixed(1)}`;
      setTariffs((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          ratePerHour: newRate,
          minFraction: newMinFraction,
          snapshotVersion: nextVersion,
        },
      }));
      showToast(
        `Snapshot ${nextVersion} generado: Tarifa de ${category} fijada a $${newRate.toLocaleString('es-CO')}/h (${reason})`,
        'info'
      );
    },
    [tariffs, showToast]
  );

  // Export to CSV
  const exportToCsv = useCallback(() => {
    const headers = ['ID Ticket', 'Placa', 'Tipo Vehiculo', 'Celda', 'Ingreso', 'Salida', 'Duracion', 'Tarifa Base', 'Total Cobrado', 'Metodo Pago', 'Operador', 'Estado'];
    const rows = transactions.map((t) => [
      t.id,
      t.plate,
      t.vehicleType,
      t.cellId,
      t.entryTime,
      t.exitTime || 'En patio',
      t.duration,
      `$${t.snapshotRate}`,
      `$${t.totalPaid}`,
      t.paymentMethod,
      t.operator,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ParkFlow_Auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportación CSV descargada exitosamente', 'success');
  }, [transactions, showToast]);

  // Export to Excel simulation
  const exportToExcel = useCallback(() => {
    exportToCsv(); // triggers compatible spreadsheet CSV download
    showToast('Archivo Excel consolidado (.xlsx) generado con 584 registros.', 'success');
  }, [exportToCsv, showToast]);

  return (
    <ParkingContext.Provider
      value={{
        activeView,
        setActiveView,
        cells,
        movements,
        transactions,
        tariffs,
        currentTimeString,
        totalOccupied,
        totalCapacity,
        occupancyPercent,
        freeCarsCount,
        occupiedCarsCount,
        freeMotosCount,
        occupiedMotosCount,
        todayRevenue,
        todayEntriesCount,
        selectedCellForModal,
        setSelectedCellForModal,
        quickSearchPlate,
        setQuickSearchPlate,
        toasts,
        showToast,
        removeToast,
        registerEntry,
        processCheckout,
        toggleCellMaintenance,
        updateTariff,
        exportToCsv,
        exportToExcel,
        selectedVehicleForCheckout,
        setSelectedVehicleForCheckout,
        thresholdSettings,
        updateThresholdSettings,
        isCapacityCritical,
        isCapacityWarning,
        isAlertDismissed,
        dismissAlert,
        playTestAlertSound,
        simulateCapacity,
        resetSimulatedCapacity,
        isSimulatedCapacity,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = (): ParkingContextType => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
