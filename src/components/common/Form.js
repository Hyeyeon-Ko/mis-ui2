import React, { useState } from 'react'

const Form = ({ children, init }) => {
    const [inputValue, setInputValue] = useState(init);
  
    // const onChange = (e) => {
    //   const { id, value } = e.target;
    //   setInputValue((prev) => ({ ...prev, [id]: value }));
    //   // key, value
    // };
  
    const formRequest = (e) => {
      e.preventDefault();
      console.log(inputValue);
      // logic...
    };
  
    return (
      <form onSubmit={formRequest}>

         {children(inputValue)}

        {/* <button onClick={onClick}>Form Action</button> */}
      </form>
    );
  };

export default Form