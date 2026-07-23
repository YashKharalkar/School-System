import React from 'react';
import { MdWarning, MdError, MdInfo, MdCheckCircle, MdClose } from 'react-icons/md';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title = 'Confirmation',
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor,
  isAlert = false,
  iconType = 'warning'
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (iconType) {
      case 'danger':
        return <MdError className="confirm-modal-icon danger" />;
      case 'success':
        return <MdCheckCircle className="confirm-modal-icon success" />;
      case 'info':
        return <MdInfo className="confirm-modal-icon info" />;
      case 'warning':
      default:
        return <MdWarning className="confirm-modal-icon warning" />;
    }
  };

  const getConfirmStyle = () => {
    if (confirmColor) return { background: confirmColor };
    if (iconType === 'danger') return { background: '#c62828' };
    if (iconType === 'success') return { background: '#2e7d32' };
    return { background: '#1a237e' };
  };

  return (
    <div className="confirm-modal-overlay" onClick={onCancel || onConfirm}>
      <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onCancel || onConfirm}>
          <MdClose />
        </button>
        <div className="confirm-modal-header">
          {renderIcon()}
          <h3 className="confirm-modal-title">{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-footer">
          {!isAlert && (
            <button className="confirm-btn-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            className="confirm-btn-ok"
            style={getConfirmStyle()}
            onClick={onConfirm}
          >
            {isAlert ? 'OK' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
