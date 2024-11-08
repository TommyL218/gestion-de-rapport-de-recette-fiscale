import React, { useState } from 'react';
import { Select, Button, Form, message, Table } from 'antd';
import { FilePdfOutlined, FileExcelOutlined} from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {jwtDecode} from 'jwt-decode';

const { Option } = Select;

const ConsolidationForm = () => {
  const [mois, setMois] = useState(null);
  const [annee, setAnnee] = useState(null);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const nom_departement = decoded.nom_departement;
  const [consolidationData, setConsolidationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const moisOptions = [
    { label: 'Janvier', value: 'janvier' },
    { label: 'Février', value: 'février' },
    { label: 'Mars', value: 'mars' },
    { label: 'Avril', value: 'avril' },
    { label: 'Mai', value: 'mai' },
    { label: 'Juin', value: 'juin' },
    { label: 'Juillet', value: 'juillet' },
    { label: 'Août', value: 'août' },
    { label: 'Septembre', value: 'septembre' },
    { label: 'Octobre', value: 'octobre' },
    { label: 'Novembre', value: 'novembre' },
    { label: 'Décembre', value: 'décembre' }
  ];

  const anneeOptions = [];
  const currentYear = new Date().getFullYear();

  for (let i = currentYear; i >= currentYear - 10; i--) {
    anneeOptions.push({ label: i, value: i });
  }

  const handleSubmit = async () => {
    if (!mois || !annee) {
      message.error('Veuillez sélectionner un mois et une année');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Assure-toi que le token est stocké sous ce nom

      const response = await axios.post('http://localhost:5000/recette/getConsolidationDri', {
        mois,
        annee
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { budgetaire, hors_budget, totalGlobal } = response.data;

      const combinedData = [
        ...budgetaire.map(item => ({ ...item, source: 'BG' })),
        ...hors_budget.map(item => ({ ...item, source: 'HB' })),
        { ...totalGlobal, source: 'Total Global' }
      ];

      setConsolidationData(combinedData);
      message.success('Données consolidées récupérées avec succès');
    } catch (error) {
      console.error('Erreur lors de la requête', error);
      message.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      [`Consolidaton DRI ${mois.charAt(0).toUpperCase() + mois.slice(1)}_${annee} `,'',''],
      ["TYPES D'IMPÔTS", `MENSUEL ${mois.charAt(0).toUpperCase() + mois.slice(1)}`, "", "", `CUMUL ${mois.charAt(0).toUpperCase() + mois.slice(1)}`, "", ""],
      ["", "PRÉVISIONS", "RÉALISATIONS", "TAUX (%)", "PRÉVISIONS", "RÉALISATIONS", "TAUX (%)"],
      ...consolidationData.map((item) => [
        item.typeImpot,
        item.prevision || 0,  // Affiche 0 si vide
        item.realisation || 0, // Affiche 0 si vide
        item.taux !== undefined ? `${item.taux}%` : "0%", // Ajout du symbole de pourcentage, sinon affiche 0%
        item.prevision || 0,    // Affiche 0 si vide
        item.realisation || 0,   // Affiche 0 si vide
        item.taux !== undefined ? `${item.taux}%` : "0%"  // Ajout du symbole de pourcentage, sinon affiche 0%
      ]),
    ]);
  
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } }, // Fusion "MENSUEL"
      { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, // Fusion "CUMUL"
    ];
  
    XLSX.utils.book_append_sheet(workbook, worksheet, `CR_${mois}_${annee}_DRI `);
    XLSX.writeFile(workbook, `Consolidation_${mois}_${annee}_DRI.xlsx`);
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Consolidation des données', 14, 16);
  
    const tableColumn = [
      'Type d\'impôt', 'MENSUEL', 'PRÉVISIONS', 'RÉALISATIONS', 'TAUX (%)', 
      'CUMUL', 'PRÉVISIONS', 'RÉALISATIONS', 'TAUX (%)'
    ];
  
    const tableRows = consolidationData.map(item => [
      item.typeImpot,
      'Mensuel', // Ajout d'une colonne pour "Mensuel"
      item.prevision || 0, // Remplace par 0 si vide
      item.realisation || 0, // Remplace par 0 si vide
      item.taux !== undefined ? `${item.taux}%` : "0%", // Affiche le taux ou 0%
      'Cumul', // Ajout d'une colonne pour "Cumul"
      item.prevision || 0, // Remplace par 0 si vide
      item.realisation || 0, // Remplace par 0 si vide
      item.taux !== undefined ? `${item.taux}%` : "0%", // Affiche le taux ou 0%
    ]);
  
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { halign: 'center' }, // Centrer le texte
      columnStyles: { 
        2: { halign: 'right' }, // Alignement à droite pour les prévisions
        3: { halign: 'right' }, // Alignement à droite pour les réalisations
        4: { halign: 'right' }, // Alignement à droite pour les taux
        6: { halign: 'right' }, // Alignement à droite pour les prévisions cumulées
        7: { halign: 'right' }, // Alignement à droite pour les réalisations cumulées
        8: { halign: 'right' }  // Alignement à droite pour les taux cumulés
      },
    });
  
    doc.save(`Consolidation_${mois}_${annee}.pdf`);
  };
  
  const columns = [
    {
      title: 'Type d\'impôt',
      dataIndex: 'typeImpot',
      key: 'typeImpot',
      width: 200,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: `Mensuel ${mois ? mois.charAt(0).toUpperCase() + mois.slice(1) : ''}`,
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
      title: `Cumul ${mois ? mois.charAt(0).toUpperCase() + mois.slice(1) : ''}`,
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

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <Form layout="inline" onFinish={handleSubmit}>
        <Form.Item label="Mois">
          <Select
            style={{ width: 200 }}
            placeholder="Sélectionner un mois"
            onChange={(value) => setMois(value)}
          >
            {moisOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Année">
          <Select
            style={{ width: 200 }}
            placeholder="Sélectionner une année"
            onChange={(value) => setAnnee(value)}
          >
            {anneeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Afficher
          </Button>
        </Form.Item>
      </Form>

      {consolidationData && (
        <div style={{ marginTop: '20px' }}>
          <Button onClick={exportToExcel} style={{ marginRight: '10px' }} icon={<FileExcelOutlined />}>
            Exporter en Excel
          </Button>
          <Button onClick={exportToPDF} icon={<FilePdfOutlined />}>
            Exporter en PDF
          </Button>

          <Table
            columns={columns}
            dataSource={consolidationData}
            rowKey="typeImpot"
            style={{ marginTop: '20px' }}
          />
        </div>
      )}
    </div>
  );
};

export default ConsolidationForm;
