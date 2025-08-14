import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import styles from './../style.module.scss';
import {AlertMessage} from '../../AlertMessage';

interface TextareaLabelProps {
  id: string;
  label: string;
  value?: string;
  setState?: (callback: (prev: any) => any) => void;
  modifyStateExternal?: (id: string, value: string) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  errorExternal?: string;
  className?: string;
}

export const TextareaLabel = forwardRef<HTMLTextAreaElement, TextareaLabelProps>(
  (props, ref) => {
    const {
      id,
      label,
      value = '',
      setState,
      modifyStateExternal,
      required = false,
      disabled = false,
      readOnly = false,
      placeholder,
      rows = 3,
      maxLength,
      errorExternal,
      className = ''
    } = props;

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [localValue, setLocalValue] = useState<string>(value);
    const [error, setError] = useState<string | undefined>();

    useImperativeHandle(ref, () => internalRef.current!);

    useEffect(() => {
      setLocalValue(value);
      if (value) setError(undefined);
    }, [value]);

    useEffect(() => {
      setError(errorExternal);
    }, [errorExternal]);

    function updateValue(val: string) {
      if (modifyStateExternal) {
        modifyStateExternal(id, val);
      } else if (setState) {
        setState(prev => ({ ...prev, [id]: val }));
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setLocalValue(val);
      updateValue(val);
    };

    return (
      <div className={styles.cFloat}>
        <label className={styles.cFloat__label} htmlFor={id}>
          {label}
          {required && <span className="text-red">*</span>}
        </label>
        <textarea
          id={id}
          ref={internalRef}
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`${styles.cFloat__input} resize-none ${error ? '!border-red border-b' : 'border-neutral/20'} ${className}`}
        />
        {error && <AlertMessage message={errorExternal} type="error" />}
      </div>
    );
  }
);

export const Textarea = React.memo(TextareaLabel);
