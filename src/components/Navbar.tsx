import React, { useState } from 'react';
import { BADM_LOGO_BASE64 } from '../data/mockData';

interface NavbarProps {
  currentLang: 'UA' | 'RU';
  onLangChange: (lang: 'UA' | 'RU') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onLangChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openFirm, setOpenFirm] = useState(false);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const navItems = [
    { name: 'Головна', hasDropdown: false },
    { name: 'Заходи', hasDropdown: true },
    { name: 'Довідники', hasDropdown: true },
    { name: 'Клієнти', hasDropdown: true },
    { name: 'Плани продажів', hasDropdown: true },
    { name: 'Автообработка', hasDropdown: true },
    { name: 'Звіти', hasDropdown: true },
    { name: 'Адміністратор', hasDropdown: true },
    { name: 'Контакт центр', hasDropdown: true },
    { name: 'Моніторинг вхідних замовлень', hasDropdown: true },
    { name: 'О CRM', hasDropdown: true },
    { name: 'Завдання', hasDropdown: true },
    { name: 'Мобільный агент', hasDropdown: true },
    { name: 'Користувачі ОК', hasDropdown: true },
  ];

  return (
    <div className="navbar navbar-inverse sticky" role="navigation" id="app-main-navbar">
      <div className="container-fullwidth">
        <div className="navbar-header" id="navbar-brand-header">
          <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <img
              style={{ borderRadius: '100%', width: 34, height: 34 }}
              src={BADM_LOGO_BASE64}
              alt="Logo"
            />
          </a>
        </div>

        <div className="navbar-collapse collapse" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <ul className="nav navbar-nav" id="main-nav-items">
            {navItems.map((item, index) => (
              <React.Fragment key={item.name}>
                <li className={`dropdown ${openDropdown === item.name ? 'open' : ''}`}>
                  <a
                    href="#"
                    className={item.hasDropdown ? 'dropdown-toggle' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.hasDropdown) toggleDropdown(item.name);
                    }}
                  >
                    {item.name}
                    {item.hasDropdown && <b className="caret"></b>}
                  </a>
                </li>
                {index < navItems.length - 1 && <li className="divider-vertical"></li>}
              </React.Fragment>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <div className="navbar-form navbar-right" style={{ margin: 0, paddingRight: 5 }}>
              <div className="btn-group-sm btn-group">
                <button
                  type="button"
                  className={`btn ${currentLang === 'UA' ? 'btn-primary disabled' : 'btn-default'}`}
                  onClick={() => onLangChange('UA')}
                >
                  UA
                </button>
                <button
                  type="button"
                  className={`btn ${currentLang === 'RU' ? 'btn-primary disabled' : 'btn-default'}`}
                  onClick={() => onLangChange('RU')}
                >
                  RU
                </button>
              </div>
            </div>

            <div className="navbar-form navbar-right" style={{ margin: 0, paddingRight: 5 }}>
              <button
                type="button"
                className="btn btn-link"
                style={{ padding: '6px 10px', color: '#9d9d9d', textDecoration: 'none' }}
                onClick={(e) => e.preventDefault()}
              >
                Дубінін Микита Валерійович
              </button>
            </div>

            <ul className="nav navbar-nav navbar-right" style={{ margin: 0 }}>
              <li className={`dropdown ${openFirm ? 'open' : ''}`}>
                <a
                  href="#"
                  className="dropdown-toggle current_firm"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenFirm(!openFirm);
                  }}
                  style={{ color: '#9d9d9d' }}
                >
                  ТОВ "БаДМ"-ТЕСТ5 <span className="caret"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
