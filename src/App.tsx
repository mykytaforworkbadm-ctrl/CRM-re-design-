/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SubNavbar } from './components/SubNavbar';
import { FilterPanel } from './components/FilterPanel';
import { ClientsTable } from './components/ClientsTable';
import { ChangeLockModal } from './components/ChangeLockModal';
import { QueueOrdersPage } from './components/QueueOrdersPage';
import { ObjectLocksPage } from './components/ObjectLocksPage';
import { MassActionModal } from './components/MassActionModal';
import { INITIAL_CLIENTS, INITIAL_OBJECT_LOCKS, QUEUE_ORDERS } from './data/mockData';
import { ClientRecord, FilterState, ColumnFilters, AppPage, ObjectLockRecord, QueueOrder, EntityType } from './types';

export default function App() {
  const [currentLang, setCurrentLang] = useState<'UA' | 'RU'>('UA');
  const [currentPage, setCurrentPage] = useState<AppPage>('registry');

  // Core records
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [objectLocks, setObjectLocks] = useState<ObjectLockRecord[]>(INITIAL_OBJECT_LOCKS);
  const [orders] = useState<QueueOrder[]>(QUEUE_ORDERS);

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

  // Handle Main Filter Apply
  const handleApplyFilter = () => {
    let result = [...INITIAL_CLIENTS];

    if (filters.filterBy === 'client_code' && filters.clientCode) {
      result = result.filter((c) =>
        c.clCode.toLowerCase().includes(filters.clientCode.toLowerCase())
      );
    } else if (filters.filterBy === 'client_name' && filters.clientName) {
      result = result.filter((c) =>
        c.clName.toLowerCase().includes(filters.clientName.toLowerCase())
      );
    } else if (filters.filterBy === 'union' && filters.unionId > 0) {
      result = result.filter((c) => c.unionId === filters.unionId);
    } else if (filters.filterBy === 'dept' && filters.deptId !== 0) {
      result = result.filter((c) => c.deptId === filters.deptId);
    } else if (filters.filterBy === 'rsp' && filters.rspId > 0) {
      result = result.filter((c) => c.rspId === filters.rspId);
    } else if (filters.filterBy === 'route' && filters.routeId > 0) {
      result = result.filter((c) => c.routeId === filters.routeId);
    }

    if (filters.showOnlyLocked) {
      result = result.filter((c) => c.isBlocked);
    }

    setClients(result);
  };

  const handleToggleLocked = () => {
    const nextLocked = !filters.showOnlyLocked;
    setFilters({ ...filters, showOnlyLocked: nextLocked });
    let result = [...INITIAL_CLIENTS];
    if (nextLocked) {
      result = result.filter((c) => c.isBlocked);
    }
    setClients(result);
  };

  // Open "Зміна блокування" Modal
  const handleOpenChangeLock = (client: ClientRecord) => {
    setModalClient(client);
    setIsChangeLockOpen(true);
  };

  // Save single lock change
  const handleSaveLock = (clientId: number, isBlocked: boolean, reason: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const newLockDetails = isBlocked
            ? [{ source: 'Клієнт' as const, reason: reason || 'Кредитный лимит' }]
            : [];
          return {
            ...c,
            isBlocked,
            isScheduled: false,
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
    setCurrentPage('buffer');
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
      {/* 1. Верхнє меню додатку (шапка) */}
      <Navbar
        currentLang={currentLang}
        onLangChange={(lang) => setCurrentLang(lang)}
      />

      {/* 2. Другий плоский ряд навігації розділів CRM */}
      <SubNavbar
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page === 'buffer' && drilldownClient) {
            // Keep drilldown
          } else if (page !== 'buffer') {
            setDrilldownClient(null);
          }
          setCurrentPage(page);
        }}
        bufferCount={orders.length}
        objectLocksCount={objectLocks.length}
      />

      {/* Page Content */}
      <div className="container-fluid" style={{ padding: '0 15px', marginTop: 10 }}>
        {/* VIEW 1: Реєстр блокувань (Головна таблиця клієнтів) */}
        {currentPage === 'registry' && (
          <>
            <div className="text-center">
              <h2 style={{ fontFamily: 'fantasy' }}>Сторінка блокування автообробки</h2>
            </div>

            {/* Панель фільтрів з кнопками «Застосувати фільтр», «Показати заблокованих» та «Масова дія» */}
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onApplyFilter={handleApplyFilter}
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
      </div>

      {/* Модальне вікно: Зміна блокування автоімпорту клієнта */}
      <ChangeLockModal
        isOpen={isChangeLockOpen}
        client={modalClient}
        onClose={() => setIsChangeLockOpen(false)}
        onSave={handleSaveLock}
        onOpenQueueOrders={(c) => {
          setIsChangeLockOpen(false);
          handleDrilldownBuffer(c);
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
