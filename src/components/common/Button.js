import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/Button.css';

/* 버튼 component */
const Button = ({ onClick, children, className = '' }) => (
  <button className={`button ${className}`} onClick={onClick}>
    {children}
  </button>
);

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Button;
