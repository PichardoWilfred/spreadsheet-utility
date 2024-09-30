
export function useDateFormatted(date, format = 'text') {
    // Meses del año
    const months = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    function capitalize(string) {
        if (string.length === 0) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Obtener el día, mes y año de la fecha
    const day = date.getDate();
    const month = capitalize( months[date.getMonth()] );
    const year = date.getFullYear();
    
    // Formatear la fecha en el formato deseado
    switch (format) {
        case 'simple':
            return `${(date.getMonth() + 1)}-${day}-${year}`;
        default:
            return `${day} de ${month}, ${year}`;
    }
;
}