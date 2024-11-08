import React, { useEffect, useState } from 'react';
import { Table, Select, Button } from 'antd';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';


const moisOptions = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const ConsolidationTable = () => {
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('Janvier');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      setLoading(true);
      axios.get(`http://localhost:5000/recette/consolidation/${selectedMonth}/${selectedYear}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('Response data:', response.data);

        const dataArray = Object.keys(response.data.consolidation).map(key => ({
          typeImpot: key,
          ...response.data.consolidation[key]
        }));

        if (Array.isArray(dataArray)) {
          setData(dataArray);
        } else {
          console.error('Les données converties ne sont pas un tableau:', dataArray);
          setError('Les données converties ne sont pas au format attendu.');
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des données:', error.response ? error.response.data : error.message);
        setError('Erreur lors du chargement des données.');
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [selectedMonth, selectedYear, token]);

  const calculateTotals = (data) => {
    return data.reduce((totals, item) => {
      totals.mensuel.prevision += item.prevision || 0;
      totals.mensuel.realisation += item.realisation || 0;
      totals.mensuel.taux += parseFloat(item.taux.replace(',', '.')) || 0;
      totals.cumul.prevision += item.prevision || 0;
      totals.cumul.realisation += item.realisation || 0;
      totals.cumul.taux += parseFloat(item.taux.replace(',', '.')) || 0;
      return totals;
    }, {
      mensuel: { prevision: 0, realisation: 0, taux: 0 },
      cumul: { prevision: 0, realisation: 0, taux: 0 }
    });
  };

  const totals = calculateTotals(data);

  const columns = [
    {
      title: 'Types d\'Impôts',
      dataIndex: 'typeImpot',
      key: 'typeImpot',
      width: 200,
    },
    {
      title: `Mensuel ${selectedMonth}`,
      children: [
        {
          title: 'Prévisions',
          dataIndex: 'prevision',
          key: 'mensuel_previsions',
          align: 'right',
          width: 150,
        },
        {
          title: 'Réalisation',
          dataIndex: 'realisation',
          key: 'mensuel_realisations',
          align: 'right',
          width: 150,
        },
        {
          title: 'Taux (%)',
          dataIndex: 'taux',
          key: 'mensuel_taux',
          align: 'right',
          width: 150,
        },
      ],
    },
    {
      title: `Cumul ${selectedMonth}`,
      children: [
        {
          title: 'Prévisions',
          dataIndex: 'prevision',
          key: 'cumul_previsions',
          align: 'right',
          width: 150,
        },
        {
          title: 'Réalisation',
          dataIndex: 'realisation',
          key: 'cumul_realisations',
          align: 'right',
          width: 150,
        },
        {
          title: 'Taux (%)',
          dataIndex: 'taux',
          key: 'cumul_taux',
          align: 'right',
          width: 150,
        },
      ],
    },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['Types d\'Impôts', `Mensuel ${selectedMonth} - Prévisions`, `Mensuel ${selectedMonth} - Réalisation`, `Mensuel ${selectedMonth} - Taux (%)`, `Cumul ${selectedMonth} - Prévisions`, `Cumul ${selectedMonth} - Réalisation`, `Cumul ${selectedMonth} - Taux (%)`]
      ],
      body: data.map(item => [
        item.typeImpot,
        item.prevision,
        item.realisation,
        item.taux,
        item.prevision,
        item.realisation,
        item.taux
      ]).concat([
        [
          'Total',
          totals.mensuel.prevision.toFixed(2),
          totals.mensuel.realisation.toFixed(2),
          totals.mensuel.taux.toFixed(2),
          totals.cumul.prevision.toFixed(2),
          totals.cumul.realisation.toFixed(2),
          totals.cumul.taux.toFixed(2)
        ]
      ]),
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 2,
      }
    });
    doc.save('consolidation.pdf');
  };
  
const exportExcel = () => {
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Totals:', JSON.stringify(totals, null, 2));

  // Préparer les en-têtes de colonnes
  const headers = [
    'Types d\'Impôts',
    `Mensuel ${selectedMonth} Prévisions`,
    `Mensuel ${selectedMonth} Réalisation`,
    `Mensuel ${selectedMonth} Taux (%)`,
    `Cumul ${selectedMonth} Prévisions`,
    `Cumul ${selectedMonth} Réalisation`,
    `Cumul ${selectedMonth} Taux (%)`
  ];

  // Préparer les données pour la feuille de calcul
  const sheetData = data.map(item => ({
    'Types d\'Impôts': item.typeImpot,
    [`Mensuel ${selectedMonth} Prévisions`]: item.prevision,
    [`Mensuel ${selectedMonth} Réalisation`]: item.realisation,
    [`Mensuel ${selectedMonth} Taux (%)`]: item.taux,
    [`Cumul ${selectedMonth} Prévisions`]: item.prevision,
    [`Cumul ${selectedMonth} Réalisation`]: item.realisation,
    [`Cumul ${selectedMonth} Taux (%)`]: item.taux
  }));

  // Ajouter une ligne pour les totaux
  sheetData.push({
    'Types d\'Impôts': 'Total',
    [`Mensuel ${selectedMonth} Prévisions`]: totals.mensuel.prevision.toFixed(2),
    [`Mensuel ${selectedMonth} Réalisation`]: totals.mensuel.realisation.toFixed(2),
    [`Mensuel ${selectedMonth} Taux (%)`]: totals.mensuel.taux.toFixed(2),
    [`Cumul ${selectedMonth} Prévisions`]: totals.cumul.prevision.toFixed(2),
    [`Cumul ${selectedMonth} Réalisation`]: totals.cumul.realisation.toFixed(2),
    [`Cumul ${selectedMonth} Taux (%)`]: totals.cumul.taux.toFixed(2)
  });

  // Créer une feuille de calcul
  const ws = utils.json_to_sheet(sheetData, { header: headers });

  // Définir les styles des en-têtes
  ws['!cols'] = [
    { wch: 20 }, // Largeur de la colonne pour 'Types d\'Impôts'
    { wch: 20 }, // Largeur des colonnes pour 'Mensuel ...'
    { wch: 20 }, // Largeur des colonnes pour 'Cumul ...'
  ];

  // Ajouter les totaux en bas du tableau
  const totalRowIndex = sheetData.length + 2;
  ws[`A${totalRowIndex}`] = { v: 'Total', t: 's' };
  Object.keys(totals.mensuel).forEach((key, index) => {
    ws[utils.encode_cell({ c: index + 1, r: totalRowIndex })] = { v: totals.mensuel[key].toFixed(2), t: 'n' };
    ws[utils.encode_cell({ c: index + 4, r: totalRowIndex })] = { v: totals.cumul[key].toFixed(2), t: 'n' };
  });

  // Créer un nouveau classeur et ajouter la feuille
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Consolidation');

  // Écrire le classeur dans un fichier Blob
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
  console.log('Workbook output:', new Uint8Array(wbout));

  // Sauvegarder le fichier avec file-saver
  saveAs(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'consolidation.xlsx');
};
  
  

  return (
    <div>
      <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 120 }}>
        {moisOptions.map(mois => (
          <Select.Option key={mois} value={mois}>
            {mois}
          </Select.Option>
        ))}
      </Select>
      <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120, marginLeft: 10 }}>
        {[2023, 2024, 2025].map(year => (
          <Select.Option key={year} value={year}>
            {year}
          </Select.Option>
        ))}
      </Select>
      <Button onClick={exportPDF} type="primary" style={{ marginLeft: 10 }}>
        Exporter en PDF
      </Button>
      <Button onClick={exportExcel} type="primary" style={{ marginLeft: 10 }}>
        Exporter en Excel
      </Button>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && 
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="typeImpot" 
          pagination={false}
          summary={pageData => {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={1} style={{ textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  Total BG
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right" style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {totals.mensuel.prevision.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right" style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {totals.mensuel.realisation.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right" style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {totals.mensuel.taux.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right" style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {totals.cumul.prevision.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right" style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {totals.cumul.realisation.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right" style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  {totals.cumul.taux.toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      }
    </div>
  );
};

export default ConsolidationTable;
