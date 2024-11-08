import React, { useEffect, useState } from 'react';
import { Select, Button, Form, message, Table } from 'antd';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Option } = Select;

const ConsolidationFormA = () => {
  const [mois, setMois] = useState(null);
  const [annee, setAnnee] = useState(null);
  const [nom_departement, setNom_departement] = useState(null);
  const [departement, setDepartement] = useState([]); // Change from null to empty array
  const [consolidationData, setConsolidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch departement
  useEffect(() => {
    axios.get('http://localhost:5000/departement/getAll', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setDepartement(response.data);
        console.log('Données des départements récupérées avec succès.');
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des départements', error);
        message.error('Erreur lors de la récupération des départements.');
      });
  }, [token]);

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
      const response = await axios.post('http://localhost:5000/recette/getConsolidationM', {
        mois,
        annee,
        nom_departement
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
      [
        `${nom_departement}`, '', ''
      ],
      ["TYPES D'IMPÔTS", `MENSUEL ${mois.charAt(0).toUpperCase() + mois.slice(1)}`, "", "", `CUMUL ${mois.charAt(0).toUpperCase() + mois.slice(1)}`, "", ""],
      ["", "PRÉVISIONS", "RÉALISATIONS", "TAUX (%)", "PRÉVISIONS", "RÉALISATIONS", "TAUX (%)"],
      ...consolidationData.map((item) => [
        item.typeImpot,
        item.prevision || 0,
        item.realisation || 0,
        item.taux !== undefined ? `${item.taux}%` : "0%",
        item.prevision || 0,
        item.realisation || 0,
        item.taux !== undefined ? `${item.taux}%` : "0%"
      ]),
    ]);

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } }, // Fusion "MENSUEL"
      { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, // Fusion "CUMUL"
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, `CR_${mois}_${nom_departement}_${annee}`);
    XLSX.writeFile(workbook, `Consolidation_${mois}_${nom_departement}_${annee}.xlsx`);
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
      item.prevision || 0,
      item.realisation || 0,
      item.taux !== undefined ? `${item.taux}%` : "0%",
      'Cumul', // Ajout d'une colonne pour "Cumul"
      item.prevision || 0,
      item.realisation || 0,
      item.taux !== undefined ? `${item.taux}%` : "0%",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { halign: 'center' },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' }
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
    <div>
      <Form layout="inline">
        <Form.Item label="Mois">
          <Select
            onChange={value => setMois(value)}
            placeholder="Sélectionnez un mois"
            style={{ width: 200 }}
          >
            {moisOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Année">
          <Select
            onChange={value => setAnnee(value)}
            placeholder="Sélectionnez une année"
            style={{ width: 200 }}
          >
            {anneeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Centre">
          <Select
            onChange={value => setNom_departement(value)}
            placeholder="Sélectionnez un Centre"
            style={{ width: 200 }}
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
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Afficher
          </Button>
        </Form.Item>
      </Form>
      <Button
            icon={<FileExcelOutlined />}
            onClick={exportToExcel}
            style={{ margin: '20px 10px' }}
          >
            Exporter en Excel
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={exportToPDF}
            style={{ margin: '20px 10px' }}
          >
            Exporter en PDF
          </Button>
     
      {consolidationData && (
        <>
         <div>
          <Table
            dataSource={consolidationData}
            columns={columns}
            rowKey="id" // Assuming you have an id for each row
            pagination={false}
            style={{ marginTop: 20 }}
          />
        </div>
        </>
      )}
    </div>
  );
};

export default ConsolidationFormA;
