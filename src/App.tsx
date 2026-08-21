/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FilterPanel } from './components/FilterPanel';
import { ClientsTable } from './components/ClientsTable';
import { ChangeLockModal } from './components/ChangeLockModal';
import { QueueOrdersPage } from './components/QueueOrdersPage';
import { ObjectLocksPage } from './components/ObjectLocksPage';
import { UnlockedQueueOrdersPage } from './components/UnlockedQueueOrdersPage';
import { MassActionModal } from './components/MassActionModal';
import { INITIAL_CLIENTS, INITIAL_OBJECT_LOCKS, QUEUE_ORDERS, UNLOCKED_QUEUE_ORDERS } from './data/mockData';
import { ClientRecord, FilterState, ColumnFilters, AppPage, ObjectLockRecord, QueueOrder, UnlockedQueueOrder, EntityType } from './types';

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

  // Main filter panel state
  const [filters, setFilters] = useState<FilterState>({
    filterBy: null,
    clientCode: '',
    clientName: '',
    unionId: 0,
    deptId: 0,
    rspId: 0,
    routeId: 0,
    showOnlyLocked: false
  });

  // Inline column filters for registry table
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
  const [isMassActionOpen, setIsMassActionOpen] = useState<boolean>(false);

  // Core filter application logic supporting all 6 combined criteria (AND logic)
  const applyFilterLogic = (currentFilters: FilterState) => {
    let result = [...INITIAL_CLIENTS];

    if (currentFilters.clientCode.trim()) {
      const q = currentFilters.clientCode.trim().toLowerCase();
      result = result.filter((c) => c.clCode.toLowerCase().includes(q));
    }
    if (currentFilters.clientName.trim()) {
      const q = currentFilters.clientName.trim().toLowerCase();
      result = result.filter((c) => c.clName.toLowerCase().includes(q));
    }
    if (currentFilters.unionId > 0) {
      result = result.filter((c) => c.unionId === currentFilters.unionId);
    }
    if (currentFilters.deptId !== 0) {
      result = result.filter((c) => c.deptId === currentFilters.deptId);
    }
    if (currentFilters.rspId > 0) {
      result = result.filter((c) => c.rspId === currentFilters.rspId);
    }
    if (currentFilters.routeId > 0) {
      result = result.filter((c) => c.routeId === currentFilters.routeId);
    }

    if (currentFilters.showOnlyLocked) {
      result = result.filter((c) => c.isBlocked);
    }

    setClients(result);
  };

  // Handle Main Filter Apply
  const handleApplyFilter = () => {
    applyFilterLogic(filters);
  };

  // Handle Filter Reset
  const handleResetFilters = () => {
    const resetState: FilterState = {
      filterBy: null,
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
    applyFilterLogic(updated);
  };

  // Open "Зміна блокування" Modal
  const handleOpenChangeLock = (client: ClientRecord) => {
    setModalClient(client);
    setIsChangeLockOpen(true);
  };

  // Save single lock change
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

  // Navigate to Buffer page from client row or modal
  const handleDrilldownBuffer = (client: ClientRecord) => {
    setDrilldownClient(client);
    navigateTo('buffer');
  };

  // Remove Object Lock
  const handleRemoveObjectLock = (lockId: string) => {
    const removedLock = objectLocks.find((l) => l.id === lockId);
    setObjectLocks((prev) => prev.filter((l) => l.id !== lockId));

    // If an object lock was removed, update related clients lockDetails
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
    const isScheduled = !!startDateTime && new Date(startDateTime) > now;
    const formattedStart = startDateTime ? startDateTime.replace('T', ' ') : undefined;
    const formattedEnd = endDateTime ? endDateTime.replace('T', ' ') : undefined;

    if (entityType === 'clients') {
      const idSet = new Set(selectedIds.map(Number));
      setClients((prev) =>
        prev.map((c) => {
          if (idSet.has(c.id)) {
            if (action === 'lock') {
              const currentDetails = c.lockDetails || [];
              const exists = currentDetails.some((d) => d.source === 'Клієнт' && d.reason === reason);
              const updatedDetails = exists
                ? currentDetails
                : [
                    ...currentDetails,
                    {
                      source: 'Клієнт' as const,
                      reason,
                      startDate: formattedStart,
                      endDate: formattedEnd,
                      isScheduled
                    }
                  ];
              return {
                ...c,
                isBlocked: true,
                isScheduled: isScheduled || c.isScheduled,
                scheduledTime: formattedStart ? formattedStart.slice(5) : c.scheduledTime,
                reason: reason,
                lockDetails: updatedDetails,
                editDate: formattedDate,
                editUser: 'Дубінін Микита Валерійович'
              };
            } else {
              // Unlock
              return {
                ...c,
                isBlocked: false,
                isScheduled: false,
                reason: '',
                lockDetails: [],
                editDate: formattedDate,
                editUser: 'Дубінін Микита Валерійович'
              };
            }
          }
          return c;
        })
      );
    } else {
      // Mass action on Objects (Маршрути, РСП, Склади)
      const typeLabel: EntityType =
        entityType === 'routes'
          ? 'Маршрут'
          : entityType === 'rsps'
          ? 'РСП'
          : 'Склад';

      if (action === 'lock') {
        const newLocks: ObjectLockRecord[] = selectedIds.map((id, index) => ({
          id: `mass-${Date.now()}-${index}`,
          targetType: typeLabel,
          targetCode: String(id),
          targetName: `${typeLabel} #${id}`,
          reason,
          lockDate: formattedDate,
          lockedBy: 'Дубінін Микита Валерійович',
          startDate: formattedStart,
          endDate: formattedEnd,
          isScheduled
        }));
        setObjectLocks((prev) => [...prev, ...newLocks]);
      } else {
        // Unlock objects with matching IDs
        const idSet = new Set(selectedIds.map(String));
        setObjectLocks((prev) =>
          prev.filter((l) => !(l.targetType === typeLabel && idSet.has(l.targetCode)))
        );
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* 1. Верхнє меню додатку (шапка) з випадаючим списком сторінок Автообробки */}
      <Navbar
        currentLang={currentLang}
        onLangChange={(lang) => setCurrentLang(lang)}
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      {/* Page Content */}
      <div className="container-fluid" style={{ padding: '0 15px', marginTop: 10 }}>
        {/* VIEW 1: Реєстр блокувань (Головна таблиця клієнтів) */}
        {currentPage === 'registry' && (
          <>
            <div className="text-center">
              <h2 style={{ fontFamily: 'fantasy' }}>Сторінка блокування автообробки</h2>
            </div>

            {/* Панель фільтрів з комбінованим пошуком (AND-логіка), чекбоксом заблокованих та масовою дією */}
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onApplyFilter={handleApplyFilter}
              onResetFilters={handleResetFilters}
              onToggleLocked={handleToggleLocked}
              onOpenMassAction={() => setIsMassActionOpen(true)}
            />

            {/* Таблиця клієнтів з багаторядковими причинами та індикаторами майбутнього блокування */}
            <ClientsTable
              clients={clients}
              selectedClientId={selectedClient?.id || null}
              onSelectClient={(c) => setSelectedClient(c)}
              onOpenChangeLock={handleOpenChangeLock}
              onDrilldownBuffer={handleDrilldownBuffer}
              columnFilters={columnFilters}
              onColumnFilterChange={setColumnFilters}
            />
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
