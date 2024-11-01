
const calculateDuration = (start, end) => {
    const [startMonth, startYear] = start.split(" ");
    const [endMonth, endYear] = end === "Present" ? [new Date().getMonth() + 1, new Date().getFullYear()] : end.split(" ");
    

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startMonthIndex = monthNames.indexOf(startMonth);
    const endMonthIndex = end === "Present" ? new Date().getMonth() : monthNames.indexOf(endMonth);
    
    const yearDiff = parseInt(endYear) - parseInt(startYear);
    const monthDiff = endMonthIndex - startMonthIndex;
  
    const totalMonths = yearDiff * 12 + monthDiff;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
  
    return `${years > 0 ? `${years} yr${years > 1 ? 's' : ''} ` : ''}${months} month${months > 1 ? 's' : ''}`;
  };
  
  export default calculateDuration