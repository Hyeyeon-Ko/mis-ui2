import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/CustomButton.css';

/* 커스텀 버튼 component */
const CustomButton = ({ onClick = () => {}, children, className = '' }) => (
  <button className={`custom-button ${className}`} onClick={onClick}>
    {children}
  </button>
);

CustomButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default CustomButton;
