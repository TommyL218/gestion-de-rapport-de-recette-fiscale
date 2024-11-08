import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Select, Button, Typography } from 'antd';
import { FilePdfOutlined, FileExcelOutlined} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './PrevisionByTrimestre.css'; // Importer le fichier CSS pour les styles personnalisés
import {jwtDecode }from 'jwt-decode';

const { Option } = Select;
const { Title } = Typography;

const PrevisionByTrimestre = () => {
  const [previsions, setPrevisions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('');
  const [columns, setColumns] = useState([]);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const nom_departement = decoded.nom_departement;





 



  // Récupérer les prévisions en fonction de l'année et du trimestre sélectionnés
  useEffect(() => {
    if (selectedYear && selectedTrimestre && token) {
      axios.get(`http://localhost:5000/prevision/getByTrimestre/${selectedYear}/${selectedTrimestre}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          setPrevisions(response.data);
        })
        .catch(error => console.error('Erreur lors de la récupération des prévisions:', error));
    }
  }, [selectedYear, selectedTrimestre, token]);

  // Mettre à jour les colonnes du tableau en fonction du trimestre sélectionné
  useEffect(() => {
    const updateColumns = () => {
      let mois = [];
      switch (selectedTrimestre) {
        case '1':
          mois = ['janvier', 'février', 'mars'];
          break;
        case '2':
          mois = ['avril', 'mai', 'juin'];
          break;
        case '3':
          mois = ['juillet', 'août', 'septembre'];
          break;
        case '4':
          mois = ['octobre', 'novembre', 'décembre'];
          break;
        default:
          mois = [];
      }

      setColumns([
        {
          title: 'Type d\'Impôt',
          dataIndex: 'typeImpotsP',
          key: 'typeImpotsP',
          sorter: (a, b) => a.typeImpotsP.localeCompare(b.typeImpotsP),
        },
        ...mois.map((mois, index) => ({
          title: mois.charAt(0).toUpperCase() + mois.slice(1), // Capitaliser le nom du mois
          dataIndex: mois,
          key: mois,
          render: (value) => {
            // Convertir la valeur en nombre et appliquer toFixed
            const numericValue = parseFloat(value);
            return !isNaN(numericValue) ? numericValue.toFixed(2) : '0.00';
          },
        })),
        {
          title: 'Total Trimestre',
          dataIndex: 'total',
          key: 'total',
          render: (value) => {
            // Convertir la valeur en nombre et appliquer toFixed
            const numericValue = parseFloat(value);
            return !isNaN(numericValue) ? numericValue.toFixed(2) : '0.00';
          },
        },
        {
          title: 'Trimestre',
          dataIndex: 'trimestre',
          key: 'trimestre',
        },
      ]);
    };

    updateColumns();
  }, [selectedTrimestre]);

  // Gérer les changements de l'année et du trimestre sélectionnés
  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const handleTrimestreChange = (value) => {
    setSelectedTrimestre(value);
  };

  // Résumé du tableau (totaux)
  const tableSummary = (pageData) => {
    const mois = columns
      .filter(col => col.key && col.key !== 'total' && col.key !== 'trimestre' && col.key !== 'typeImpotsP')
      .map(col => col.key);

    const totals = mois.reduce((acc, mois) => {
      acc[mois] = 0;
      return acc;
    }, { total: 0 });

    pageData.forEach(item => {
      mois.forEach(mois => {
        const value = parseFloat(item[mois]) || 0;
        totals[mois] += value;
      });
      totals.total += parseFloat(item.total) || 0;
    });

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell className="summary-cell"><b>Total</b></Table.Summary.Cell>
        {mois.map((mois, index) => (
          <Table.Summary.Cell key={`footer-mois-${index}`} className="summary-cell">{totals[mois].toFixed(2)}</Table.Summary.Cell>
        ))}
        <Table.Summary.Cell className="summary-cell">{totals.total.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell className="summary-cell"></Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  // Fonction pour exporter les données en Excel
  const exportToExcel = () => {
    const mois = columns
      .filter(col => col.key && col.key !== 'total' && col.key !== 'trimestre' && col.key !== 'typeImpotsP')
      .map(col => col.key);

    // Préparer les données pour le fichier Excel
    const wsData = [
      [
        `${nom_departement}`
      ],
      ['TYPE D\'IMPÔT', ...mois.map(mois => mois.toUpperCase()), 'TOTAL TRIMESTRE', 'TRIMESTRE', 'ANNEE'], // En-têtes avec "ANNEE"
      ...previsions.map(item => [
        item.typeImpotsP || 'N/A', // Assurer que le type d'impôt est inclus
        ...mois.map(mois => {
          const moisCle = mois.toLowerCase();
          const value = parseFloat(item[moisCle]);
          return isNaN(value) ? '' : value.toFixed(2);
        }),
        item.total ? parseFloat(item.total).toFixed(2) : '0.00',
        selectedTrimestre || '', // Ajouter le trimestre
        selectedYear // Ajouter l'année
      ]), 
      ['', '', '', '', '', '', '', ''], // Ligne vide avant les totaux
      ['TOTAL',
        ...mois.map(mois => previsions.reduce((sum, item) => sum + (parseFloat(item[mois]) || 0), 0).toFixed(2)),
        previsions.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2),
        '', // Pas de trimestre dans la ligne des totaux
        '' // Pas d'année dans la ligne des totaux
      ],
    ];

    // Ajouter des logs pour vérifier les données
    console.log('Prévisions:', previsions); // Inspecte les données brutes
    console.log('Colonnes:', columns); // Inspecte les colonnes
    console.log('Données Excel:', wsData); // Inspecte les données prêtes pour l'exportation

    const ws = XLSX.utils.aoa_to_sheet(wsData);
      // Fusion de cellules pour le titre "CUMUL T<selectedTrimestre>"
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Fusionne les colonnes 1 à 3 sur la première ligne pour "Consolidation des recettes fiscales"
      ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Prévisions_T${selectedTrimestre}_${nom_departement}_${selectedYear}`);
    XLSX.writeFile(wb, `previsions-${selectedYear}-trimestre-${selectedTrimestre}.xlsx`);
  };

  // Fonction pour exporter les données en PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const mois = columns.filter(col => col.key && col.key !== 'total' && col.key !== 'trimestre' && col.key !== 'typeImpotsP').map(col => col.title);

    const tableData = previsions.map(item => [
      item.typeImpotsP || 'N/A',
      ...mois.map(mois => {
        const moisCle = mois.toLowerCase();
        const value = parseFloat(item[moisCle]);
        return isNaN(value) ? '' : value.toFixed(2);
      }),
      item.total ? parseFloat(item.total).toFixed(2) : '0.00',
      item.trimestre ? item.trimestre.toString() : 'N/A',
      selectedYear,
    ]);

    const totals = mois.reduce((acc, mois) => {
      const moisCle = mois.toLowerCase();
      acc[mois] = previsions.reduce((sum, item) => sum + (parseFloat(item[moisCle]) || 0), 0).toFixed(2);
      return acc;
    }, {});
    
    const totalRow = [
      'TOTAL',
      ...mois.map(mois => totals[mois]),
      previsions.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2),
      '',
      '',
    ];

    doc.autoTable({
      head: [
        ['Type d\'Impôt', ...mois, 'Total Trimestre', 'Trimestre', 'Année'],
      ],
      body: [...tableData, totalRow],
      theme: 'grid',
    });

    doc.save(`previsions-${selectedYear}-trimestre-${selectedTrimestre}.pdf`);
  };

  return (

   
   
  
    <div>
      <Title level={2} style={{ marginBottom: '16px', textAlign: 'center', color: '#93c4c5' }}>Prévisions par Trimestre{}</Title>
      <Select
        placeholder="Sélectionner l'année"
        onChange={handleYearChange}
        style={{ width: 200, marginRight: 16 }}
      >
        {/* Remplacer les options par celles que vous avez réellement */}
          <Option value="2022">2022</Option>
          <Option value="2023">2023</Option>
          <Option value="2024">2024</Option>
          <Option value="2025">2025</Option>
          <Option value="2026">2026</Option>
          <Option value="2027">2027</Option>
          <Option value="2028">2028</Option>
          <Option value="2029">2029</Option>
          <Option value="2030">2030</Option>
          <Option value="2031">2031</Option>
          <Option value="2032">2032</Option>
          <Option value="2033">2033</Option>
          <Option value="2034">2034</Option>
          <Option value="2035">2035</Option>
      </Select>
      <Select
        placeholder="Sélectionner le trimestre"
        onChange={handleTrimestreChange}
        style={{ width: 200, marginRight: 16 }}
      >
        <Option value="1">1er Trimestre</Option>
        <Option value="2">2e Trimestre</Option>
        <Option value="3">3e Trimestre</Option>
        <Option value="4">4e Trimestre</Option>
      </Select>
      <Button onClick={exportToExcel} type="default" icon={<FileExcelOutlined />} style={{ marginLeft: 700,marginBottom: 20 }}>
        Exporter en Excel
      </Button>
      <Button onClick={exportToPDF}  icon={<FilePdfOutlined />} type="default" style={{ marginLeft: 16,marginBottom: 20 }}>
        Exporter en PDF
      </Button>
      <div/>
      <div/>
      <Table
        columns={columns}
        dataSource={previsions}
        summary={tableSummary}
        rowKey="id_prevision"
      />
    </div>
  
  );
};

export default PrevisionByTrimestre;
