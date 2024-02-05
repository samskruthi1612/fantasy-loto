import React, { useState, useRef, useEffect } from 'react';
import './TextArea.css';

const TextArea = ({label,maskInput,onChange,width,defaultValue,errorState,disabled,errorMessage,cols,rows, ...props }) => {
  const [isFocused, setIsFocused] = useState(defaultValue?true:false);
  const inputRef = useRef(null);
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    let value = inputRef?.current?.value
    setIsFocused(value !== '' && value !== undefined && value !== null);
 };

  const handleChange = (event) => {
    onChange(event.target.value);
 };

 useEffect(()=> {
  setIsFocused(defaultValue?true:false)
 }, [defaultValue])

 const focused = () => isFocused || inputRef?.current?.value

  return (
    <div className={`floating-label-input ${focused() ? 'focused' : ''} ${errorState ? 'error' : ''}`}>
      <label>{label}</label>
      <textarea
        ref={inputRef}
        className={`${focused()?'focused':''}`}
        {...props}
        cols={cols}
        rows={rows}
        style={{width}}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        defaultValue={defaultValue??''}
        disabled={disabled}
      />
      {errorState && <span className="error-message">{errorMessage}</span>}
    </div>
  );
};

export default TextArea;
