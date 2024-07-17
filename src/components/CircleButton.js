import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/common/CircleButton.css';

/* 원 형태의 버튼 component */
const CircleButton = ({ to, label, subLabel = null }) => (
  <Link to={to} className="circle-button">
    <span className="label">{label}</span>
    {subLabel && <div className="sub-label">{subLabel}</div>}
  </Link>
);

CircleButton.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string,
};

export default CircleButton;
