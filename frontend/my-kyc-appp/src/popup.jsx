import React from 'react';
import PropTypes from 'prop-types';

const Popup = ({ title, data, onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>{title}</h2>
        <div style={styles.dataContainer}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} style={styles.dataRow}>
              <strong style={styles.dataKey}>{formatKey(key)}:</strong>
              <span style={styles.dataValue}>{String(value)}</span>
            </div>
          ))}
        </div>
        <div style={styles.modalActions}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const formatKey = (key) => {
  switch (key) {
    case 'pan_no':
      return 'PAN Number';
    case 'pan_status':
      return 'PAN Status';
    case 'kyc_status':
      return 'KYC Status';
    case 'bank_account_number':
      return 'Bank Account Number';
    case 'ifsc':
      return 'IFSC Code';
    case 'bank_account_name':
      return 'Bank Account Name';
    case 'bank_status':
      return 'Bank Status';
    case 'created_at':
      return 'Created At';
    default:
      return key;
  }
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    padding: '32px',
    width: '400px',
    textAlign: 'left',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#333',
    textAlign: 'center',
  },
  dataContainer: {
    marginBottom: '24px',
  },
  dataRow: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'flex-start',
  },
  dataKey: {
    fontWeight: '600',
    marginRight: '12px',
    color: '#555',
    minWidth: '200px', // Increased minWidth for consistent key width
    textAlign: 'left',
    display: 'inline-block', // allows width to work
  },
  dataValue: {
    color: '#333',
    flex: 1,
    wordBreak: 'break-word', // prevent overflow
  },
  modalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'center',
  },
  cancelBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
};

export default Popup;