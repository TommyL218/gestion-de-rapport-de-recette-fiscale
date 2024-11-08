import React, { useState } from 'react';
import { Select, Button, Form, message, Table } from 'antd';
import axios from 'axios';

const { Option } = Select;

const ConsolidationForm = () => {
  const [mois, setMois] = useState(null);
  const [annee, setAnnee] = useState(null);
  const [consolidationData, setConsolidationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const moisOptions = [
    { label: 'Janvier', value: 'janvier' },
    { label: 'Février', value: 'fevrier' },
    { label: 'Mars', value: '03' },
    { label: 'Avril', value: '04' },
    { label: 'Mai', value: '05' },
    { label: 'Juin', value: '06' },
    { label: 'Juillet', value: '07' },
    { label: 'Août', value: '08' },
    { label: 'Septembre', value: '09' },
    { label: 'Octobre', value: '10' },
    { label: 'Novembre', value: '11' },
    { label: 'Décembre', value: '12' }
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
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token'); // Assure-toi que le token est stocké sous ce nom

      // Requête POST vers l'API backend avec le Bearer Token
      const response = await axios.post('http://localhost:5000/recette/getConsolidation', {
        mois,
        annee
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setConsolidationData(response.data);
      message.success('Données consolidées récupérées avec succès');
    } catch (error) {
      console.error('Erreur lors de la requête', error);
      message.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Type d\'impôt',
      dataIndex: 'typeImpot',
      key: 'typeImpot'
    },
    {
      title: 'Prévision',
      dataIndex: 'prevision',
      key: 'prevision'
    },
    {
      title: 'Réalisation',
      dataIndex: 'realisation',
      key: 'realisation'
    },
    {
      title: 'Taux de réalisation (%)',
      dataIndex: 'taux',
      key: 'taux'
    }
  ];

  return (
    <div>
      <Form layout="inline" onFinish={handleSubmit}>
        <Form.Item label="Mois">
          <Select
            style={{ width: 120 }}
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
            style={{ width: 120 }}
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
            Soumettre
          </Button>
        </Form.Item>
      </Form>

      {consolidationData && (
        <div style={{ marginTop: '20px' }}>
          <h2>Consolidation des données</h2>
          <Table
            dataSource={consolidationData.budgetaire}
            columns={columns}
            rowKey="typeImpot"
            pagination={false}
          />
          <Table
            dataSource={consolidationData.hors_budget}
            columns={columns}
            rowKey="typeImpot"
            pagination={false}
          />

          <h3>Total Global</h3>
          <Table
            dataSource={[consolidationData.totalGlobal]}
            columns={columns}
            rowKey="typeImpot"
            pagination={false}
          />
        </div>
      )}
    </div>
  );
};

export default ConsolidationForm;
