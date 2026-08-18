import React, { useState, useEffect } from 'react';
import { QueueOrder, QueueColumnFilters, ClientRecord } from '../types';
import { UNIONS_DATA } from '../data/mockData';

interface QueueOrdersPageProps {
  orders: QueueOrder[];
  initialClientFilter?: ClientRecord | null;
  onClearInitialFilter?: () => void;
}

export const QueueOrdersPage: React.FC<QueueOrdersPageProps> = ({
  orders,
  initialClientFilter,
  onClearInitialFilter
}) => {
  // Top filter states
  const [filterClient, setFilterClient] = useState<string>('');
  const [filterUnion, setFilterUnion] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  // Table pagination and selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Column inline filters
  const [columnFilters, setColumnFilters] = useState<QueueColumnFilters>({
    dateReceived: '',
    clOrderNo: '',
    msgId: '',
    clientName: '',
    clientCode: '',
    routeName: '',
    subCode: '',
    subName: '',
    fileName: '',
    managerName: '',
    orderedSum: '',
    pending: '',
    urgentazh: '',
    orderCountRows: ''
  });

  // If initialClientFilter is passed (drill-down from registry)
  useEffect(() => {
    if (initialClientFilter) {
      setFilterClient(initialClientFilter.clCode);
      if (initialClientFilter.unionName) {
        setFilterUnion(initialClientFilter.unionName);
      }
    }
  }, [initialClientFilter]);

  // Apply top filters
  const topFilteredOrders = orders.filter((o) => {
    if (filterClient) {
      const q = filterClient.toLowerCase();
      const matchClient = o.clientCode.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
      if (!matchClient) return false;
    }
    if (filterUnion && filterUnion !== '0') {
      const q = filterUnion.toLowerCase();
      const matchUnion =
        (o.unionName && o.unionName.toLowerCase().includes(q)) ||
        (o.corpName && o.corpName.toLowerCase().includes(q)) ||
        (o.corpCode && o.corpCode.toLowerCase().includes(q));
      if (!matchUnion) return false;
    }
    if (filterDateFrom) {
      // Basic date check (dateReceived is dd.mm.yyyy hh:mm:ss)
      const orderDateParts = o.dateReceived.split(' ')[0].split('.');
      if (orderDateParts.length === 3) {
        const orderIso = `${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]}`;
        if (orderIso < filterDateFrom) return false;
      }
    }
    if (filterDateTo) {
      const orderDateParts = o.dateReceived.split(' ')[0].split('.');
      if (orderDateParts.length === 3) {
        const orderIso = `${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]}`;
        if (orderIso > filterDateTo) return false;
      }
    }
    return true;
  });

  // Apply inline column filters
  const finalFilteredOrders = topFilteredOrders.filter((o) => {
    if (columnFilters.dateReceived && !o.dateReceived.toLowerCase().includes(columnFilters.dateReceived.toLowerCase())) return false;
    if (columnFilters.clOrderNo && !o.clOrderNo.toLowerCase().includes(columnFilters.clOrderNo.toLowerCase())) return false;
    if (columnFilters.msgId && !String(o.msgId).includes(columnFilters.msgId)) return false;
    if (columnFilters.clientName && !o.clientName.toLowerCase().includes(columnFilters.clientName.toLowerCase())) return false;
    if (columnFilters.clientCode && !o.clientCode.toLowerCase().includes(columnFilters.clientCode.toLowerCase())) return false;
    if (columnFilters.routeName && !o.routeName.toLowerCase().includes(columnFilters.routeName.toLowerCase())) return false;
    if (columnFilters.subCode && !o.subCode.toLowerCase().includes(columnFilters.subCode.toLowerCase())) return false;
    if (columnFilters.subName && !o.subName.toLowerCase().includes(columnFilters.subName.toLowerCase())) return false;
    if (columnFilters.fileName && !o.fileName.toLowerCase().includes(columnFilters.fileName.toLowerCase())) return false;
    if (columnFilters.managerName && !o.managerName.toLowerCase().includes(columnFilters.managerName.toLowerCase())) return false;
    if (columnFilters.orderedSum && !String(o.orderedSum).includes(columnFilters.orderedSum)) return false;
    if (columnFilters.pending && !o.pending.toLowerCase().includes(columnFilters.pending.toLowerCase())) return false;
    if (columnFilters.urgentazh && !o.urgentazh.toLowerCase().includes(columnFilters.urgentazh.toLowerCase())) return false;
    if (columnFilters.orderCountRows && !String(o.orderCountRows).includes(columnFilters.orderCountRows)) return false;
    return true;
  });

  // Calculate totals
  const totalSum = finalFilteredOrders.reduce((sum, o) => sum + o.orderedSum, 0);
  const totalPositions = finalFilteredOrders.reduce((sum, o) => sum + o.orderCountRows, 0);

  const totalPages = Math.max(1, Math.ceil(finalFilteredOrders.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const startIndex = (pageIndex - 1) * pageSize;
  const pageOrders = finalFilteredOrders.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setFilterClient('');
    setFilterUnion('');
    setFilterDateFrom('');
    setFilterDateTo('');
    if (onClearInitialFilter) onClearInitialFilter();
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === pageOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(pageOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: number) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((i) => i !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const clearColumnFilter = (key: keyof QueueColumnFilters) => {
    setColumnFilters({
      ...columnFilters,
      [key]: ''
    });
  };

  return (
    <div id="queue-orders-buffer-page" style={{ padding: '0 15px' }}>
      <div className="text-center">
        <h2 style={{ fontFamily: 'fantasy' }}>Замовлення у черзі (Буфер)</h2>
      </div>

      {/* Top Filter Bar in the same CRM layout */}
      <div
        id="tbl_filter"
        style={{
          backgroundColor: '#fbfbfb',
          border: '1px solid #ddd',
          padding: '12px 15px',
          marginBottom: 15
        }}
      >
        <div className="row" style={{ marginBottom: 8 }}>
          <div className="col-md-2" style={{ fontWeight: 'bold', width: '180px' }}>
            Клієнт (код / назва):
          </div>
          <div className="col-md-2" style={{ width: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Код або назва клієнта"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
          </div>

          <div className="col-md-2" style={{ fontWeight: 'bold', width: '210px', paddingLeft: 20 }}>
            Об'єднання / Корпорація:
          </div>
          <div className="col-md-2" style={{ width: '320px' }}>
            <select
              className="form-control"
              value={filterUnion}
              onChange={(e) => setFilterUnion(e.target.value)}
            >
              <option value="">Всі об'єднання та корпорації</option>
              {UNIONS_DATA.filter((u) => u.value !== 0).map((u) => (
                <option key={u.value} value={u.label}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-2" style={{ fontWeight: 'bold', width: '180px' }}>
            Дата надходження з:
          </div>
          <div className="col-md-2" style={{ width: '240px' }}>
            <input
              type="date"
              className="form-control"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          <div className="col-md-2" style={{ fontWeight: 'bold', width: '210px', paddingLeft: 20 }}>
            Дата надходження по:
          </div>
          <div className="col-md-2" style={{ width: '240px' }}>
            <input
              type="date"
              className="form-control"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: 20, display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setCurrentPage(1)}
            >
              Застосувати фільтр
            </button>
            <button
              type="button"
              className="btn btn-default"
              onClick={handleResetFilters}
            >
              Скинути фільтр
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table (jqGrid style) */}
      <div className="ui-jqgrid" id="gbox_bufferOrders" dir="ltr" style={{ width: '100%' }}>
        <div className="ui-jqgrid-view table-responsive" role="grid" id="gview_bufferOrders" style={{ width: '100%' }}>
          <div className="ui-jqgrid-hdiv" style={{ width: '100%' }}>
            <div className="ui-jqgrid-hbox">
              <table className="ui-jqgrid-htable ui-common-table table table-bordered" style={{ width: '100%', minWidth: 1400 }}>
                <thead>
                  <tr className="ui-jqgrid-labels" role="row">
                    <th style={{ width: '36px', textAlign: 'center' }} className="ui-th-column ui-th-ltr jqgrid-multibox">
                      <div className="ui-th-div">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.length > 0 && selectedOrderIds.length === pageOrders.length}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th style={{ width: '130px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Дата замовлення</div>
                    </th>
                    <th style={{ width: '100px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Номер замовлення</div>
                    </th>
                    <th style={{ width: '70px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">ID замовл</div>
                    </th>
                    <th style={{ width: '140px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Кліент</div>
                    </th>
                    <th style={{ width: '80px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Код кліента</div>
                    </th>
                    <th style={{ width: '90px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Маршрут</div>
                    </th>
                    <th style={{ width: '85px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Код підрозділу</div>
                    </th>
                    <th style={{ width: '180px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Назва підрозділу</div>
                    </th>
                    <th style={{ width: '110px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Файл заявки</div>
                    </th>
                    <th style={{ width: '120px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Менеджер</div>
                    </th>
                    <th style={{ width: '105px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Сума замовлення</div>
                    </th>
                    <th style={{ width: '75px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Ігнорування</div>
                    </th>
                    <th style={{ width: '70px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Ургентаж</div>
                    </th>
                    <th style={{ width: '95px' }} className="ui-th-column ui-th-ltr">
                      <div className="ui-th-div">Кількість позицій</div>
                    </th>
                  </tr>

                  {/* Inline column filters */}
                  <tr className="ui-search-toolbar" role="row">
                    <th><div></div></th>
                    <th>
                      <table className="ui-search-table">
                        <tbody>
                          <tr>
                            <td className="ui-search-input">
                              <input
                                type="text"
                                className="form-control"
                                value={columnFilters.dateReceived}
                                onChange={(e) => setColumnFilters({ ...columnFilters, dateReceived: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('dateReceived')}>x</a>
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
                                value={columnFilters.clOrderNo}
                                onChange={(e) => setColumnFilters({ ...columnFilters, clOrderNo: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('clOrderNo')}>x</a>
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
                                value={columnFilters.msgId}
                                onChange={(e) => setColumnFilters({ ...columnFilters, msgId: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('msgId')}>x</a>
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
                                value={columnFilters.clientName}
                                onChange={(e) => setColumnFilters({ ...columnFilters, clientName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('clientName')}>x</a>
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
                                value={columnFilters.clientCode}
                                onChange={(e) => setColumnFilters({ ...columnFilters, clientCode: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('clientCode')}>x</a>
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
                                value={columnFilters.routeName}
                                onChange={(e) => setColumnFilters({ ...columnFilters, routeName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('routeName')}>x</a>
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
                                value={columnFilters.subCode}
                                onChange={(e) => setColumnFilters({ ...columnFilters, subCode: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('subCode')}>x</a>
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
                                value={columnFilters.subName}
                                onChange={(e) => setColumnFilters({ ...columnFilters, subName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('subName')}>x</a>
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
                                value={columnFilters.fileName}
                                onChange={(e) => setColumnFilters({ ...columnFilters, fileName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('fileName')}>x</a>
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
                                value={columnFilters.managerName}
                                onChange={(e) => setColumnFilters({ ...columnFilters, managerName: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('managerName')}>x</a>
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
                                value={columnFilters.orderedSum}
                                onChange={(e) => setColumnFilters({ ...columnFilters, orderedSum: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('orderedSum')}>x</a>
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
                                value={columnFilters.pending}
                                onChange={(e) => setColumnFilters({ ...columnFilters, pending: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('pending')}>x</a>
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
                                value={columnFilters.urgentazh}
                                onChange={(e) => setColumnFilters({ ...columnFilters, urgentazh: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('urgentazh')}>x</a>
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
                                value={columnFilters.orderCountRows}
                                onChange={(e) => setColumnFilters({ ...columnFilters, orderCountRows: e.target.value })}
                              />
                            </td>
                            <td className="ui-search-clear">
                              <a className="clearsearchclass" onClick={() => clearColumnFilter('orderCountRows')}>x</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pageOrders.map((order) => {
                    const isChecked = selectedOrderIds.includes(order.id);
                    return (
                      <tr key={order.id} id={String(order.id)} className="jqgrow ui-row-ltr">
                        <td style={{ textAlign: 'center' }} className="jqgrid-multibox">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectOrder(order.id)}
                          />
                        </td>
                        <td>{order.dateReceived}</td>
                        <td>{order.clOrderNo}</td>
                        <td>{order.msgId}</td>
                        <td title={order.clientName}>{order.clientName}</td>
                        <td>{order.clientCode}</td>
                        <td>{order.routeName}</td>
                        <td>{order.subCode}</td>
                        <td title={order.subName}>{order.subName}</td>
                        <td>
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            style={{ color: '#337ab7', textDecoration: 'underline' }}
                          >
                            {order.fileName}
                          </a>
                        </td>
                        <td title={order.managerName}>{order.managerName}</td>
                        <td style={{ textAlign: 'right' }}>
                          {order.orderedSum.toLocaleString('uk-UA', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'center' }}>{order.pending}</td>
                        <td style={{ textAlign: 'center' }}>{order.urgentazh}</td>
                        <td style={{ textAlign: 'right' }}>{order.orderCountRows}</td>
                      </tr>
                    );
                  })}
                  {pageOrders.length === 0 && (
                    <tr>
                      <td colSpan={15} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Не знайдено замовлень за вказаними фільтрами
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Summary Totals Footer */}
                <tfoot>
                  <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                    <td colSpan={11} style={{ textAlign: 'right', padding: '8px 12px' }}>
                      Разом по відфільтрованих замовленнях ({finalFilteredOrders.length} замовл.):
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', color: '#245580', fontSize: 13 }}>
                      {totalSum.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн
                    </td>
                    <td colSpan={2}></td>
                    <td style={{ textAlign: 'right', padding: '8px', color: '#245580', fontSize: 13 }}>
                      {totalPositions}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pager */}
          <div id="buffer_pager" className="ui-jqgrid-pager" dir="ltr" style={{ width: '100%' }}>
            <div className="ui-pager-control" role="group">
              <table className="ui-pg-table ui-common-table ui-pager-table table" style={{ margin: 0 }}>
                <tbody>
                  <tr>
                    <td align="left" style={{ width: '25%' }}>
                      <table className="ui-pg-table navtable ui-common-table" style={{ margin: 0 }}>
                        <tbody>
                          <tr>
                            <td className="ui-pg-button" title="Змінити ігнорування">
                              <div className="ui-pg-div" style={{ padding: '0 4px', fontWeight: 'bold' }}>
                                <span>▦</span>
                              </div>
                            </td>
                            <td className="ui-pg-button" title="Оновити" onClick={() => setCurrentPage(1)}>
                              <div className="ui-pg-div" style={{ padding: '0 4px' }}>
                                <span>↻</span>
                              </div>
                            </td>
                            <td className="ui-pg-button" title="Export">
                              <div className="ui-pg-div" style={{ padding: '0 4px' }}>
                                <span>⤓</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    <td align="center" style={{ whiteSpace: 'pre', width: '370px' }}>
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
                            <td dir="ltr">
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
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={500}>500</option>
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    <td align="right" style={{ width: '25%' }}>
                      <div className="ui-paging-info" style={{ textAlign: 'right' }}>
                        Перегляд {finalFilteredOrders.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, finalFilteredOrders.length)} з {finalFilteredOrders.length}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
