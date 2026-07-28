export const formatToVNTime = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  
  let dateObj: Date;
  if (typeof dateInput === 'string') {
    dateObj = new Date(dateInput);
  } else {
    dateObj = dateInput;
  }
    
  if (isNaN(dateObj.getTime())) {
    return String(dateInput);
  }

  try {
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear();
    
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());
    
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  } catch (e) {
    return dateObj.toLocaleString();
  }
};
