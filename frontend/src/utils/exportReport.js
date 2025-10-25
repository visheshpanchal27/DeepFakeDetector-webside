export const exportToJSON = (data, filename = 'analysis-report') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

export const exportToCSV = (data, filename = 'analysis-report') => {
  const headers = Object.keys(data);
  const values = Object.values(data).map(v => 
    typeof v === 'object' ? JSON.stringify(v) : v
  );
  
  const csv = [headers.join(','), values.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `${filename}.csv`);
};

export const exportToPDF = async (elementId, filename = 'analysis-report') => {
  // Placeholder for PDF export - requires html2pdf or similar library
  console.log('PDF export requires additional library');
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
