import React from 'react';
import { FaHome } from 'react-icons/fa';
import PropTypes from 'prop-types';
import '../../styles/common/Breadcrumb.css';

/* 페이지 흐름을 나타내는 component */
const Breadcrumb = ({ items }) => (
  <div className="breadcrumb">
    <FaHome />
    {items.map((item, index) => (
      <React.Fragment key={index}>
        <span className="nav-separator"> &gt; </span>
        <span className={`nav-item ${index === items.length - 1 ? 'current' : 'before'}`}>{item}</span>
      </React.Fragment>
    ))}
  </div>
);

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Breadcrumb;
