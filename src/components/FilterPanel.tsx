import React from 'react';
import { FilterState } from '../types';
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
      {/* 6 Combined Filter Fields in Clean 3-Column Grid */}
      <div className="row" style={{ marginLeft: -8, marginRight: -8 }}>
        {/* Field 1: Client Code */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="ClientCode"
            style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12, color: '#333' }}
          >
            Код клієнта
          </label>
          <input
            className="form-control input-sm"
            id="ClientCode"
            name="ClientCode"
            placeholder="Введіть код..."
            type="text"
            value={filters.clientCode}
            onChange={(e) =>
              onFilterChange({ ...filters, clientCode: e.target.value })
            }
            style={{ height: 30, borderRadius: 0 }}
          />
        </div>

        {/* Field 2: Client Name */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="ClientName"
            style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12, color: '#333' }}
          >
            Назва клієнта
          </label>
          <input
            className="form-control input-sm"
            id="ClientName"
            name="ClientName"
            placeholder="Введіть назву..."
            type="text"
            value={filters.clientName}
            onChange={(e) =>
              onFilterChange({ ...filters, clientName: e.target.value })
            }
            style={{ height: 30, borderRadius: 0 }}
          />
        </div>

        {/* Field 3: Union Name */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="UnionId"
            style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12, color: '#333' }}
          >
            Назва об'єднання
          </label>
          <select
            className="form-control input-sm"
            id="UnionId"
            name="UnionId"
            value={filters.unionId}
            onChange={(e) =>
              onFilterChange({ ...filters, unionId: Number(e.target.value) })
            }
            style={{ height: 30, borderRadius: 0 }}
          >
            {UNIONS_DATA.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 4: Warehouse (Dept) */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="deptId"
            style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12, color: '#333' }}
          >
            Склад
          </label>
          <select
            className="form-control input-sm"
            id="deptId"
            name="deptId"
            value={filters.deptId}
            onChange={(e) =>
              onFilterChange({ ...filters, deptId: Number(e.target.value) })
            }
            style={{ height: 30, borderRadius: 0 }}
          >
            {DEPTS_DATA.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 5: RSP */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="RspId"
            style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12, color: '#333' }}
          >
            РСП
          </label>
          <select
            className="form-control input-sm"
            id="RspId"
            name="RspId"
            value={filters.rspId}
            onChange={(e) =>
              onFilterChange({ ...filters, rspId: Number(e.target.value) })
            }
            style={{ height: 30, borderRadius: 0 }}
          >
            {RSPS_DATA.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 6: Route */}
        <div className="col-xs-12 col-sm-6 col-md-4" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 10 }}>
          <label
            htmlFor="RouteId"
            style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12, color: '#333' }}
          >
            Маршрут
          </label>
          <select
            className="form-control input-sm"
            id="RouteId"
            name="RouteId"
            value={filters.routeId}
            onChange={(e) =>
              onFilterChange({ ...filters, routeId: Number(e.target.value) })
            }
            style={{ height: 30, borderRadius: 0 }}
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
            title="Очистити всі поля фільтра"
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
