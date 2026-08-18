import React, { useState, useEffect } from 'react';
import { ClientRecord } from '../types';

interface ChangeLockModalProps {
  client: ClientRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: number, isBlocked: boolean, reason: string) => void;
  onOpenQueueOrders: (client: ClientRecord) => void;
}

export const ChangeLockModal: React.FC<ChangeLockModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave,
  onOpenQueueOrders
}) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (client) {
      setIsBlocked(client.isBlocked);
      setReason(client.reason || '');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSave = () => {
    onSave(client.id, isBlocked, reason);
    onClose();
  };

  return (
    <>
      <div
        className="modal in"
        id="changeLockModal"
        style={{ display: 'block', paddingRight: '15px' }}
        role="dialog"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close closeChangeLockModal"
                aria-hidden="true"
                onClick={onClose}
              >
                ×
              </button>
              <h4 className="modal-title">Зміна блокування автоімпорту клієнта</h4>
            </div>

            <div className="container"></div>

            <div className="modal-body">
              <table id="tbl_data_client" className="table">
                <tbody>
                  <tr>
                    <td style={{ width: '30%', verticalAlign: 'middle', fontWeight: 'bold' }}>Заблокований</td>
                    <td>
                      <div className="btn-group" tabIndex={0}>
                        <a
                          className={`btn ${isBlocked ? 'active btn-danger' : 'btn-default'}`}
                          onClick={() => setIsBlocked(true)}
                        >
                          Так
                        </a>
                        <a
                          className={`btn ${!isBlocked ? 'active btn-success' : 'btn-default'}`}
                          onClick={() => setIsBlocked(false)}
                        >
                          Ні
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>Причина</td>
                    <td>
                      <select
                        className="form-control"
                        id="BLOCKING_REASON"
                        name="BLOCKING_REASON"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      >
                        <option value="">не вказана</option>
                        <option value="Пробне блокування">Пробне блокування</option>
                        <option value="Блокування НКЦ">Блокування НКЦ</option>
                        <option value="РСП">РСП</option>
                        <option value="Об'єднання">Об'єднання</option>
                        <option value="Кредитный лимит">Кредитный лимит</option>
                        <option value="Дебиторская задолженость">Дебиторская задолженость</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-center" style={{ borderTop: 'none', paddingTop: 20 }}>
                      <button
                        type="button"
                        className="btn btn-success"
                        style={{ width: '225px', marginTop: '10px' }}
                        id="btn_autoblicking_orders"
                        onClick={() => onOpenQueueOrders(client)}
                      >
                        Замовлення
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <table className="table text-right" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', borderTop: 'none', padding: 0, paddingRight: 5 }}>
                      <button
                        id="saveLockClient"
                        type="button"
                        className="btn btn-info"
                        style={{ width: '100%' }}
                        onClick={handleSave}
                      >
                        Зберегти
                      </button>
                    </td>
                    <td style={{ width: '50%', borderTop: 'none', padding: 0, paddingLeft: 5 }}>
                      <button
                        type="button"
                        className="btn btn-danger closeChangeLockModal"
                        style={{ width: '100%' }}
                        onClick={onClose}
                      >
                        Вихід
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop in"></div>
    </>
  );
};
