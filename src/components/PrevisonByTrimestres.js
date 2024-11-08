import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Select, Button } from 'antd';
import * as XLSX from 'xlsx';

const { Option } = Select;

const PrevisionByTrimestre = () => {
  const [previsions, setPrevisions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (selectedYear && selectedTrimestre) {
      axios
        .get(`http://localhost:5000/prevision/getByTrimestre/${selectedYear}/${selectedTrimestre}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        .then(response => {
          setPrevisions(response.data);
        })
        .catch(error => console.error('Erreur lors de la récupération des prévisions:', error));
    }
  }, [selectedYear, selectedTrimestre]);

  const handleYearChange = value => {
    setSelectedYear(value);
  };

  const handleTrimestreChange = value => {
    setSelectedTrimestre(value);
  };

  const columns = [
    {
      title: 'Type d\'Impôt',
      dataIndex: 'typeImpotsP',
      key: 'typeImpotsP',
    },
    {
      title: 'Janvier',
      dataIndex: 'janvier',
      key: 'janvier',
      render: value => (value ? value : 0),
    },
    {
      title: 'Février',
      dataIndex: 'fevrier',
      key: 'fevrier',
      render: value => (value ? value : 0),
    },
    {
      title: 'Mars',
      dataIndex: 'mars',
      key: 'mars',
      render: value => (value ? value : 0),
    },
    {
      title: 'Total Trimestre',
      dataIndex: 'total',
      key: 'total',
      render: value => (value ? value : 0),
    },
    {
      title: 'Trimestre',
      dataIndex: 'trimestre',
      key: 'trimestre',
    },
  ];

  const exportToExcel = () => {
    const mois = columns
      .filter(col => col.key && col.key !== 'total' && col.key !== 'trimestre')
      .map(col => col.title);

    const wsData = [
      columns.map(col => col.title.toUpperCase()), // En-têtes en majuscules
      ...previsions.map(item =>
        columns.map(col => (item[col.dataIndex] ? item[col.dataIndex].toString().toUpperCase() : ''))
      ), // Données en majuscules
      ['', '', '', '', '', '', ''], // Ligne vide avant les totaux
      [
        'TOTAL',
        ...mois.map(mois =>
          previsions.reduce((sum, item) => sum + (parseFloat(item[mois.toLowerCase()]) || 0), 0).toFixed(2)
        ),
        previsions.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2),
      ], // Totaux
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Appliquer des bordures et du style de base
    ws['!cols'] = columns.map(() => ({ wpx: 100 })); // Largeur des colonnes
    Object.keys(ws).forEach(cell => {
      if (ws[cell] && typeof ws[cell] === 'object') {
        ws[cell].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: { horizontal: 'center', vertical: 'center' }, // Centrer le texte
          font: { bold: true, sz: 12, color: { rgb: '000000' } }, // Mettre les en-têtes en gras et taille 12
        };
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prévisions');
    XLSX.writeFile(wb, 'previsions.xlsx');
  };

  const tableSummary = pageData => {
    let totalJanvier = 0;
    let totalFévrier = 0;
    let totalMars = 0;
    let totalTrimestre = 0;

    pageData.forEach(({ janvier, fevrier, mars, total }) => {
      totalJanvier += parseFloat(janvier) || 0;
      totalFévrier += parseFloat(fevrier) || 0;
      totalMars += parseFloat(mars) || 0;
      totalTrimestre += parseFloat(total) || 0;
    });

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell><b>Total</b></Table.Summary.Cell>
        <Table.Summary.Cell>{totalJanvier.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalFévrier.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalMars.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalTrimestre.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell></Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  return (
    <div>
      <h2>Prévisions par Trimestre</h2>
      <Select
        placeholder="Sélectionner une année"
        onChange={handleYearChange}
        style={{ width: 200, marginBottom: '16px' }}
        allowClear
      >
        <Option value="2022">2022</Option>
        <Option value="2023">2023</Option>
        <Option value="2024">2024</Option>
      </Select>
      <Select
        placeholder="Sélectionner un trimestre"
        onChange={handleTrimestreChange}
        style={{ width: 200, marginBottom: '16px' }}
        allowClear
      >
        <Option value="1">Trimestre 1</Option>
        <Option value="2">Trimestre 2</Option>
        <Option value="3">Trimestre 3</Option>
        <Option value="4">Trimestre 4</Option>
      </Select>
      <Button onClick={exportToExcel} style={{ marginBottom: '16px' }}>
        Exporter en Excel
      </Button>

      <Table
        columns={columns}
        dataSource={previsions}
        rowKey="id_prevision"
        pagination={false}
        summary={tableSummary}
      />
    </div>
  );
};

export default PrevisionByTrimestre;
