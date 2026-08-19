import React, { useState, useEffect } from 'react';
import { ClientRecord, ObjectLockRecord } from '../types';

interface ChangeLockModalProps {
  client: ClientRecord | null;
  objectLocks?: ObjectLockRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    clientId: number,
    isBlocked: boolean,
    reason: string,
    startDateTime?: string,
    endDateTime?: string
  ) => void;
  onOpenQueueOrders: (client: ClientRecord) => void;
  onNavigateToObjectLocks?: (entityType?: string, entityName?: string) => void;
}

export const ChangeLockModal: React.FC<ChangeLockModalProps> = ({
  client,
  objectLocks = [],
  isOpen,
  onClose,
  onSave,
  onOpenQueueOrders,
  onNavigateToObjectLocks
}) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');
  const [startDateTime, setStartDateTime] = useState<string>('');
  const [endDateTime, setEndDateTime] = useState<string>('');

  useEffect(() => {
    if (client) {
      setIsBlocked(client.isBlocked);
      setReason(client.reason || 'Кредитный лимит');
      setStartDateTime('');
      setEndDateTime('');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSave = () => {
    onSave(
      client.id,
      isBlocked,
      isBlocked ? reason || 'Кредитный лимит' : '',
      isBlocked ? startDateTime : undefined,
      isBlocked ? endDateTime : undefined
    );
    onClose();
  };

  // Helper to determine status of related hierarchical objects
  const getObjectStatus = (type: 'Об\'єднання' | 'РСП' | 'Маршрут' | 'Склад') => {
    let name = '';
    let isLocked = false;
    let lockReason = '';
    let lockDate = '';

    if (type === 'Об\'єднання') {
      name = client.unionName || 'Не прив\'язано';
      if (client.unionName) {
        const found = objectLocks.find(
          (o) =>
            o.targetType === 'Об\'єднання' &&
            (o.targetName === client.unionName || (client.unionId && o.targetCode === String(client.unionId)))
        );
        if (found) {
          isLocked = true;
          lockReason = found.reason;
          lockDate = found.lockDate;
        } else {
          const detail = client.lockDetails?.find((d) => d.source === 'Об\'єднання');
          if (detail) {
            isLocked = true;
            lockReason = detail.reason;
          }
        }
      }
    } else if (type === 'РСП') {
      name = client.rspName || (client.rspId ? `РСП #${client.rspId}` : 'Не призначено');
      if (client.rspName || client.rspId) {
        const found = objectLocks.find(
          (o) =>
            o.targetType === 'РСП' &&
            (o.targetName === client.rspName || (client.rspId && o.targetCode === String(client.rspId)))
        );
        if (found) {
          isLocked = true;
          lockReason = found.reason;
          lockDate = found.lockDate;
        } else {
          const detail = client.lockDetails?.find((d) => d.source === 'РСП');
          if (detail) {
            isLocked = true;
            lockReason = detail.reason;
          }
        }
      }
    } else if (type === 'Маршрут') {
      name = client.routeName || (client.routeId ? `Маршрут #${client.routeId}` : 'Не призначено');
      if (client.routeName || client.routeId) {
        const found = objectLocks.find(
          (o) =>
            o.targetType === 'Маршрут' &&
            (o.targetName === client.routeName || (client.routeId && o.targetCode === String(client.routeId)))
        );
        if (found) {
          isLocked = true;
          lockReason = found.reason;
          lockDate = found.lockDate;
        } else {
          const detail = client.lockDetails?.find((d) => d.source === 'Маршрут');
          if (detail) {
            isLocked = true;
            lockReason = detail.reason;
          }
        }
      }
    } else if (type === 'Склад') {
      name = client.deptName || (client.deptId ? `Склад #${client.deptId}` : 'Не призначено');
      if (client.deptName || client.deptId) {
        const found = objectLocks.find(
          (o) =>
            o.targetType === 'Склад' &&
            (o.targetName === client.deptName || (client.deptId && o.targetCode === String(client.deptId)))
        );
        if (found) {
          isLocked = true;
          lockReason = found.reason;
          lockDate = found.lockDate;
        } else {
          const detail = client.lockDetails?.find((d) => d.source === 'Склад');
          if (detail) {
            isLocked = true;
            lockReason = detail.reason;
          }
        }
      }
    }

    return { name, isLocked, lockReason, lockDate };
  };

  const unionStatus = getObjectStatus('Об\'єднання');
  const rspStatus = getObjectStatus('РСП');
  const routeStatus = getObjectStatus('Маршрут');
  const warehouseStatus = getObjectStatus('Склад');

  return (
    <>
      <div
        className="modal in"
        id="changeLockModal"
        style={{ display: 'block', paddingRight: '15px' }}
        role="dialog"
      >
        <div className="modal-dialog" style={{ maxWidth: '640px', width: '95%' }}>
          <div className="modal-content" style={{ borderRadius: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                backgroundColor: '#2b2b2b',
                color: '#fff',
                padding: '10px 15px',
                borderBottom: '2px solid #1a568c'
              }}
            >
              <button
                type="button"
                className="close"
                aria-hidden="true"
                onClick={onClose}
                style={{ color: '#fff', opacity: 0.85, fontSize: 22, marginTop: -2 }}
              >
                ×
              </button>
              <h4 className="modal-title" style={{ fontSize: 15, fontWeight: 'bold', margin: 0 }}>
                Зміна блокування автоімпорту клієнта
              </h4>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '15px 20px' }}>
              {/* 1. Client Identification Header */}
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e2e4e8',
                  padding: '10px 14px',
                  marginBottom: 12
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>
                  {client.clCode} · {client.clName}
                </div>
                {(client.unionName || client.corpName) ? (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>
                    {client.unionName && <span>Об'єднання: <strong>{client.unionName}</strong></span>}
                    {client.unionName && client.corpName && <span> · </span>}
                    {client.corpName && <span>Корпорація: <strong>{client.corpName}</strong></span>}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#777', marginTop: 3 }}>
                    Звичайний клієнт {client.deptName ? `· Склад: ${client.deptName}` : ''}
                  </div>
                )}

                {/* 3. Link to buffer orders right under client info */}
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #dcdfe4' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenQueueOrders(client);
                    }}
                    style={{
                      color: '#23527c',
                      fontWeight: 'bold',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'underline'
                    }}
                    title="Переглянути всі замовлення цього клієнта у черзі буфера"
                  >
                    📦 Переглянути замовлення в черзі ({client.countOrders !== '' ? client.countOrders : 0}) →
                  </a>
                </div>
              </div>

              {/* 2. Section: Client Lock (Editable) */}
              <div
                style={{
                  border: '1px solid #d5d5d5',
                  padding: '12px 14px',
                  marginBottom: 14,
                  backgroundColor: '#fff'
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    color: '#204d74',
                    marginBottom: 10,
                    borderBottom: '1px solid #eee',
                    paddingBottom: 4
                  }}
                >
                  1. Блокування клієнта (автоімпорт)
                </div>

                <div className="row" style={{ marginBottom: 10, alignItems: 'center' }}>
                  <div className="col-xs-4" style={{ fontWeight: 600, fontSize: 12, color: '#333', paddingTop: 6 }}>
                    Заблокований:
                  </div>
                  <div className="col-xs-8">
                    <div className="btn-group" tabIndex={0}>
                      <button
                        type="button"
                        className={`btn btn-sm ${isBlocked ? 'btn-danger' : 'btn-default'}`}
                        onClick={() => setIsBlocked(true)}
                        style={{
                          borderRadius: 0,
                          minWidth: 70,
                          fontWeight: isBlocked ? 'bold' : 'normal',
                          backgroundColor: isBlocked ? '#c9302c' : '#fff',
                          borderColor: isBlocked ? '#ac2925' : '#ccc'
                        }}
                      >
                        Так
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${!isBlocked ? 'btn-success' : 'btn-default'}`}
                        onClick={() => setIsBlocked(false)}
                        style={{
                          borderRadius: 0,
                          minWidth: 70,
                          fontWeight: !isBlocked ? 'bold' : 'normal',
                          backgroundColor: !isBlocked ? '#449d44' : '#fff',
                          borderColor: !isBlocked ? '#398439' : '#ccc'
                        }}
                      >
                        Ні
                      </button>
                    </div>
                  </div>
                </div>

                <div className="row" style={{ marginBottom: 10, alignItems: 'center' }}>
                  <div className="col-xs-4" style={{ fontWeight: 600, fontSize: 12, color: isBlocked ? '#333' : '#888', paddingTop: 6 }}>
                    Причина:
                  </div>
                  <div className="col-xs-8">
                    <select
                      className="form-control input-sm"
                      id="BLOCKING_REASON"
                      name="BLOCKING_REASON"
                      disabled={!isBlocked}
                      value={isBlocked ? reason : ''}
                      onChange={(e) => setReason(e.target.value)}
                      style={{
                        borderRadius: 0,
                        backgroundColor: isBlocked ? '#fff' : '#f5f5f5',
                        color: isBlocked ? '#333' : '#999',
                        borderColor: isBlocked ? '#ccc' : '#e0e0e0',
                        cursor: isBlocked ? 'default' : 'not-allowed'
                      }}
                    >
                      {isBlocked ? (
                        <>
                          <option value="Кредитный лимит">Кредитный лимит</option>
                          <option value="Дебиторская задолженость">Дебиторская задолженость</option>
                          <option value="Блокування НКЦ">Блокування НКЦ</option>
                          <option value="Пробне блокування">Пробне блокування</option>
                          <option value="РСП">РСП</option>
                          <option value="Об'єднання">Об'єднання</option>
                          <option value="Технічна перевірка">Технічна перевірка</option>
                        </>
                      ) : (
                        <option value="">не вказана (розблоковано)</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Optional Schedule Period */}
                {isBlocked && (
                  <div className="row" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #eee' }}>
                    <div className="col-xs-4" style={{ fontSize: 11, fontWeight: 600, color: '#555', paddingTop: 4 }}>
                      Період (опціонально):
                    </div>
                    <div className="col-xs-4">
                      <input
                        type="datetime-local"
                        className="form-control input-sm"
                        placeholder="Дата з"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        style={{ height: 26, fontSize: 11, borderRadius: 0 }}
                        title="Дата і час початку блокування"
                      />
                    </div>
                    <div className="col-xs-4">
                      <input
                        type="datetime-local"
                        className="form-control input-sm"
                        placeholder="Дата по"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        style={{ height: 26, fontSize: 11, borderRadius: 0 }}
                        title="Дата і час завершення блокування"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Section: Other active object locks (View-only, informational) */}
              <div
                style={{
                  border: '1px solid #d5d5d5',
                  padding: '12px 14px',
                  backgroundColor: '#fafbfc'
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    color: '#555',
                    marginBottom: 8,
                    borderBottom: '1px solid #eee',
                    paddingBottom: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>2. Інші діючі блокування (довідково)</span>
                  <span style={{ fontSize: 11, fontWeight: 'normal', color: '#777' }}>тільки перегляд</span>
                </div>

                <div style={{ fontSize: 12 }}>
                  {/* Row 1: Об'єднання */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ width: '110px', fontWeight: 600, color: '#333' }}>Об'єднання:</div>
                    <div style={{ flex: 1, paddingRight: 10 }}>
                      {unionStatus.isLocked ? (
                        <span style={{ color: '#a94442', fontWeight: 600 }}>
                          🔴 Заблоковано — {unionStatus.lockReason}{unionStatus.lockDate ? ` (з ${unionStatus.lockDate.split(' ')[0]})` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#777' }}>
                          ⚪ Не заблоковано <span style={{ color: '#999', fontSize: 11 }}>({unionStatus.name})</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavigateToObjectLocks) onNavigateToObjectLocks('Об\'єднання', unionStatus.name);
                        }}
                        style={{ color: '#337ab7', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                      >
                        Перейти →
                      </a>
                    </div>
                  </div>

                  {/* Row 2: РСП */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ width: '110px', fontWeight: 600, color: '#333' }}>РСП:</div>
                    <div style={{ flex: 1, paddingRight: 10 }}>
                      {rspStatus.isLocked ? (
                        <span style={{ color: '#a94442', fontWeight: 600 }}>
                          🔴 Заблоковано — {rspStatus.lockReason}{rspStatus.lockDate ? ` (з ${rspStatus.lockDate.split(' ')[0]})` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#777' }}>
                          ⚪ Не заблоковано <span style={{ color: '#999', fontSize: 11 }}>({rspStatus.name})</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavigateToObjectLocks) onNavigateToObjectLocks('РСП', rspStatus.name);
                        }}
                        style={{ color: '#337ab7', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                      >
                        Перейти →
                      </a>
                    </div>
                  </div>

                  {/* Row 3: Маршрут */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ width: '110px', fontWeight: 600, color: '#333' }}>Маршрут:</div>
                    <div style={{ flex: 1, paddingRight: 10 }}>
                      {routeStatus.isLocked ? (
                        <span style={{ color: '#a94442', fontWeight: 600 }}>
                          🔴 Заблоковано — {routeStatus.lockReason}{routeStatus.lockDate ? ` (з ${routeStatus.lockDate.split(' ')[0]})` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#777' }}>
                          ⚪ Не заблоковано <span style={{ color: '#999', fontSize: 11 }}>({routeStatus.name})</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavigateToObjectLocks) onNavigateToObjectLocks('Маршрут', routeStatus.name);
                        }}
                        style={{ color: '#337ab7', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                      >
                        Перейти →
                      </a>
                    </div>
                  </div>

                  {/* Row 4: Склад */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 0'
                    }}
                  >
                    <div style={{ width: '110px', fontWeight: 600, color: '#333' }}>Склад:</div>
                    <div style={{ flex: 1, paddingRight: 10 }}>
                      {warehouseStatus.isLocked ? (
                        <span style={{ color: '#a94442', fontWeight: 600 }}>
                          🔴 Заблоковано — {warehouseStatus.lockReason}{warehouseStatus.lockDate ? ` (з ${warehouseStatus.lockDate.split(' ')[0]})` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#777' }}>
                          ⚪ Не заблоковано <span style={{ color: '#999', fontSize: 11 }}>({warehouseStatus.name})</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavigateToObjectLocks) onNavigateToObjectLocks('Склад', warehouseStatus.name);
                        }}
                        style={{ color: '#337ab7', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                      >
                        Перейти →
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    padding: '6px 8px',
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    fontSize: 11,
                    color: '#666',
                    lineHeight: 1.3
                  }}
                >
                  ℹ️ Якщо клієнт розблокований тут, але на нього діє блокування РСП, Складу або Маршруту — його замовлення залишатимуться в буфері до зняття блокування відповідного об'єкта.
                </div>
              </div>
            </div>

            {/* 4. Modal Footer with Proper Hierarchy */}
            <div
              className="modal-footer"
              style={{
                backgroundColor: '#f5f5f5',
                borderTop: '1px solid #ddd',
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10
              }}
            >
              <button
                type="button"
                className="btn btn-default"
                onClick={onClose}
                style={{
                  borderRadius: 0,
                  padding: '6px 18px',
                  borderColor: '#ccc',
                  backgroundColor: '#fff',
                  color: '#333',
                  fontSize: 12
                }}
              >
                Вихід
              </button>
              <button
                id="saveLockClient"
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                style={{
                  borderRadius: 0,
                  padding: '6px 24px',
                  fontWeight: 'bold',
                  fontSize: 12,
                  minWidth: 120,
                  backgroundColor: '#337ab7',
                  borderColor: '#2e6da4'
                }}
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop in" style={{ opacity: 0.5 }}></div>
    </>
  );
};
