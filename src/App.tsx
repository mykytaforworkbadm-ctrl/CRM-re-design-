/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterPanel } from './components/FilterPanel';
import { ClientsTable } from './components/ClientsTable';
import { EntityRegistryTable } from './components/EntityRegistryTable';
import { ChangeLockModal } from './components/ChangeLockModal';
import { ChangeObjectLockModal } from './components/ChangeObjectLockModal';
import { QueueOrdersPage } from './components/QueueOrdersPage';
import { ObjectLocksPage } from './components/ObjectLocksPage';
import { UnlockedQueueOrdersPage } from './components/UnlockedQueueOrdersPage';
import { MassActionModal } from './components/MassActionModal';
import {
  INITIAL_CLIENTS,
  INITIAL_OBJECT_LOCKS,
  QUEUE_ORDERS,
  UNLOCKED_QUEUE_ORDERS,
  UNIONS_DATA,
  DEPTS_DATA,
  RSPS_DATA,
  ROUTES_DATA
} from './data/mockData';
import {
  ClientRecord,
  FilterState,
  ColumnFilters,
  AppPage,
  ObjectLockRecord,
  QueueOrder,
  UnlockedQueueOrder,
  EntityType,
  EntityRegistryRow
} from './types';

export default function App() {
  const [currentLang, setCurrentLang] = useState<'UA' | 'RU'>('UA');
  
  // Page state with hash initialization
  const getPageFromHash = (): AppPage => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('buffer')) return 'buffer';
    if (hash.includes('object')) return 'objects';
    if (hash.includes('unlocked')) return 'unlocked-queue';
    return 'registry';
  };

  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromHash);

  // Sync hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: AppPage) => {
    if (page === 'registry') window.location.hash = '/auto-processing/client-locks';
    else if (page === 'buffer') window.location.hash = '/auto-processing/buffer-queue';
    else if (page === 'objects') window.location.hash = '/auto-processing/object-locks';
    else if (page === 'unlocked-queue') window.location.hash = '/auto-processing/unlocked-queue';
    
    if (page !== 'buffer') {
      setDrilldownClient(null);
    }
    setCurrentPage(page);
  };

  // Core records
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [objectLocks, setObjectLocks] = useState<ObjectLockRecord[]>(INITIAL_OBJECT_LOCKS);
  const [orders] = useState<QueueOrder[]>(QUEUE_ORDERS);
  const [unlockedOrders] = useState<UnlockedQueueOrder[]>(UNLOCKED_QUEUE_ORDERS);

  // Selected client & drilldown states
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(INITIAL_CLIENTS[1] || null);
  const [drilldownClient, setDrilldownClient] = useState<ClientRecord | null>(null);

  // Main filter panel state with 6 radio choices, defaulting to 'client_code'
  const [filters, setFilters] = useState<FilterState>({
    filterBy: 'client_code',
    clientCode: '',
    clientName: '',
    unionId: 0,
    deptId: 0,
    rspId: 0,
    routeId: 0,
    showOnlyLocked: false
  });

  // Inline column filters for clients registry table
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    type: '',
    block: '',
    clCode: '',
    clName: '',
    corpCode: '',
    corpName: '',
    unionName: '',
    mngName: '',
    editDate: '',
    editUser: '',
    reason: '',
    countUrgent: '',
    countOrders: '',
    sumAllOrders: '',
    countRowsAllOrders: '',
    countIgnored: ''
  });

  // Modals state
  const [isChangeLockOpen, setIsChangeLockOpen] = useState<boolean>(false);
  const [modalClient, setModalClient] = useState<ClientRecord | null>(null);
  
  const [isChangeObjectLockOpen, setIsChangeObjectLockOpen] = useState<boolean>(false);
  const [modalObjectRow, setModalObjectRow] = useState<EntityRegistryRow | null>(null);

  const [isMassActionOpen, setIsMassActionOpen] = useState<boolean>(false);

  // Core filter application logic for clients
  const applyFilterLogic = (currentFilters: FilterState) => {
    let result = [...INITIAL_CLIENTS];

    if (currentFilters.filterBy === 'client_code' && currentFilters.clientCode.trim()) {
      const q = currentFilters.clientCode.trim().toLowerCase();
      result = result.filter((c) => c.clCode.toLowerCase().includes(q));
    }
    if (currentFilters.filterBy === 'client_name' && currentFilters.clientName.trim()) {
      const q = currentFilters.clientName.trim().toLowerCase();
      result = result.filter((c) => c.clName.toLowerCase().includes(q));
    }

    if (currentFilters.showOnlyLocked) {
      result = result.filter((c) => c.isBlocked);
    }

    setClients(result);
  };

  // Handle Main Filter Apply
  const handleApplyFilter = () => {
    if (filters.filterBy === 'client_code' || filters.filterBy === 'client_name') {
      applyFilterLogic(filters);
    }
  };

  // Handle Filter Reset
  const handleResetFilters = () => {
    const resetState: FilterState = {
      filterBy: filters.filterBy,
      clientCode: '',
      clientName: '',
      unionId: 0,
      deptId: 0,
      rspId: 0,
      routeId: 0,
      showOnlyLocked: false
    };
    setFilters(resetState);
    setClients(INITIAL_CLIENTS);
  };

  const handleToggleLocked = () => {
    const nextLocked = !filters.showOnlyLocked;
    const updated = { ...filters, showOnlyLocked: nextLocked };
    setFilters(updated);
    if (filters.filterBy === 'client_code' || filters.filterBy === 'client_name') {
      applyFilterLogic(updated);
    }
  };

  // Open "Зміна блокування" Modal for client
  const handleOpenChangeLock = (client: ClientRecord) => {
    setModalClient(client);
    setIsChangeLockOpen(true);
  };

  // Open "Зміна блокування" Modal for object (Union, RSP, Warehouse, Route)
  const handleOpenChangeObjectLock = (row: EntityRegistryRow) => {
    setModalObjectRow(row);
    setIsChangeObjectLockOpen(true);
  };

  // Save single client lock change
  const handleSaveLock = (
    clientId: number,
    isBlocked: boolean,
    reason: string,
    startDateTime?: string,
    endDateTime?: string
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const isScheduled = isBlocked && Boolean(startDateTime || endDateTime);

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const newLockDetails = isBlocked
            ? [
                {
                  source: 'Клієнт' as const,
                  reason: reason || 'Кредитный лимит',
                  isScheduled,
                  startDate: startDateTime,
                  endDate: endDateTime
                }
              ]
            : [];
          return {
            ...c,
            isBlocked,
            isScheduled,
            scheduledTime: startDateTime ? startDateTime.replace('T', ' ') : undefined,
            reason: isBlocked ? (reason || 'Кредитный лимит') : '',
            lockDetails: newLockDetails,
            editDate: formattedDate,
            editUser: 'Дубінін Микита Валерійович'
          };
        }
        return c;
      })
    );
  };

  // Save single object lock change (Union, RSP, Warehouse, Route)
  const handleSaveObjectLock = (
    targetType: EntityType,
    targetCode: string,
    targetName: string,
    isBlocked: boolean,
    reason: string,
    startDate?: string,
    endDate?: string
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const isScheduled = isBlocked && Boolean(startDate || endDate);

    if (isBlocked) {
      setObjectLocks((prev) => {
        const existingIndex = prev.findIndex(
          (l) => l.targetType === targetType && (l.targetCode === targetCode || l.targetName === targetName)
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            reason: reason || 'Блокування НКЦ',
            lockDate: formattedDate,
            lockedBy: 'Дубінін Микита Валерійович',
            startDate,
            endDate,
            isScheduled
          };
          return updated;
        } else {
          const newLock: ObjectLockRecord = {
            id: `lock-${Date.now()}`,
            targetType,
            targetCode,
            targetName,
            reason: reason || 'Блокування НКЦ',
            lockDate: formattedDate,
            lockedBy: 'Дубінін Микита Валерійович',
            startDate,
            endDate,
            isScheduled
          };
          return [newLock, ...prev];
        }
      });

      // Cascade to clients belonging to this entity
      setClients((prev) =>
        prev.map((c) => {
          let matches = false;
          if (targetType === 'Об\'єднання' && (String(c.unionId) === targetCode || c.unionName === targetName)) matches = true;
          if (targetType === 'РСП' && (String(c.rspId) === targetCode || c.rspName === targetName)) matches = true;
          if (targetType === 'Склад' && (String(c.deptId) === targetCode || c.deptName === targetName)) matches = true;
          if (targetType === 'Маршрут' && (String(c.routeId) === targetCode || c.routeName === targetName)) matches = true;

          if (matches) {
            const existingDetails = c.lockDetails || [];
            const filtered = existingDetails.filter((ld) => ld.source !== targetType);
            const newDetail = {
              source: targetType,
              reason: reason || 'Блокування НКЦ',
              startDate,
              endDate,
              isScheduled
            };
            return {
              ...c,
              isBlocked: true,
              reason: reason || 'Блокування НКЦ',
              lockDetails: [newDetail, ...filtered]
            };
          }
          return c;
        })
      );
    } else {
      // Remove object lock
      setObjectLocks((prev) =>
        prev.filter(
          (l) => !(l.targetType === targetType && (l.targetCode === targetCode || l.targetName === targetName))
        )
      );

      // Cascade to clients
      setClients((prev) =>
        prev.map((c) => {
          let matches = false;
          if (targetType === 'Об\'єднання' && (String(c.unionId) === targetCode || c.unionName === targetName)) matches = true;
          if (targetType === 'РСП' && (String(c.rspId) === targetCode || c.rspName === targetName)) matches = true;
          if (targetType === 'Склад' && (String(c.deptId) === targetCode || c.deptName === targetName)) matches = true;
          if (targetType === 'Маршрут' && (String(c.routeId) === targetCode || c.routeName === targetName)) matches = true;

          if (matches && c.lockDetails) {
            const remainingDetails = c.lockDetails.filter((ld) => ld.source !== targetType);
            return {
              ...c,
              isBlocked: remainingDetails.length > 0,
              reason: remainingDetails.length > 0 ? remainingDetails[0].reason : '',
              lockDetails: remainingDetails
            };
          }
          return c;
        })
      );
    }
  };

  // Navigate to Buffer page from client row or modal
  const handleDrilldownBuffer = (client: ClientRecord) => {
    setDrilldownClient(client);
    navigateTo('buffer');
  };

  // Remove Object Lock from Objects Page
  const handleRemoveObjectLock = (lockId: string) => {
    const removedLock = objectLocks.find((l) => l.id === lockId);
    setObjectLocks((prev) => prev.filter((l) => l.id !== lockId));

    if (removedLock) {
      setClients((prev) =>
        prev.map((c) => {
          if (!c.lockDetails) return c;
          const filteredDetails = c.lockDetails.filter(
            (ld) => !(ld.source === removedLock.targetType && ld.reason === removedLock.reason)
          );
          return {
            ...c,
            isBlocked: filteredDetails.length > 0,
            lockDetails: filteredDetails,
            reason: filteredDetails.length > 0 ? filteredDetails[0].reason : ''
          };
        })
      );
    }
  };

  // Mass Action Handler
  const handleApplyMassAction = (
    entityType: 'clients' | 'routes' | 'rsps' | 'depts',
    selectedIds: (number | string)[],
    action: 'lock' | 'unlock',
    reason: string,
    startDateTime?: string,
    endDateTime?: string
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const isLocking = action === 'lock';
    const isScheduled = isLocking && Boolean(startDateTime || endDateTime);

    if (entityType === 'clients') {
      const idSet = new Set(selectedIds.map(Number));
      setClients((prev) =>
        prev.map((c) => {
          if (idSet.has(c.id)) {
            const newLockDetails = isLocking
              ? [
                  {
                    source: 'Клієнт' as const,
                    reason: reason || 'Блокування НКЦ',
                    isScheduled,
                    startDate: startDateTime,
                    endDate: endDateTime
                  }
                ]
              : [];
            return {
              ...c,
              isBlocked: isLocking,
              isScheduled,
              scheduledTime: startDateTime ? startDateTime.replace('T', ' ') : undefined,
              reason: isLocking ? reason : '',
              lockDetails: newLockDetails,
              editDate: formattedDate,
              editUser: 'Дубінін Микита Валерійович'
            };
          }
          return c;
        })
      );
    } else {
      let targetType: EntityType = 'Маршрут';
      if (entityType === 'rsps') targetType = 'РСП';
      if (entityType === 'depts') targetType = 'Склад';

      if (isLocking) {
        const newLocks: ObjectLockRecord[] = selectedIds.map((id) => {
          let name = String(id);
          if (entityType === 'routes') {
            const found = ROUTES_DATA.find((r) => r.value === Number(id));
            if (found) name = found.label;
          } else if (entityType === 'rsps') {
            const found = RSPS_DATA.find((r) => r.value === Number(id));
            if (found) name = found.label;
          } else if (entityType === 'depts') {
            const found = DEPTS_DATA.find((d) => d.value === Number(id));
            if (found) name = found.label;
          }

          return {
            id: `lock-mass-${id}-${Date.now()}`,
            targetType,
            targetCode: String(id),
            targetName: name,
            reason: reason || 'Блокування НКЦ',
            lockDate: formattedDate,
            lockedBy: 'Дубінін Микита Валерійович',
            startDate: startDateTime,
            endDate: endDateTime,
            isScheduled
          };
        });

        setObjectLocks((prev) => {
          const filtered = prev.filter(
            (l) => !(l.targetType === targetType && selectedIds.map(String).includes(l.targetCode))
          );
          return [...newLocks, ...filtered];
        });

        // Cascade to clients
        setClients((prev) =>
          prev.map((c) => {
            let matches = false;
            if (entityType === 'routes' && selectedIds.map(Number).includes(c.routeId)) matches = true;
            if (entityType === 'rsps' && selectedIds.map(Number).includes(c.rspId)) matches = true;
            if (entityType === 'depts' && selectedIds.map(Number).includes(c.deptId)) matches = true;

            if (matches) {
              const existingDetails = c.lockDetails || [];
              const filtered = existingDetails.filter((ld) => ld.source !== targetType);
              const newDetail = {
                source: targetType,
                reason: reason || 'Блокування НКЦ',
                startDate: startDateTime,
                endDate: endDateTime,
                isScheduled
              };
              return {
                ...c,
                isBlocked: true,
                reason: reason || 'Блокування НКЦ',
                lockDetails: [newDetail, ...filtered]
              };
            }
            return c;
          })
        );
      } else {
        // Unlock mass objects
        setObjectLocks((prev) =>
          prev.filter(
            (l) => !(l.targetType === targetType && selectedIds.map(String).includes(l.targetCode))
          )
        );

        setClients((prev) =>
          prev.map((c) => {
            let matches = false;
            if (entityType === 'routes' && selectedIds.map(Number).includes(c.routeId)) matches = true;
            if (entityType === 'rsps' && selectedIds.map(Number).includes(c.rspId)) matches = true;
            if (entityType === 'depts' && selectedIds.map(Number).includes(c.deptId)) matches = true;

            if (matches && c.lockDetails) {
              const remainingDetails = c.lockDetails.filter((ld) => ld.source !== targetType);
              return {
                ...c,
                isBlocked: remainingDetails.length > 0,
                reason: remainingDetails.length > 0 ? remainingDetails[0].reason : '',
                lockDetails: remainingDetails
              };
            }
            return c;
          })
        );
      }
    }
  };

  // Generate rows for the entity registries (Union, RSP, Warehouse, Route)
  const currentEntityRows: EntityRegistryRow[] = useMemo(() => {
    if (filters.filterBy === 'union') {
      const list = UNIONS_DATA.filter((u) => u.value > 0);
      return list
        .filter((u) => (filters.unionId > 0 ? u.value === filters.unionId : true))
        .map((u) => {
          const lock = objectLocks.find(
            (l) =>
              l.targetType === 'Об\'єднання' &&
              (l.targetCode === String(u.value) || l.targetName.toLowerCase() === u.label.toLowerCase())
          );
          const relatedClients = clients.filter(
            (c) => c.unionId === u.value || c.unionName === u.label
          );
          const countOrders = relatedClients.reduce(
            (acc, c) => acc + (c.countOrders ? Number(c.countOrders) : 0),
            0
          );
          const sumOrdersVal = relatedClients.reduce((acc, c) => {
            const s = parseFloat(c.sumAllOrders.replace(/\s/g, '').replace(',', '.')) || 0;
            return acc + s;
          }, 0);
          const countRows = relatedClients.reduce(
            (acc, c) => acc + (c.countRowsAllOrders ? Number(c.countRowsAllOrders) : 0),
            0
          );

          return {
            id: `union-${u.value}`,
            type: 'Об\'єднання',
            code: String(u.value),
            name: u.label,
            isBlocked: Boolean(lock),
            isScheduled: lock?.isScheduled,
            startDate: lock?.startDate,
            endDate: lock?.endDate,
            editDate: lock ? lock.lockDate : '',
            editUser: lock ? lock.lockedBy : '',
            reason: lock ? lock.reason : '',
            countOrders: countOrders > 0 ? countOrders : (u.label === 'О_Аннушка Хелс Кеа' ? 2 : ''),
            sumOrders:
              sumOrdersVal > 0
                ? sumOrdersVal.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ')
                : (u.label === 'О_Аннушка Хелс Кеа' ? '14 320,50' : ''),
            countRows: countRows > 0 ? countRows : (u.label === 'О_Аннушка Хелс Кеа' ? 12 : '')
          };
        });
    }

    if (filters.filterBy === 'rsp') {
      const list = RSPS_DATA.filter((r) => r.value > 0);
      return list
        .filter((r) => (filters.rspId > 0 ? r.value === filters.rspId : true))
        .map((r) => {
          const lock = objectLocks.find(
            (l) =>
              l.targetType === 'РСП' &&
              (l.targetCode === String(r.value) || l.targetName.toLowerCase() === r.label.toLowerCase())
          );
          const relatedClients = clients.filter(
            (c) => c.rspId === r.value || c.rspName === r.label
          );
          const countOrders = relatedClients.reduce(
            (acc, c) => acc + (c.countOrders ? Number(c.countOrders) : 0),
            0
          );
          const sumOrdersVal = relatedClients.reduce((acc, c) => {
            const s = parseFloat(c.sumAllOrders.replace(/\s/g, '').replace(',', '.')) || 0;
            return acc + s;
          }, 0);
          const countRows = relatedClients.reduce(
            (acc, c) => acc + (c.countRowsAllOrders ? Number(c.countRowsAllOrders) : 0),
            0
          );

          return {
            id: `rsp-${r.value}`,
            type: 'РСП',
            code: String(r.value),
            name: r.label,
            isBlocked: Boolean(lock),
            isScheduled: lock?.isScheduled,
            startDate: lock?.startDate,
            endDate: lock?.endDate,
            editDate: lock ? lock.lockDate : '',
            editUser: lock ? lock.lockedBy : '',
            reason: lock ? lock.reason : '',
            countOrders: countOrders > 0 ? countOrders : (r.label === 'Київ Темпус' ? 27 : ''),
            sumOrders:
              sumOrdersVal > 0
                ? sumOrdersVal.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ')
                : (r.label === 'Київ Темпус' ? '211 200,00' : ''),
            countRows: countRows > 0 ? countRows : (r.label === 'Київ Темпус' ? 133 : '')
          };
        });
    }

    if (filters.filterBy === 'dept') {
      const list = DEPTS_DATA.filter((d) => d.value !== 0);
      return list
        .filter((d) => (filters.deptId !== 0 ? d.value === filters.deptId : true))
        .map((d) => {
          const lock = objectLocks.find(
            (l) =>
              l.targetType === 'Склад' &&
              (l.targetCode === String(d.value) || l.targetName.toLowerCase() === d.label.toLowerCase())
          );
          const relatedClients = clients.filter(
            (c) => c.deptId === d.value || c.deptName === d.label
          );
          const countOrders = relatedClients.reduce(
            (acc, c) => acc + (c.countOrders ? Number(c.countOrders) : 0),
            0
          );
          const sumOrdersVal = relatedClients.reduce((acc, c) => {
            const s = parseFloat(c.sumAllOrders.replace(/\s/g, '').replace(',', '.')) || 0;
            return acc + s;
          }, 0);
          const countRows = relatedClients.reduce(
            (acc, c) => acc + (c.countRowsAllOrders ? Number(c.countRowsAllOrders) : 0),
            0
          );

          return {
            id: `dept-${d.value}`,
            type: 'Склад',
            code: String(d.value),
            name: d.label,
            isBlocked: Boolean(lock),
            isScheduled: lock?.isScheduled,
            startDate: lock?.startDate,
            endDate: lock?.endDate,
            editDate: lock ? lock.lockDate : '',
            editUser: lock ? lock.lockedBy : '',
            reason: lock ? lock.reason : '',
            countOrders: countOrders > 0 ? countOrders : (d.label === 'Паникахи Днепропетровск Сводный' ? 12 : ''),
            sumOrders:
              sumOrdersVal > 0
                ? sumOrdersVal.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ')
                : (d.label === 'Паникахи Днепропетровск Сводный' ? '78 200,00' : ''),
            countRows: countRows > 0 ? countRows : (d.label === 'Паникахи Днепропетровск Сводный' ? 45 : '')
          };
        });
    }

    if (filters.filterBy === 'route') {
      const list = ROUTES_DATA.filter((rt) => rt.value > 0);
      return list
        .filter((rt) => (filters.routeId > 0 ? rt.value === filters.routeId : true))
        .map((rt) => {
          const lock = objectLocks.find(
            (l) =>
              l.targetType === 'Маршрут' &&
              (l.targetCode === String(rt.value) || l.targetName.toLowerCase() === rt.label.toLowerCase())
          );
          const relatedClients = clients.filter(
            (c) => c.routeId === rt.value || c.routeName === rt.label
          );
          const countOrders = relatedClients.reduce(
            (acc, c) => acc + (c.countOrders ? Number(c.countOrders) : 0),
            0
          );
          const sumOrdersVal = relatedClients.reduce((acc, c) => {
            const s = parseFloat(c.sumAllOrders.replace(/\s/g, '').replace(',', '.')) || 0;
            return acc + s;
          }, 0);
          const countRows = relatedClients.reduce(
            (acc, c) => acc + (c.countRowsAllOrders ? Number(c.countRowsAllOrders) : 0),
            0
          );

          return {
            id: `route-${rt.value}`,
            type: 'Маршрут',
            code: String(rt.value),
            name: rt.label,
            isBlocked: Boolean(lock),
            isScheduled: lock?.isScheduled,
            startDate: lock?.startDate,
            endDate: lock?.endDate,
            editDate: lock ? lock.lockDate : '',
            editUser: lock ? lock.lockedBy : '',
            reason: lock ? lock.reason : '',
            countOrders: countOrders > 0 ? countOrders : (rt.label === '00_LV_02B' ? 8 : rt.label === 'BT_KI_01' ? 18 : ''),
            sumOrders:
              sumOrdersVal > 0
                ? sumOrdersVal.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ')
                : (rt.label === '00_LV_02B' ? '45 100,00' : rt.label === 'BT_KI_01' ? '142 800,00' : ''),
            countRows: countRows > 0 ? countRows : (rt.label === '00_LV_02B' ? 28 : rt.label === 'BT_KI_01' ? 92 : '')
          };
        });
    }

    return [];
  }, [filters.filterBy, filters.unionId, filters.rspId, filters.deptId, filters.routeId, objectLocks, clients]);

  return (
    <div className="crm-app" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* 1. Автентичний навігаційний бар */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      {/* 2. Основна робоча область */}
      <div className="container-fluid" style={{ padding: '8px 15px' }}>
        {/* VIEW 1: Блокування автоімпорту */}
        {currentPage === 'registry' && (
          <>
            {/* Підшапка з назвою форми (оригінальний CRM заголовок) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 0 8px 0',
                borderBottom: '1px solid #e5e5e5',
                marginBottom: 10
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  margin: 0,
                  color: '#333'
                }}
              >
                Сторінка блокування автообробки
              </h2>
            </div>

            {/* Панель фільтрів із 6 радіокнопками та кнопками керування */}
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onApplyFilter={handleApplyFilter}
              onResetFilters={handleResetFilters}
              onToggleLocked={handleToggleLocked}
              onOpenMassAction={() => setIsMassActionOpen(true)}
            />

            {/* Динамічна таблиця:
                - Якщо обрано «Код клієнта» або «Назва клієнта» -> Показуємо таблицю клієнтів
                - Якщо обрано «Назва об'єднання», «РСП», «Склад» або «Маршрут» -> Показуємо реєстр відповідної сутності */}
            {(filters.filterBy === 'client_code' || filters.filterBy === 'client_name') && (
              <ClientsTable
                clients={clients}
                selectedClientId={selectedClient?.id || null}
                onSelectClient={(c) => setSelectedClient(c)}
                onOpenChangeLock={handleOpenChangeLock}
                onDrilldownBuffer={handleDrilldownBuffer}
                columnFilters={columnFilters}
                onColumnFilterChange={setColumnFilters}
              />
            )}

            {(filters.filterBy === 'union' ||
              filters.filterBy === 'rsp' ||
              filters.filterBy === 'dept' ||
              filters.filterBy === 'route') && (
              <EntityRegistryTable
                entityType={filters.filterBy}
                rows={currentEntityRows}
                onOpenChangeLock={handleOpenChangeObjectLock}
                showOnlyLocked={filters.showOnlyLocked}
              />
            )}
          </>
        )}

        {/* VIEW 2: Замовлення у черзі (Буфер) */}
        {currentPage === 'buffer' && (
          <QueueOrdersPage
            orders={orders}
            initialClientFilter={drilldownClient}
            onClearInitialFilter={() => setDrilldownClient(null)}
          />
        )}

        {/* VIEW 3: Блокування об'єктів (Маршрути, РСП, Склади, Об'єднання) */}
        {currentPage === 'objects' && (
          <ObjectLocksPage
            objectLocks={objectLocks}
            onRemoveLock={handleRemoveObjectLock}
            onOpenMassAction={() => setIsMassActionOpen(true)}
          />
        )}

        {/* VIEW 4: Замовлення у черзі (розблокування) */}
        {currentPage === 'unlocked-queue' && (
          <UnlockedQueueOrdersPage
            orders={unlockedOrders}
          />
        )}
      </div>

      {/* Модальне вікно: Зміна блокування автоімпорту клієнта */}
      <ChangeLockModal
        isOpen={isChangeLockOpen}
        client={modalClient}
        objectLocks={objectLocks}
        onClose={() => setIsChangeLockOpen(false)}
        onSave={handleSaveLock}
        onOpenQueueOrders={(c) => {
          setIsChangeLockOpen(false);
          handleDrilldownBuffer(c);
        }}
        onNavigateToObjectLocks={() => {
          setIsChangeLockOpen(false);
          setCurrentPage('objects');
        }}
      />

      {/* Модальне вікно: Зміна блокування об'єкта (Об'єднання, РСП, Склад, Маршрут) */}
      <ChangeObjectLockModal
        isOpen={isChangeObjectLockOpen}
        row={modalObjectRow}
        onClose={() => setIsChangeObjectLockOpen(false)}
        onSave={handleSaveObjectLock}
      />

      {/* Модальне вікно: Масова дія (4 вкладки сутностей, вибір, дати, блокування) */}
      <MassActionModal
        isOpen={isMassActionOpen}
        onClose={() => setIsMassActionOpen(false)}
        clients={clients}
        onApplyMassAction={handleApplyMassAction}
      />
    </div>
  );
}
