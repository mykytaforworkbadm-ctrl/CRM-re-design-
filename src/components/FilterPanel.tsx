import React from 'react';
import { FilterState, FilterFieldType } from '../types';
import { UNIONS_DATA, DEPTS_DATA, RSPS_DATA, ROUTES_DATA } from '../data/mockData';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onApplyFilter: () => void;
  onToggleLocked: () => void;
  onOpenMassAction: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onApplyFilter,
  onToggleLocked,
  onOpenMassAction
}) => {
  const handleRadioChange = (type: FilterFieldType) => {
    onFilterChange({
      ...filters,
      filterBy: type
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter();
  };

  return (
    <form
      action="/Clients/AutoImport"
      method="post"
      name="mainForm"
      style={{ minHeight: '300px' }}
      onSubmit={handleSubmit}
      id="main-filter-form"
    >
      <div id="tbl_filter">
        {/* Row 1: Client Code */}
        <div className="row">
          <div
            className="form-group col-md-2 filter-title"
            onClick={() => handleRadioChange('client_code')}
          >
            <input
              id="client_code"
              name="FilterBy"
              type="radio"
              value="client_code"
              checked={filters.filterBy === 'client_code'}
              onChange={() => handleRadioChange('client_code')}
            />
            <label htmlFor="client_code">Код клієнта</label>
          </div>
          <div className="form-group col-md-2 data-value">
            <input
              className="form-control"
              id="ClientCode"
              name="ClientCode"
              placeholder="Код клієнта"
              type="text"
              value={filters.clientCode}
              disabled={filters.filterBy !== 'client_code'}
              onChange={(e) =>
                onFilterChange({ ...filters, clientCode: e.target.value })
              }
            />
          </div>
        </div>

        {/* Row 2: Client Name */}
        <div className="row">
          <div
            className="form-group col-md-2 filter-title"
            onClick={() => handleRadioChange('client_name')}
          >
            <input
              id="client_name"
              name="FilterBy"
              type="radio"
              value="client_name"
              checked={filters.filterBy === 'client_name'}
              onChange={() => handleRadioChange('client_name')}
            />
            <label htmlFor="client_name">Назва клієнта</label>
          </div>
          <div className="form-group col-md-2 data-value">
            <input
              className="form-control"
              id="ClientName"
              name="ClientName"
              placeholder="Назва клієнта"
              type="text"
              value={filters.clientName}
              disabled={filters.filterBy !== 'client_name'}
              onChange={(e) =>
                onFilterChange({ ...filters, clientName: e.target.value })
              }
            />
          </div>
        </div>

        {/* Row 3: Union Name & Warehouse (Dept) */}
        <div className="row">
          <div
            className="form-group col-md-2 filter-title"
            onClick={() => handleRadioChange('union')}
          >
            <input
              id="union"
              name="FilterBy"
              type="radio"
              value="union"
              checked={filters.filterBy === 'union'}
              onChange={() => handleRadioChange('union')}
            />
            <label htmlFor="union">Назва об'єднання</label>
          </div>
          <div className="form-group col-md-2 data-value">
            <select
              className="form-control"
              id="UnionId"
              name="UnionId"
              value={filters.unionId}
              disabled={filters.filterBy !== 'union'}
              onChange={(e) =>
                onFilterChange({ ...filters, unionId: Number(e.target.value) })
              }
            >
              {UNIONS_DATA.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group col-md-1 filter-title" style={{ paddingLeft: '2vw' }} onClick={() => handleRadioChange('dept')}>
            <input
              id="dept"
              name="FilterBy"
              type="radio"
              value="dept"
              checked={filters.filterBy === 'dept'}
              onChange={() => handleRadioChange('dept')}
            />
            <label htmlFor="dept">Склад</label>
          </div>
          <div className="form-group col-md-2 data-value">
            <select
              className="form-control"
              id="deptId"
              name="deptId"
              value={filters.deptId}
              disabled={filters.filterBy !== 'dept'}
              onChange={(e) =>
                onFilterChange({ ...filters, deptId: Number(e.target.value) })
              }
            >
              {DEPTS_DATA.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: RSP & Route */}
        <div className="row">
          <div
            className="form-group col-md-2 filter-title"
            onClick={() => handleRadioChange('rsp')}
          >
            <input
              id="rsp"
              name="FilterBy"
              type="radio"
              value="rsp"
              checked={filters.filterBy === 'rsp'}
              onChange={() => handleRadioChange('rsp')}
            />
            <label htmlFor="rsp">РСП</label>
          </div>
          <div className="form-group col-md-2 data-value">
            <select
              className="form-control"
              id="RspId"
              name="RspId"
              value={filters.rspId}
              disabled={filters.filterBy !== 'rsp'}
              onChange={(e) =>
                onFilterChange({ ...filters, rspId: Number(e.target.value) })
              }
            >
              {RSPS_DATA.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group col-md-1 filter-title" style={{ paddingLeft: '2vw' }} onClick={() => handleRadioChange('route')}>
            <input
              id="route"
              name="FilterBy"
              type="radio"
              value="route"
              checked={filters.filterBy === 'route'}
              onChange={() => handleRadioChange('route')}
            />
            <label htmlFor="route">Маршрут</label>
          </div>
          <div className="form-group col-md-2 data-value">
            <select
              className="form-control"
              id="RouteId"
              name="RouteId"
              value={filters.routeId}
              disabled={filters.filterBy !== 'route'}
              onChange={(e) =>
                onFilterChange({ ...filters, routeId: Number(e.target.value) })
              }
            >
              {ROUTES_DATA.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
        <input
          style={{ whiteSpace: 'normal', width: 'auto', minWidth: 190 }}
          type="submit"
          id="btn_search"
          className="btn btn-success"
          value="Застосувати фільтр"
        />
        <input
          style={{ marginLeft: '10px', width: 'auto', minWidth: 190 }}
          type="button"
          id="show_locked"
          className="btn btn-warning"
          value={filters.showOnlyLocked ? "Показати всіх" : "Показати заблокованих"}
          onClick={onToggleLocked}
        />
        <input
          style={{ marginLeft: '10px', width: 'auto', minWidth: 190 }}
          type="button"
          id="btn_mass_action"
          className="btn btn-primary"
          value="Масова дія"
          onClick={onOpenMassAction}
        />
      </div>
    </form>
  );
};
