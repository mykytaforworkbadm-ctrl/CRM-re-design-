import React, { useState } from 'react';
import { ClientRecord, ObjectLockRecord } from '../types';
import { UNIONS_DATA, DEPTS_DATA, RSPS_DATA, ROUTES_DATA, CORPORATIONS_DATA } from '../data/mockData';

interface MassActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientRecord[];
  onApplyMassAction: (
    entityType: 'clients' | 'routes' | 'rsps' | 'depts',
    selectedIds: (number | string)[],
    action: 'lock' | 'unlock',
    reason: string,
    startDateTime?: string,
    endDateTime?: string
  ) => void;
}

export const MassActionModal: React.FC<MassActionModalProps> = ({
  isOpen,
  onClose,
  clients,
  onApplyMassAction
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'routes' | 'rsps' | 'depts'>('clients');

  // Selection states
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const [selectedRspIds, setSelectedRspIds] = useState<number[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);

  // Search filters per tab
  const [clientSearch, setClientSearch] = useState<string>('');
  const [clientUnionFilter, setClientUnionFilter] = useState<number>(0);
  const [clientCorpFilter, setClientCorpFilter] = useState<string>('all');
  const [routeSearch, setRouteSearch] = useState<string>('');
  const [rspSearch, setRspSearch] = useState<string>('');
  const [deptSearch, setDeptSearch] = useState<string>('');

  // Form states at bottom
  const [reason, setReason] = useState<string>('Кредитный лимит');
  const [startDateTime, setStartDateTime] = useState<string>('');
  const [endDateTime, setEndDateTime] = useState<string>('');

  if (!isOpen) return null;

  // Filtered lists
  const filteredClients = clients.filter((c) => {
    if (clientUnionFilter > 0 && c.unionId !== clientUnionFilter) return false;
    if (clientCorpFilter !== 'all') {
      if (c.corpCode !== clientCorpFilter && c.corpName !== clientCorpFilter) return false;
    }
    if (clientSearch) {
      const q = clientSearch.toLowerCase();
      return (
        c.clCode.toLowerCase().includes(q) ||
        c.clName.toLowerCase().includes(q) ||
        c.corpCode.toLowerCase().includes(q) ||
        c.corpName.toLowerCase().includes(q) ||
        c.unionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredRoutes = ROUTES_DATA.filter((r) => r.value !== 0 && (!routeSearch || r.label.toLowerCase().includes(routeSearch.toLowerCase())));
  const filteredRsps = RSPS_DATA.filter((r) => r.value !== 0 && (!rspSearch || r.label.toLowerCase().includes(rspSearch.toLowerCase())));
  const filteredDepts = DEPTS_DATA.filter((d) => d.value !== 0 && (!deptSearch || d.label.toLowerCase().includes(deptSearch.toLowerCase())));

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (activeTab === 'clients') {
      if (selectedClientIds.length === filteredClients.length) {
        setSelectedClientIds([]);
      } else {
        setSelectedClientIds(filteredClients.map((c) => c.id));
      }
    } else if (activeTab === 'routes') {
      if (selectedRouteIds.length === filteredRoutes.length) {
        setSelectedRouteIds([]);
      } else {
        setSelectedRouteIds(filteredRoutes.map((r) => r.value));
      }
    } else if (activeTab === 'rsps') {
      if (selectedRspIds.length === filteredRsps.length) {
        setSelectedRspIds([]);
      } else {
        setSelectedRspIds(filteredRsps.map((r) => r.value));
      }
    } else if (activeTab === 'depts') {
      if (selectedDeptIds.length === filteredDepts.length) {
        setSelectedDeptIds([]);
      } else {
        setSelectedDeptIds(filteredDepts.map((d) => d.value));
      }
    }
  };

  const getSelectedCount = () => {
    switch (activeTab) {
      case 'clients': return selectedClientIds.length;
      case 'routes': return selectedRouteIds.length;
      case 'rsps': return selectedRspIds.length;
      case 'depts': return selectedDeptIds.length;
    }
  };

  const handleAction = (action: 'lock' | 'unlock') => {
    let ids: (number | string)[] = [];
    if (activeTab === 'clients') ids = selectedClientIds;
    else if (activeTab === 'routes') ids = selectedRouteIds;
    else if (activeTab === 'rsps') ids = selectedRspIds;
    else if (activeTab === 'depts') ids = selectedDeptIds;

    if (ids.length === 0) {
      alert('Будь ласка, оберіть хоча б один елемент зі списку.');
      return;
    }

    onApplyMassAction(activeTab, ids, action, reason, startDateTime, endDateTime);
    onClose();
  };

  return (
    <>
      <div
        className="modal fade in"
        id="massActionModal"
        style={{ display: 'block', zIndex: 1055 }}
        role="dialog"
      >
        <div className="modal-dialog" style={{ width: '750px', marginTop: '30px' }}>
          <div className="modal-content panel panel-primary" style={{ marginBottom: 0 }}>
            <div className="modal-header panel-heading">
              <h4 className="modal-title" style={{ color: '#fff' }}>
                Масова дія — Блокування / Розблокування
              </h4>
              <button
                type="button"
                className="close"
                style={{ color: '#fff', opacity: 0.8 }}
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{ padding: '15px' }}>
              {/* Entity Tabs in standard flat CRM style */}
              <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 12, backgroundColor: '#f5f5f5' }}>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeTab === 'clients' ? '2px solid #337ab7' : '2px solid transparent',
                    backgroundColor: activeTab === 'clients' ? '#fff' : 'transparent',
                    fontWeight: activeTab === 'clients' ? 'bold' : 'normal',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onClick={() => setActiveTab('clients')}
                >
                  Клієнти ({clients.length})
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeTab === 'routes' ? '2px solid #337ab7' : '2px solid transparent',
                    backgroundColor: activeTab === 'routes' ? '#fff' : 'transparent',
                    fontWeight: activeTab === 'routes' ? 'bold' : 'normal',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onClick={() => setActiveTab('routes')}
                >
                  Маршрути ({ROUTES_DATA.length - 1})
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeTab === 'rsps' ? '2px solid #337ab7' : '2px solid transparent',
                    backgroundColor: activeTab === 'rsps' ? '#fff' : 'transparent',
                    fontWeight: activeTab === 'rsps' ? 'bold' : 'normal',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onClick={() => setActiveTab('rsps')}
                >
                  РСП ({RSPS_DATA.length - 1})
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeTab === 'depts' ? '2px solid #337ab7' : '2px solid transparent',
                    backgroundColor: activeTab === 'depts' ? '#fff' : 'transparent',
                    fontWeight: activeTab === 'depts' ? 'bold' : 'normal',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onClick={() => setActiveTab('depts')}
                >
                  Склади ({DEPTS_DATA.length - 1})
                </button>
              </div>

              {/* Tab 1: Clients */}
              {activeTab === 'clients' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Пошук клієнта за кодом, назвою, корпорацією..."
                      style={{ flex: 1.8 }}
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                    <select
                      className="form-control"
                      style={{ flex: 1.1 }}
                      value={clientUnionFilter}
                      onChange={(e) => setClientUnionFilter(Number(e.target.value))}
                    >
                      <option value={0}>Всі об'єднання</option>
                      {UNIONS_DATA.filter((u) => u.value !== 0).map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                    <select
                      className="form-control"
                      style={{ flex: 1.1 }}
                      value={clientCorpFilter}
                      onChange={(e) => setClientCorpFilter(e.target.value)}
                    >
                      {CORPORATIONS_DATA.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', backgroundColor: '#fff' }}>
                    <table className="table table-bordered table-hover" style={{ margin: 0, fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ width: 36, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={filteredClients.length > 0 && selectedClientIds.length === filteredClients.length}
                              onChange={handleToggleSelectAll}
                            />
                          </th>
                          <th style={{ width: 65 }}>Код</th>
                          <th>Назва клієнта</th>
                          <th style={{ width: 140 }}>Об'єднання</th>
                          <th style={{ width: 150 }}>Корпорація</th>
                          <th style={{ width: 75, textAlign: 'center' }}>Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((client) => {
                          const isChecked = selectedClientIds.includes(client.id);
                          return (
                            <tr
                              key={client.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedClientIds(selectedClientIds.filter((id) => id !== client.id));
                                } else {
                                  setSelectedClientIds([...selectedClientIds, client.id]);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                />
                              </td>
                              <td>{client.clCode}</td>
                              <td>{client.clName}</td>
                              <td>{client.unionName || '—'}</td>
                              <td>{client.corpName || '—'}</td>
                              <td style={{ textAlign: 'center' }}>
                                {client.isBlocked ? (
                                  <span style={{ color: '#ac2925', fontWeight: 'bold' }}>Блок</span>
                                ) : (
                                  <span style={{ color: '#3e8f3e' }}>Активний</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Routes */}
              {activeTab === 'routes' && (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Пошук маршруту..."
                      value={routeSearch}
                      onChange={(e) => setRouteSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', backgroundColor: '#fff' }}>
                    <table className="table table-bordered table-hover" style={{ margin: 0, fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ width: 36, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={filteredRoutes.length > 0 && selectedRouteIds.length === filteredRoutes.length}
                              onChange={handleToggleSelectAll}
                            />
                          </th>
                          <th style={{ width: 90 }}>ID</th>
                          <th>Код / Назва маршруту</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoutes.map((r) => {
                          const isChecked = selectedRouteIds.includes(r.value);
                          return (
                            <tr
                              key={r.value}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedRouteIds(selectedRouteIds.filter((id) => id !== r.value));
                                } else {
                                  setSelectedRouteIds([...selectedRouteIds, r.value]);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                />
                              </td>
                              <td>{r.value}</td>
                              <td>{r.label}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: RSPs */}
              {activeTab === 'rsps' && (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Пошук РСП..."
                      value={rspSearch}
                      onChange={(e) => setRspSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', backgroundColor: '#fff' }}>
                    <table className="table table-bordered table-hover" style={{ margin: 0, fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ width: 36, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={filteredRsps.length > 0 && selectedRspIds.length === filteredRsps.length}
                              onChange={handleToggleSelectAll}
                            />
                          </th>
                          <th style={{ width: 110 }}>Код</th>
                          <th>Назва РСП</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRsps.map((rsp) => {
                          const isChecked = selectedRspIds.includes(rsp.value);
                          return (
                            <tr
                              key={rsp.value}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedRspIds(selectedRspIds.filter((id) => id !== rsp.value));
                                } else {
                                  setSelectedRspIds([...selectedRspIds, rsp.value]);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                />
                              </td>
                              <td>{rsp.code || rsp.value}</td>
                              <td>{rsp.label}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Depts / Warehouses */}
              {activeTab === 'depts' && (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Пошук складу..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', backgroundColor: '#fff' }}>
                    <table className="table table-bordered table-hover" style={{ margin: 0, fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <th style={{ width: 36, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={filteredDepts.length > 0 && selectedDeptIds.length === filteredDepts.length}
                              onChange={handleToggleSelectAll}
                            />
                          </th>
                          <th style={{ width: 110 }}>Код</th>
                          <th>Назва складу</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDepts.map((d) => {
                          const isChecked = selectedDeptIds.includes(d.value);
                          return (
                            <tr
                              key={d.value}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedDeptIds(selectedDeptIds.filter((id) => id !== d.value));
                                } else {
                                  setSelectedDeptIds([...selectedDeptIds, d.value]);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                />
                              </td>
                              <td>{d.code || d.value}</td>
                              <td>{d.label}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Form Controls for Action at Bottom */}
              <div style={{ marginTop: 15, padding: 12, backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5' }}>
                <div className="row" style={{ marginBottom: 8 }}>
                  <div className="col-md-2" style={{ fontWeight: 'bold' }}>
                    Причина:
                  </div>
                  <div className="col-md-2" style={{ width: '80%' }}>
                    <select
                      className="form-control"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      <option value="Кредитный лимит">Кредитный лимит</option>
                      <option value="Дебиторская задолженость">Дебиторская задолженость</option>
                      <option value="Блокування НКЦ">Блокування НКЦ</option>
                      <option value="РСП">РСП</option>
                      <option value="Об'єднання">Об'єднання</option>
                      <option value="Пробне блокування">Пробне блокування</option>
                      <option value="Технічне обслуговування">Технічне обслуговування</option>
                      <option value="Перекриття автошляху">Перекриття автошляху</option>
                    </select>
                  </div>
                </div>

                <div className="row" style={{ marginBottom: 0 }}>
                  <div className="col-md-2" style={{ fontWeight: 'bold' }}>
                    Дата-час з:
                  </div>
                  <div className="col-md-2" style={{ width: '38%' }}>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                    />
                  </div>
                  <div className="col-md-1" style={{ fontWeight: 'bold', width: 'auto', paddingLeft: 10, paddingRight: 10 }}>
                    по:
                  </div>
                  <div className="col-md-2" style={{ width: '38%' }}>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>
                  * Якщо період не заповнено — блокування встановлюється негайно і безстроково.
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#555' }}>
                Обрано об'єктів: <strong>{getSelectedCount()}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleAction('lock')}
                >
                  Блокувати
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleAction('unlock')}
                >
                  Розблокувати
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={onClose}
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade in" style={{ zIndex: 1050 }}></div>
    </>
  );
};
