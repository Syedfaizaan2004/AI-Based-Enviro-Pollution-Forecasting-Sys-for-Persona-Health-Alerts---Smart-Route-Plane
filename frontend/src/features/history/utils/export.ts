export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => headers.map(header => {
      const val = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(','))
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  triggerDownload(blob, `${filename}.csv`);
};

export const exportToJSON = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  
  triggerDownload(blob, `${filename}.json`);
};

const triggerDownload = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  if (link.download !== undefined) { 
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
