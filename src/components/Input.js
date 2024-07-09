import React from 'react';
import PropTypes from 'prop-types';
import '../styles/common/Input.css';

/* 입력 component */
const Input = ({ type, value, onChange, className }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`custom-input ${className}`}
  />
);

Input.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

Input.defaultProps = {
  className: '',
};

export default Input;
