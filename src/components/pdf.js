import React from 'react';
import axios from 'axios';

const DownloadButtons = () => {
  const downloadReport = (format) => {
    axios({
      url: `http://localhost:5000/api/rapport/${format}`,
      method: 'GET',
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport.${format}`);
      document.body.appendChild(link);
      link.click();
    }).catch(error => {
      console.error(`Erreur lors du téléchargement du rapport ${format}`, error);
    });
  };

  return (
    <div>
      <button onClick={() => downloadReport('pdf')}>Télécharger le Rapport en PDF</button>
      <button onClick={() => downloadReport('excel')}>Télécharger le Rapport en Excel</button>
    </div>
  );
};

export default DownloadButtons;
