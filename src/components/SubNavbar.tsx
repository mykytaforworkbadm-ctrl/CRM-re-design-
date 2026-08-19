import React from 'react';
import { AppPage } from '../types';

interface SubNavbarProps {
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  bufferCount?: number;
  objectLocksCount?: number;
  unlockedQueueCount?: number;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  currentPage,
  onPageChange,
  bufferCount,
  objectLocksCount,
  unlockedQueueCount
}) => {
  const tabs: { id: AppPage; label: string; count?: number }[] = [
    { id: 'registry', label: 'Реєстр блокувань' },
    { id: 'buffer', label: 'Замовлення у черзі (буфер)', count: bufferCount },
    { id: 'objects', label: 'Блокування об\'єктів', count: objectLocksCount },
    { id: 'unlocked-queue', label: 'Замовлення у черзі (розблокування)', count: unlockedQueueCount }
  ];

  return (
    <div
      id="crm-sub-navbar"
      style={{
        backgroundColor: '#2b2b2b',
        borderBottom: '1px solid #1a1a1a',
        borderTop: '1px solid #3c3c3c',
        paddingLeft: '15px',
        paddingRight: '15px',
        display: 'flex',
        alignItems: 'center',
        minHeight: '36px'
      }}
    >
      <div style={{ display: 'flex', gap: '0' }}>
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPageChange(tab.id)}
              style={{
                backgroundColor: isActive ? '#3e3e3e' : 'transparent',
                color: isActive ? '#ffffff' : '#b0b0b0',
                border: 'none',
                borderBottom: isActive ? '2px solid #337ab7' : '2px solid transparent',
                borderRadius: '0px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: isActive ? 'bold' : 'normal',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'none',
                transition: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#353535';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#b0b0b0';
                }
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    padding: '1px 5px',
                    backgroundColor: isActive ? '#245580' : '#444',
                    color: '#fff'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
