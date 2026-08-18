import React, { useState } from 'react';
import { ObjectLockRecord, EntityType } from '../types';

interface ObjectLocksPageProps {
  objectLocks: ObjectLockRecord[];
  onRemoveLock: (lockId: string) => void;
  onOpenMassAction: () => void;
}

export const ObjectLocksPage: React.FC<ObjectLocksPageProps> = ({
  objectLocks,
  onRemoveLock,
  onOpenMassAction
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [columnFilters, setColumnFilters] = useState({
    targetType: '',
    targetName: '',
    reason: '',
    lockDate: '',
    lockedBy: '',
    period: ''
  });

  const filteredLocks = objectLocks.filter((l) => {
    if (filterType !== 'all' && l.targetType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        l.targetName.toLowerCase().includes(q) ||
        l.targetCode.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.lockedBy.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (columnFilters.targetType && !l.targetType.toLowerCase().includes(columnFilters.targetType.toLowerCase())) return false;
    if (columnFilters.targetName && !(l.targetName + ' ' + l.targetCode).toLowerCase().includes(columnFilters.targetName.toLowerCase())) return false;
    if (columnFilters.reason && !l.reason.toLowerCase().includes(columnFilters.reason.toLowerCase())) return false;
    if (columnFilters.lockDate && !l.lockDate.toLowerCase().includes(columnFilters.lockDate.toLowerCase())) return false;
    if (columnFilters.lockedBy && !l.lockedBy.toLowerCase().includes(columnFilters.lockedBy.toLowerCase())) return false;

    return true;
  });

  return (
    <div id="object-locks-page" style={{ padding: '0 15px' }}>
      <div className="text-center">
        <h2 style={{ fontFamily: 'fantasy' }}>Реєстр блокувань об'єктів (Маршрути, РСП, Склади, Об'єднання)</h2>
      </div>

      {/* Top Filter Panel in exact CRM style */}
      <div
        id="tbl_object_filter"
        style={{
          backgroundColor: '#fbfbfb',
          border: '1px solid #ddd',
          padding: '12px 15px',
          marginBottom: 15,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>Тип об'єкта:</div>
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Всі типи об'єктів</option>
            <option value="Маршрут">Маршрути</option>
            <option value="РСП">РСП</option>
            <option value="Склад">Склади</option>
            <option value="Об'єднання">Об'єднання</option>
          </select>

          <div style={{ fontWeight: 'bold', marginLeft: 10 }}>Пошук:</div>
          <input
            type="text"
            className="form-control"
            placeholder="Назва, код або причина..."
            style={{ width: '260px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenMassAction}
          >
            Масова дія / Нове блокування
          </button>
        </div>
      </div>

      {/* Table jqGrid style */}
      <div className="ui-jqgrid" id="gbox_objectLocks" dir="ltr" style={{ width: '100%' }}>
        <div className="ui-jqgrid-view table-responsive" role="grid" id="gview_objectLocks" style={{ width: '100%' }}>
          <div className="ui-jqgrid-hdiv" style={{ width: '100%' }}>
            <div className="ui-jqgrid-hbox">
              <table className="ui-jqgrid-htable ui-common-table table table-bordered" style={{ width: '100%' }}>
                <thead>
                  <tr className="ui-jqgrid-labels" role="row">
                    <th style={{ width: '130px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Тип об'єкта</div>
                    </th>
                    <th style={{ width: '260px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Назва / Код об'єкта</div>
                    </th>
                    <th style={{ width: '220px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Причина блокування</div>
                    </th>
                    <th style={{ width: '150px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Дата постановки</div>
                    </th>
                    <th style={{ width: '180px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Хто поставив</div>
                    </th>
                    <th style={{ width: '190px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Період дії / Заплановано</div>
                    </th>
                    <th style={{ width: '110px', textAlign: 'center' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Дія</div>
                    </th>
                  </tr>

                  {/* Inline column filters */}
                  <tr className="ui-search-toolbar" role="row">
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.targetType}
                                onChange={(e) => setColumnFilters({ ...columnFilters, targetType: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => setColumnFilters({ ...columnFilters, targetType: '' })}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.targetName}
                                onChange={(e) => setColumnFilters({ ...columnFilters, targetName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => setColumnFilters({ ...columnFilters, targetName: '' })}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.reason}
                                onChange={(e) => setColumnFilters({ ...columnFilters, reason: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => setColumnFilters({ ...columnFilters, reason: '' })}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.lockDate}
                                onChange={(e) => setColumnFilters({ ...columnFilters, lockDate: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => setColumnFilters({ ...columnFilters, lockDate: '' })}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.lockedBy}
                                onChange={(e) => setColumnFilters({ ...columnFilters, lockedBy: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => setColumnFilters({ ...columnFilters, lockedBy: '' })}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                    <th>
                      <div></div>
                    </th>
                    <th>
                      <div></div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLocks.map((lock) => (
                    <tr key={lock.id} className="jqgrow ui-row-ltr">
                      <td>
                        <span
                          style={{
                            fontWeight: 'bold',
                            color:
                              lock.targetType === 'Маршрут'
                                ? '#337ab7'
                                : lock.targetType === 'РСП'
                                ? '#269abc'
                                : lock.targetType === 'Склад'
                                ? '#8a6d3b'
                                : '#a94442'
                          }}
                        >
                          {lock.targetType}
                        </span>
                      </td>
                      <td>
                        <strong>{lock.targetName}</strong>
                        {lock.targetCode && <span style={{ color: '#666', fontSize: 12 }}> (код: {lock.targetCode})</span>}
                      </td>
                      <td>{lock.reason}</td>
                      <td>{lock.lockDate}</td>
                      <td>{lock.lockedBy}</td>
                      <td>
                        {lock.isScheduled ? (
                          <span style={{ color: '#a06000', fontWeight: 'bold' }}>
                            ⏱ Заплановано: {lock.startDate || 'майбутній час'} {lock.endDate ? `— ${lock.endDate}` : ''}
                          </span>
                        ) : lock.startDate || lock.endDate ? (
                          <span>
                            {lock.startDate || '—'} — {lock.endDate || 'безстроково'}
                          </span>
                        ) : (
                          <span style={{ color: '#666' }}>Діє постійно</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-danger btn-xs"
                          style={{ padding: '2px 8px', fontSize: 12 }}
                          onClick={() => onRemoveLock(lock.id)}
                        >
                          Зняти блок
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLocks.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Немає активних або запланованих блокувань об'єктів
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
