import React, { useState, useEffect } from 'react';
import { Table, Select, Button, message, Typography } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import {jwtDecode} from 'jwt-decode';

const { Option } = Select;
const { Title } = Typography;

const ConsolidationByAn = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [data, setData] = useState([]);
  const [departementa, setNom_departement] = useState(null);
  const [departement, setDepartement] = useState([]);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const nom_departement = decoded.nom_departement;
  const anneeOptions = [];
  const currentYear = new Date().getFullYear();


  useEffect(() => {
    axios.get('http://localhost:5000/departement/getAll', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setDepartement(response.data);
        message.success(' lors de la récupération des departements.');
    
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des departements', error);
        message.error('Erreur lors de la récupération des departements.');
      });
  }, [token]);


  // Générer les options d'année pour la sélection
  for (let i = currentYear; i >= currentYear - 10; i--) {
    anneeOptions.push({ label: i, value: i });
  }

  const fetchData = () => {
    if (selectedYear && token) {
      axios.post(`http://localhost:5000/recette/getConsolidationAn`, {
        annee: selectedYear,
        departementa
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          const budgetaireData = response.data.budgetaire || [];
          const horsBudgetData = response.data.hors_budget || [];
          const totalGlobal = response.data.totalGlobal ? [response.data.totalGlobal] : [];

          // Fusionner toutes les données
          setData([...budgetaireData, ...horsBudgetData, ...totalGlobal]);
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des consolidations:', error);
          message.error('Erreur lors de la récupération des données');
        });
    }
  };

  const handleSubmit = () => {
    if (selectedYear) {
      fetchData(); // Appelle la fonction pour récupérer les données
    } else {
      message.warning('Veuillez sélectionner une année');
    }
  };

  const columns = [
    {
      title: 'Types d\'Impôts',
      dataIndex: 'typeImpot',
    },
    {
      title: `CUMUL ANNUEL ${selectedYear}`,
      children: [
        {
          title: 'Prévisions',
          dataIndex: 'prevision',
        },
        {
          title: 'Réalisation',
          dataIndex: 'realisation',
        },
        {
          title: 'Taux(%)',
          dataIndex: 'taux',
        },
      ],
    },
  ];

  // Export Excel
  const exportToExcel = () => {
    // Préparation des données pour le tableau Excel
    const worksheetData = [
      [`${departementa}`,'','',], // Ligne avec le titre de l'année
      ['Types d\'Impôts', `CUMUL ${selectedYear}`, '', ''],  // Ligne avec le titre CUMUL sur trois colonnes
      ['Types d\'Impôts', 'Prévisions', 'Réalisation', 'Taux (%)'], // Sous-colonnes
    ];
  
    // Ajout des données de la table dans worksheetData
    data.forEach(row => {
      worksheetData.push([
        row.typeImpot,
        row.prevision || 'N/A',
        row.realisation || 'N/A',
        row.taux || 'N/A',
      ]);
    });
  
    // Création de la feuille Excel
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    // Fusion de cellules pour le titre "CUMUL T<selectedTrimestre>"
    worksheet['!merges'] = [
      { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } }, // Fusionne les colonnes 1 à 3 sur la deuxième ligne pour "CUMUL"
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Fusionne les colonnes 1 à 3 sur la première ligne pour "Consolidation des recettes fiscales"
    ];
  
    // Création du classeur
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `CR_${selectedYear}_du_${departementa} `);
  
    // Téléchargement du fichier Excel
    XLSX.writeFile(workbook, `Consolidation_${selectedYear}_${departementa}.xlsx`);
  };
  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = [
      { header: 'Types d\'Impôts', dataKey: 'typeImpot' },
      { header: 'Prévisions', dataKey: 'prevision' },
      { header: 'Réalisation', dataKey: 'realisation' },
      { header: 'Taux(%)', dataKey: 'taux' }
    ];
    
    const tableRows = data.map(item => ({
      typeImpot: item.typeImpot,
      prevision: item.prevision,
      realisation: item.realisation,
      taux: item.taux,
    }));
    
    doc.autoTable({
      columns: tableColumn,
      body: tableRows,
      startY: 20,
      theme: 'grid'
    });

    doc.text(`Consolidation ${nom_departement} - Année ${selectedYear}`, 14, 15);
    doc.save(`Consolidation_${nom_departement}_Annee_${selectedYear}.pdf`);
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ marginBottom: '20px' }}>
        <Title level={2} style={{ marginBottom: '16px', textAlign: 'center', color: '#93c4c5' }}>
          Consolidation Annuelle
        </Title>
        <Select
          placeholder="Sélectionner l'Année"
          onChange={setSelectedYear}
          style={{ width: 200, marginRight: 16 }}
        >
          {anneeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
    
        <Select
            onChange={value => setNom_departement(value)}
            placeholder="Sélectionnez un département"
            style={{ width: 200, marginRight: 16 }}
          >
            {departement.length > 0 ? (
              departement.map(dep => (
                <Option key={dep.id_departement} value={dep.nom_departement}>
                  {dep.nom_departement}
                </Option>
              ))
            ) : (
              <Option disabled>Aucun département disponible</Option>
            )}
          </Select>
        
        <Button type="primary" onClick={handleSubmit}>Afficher</Button>
        <Button type="default" onClick={exportToExcel} style={{ marginLeft: 600 }} icon={<FileExcelOutlined />}>
          Exporter en Excel
        </Button>
        <Button type="default" onClick={exportToPDF} style={{ marginLeft: 16 }} icon={<FilePdfOutlined />}>
          Exporter en PDF
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey={(record) => record.typeImpot || record.id} pagination={false} />
    </div>
  );
};

export default ConsolidationByAn;
