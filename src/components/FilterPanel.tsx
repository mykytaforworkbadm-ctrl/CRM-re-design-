import React from 'react';
import { FilterState, FilterFieldType } from '../types';
import { UNIONS_DATA, DEPTS_DATA, RSPS_DATA, ROUTES_DATA } from '../data/mockData';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onApplyFilter: () => void;
  onResetFilters: () => void;
  onToggleLocked: () => void;
  onOpenMassAction: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onApplyFilter,
  onResetFilters,
  onToggleLocked,
  onOpenMassAction
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter();
  };

  const handleSelectRadio = (fieldType: FilterFieldType) => {
    onFilterChange({
      ...filters,
      filterBy: fieldType
    });
  };

  return (
    <form
      action="/Clients/AutoImport"
      method="post"
      name="mainForm"
      onSubmit={handleSubmit}
      id="main-filter-form"
      style={{
        backgroundColor: '#fbfbfb',
        border: '1px solid #d5d5d5',
        padding: '12px 16px',
        marginBottom: 12
      }}
    >
      {/* 6 Filter Fields with Radio Buttons in Exact Order:
          1. Код клієнта
          2. Назва клієнта
          3. Назва об'єднання
          4. РСП
          5. Склад
          6. Маршрут */}
      <div className="row" style={{ marginLeft: -8, marginRight: -8 }}>
        {/* Field 1: Код клієнта */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="radio_client_code"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: filters.filterBy === 'client_code' ? 700 : 500,
              fontSize: 12,
              color: filters.filterBy === 'client_code' ? '#111' : '#555',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              id="radio_client_code"
              name="filterEntityGroup"
              checked={filters.filterBy === 'client_code'}
              onChange={() => handleSelectRadio('client_code')}
              style={{ margin: 0, cursor: 'pointer' }}
            />
            <span>Код клієнта</span>
          </label>
          <input
            className="form-control input-sm"
            id="ClientCode"
            name="ClientCode"
            placeholder="Введіть код..."
            type="text"
            disabled={filters.filterBy !== 'client_code'}
            value={filters.clientCode}
            onChange={(e) =>
              onFilterChange({ ...filters, clientCode: e.target.value })
            }
            style={{
              height: 30,
              borderRadius: 0,
              backgroundColor: filters.filterBy === 'client_code' ? '#fff' : '#f5f5f5',
              color: filters.filterBy === 'client_code' ? '#333' : '#888',
              cursor: filters.filterBy === 'client_code' ? 'text' : 'not-allowed',
              borderColor: filters.filterBy === 'client_code' ? '#66afe9' : '#d5d5d5'
            }}
          />
        </div>

        {/* Field 2: Назва клієнта */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="radio_client_name"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: filters.filterBy === 'client_name' ? 700 : 500,
              fontSize: 12,
              color: filters.filterBy === 'client_name' ? '#111' : '#555',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              id="radio_client_name"
              name="filterEntityGroup"
              checked={filters.filterBy === 'client_name'}
              onChange={() => handleSelectRadio('client_name')}
              style={{ margin: 0, cursor: 'pointer' }}
            />
            <span>Назва клієнта</span>
          </label>
          <input
            className="form-control input-sm"
            id="ClientName"
            name="ClientName"
            placeholder="Введіть назву..."
            type="text"
            disabled={filters.filterBy !== 'client_name'}
            value={filters.clientName}
            onChange={(e) =>
              onFilterChange({ ...filters, clientName: e.target.value })
            }
            style={{
              height: 30,
              borderRadius: 0,
              backgroundColor: filters.filterBy === 'client_name' ? '#fff' : '#f5f5f5',
              color: filters.filterBy === 'client_name' ? '#333' : '#888',
              cursor: filters.filterBy === 'client_name' ? 'text' : 'not-allowed',
              borderColor: filters.filterBy === 'client_name' ? '#66afe9' : '#d5d5d5'
            }}
          />
        </div>

        {/* Field 3: Назва об'єднання */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="radio_union"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: filters.filterBy === 'union' ? 700 : 500,
              fontSize: 12,
              color: filters.filterBy === 'union' ? '#111' : '#555',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              id="radio_union"
              name="filterEntityGroup"
              checked={filters.filterBy === 'union'}
              onChange={() => handleSelectRadio('union')}
              style={{ margin: 0, cursor: 'pointer' }}
            />
            <span>Назва об'єднання</span>
          </label>
          <select
            className="form-control input-sm"
            id="UnionId"
            name="UnionId"
            disabled={filters.filterBy !== 'union'}
            value={filters.unionId}
            onChange={(e) =>
              onFilterChange({ ...filters, unionId: Number(e.target.value) })
            }
            style={{
              height: 30,
              borderRadius: 0,
              backgroundColor: filters.filterBy === 'union' ? '#fff' : '#f5f5f5',
              color: filters.filterBy === 'union' ? '#333' : '#888',
              cursor: filters.filterBy === 'union' ? 'default' : 'not-allowed',
              borderColor: filters.filterBy === 'union' ? '#66afe9' : '#d5d5d5'
            }}
          >
            {UNIONS_DATA.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 4: РСП */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="radio_rsp"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: filters.filterBy === 'rsp' ? 700 : 500,
              fontSize: 12,
              color: filters.filterBy === 'rsp' ? '#111' : '#555',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              id="radio_rsp"
              name="filterEntityGroup"
              checked={filters.filterBy === 'rsp'}
              onChange={() => handleSelectRadio('rsp')}
              style={{ margin: 0, cursor: 'pointer' }}
            />
            <span>РСП</span>
          </label>
          <select
            className="form-control input-sm"
            id="RspId"
            name="RspId"
            disabled={filters.filterBy !== 'rsp'}
            value={filters.rspId}
            onChange={(e) =>
              onFilterChange({ ...filters, rspId: Number(e.target.value) })
            }
            style={{
              height: 30,
              borderRadius: 0,
              backgroundColor: filters.filterBy === 'rsp' ? '#fff' : '#f5f5f5',
              color: filters.filterBy === 'rsp' ? '#333' : '#888',
              cursor: filters.filterBy === 'rsp' ? 'default' : 'not-allowed',
              borderColor: filters.filterBy === 'rsp' ? '#66afe9' : '#d5d5d5'
            }}
          >
            {RSPS_DATA.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 5: Склад */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="radio_dept"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: filters.filterBy === 'dept' ? 700 : 500,
              fontSize: 12,
              color: filters.filterBy === 'dept' ? '#111' : '#555',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              id="radio_dept"
              name="filterEntityGroup"
              checked={filters.filterBy === 'dept'}
              onChange={() => handleSelectRadio('dept')}
              style={{ margin: 0, cursor: 'pointer' }}
            />
            <span>Склад</span>
          </label>
          <select
            className="form-control input-sm"
            id="deptId"
            name="deptId"
            disabled={filters.filterBy !== 'dept'}
            value={filters.deptId}
            onChange={(e) =>
              onFilterChange({ ...filters, deptId: Number(e.target.value) })
            }
            style={{
              height: 30,
              borderRadius: 0,
              backgroundColor: filters.filterBy === 'dept' ? '#fff' : '#f5f5f5',
              color: filters.filterBy === 'dept' ? '#333' : '#888',
              cursor: filters.filterBy === 'dept' ? 'default' : 'not-allowed',
              borderColor: filters.filterBy === 'dept' ? '#66afe9' : '#d5d5d5'
            }}
          >
            {DEPTS_DATA.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 6: Маршрут */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="radio_route"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: filters.filterBy === 'route' ? 700 : 500,
              fontSize: 12,
              color: filters.filterBy === 'route' ? '#111' : '#555',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              id="radio_route"
              name="filterEntityGroup"
              checked={filters.filterBy === 'route'}
              onChange={() => handleSelectRadio('route')}
              style={{ margin: 0, cursor: 'pointer' }}
            />
            <span>Маршрут</span>
          </label>
          <select
            className="form-control input-sm"
            id="RouteId"
            name="RouteId"
            disabled={filters.filterBy !== 'route'}
            value={filters.routeId}
            onChange={(e) =>
              onFilterChange({ ...filters, routeId: Number(e.target.value) })
            }
            style={{
              height: 30,
              borderRadius: 0,
              backgroundColor: filters.filterBy === 'route' ? '#fff' : '#f5f5f5',
              color: filters.filterBy === 'route' ? '#333' : '#888',
              cursor: filters.filterBy === 'route' ? 'default' : 'not-allowed',
              borderColor: filters.filterBy === 'route' ? '#66afe9' : '#d5d5d5'
            }}
          >
            {ROUTES_DATA.map((rt) => (
              <option key={rt.value} value={rt.value}>
                {rt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons & Checkbox Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingTop: 10,
          marginTop: 4,
          borderTop: '1px solid #e7e7e7'
        }}
      >
        {/* Search Actions & Checkbox */}
        <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="submit"
            id="btn_search"
            className="btn btn-success btn-sm"
            style={{
              padding: '6px 16px',
              fontWeight: 'bold',
              borderRadius: 0,
              fontSize: 12,
              minWidth: 150
            }}
          >
            Застосувати фільтр
          </button>

          <button
            type="button"
            id="btn_reset"
            className="btn btn-default btn-sm"
            onClick={onResetFilters}
            style={{
              padding: '6px 14px',
              borderRadius: 0,
              fontSize: 12,
              borderColor: '#ccc',
              backgroundColor: '#fff',
              color: '#444'
            }}
            title="Очистити значення фільтра"
          >
            Скинути
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginLeft: 8,
              padding: '4px 8px',
              backgroundColor: filters.showOnlyLocked ? '#fff3cd' : 'transparent',
              border: filters.showOnlyLocked ? '1px solid #ffeeba' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <label
              htmlFor="show_locked_checkbox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                margin: 0,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: filters.showOnlyLocked ? '#856404' : '#555',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                id="show_locked_checkbox"
                checked={filters.showOnlyLocked}
                onChange={onToggleLocked}
                style={{ margin: 0, cursor: 'pointer' }}
              />
              Показати тільки заблокованих
            </label>
          </div>
        </div>

        {/* Separated Mass Action Button */}
        <div>
          <button
            type="button"
            id="btn_mass_action"
            className="btn btn-primary btn-sm"
            onClick={onOpenMassAction}
            style={{
              padding: '6px 16px',
              borderRadius: 0,
              fontSize: 12,
              fontWeight: 'bold'
            }}
          >
            Масова дія...
          </button>
        </div>
      </div>
    </form>
  );
};
