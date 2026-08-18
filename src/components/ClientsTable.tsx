import React, { useState } from 'react';
import { ClientRecord, ColumnFilters } from '../types';

interface ClientsTableProps {
  clients: ClientRecord[];
  selectedClientId: number | null;
  onSelectClient: (client: ClientRecord) => void;
  onOpenChangeLock: (client: ClientRecord) => void;
  onDrilldownBuffer?: (client: ClientRecord) => void;
  columnFilters: ColumnFilters;
  onColumnFilterChange: (filters: ColumnFilters) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenChangeLock,
  onDrilldownBuffer,
  columnFilters,
  onColumnFilterChange,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<keyof ClientRecord | null>('clName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Handle column filtering
  const filteredClients = clients.filter((c) => {
    if (columnFilters.type && columnFilters.type !== '') {
      if (c.type !== columnFilters.type) return false;
    }
    if (columnFilters.block && columnFilters.block !== '') {
      const isBlockedExpected = columnFilters.block === '1';
      if (c.isBlocked !== isBlockedExpected) return false;
    }
    if (columnFilters.clCode && !c.clCode.toLowerCase().includes(columnFilters.clCode.toLowerCase())) return false;
    if (columnFilters.clName && !c.clName.toLowerCase().includes(columnFilters.clName.toLowerCase())) return false;
    if (columnFilters.corpCode && !c.corpCode.toLowerCase().includes(columnFilters.corpCode.toLowerCase())) return false;
    if (columnFilters.corpName && !c.corpName.toLowerCase().includes(columnFilters.corpName.toLowerCase())) return false;
    if (columnFilters.unionName && !c.unionName.toLowerCase().includes(columnFilters.unionName.toLowerCase())) return false;
    if (columnFilters.mngName && !c.mngName.toLowerCase().includes(columnFilters.mngName.toLowerCase())) return false;
    if (columnFilters.editDate && !c.editDate.toLowerCase().includes(columnFilters.editDate.toLowerCase())) return false;
    if (columnFilters.editUser && !c.editUser.toLowerCase().includes(columnFilters.editUser.toLowerCase())) return false;
    if (columnFilters.reason && !c.reason.toLowerCase().includes(columnFilters.reason.toLowerCase())) return false;
    if (columnFilters.countUrgent && String(c.countUrgent) !== columnFilters.countUrgent) return false;
    if (columnFilters.countOrders && String(c.countOrders) !== columnFilters.countOrders) return false;
    if (columnFilters.sumAllOrders && !c.sumAllOrders.toLowerCase().includes(columnFilters.sumAllOrders.toLowerCase())) return false;
    if (columnFilters.countRowsAllOrders && String(c.countRowsAllOrders) !== columnFilters.countRowsAllOrders) return false;
    if (columnFilters.countIgnored && String(c.countIgnored) !== columnFilters.countIgnored) return false;
    return true;
  });

  // Sort
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField] ?? '';
    const bVal = b[sortField] ?? '';
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const startIndex = (pageIndex - 1) * pageSize;
  const pageClients = sortedClients.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: keyof ClientRecord) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const clearColumnFilter = (key: keyof ColumnFilters) => {
    onColumnFilterChange({
      ...columnFilters,
      [key]: ''
    });
  };

  const renderSortIndicator = (field: keyof ClientRecord) => {
    const isCurrent = sortField === field;
    return (
      <span className="s-ico" style={{ display: 'inline-flex', marginLeft: 4 }}>
        <span
          style={{
            fontSize: 9,
            lineHeight: 1,
            color: isCurrent && sortDir === 'asc' ? '#333' : '#bbb'
          }}
        >
          ▲
        </span>
        <span
          style={{
            fontSize: 9,
            lineHeight: 1,
            color: isCurrent && sortDir === 'desc' ? '#333' : '#bbb'
          }}
        >
          ▼
        </span>
      </span>
    );
  };

  return (
    <div id="clients-table-container" style={{ marginTop: 10 }}>
      <div className="ui-jqgrid" id="gbox_gridResults" dir="ltr" style={{ width: '100%' }}>
        <div className="ui-jqgrid-view table-responsive" role="grid" id="gview_gridResults" style={{ width: '100%' }}>
          <div className="ui-jqgrid-hdiv" style={{ width: '100%' }}>
            <div className="ui-jqgrid-hbox">
              <table className="ui-jqgrid-htable ui-common-table table table-bordered" style={{ width: '100%', minWidth: 1480 }} role="presentation">
                <thead>
                  <tr className="ui-jqgrid-labels" role="row">
                    <th style={{ width: '31px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div"></div>
                    </th>
                    <th style={{ width: '68px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('type')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Тип {renderSortIndicator('type')}
                      </div>
                    </th>
                    <th style={{ width: '48px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('isBlocked')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Блок {renderSortIndicator('isBlocked')}
                      </div>
                    </th>
                    <th style={{ width: '75px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Змінити</div>
                    </th>
                    <th style={{ width: '87px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('clCode')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Код {renderSortIndicator('clCode')}
                      </div>
                    </th>
                    <th style={{ width: '190px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('clName')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Назва {renderSortIndicator('clName')}
                      </div>
                    </th>
                    <th style={{ width: '90px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('corpCode')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Код корпорації {renderSortIndicator('corpCode')}
                      </div>
                    </th>
                    <th style={{ width: '130px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('corpName')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Корпорація {renderSortIndicator('corpName')}
                      </div>
                    </th>
                    <th style={{ width: '130px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('unionName')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Об'єднання {renderSortIndicator('unionName')}
                      </div>
                    </th>
                    <th style={{ width: '120px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('mngName')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Менеджер {renderSortIndicator('mngName')}
                      </div>
                    </th>
                    <th style={{ width: '95px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('editDate')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Дата змін {renderSortIndicator('editDate')}
                      </div>
                    </th>
                    <th style={{ width: '95px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('editUser')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Змінив {renderSortIndicator('editUser')}
                      </div>
                    </th>
                    <th style={{ width: '110px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('reason')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Причина {renderSortIndicator('reason')}
                      </div>
                    </th>
                    <th style={{ width: '80px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('countUrgent')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Ургентаж {renderSortIndicator('countUrgent')}
                      </div>
                    </th>
                    <th style={{ width: '90px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('countOrders')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Кількість замовлень {renderSortIndicator('countOrders')}
                      </div>
                    </th>
                    <th style={{ width: '95px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('sumAllOrders')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Сума замовлень {renderSortIndicator('sumAllOrders')}
                      </div>
                    </th>
                    <th style={{ width: '90px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('countRowsAllOrders')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Кількість позицій {renderSortIndicator('countRowsAllOrders')}
                      </div>
                    </th>
                    <th style={{ width: '70px' }} className="ui-th-column ui-th-ltr" onClick={() => handleSort('countIgnored')}>
                      <div className="ui-th-div ui-jqgrid-sortable">
                        Ігнор {renderSortIndicator('countIgnored')}
                      </div>
                    </th>
                  </tr>

                  {/* Inline filter row */}
                  <tr className="ui-search-toolbar" role="row">
                    <th><div></div></th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <select
                                className="form-control"
                                value={columnFilters.type}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, type: e.target.value })}
                              >
                                <option value="">Всі</option>
                                <option value="usual">Звичайний</option>
                                <option value="corp">Корпорація</option>
                                <option value="corp-member">Член корп.</option>
                              </select>
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('type')}>x</a>
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
                              <select
                                className="form-control"
                                value={columnFilters.block}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, block: e.target.value })}
                              >
                                <option value="">Всі</option>
                                <option value="1">Так</option>
                                <option value="0">Ні</option>
                              </select>
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('block')}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                    <th><div></div></th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.clCode}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, clCode: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('clCode')}>x</a>
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
                                value={columnFilters.clName}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, clName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('clName')}>x</a>
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
                                value={columnFilters.corpCode}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, corpCode: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('corpCode')}>x</a>
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
                                value={columnFilters.corpName}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, corpName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('corpName')}>x</a>
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
                                value={columnFilters.unionName}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, unionName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('unionName')}>x</a>
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
                                value={columnFilters.mngName}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, mngName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('mngName')}>x</a>
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
                                value={columnFilters.editDate}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, editDate: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('editDate')}>x</a>
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
                                value={columnFilters.editUser}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, editUser: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('editUser')}>x</a>
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
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, reason: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('reason')}>x</a>
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
                                value={columnFilters.countUrgent}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, countUrgent: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('countUrgent')}>x</a>
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
                                value={columnFilters.countOrders}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, countOrders: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('countOrders')}>x</a>
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
                                value={columnFilters.sumAllOrders}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, sumAllOrders: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('sumAllOrders')}>x</a>
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
                                value={columnFilters.countRowsAllOrders}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, countRowsAllOrders: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('countRowsAllOrders')}>x</a>
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
                                value={columnFilters.countIgnored}
                                onChange={(e) => onColumnFilterChange({ ...columnFilters, countIgnored: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('countIgnored')}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          <div className="ui-jqgrid-bdiv" style={{ width: '100%', minHeight: 350 }}>
            <table className="ui-jqgrid-btable ui-common-table table table-bordered" style={{ width: '100%', minWidth: 1480 }}>
              <tbody>
                {pageClients.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <tr
                      key={client.id}
                      id={String(client.id)}
                      className={`jqgrow ui-row-ltr ${isSelected ? 'success' : ''}`}
                      aria-selected={isSelected}
                      onClick={() => onSelectClient(client)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ width: '31px', textAlign: 'center' }} className="ui-sgcollapsed sgcollapsed">
                        +
                      </td>
                      <td style={{ width: '68px', textAlign: 'center' }}>
                        {client.type === 'corp-member' ? (
                          <span style={{ padding: '3px', color: '#fff', backgroundColor: 'rgb(38, 154, 188)', display: 'inline-block' }}>
                            Член корп.
                          </span>
                        ) : client.type === 'corp' ? (
                          <span style={{ padding: '3px', color: '#fff', backgroundColor: '#337ab7', display: 'inline-block' }}>
                            Корпорація
                          </span>
                        ) : (
                          <span>Звичайний</span>
                        )}
                      </td>
                      <td style={{ width: '48px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          {client.isBlocked ? (
                            <span style={{ padding: '3px', color: '#fff', backgroundColor: 'rgb(172, 41, 37)', display: 'inline-block' }}>
                              Так
                            </span>
                          ) : (
                            <span style={{ padding: '3px', color: '#fff', backgroundColor: '#5cb85c', display: 'inline-block' }}>
                              Ні
                            </span>
                          )}
                          {client.isScheduled && (
                            <span
                              title={`Заплановане блокування: ${client.scheduledTime || 'майбутній час'}`}
                              style={{ fontSize: 13, cursor: 'help' }}
                            >
                              ⏱
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ width: '75px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary changeLock"
                          style={{ padding: '3px 8px', fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChangeLock(client);
                          }}
                        >
                          Змінити
                        </button>
                      </td>
                      <td style={{ width: '87px' }}>{client.clCode}</td>
                      <td style={{ width: '190px' }} title={client.clName}>{client.clName}</td>
                      <td style={{ width: '90px' }}>{client.corpCode || '\u00A0'}</td>
                      <td style={{ width: '130px' }} title={client.corpName}>{client.corpName || '\u00A0'}</td>
                      <td style={{ width: '130px' }} title={client.unionName}>{client.unionName || '\u00A0'}</td>
                      <td style={{ width: '120px' }} title={client.mngName}>{client.mngName}</td>
                      <td style={{ width: '95px' }}>{client.editDate}</td>
                      <td style={{ width: '95px' }} title={client.editUser}>{client.editUser}</td>
                      <td style={{ width: '150px', fontSize: 11, lineHeight: 1.3 }}>
                        {client.lockDetails && client.lockDetails.length > 0 ? (
                          client.lockDetails.map((detail, idx) => (
                            <div key={idx} style={{ marginBottom: idx < client.lockDetails!.length - 1 ? 3 : 0 }}>
                              <span
                                style={{
                                  fontWeight: 'bold',
                                  color:
                                    detail.source === 'Клієнт'
                                      ? '#ac2925'
                                      : detail.source === 'Об\'єднання'
                                      ? '#8a6d3b'
                                      : detail.source === 'РСП'
                                      ? '#269abc'
                                      : detail.source === 'Маршрут'
                                      ? '#337ab7'
                                      : '#777'
                                }}
                              >
                                [{detail.source}]
                              </span>{' '}
                              <span>{detail.reason}</span>
                              {detail.isScheduled && (
                                <span style={{ color: '#a06000', fontSize: 10 }}> (⏱ {detail.startDate ? detail.startDate.split(' ')[1] : ''})</span>
                              )}
                            </div>
                          ))
                        ) : (
                          client.reason || '\u00A0'
                        )}
                      </td>
                      <td style={{ width: '80px', textAlign: 'right' }}>{client.countUrgent !== '' ? client.countUrgent : '\u00A0'}</td>
                      <td style={{ width: '90px', textAlign: 'right' }}>
                        {client.countOrders !== '' ? (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onDrilldownBuffer) onDrilldownBuffer(client);
                            }}
                            style={{ color: '#337ab7', fontWeight: 'bold', textDecoration: 'underline' }}
                            title="Переглянути замовлення у черзі (Буфер)"
                          >
                            {client.countOrders}
                          </a>
                        ) : (
                          '\u00A0'
                        )}
                      </td>
                      <td style={{ width: '95px', textAlign: 'right' }}>{client.sumAllOrders || '\u00A0'}</td>
                      <td style={{ width: '90px', textAlign: 'right' }}>{client.countRowsAllOrders !== '' ? client.countRowsAllOrders : '\u00A0'}</td>
                      <td style={{ width: '70px', textAlign: 'right' }}>{client.countIgnored !== '' ? client.countIgnored : '\u00A0'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pager */}
        <div id="pager" className="ui-jqgrid-pager" dir="ltr" style={{ width: '100%' }}>
          <div className="ui-pager-control" role="group">
            <table className="ui-pg-table ui-common-table ui-pager-table table" style={{ margin: 0 }}>
              <tbody>
                <tr>
                  <td id="pager_left" align="left" style={{ width: '30%' }}></td>
                  <td id="pager_center" align="center" style={{ whiteSpace: 'pre', width: '350px' }}>
                    <table className="ui-pg-table ui-common-table ui-paging-pager" style={{ margin: 0 }}>
                      <tbody>
                        <tr>
                          <td
                            className={`ui-pg-button ${pageIndex <= 1 ? 'ui-disabled' : ''}`}
                            title="Перша"
                            onClick={() => setCurrentPage(1)}
                          >
                            <span>«</span>
                          </td>
                          <td
                            className={`ui-pg-button ${pageIndex <= 1 ? 'ui-disabled' : ''}`}
                            title="Попередня"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          >
                            <span>‹</span>
                          </td>
                          <td className="ui-pg-button ui-disabled">
                            <span className="ui-separator"></span>
                          </td>
                          <td id="input_pager" dir="ltr">
                            Стор.{' '}
                            <input
                              className="ui-pg-input form-control"
                              type="text"
                              size={2}
                              value={pageIndex}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                  setCurrentPage(val);
                                }
                              }}
                            />{' '}
                            з <span>{totalPages}</span>
                          </td>
                          <td className="ui-pg-button ui-disabled">
                            <span className="ui-separator"></span>
                          </td>
                          <td
                            className={`ui-pg-button ${pageIndex >= totalPages ? 'ui-disabled' : ''}`}
                            title="Наступна"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          >
                            <span>›</span>
                          </td>
                          <td
                            className={`ui-pg-button ${pageIndex >= totalPages ? 'ui-disabled' : ''}`}
                            title="Остання"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            <span>»</span>
                          </td>
                          <td dir="ltr">
                            <select
                              className="ui-pg-selbox form-control"
                              value={pageSize}
                              onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                            >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={30}>30</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td id="pager_right" align="right" style={{ width: '30%' }}>
                    <div className="ui-paging-info" style={{ textAlign: 'right' }}>
                      Перегляд {sortedClients.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, sortedClients.length)} з {sortedClients.length}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
