import React, { useState } from 'react';
import { Table, Select, Button } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';

const ConsolidationRecettes = () => {
  const [mois, setMois] = useState('');
  const [annee, setAnnee] = useState('');
  const [data, setData] = useState([]);

  const anneeOptions = [];
  const currentYear = new Date().getFullYear();

  for (let i = currentYear; i >= currentYear - 10; i--) {
    anneeOptions.push({ label: i, value: i });
  }
  const handleConsolidation = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/recette/consolidationA?mois=${mois}&annee=${annee}`);
      setData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const columns = () => {
    const departements = [...new Set(data.flatMap(item => Object.keys(item).slice(2)))];

    const dynamicColumns = departements.map(dep => ({
      title: dep,
      dataIndex: dep,
      key: dep,
      sorter: (a, b) => a[dep] - b[dep], // Tri par montant
      render: (text) => text || 0 // Affiche 0 si aucune donnée
    }));

    return [
      {
        title: 'Types d\'Impôts',
        dataIndex: 'nom_typeImpot',
        key: 'nom_typeImpot',
        sorter: (a, b) => a.nom_typeImpot.localeCompare(b.nom_typeImpot), // Tri alphabétique
      },
      ...dynamicColumns,
      {
        title: 'Total DRI (en ariary)',
        dataIndex: 'total',
        key: 'total',
        sorter: (a, b) => a.total - b.total, // Tri par total
      },
    ];
  };

  const moisOptions = [
    { value: 'janvier', label: 'Janvier' },
    { value: 'février', label: 'Février' },
    { value: 'mars', label: 'Mars' },
    { value: 'avril', label: 'Avril' },
    { value: 'mai', label: 'Mai' },
    { value: 'juin', label: 'Juin' },
    { value: 'juillet',   label: 'Juillet' },
    { value: 'août', label: 'Août' },
    { value: 'septembre', label: 'Septembre' },
    { value: 'octobre', label: 'Octobre' },
    { value: 'novembre', label: 'Novembre' },
    { value: 'décembre', label: 'Décembre' },
  ];

  const exportToExcel = () => {
    // Création d'un tableau modifié basé sur la structure désirée
    const modifiedData = 
    
    data.map(item => {
      
      const modifiedItem = { 'Types d\'Impôts': item.nom_typeImpot }; // Ajout du type d'impôt
  
      // Ajout des départements dynamiques
      const departements = Object.keys(item).filter(key => key !== 'nom_typeImpot' && key !== 'total');
      departements.forEach(dep => {
        modifiedItem[dep] = (item[dep] === 0 || item[dep] === undefined) ? '-' : item[dep]; // Ajout de la valeur ou tiret
      });
  
      // Ajout du total
      modifiedItem['Total DRI (en ariary)'] = item.total || '-'; // Ajout du total
  
      return modifiedItem;
    });
  
    // Création de la feuille et du classeur pour Excel
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `CONSOL_${mois}_${annee}`);
    XLSX.writeFile(workbook, `Consolidation_${mois}_${annee}.xlsx`);
  };
  

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Préparer les colonnes et les données pour le PDF
    const columns = [
      { title: 'Types d\'Impôts', dataKey: 'nom_typeImpot' },
      ...data.map((item, index) => {
        const keys = Object.keys(item).filter(key => key !== 'nom_typeImpot' && key !== 'total');
        return keys.map(key => ({ title: key, dataKey: key }));
      }).flat(),
      { title: 'Total', dataKey: 'total' },
    ];

    const pdfData = data.map(item => {
      const row = { 'nom_typeImpot': item.nom_typeImpot };
      
      // Ajout des valeurs de départements
      Object.keys(item).forEach(key => {
        if (key !== 'nom_typeImpot' && key !== 'total') {
          row[key] = item[key];
        }
      });

      // Ajout du total
      row.total = item.total;
      return row;
    });

    // Utilisation de jsPDF-AutoTable pour créer le tableau
    pdf.autoTable({
      head: [columns],
      body: pdfData,
      theme: 'grid', // Vous pouvez changer le thème si nécessaire
    });

    pdf.save(`Consolidation_${mois}_${annee}.pdf`);
  };

  return (
   <>
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
   <div  style={{marginBottom: 50 }}>
      <Select 
        onChange={value => setMois(value)} 
        placeholder="Sélectionner le mois" 
        style={{ width: 200, marginRight: 16 }}
      >
        {moisOptions.map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
      <Select 
        onChange={value => setAnnee(value)} 
        placeholder="Sélectionner l'année" 
        style={{ width: 200, marginRight: 16 }}
      >
         {anneeOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
      </Select>
      <Button type="primary" onClick={handleConsolidation}>Consolider</Button>
      <Button type="default" onClick={exportToExcel} style={{ marginLeft: 600 }}  icon={<FileExcelOutlined />}>Exporter en Excel</Button>
      <Button type="default" onClick={exportToPDF} style={{ marginLeft: 8 }}  icon={<FilePdfOutlined />}>Exporter en PDF</Button>
      </div>
      <div>
      <Table 
        id="table-to-export"
        dataSource={data} 
        columns={columns()} 
        rowKey="nom_typeImpot" 
        pagination={{ pageSize: 10 }} // Pagination de 10 éléments par page
        style={{ marginTop: 16 }} 
      />
    </div>
    </div>
    </>
  );
};

export default ConsolidationRecettes;
