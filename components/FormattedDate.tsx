"use client";

import { useEffect, useState } from "react";
import { format as dateFnsFormat } from "date-fns";
import { es } from "date-fns/locale";

interface FormattedDateProps {
  date: string;
  options?: Intl.DateTimeFormatOptions;
  formatString?: string;
  className?: string;
  showTime?: boolean;
}

export default function FormattedDate({ 
  date, 
  options, 
  formatString,
  className = "", 
  showTime = false 
}: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (!date) return;

    const dateObj = new Date(date);
    
    if (formatString) {
      setFormattedDate(dateFnsFormat(dateObj, formatString, { locale: es }));
      return;
    }
    
    // Default options if none provided
    const defaultOptions: Intl.DateTimeFormatOptions = showTime 
      ? { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric',
          second: undefined 
        }
      : { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric' 
        };

    const finalOptions = options || defaultOptions;
    
    // Use the browser's locale and timezone
    setFormattedDate(dateObj.toLocaleString(undefined, finalOptions));
  }, [date, options, formatString, showTime]);

  // Render a placeholder or nothing to avoid hydration mismatch
  if (!formattedDate) {
    return <span className={`opacity-0 ${className}`}>...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}
