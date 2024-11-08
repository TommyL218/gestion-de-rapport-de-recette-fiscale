import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Input, Form, Popconfirm } from 'antd';
import { SearchOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ImpotList = () => {
  const [departement, setDepartement] = useState([]);
  const token = localStorage.getItem('token');
  const [filteredDepartement, setFiltereddepartement] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  

  // Fetch previsions
  useEffect(() => {
    if (!token) {
      message.error('Token manquant. Veuillez vous connecter.');
      return;
    }

    axios.get('http://localhost:5000/departement/getAll', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setDepartement(response.data);
        setFiltereddepartement(response.data);
      })
      .catch(error => {
        message.error('Erreur lors de la récupération des departement.');
        console.error(error);
      });
  }, [token]);
  const columns = [
    {
      title: 'id',
      dataIndex: 'id_departement',
      key: 'id_departement',
    },
   
    {
      title: "nom du centre",
      dataIndex: 'nom_departement',
      key: 'nom_departement',
    },
    {
      title: 'Localisation',
      dataIndex: 'localisation',
      key: 'localisation',
    },
    {
      title: 'Adrésse',
      dataIndex: 'adresse',
      key: 'adresse',
    },
   
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce departement?"
            onConfirm={() => handleDelete(record.id_departement)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" danger size="small" style={{ marginLeft: 8 }}>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    }
  ];
  useEffect(() => {

    let filtered = departement;

    if (searchText) {
      filtered = filtered.filter(departement =>
        departement.nom_departement && departement.nom_departement.toLowerCase().includes(searchText.toLowerCase())
      );
      
    }
    setFiltereddepartement(filtered);
   }, [searchText, departement]);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({

      nom_departement: record.nom_departement,
      localisation: record.localisation,
      adresse: record.adresse,
     
     
    });
  };

  const handleDelete = (id_departement) => {
    axios.delete(`http://localhost:5000/departement/delete/${id_departement}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        message.success('departement supprimée avec succès');
        setDepartement(departement.filter(departement => departement.id_departement !== id_departement));
      })
      .catch(err => {
        console.error(err);
        message.error('Erreur lors de la suppression de l\'impot');
      });
  };

 

   // Vérifie si une recette avec les mêmes critères existe déjà
   const isDuplicate = (values) => {
    return departement.some(departement =>
      departement.nom_departement === values.nom_departement &&
      (!selectedRecord || departement.id_departement !== selectedRecord.id_departement)  // Exclut l'enregistrement en cours de modification
    );
  };
  
  

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {

        if (isDuplicate(values)) {
          message.error('Un impot avec ces critères existe déjà.');
          return;
        }
        const url = selectedRecord
          ? `http://localhost:5000/departement/update/${selectedRecord.id_departement}`
          : 'http://localhost:5000/departement/create';

        const method = selectedRecord ? 'put' : 'post';
        axios({
          method,
          url,
          data: values,
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            message.success(`departement ${selectedRecord ? 'modifiée' : 'ajoutée'} avec succès`);
            setIsModalVisible(false);
            form.resetFields();
            setSelectedRecord(null);
            axios.get('http://localhost:5000/departement/getAll', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(response => setDepartement(response.data))
              .catch(err => {
                console.error(err);
                message.error('Erreur lors de la récupération des departements après soumission.');
              });
          })
          .catch(err => {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
              message.error(`Erreur : ${err.response.data.message}`);
            } else {
              message.error(`Erreur lors de l'${selectedRecord ? 'édition' : 'ajout'} de l'impot`);
            }
          });
      })
      .catch(info => {
        console.log('Validation Failed:', info);
      });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['id', 'nom du departement', 'Localisation', 'Adrésse']],
      body: filteredDepartement.map(departement => [
        departement.id_departement,
        departement.nom_departement,
        departement.localisation,
        departement.adresse,
      ]),
    });
    doc.save('Departements.pdf');
  };

 const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredDepartement.map(departement => ({
      'id': departement.id_departement,
      'nom du departement': departement.nom_departement,
      'Localisation':departement.localisation,
      'Adrésse': departement.adresse,
     
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prévisions');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Departements.xlsx');
  };

  const handleAdd = () => {
    setIsModalVisible(true);
    setSelectedRecord(null);
    form.resetFields();
  };
    // Fonction pour déterminer le trimestre en fonction du mois
  /*  const getTrimestreFromMonth = (mois) => {
      switch (mois) {
        case 'janvier':
        case 'fevrier':
        case 'mars':
          return 1;
        case 'avril':
        case 'mai':
        case 'juin':
          return 2;
        case 'juillet':
        case 'août':
        case 'septembre':
          return 3;
        case 'octobre':
        case 'novembre':
        case 'decembre':
          return 4;
        default:
          return null;
      }
    };

  // Fonction déclenchée lors de la sélection du mois
 /* const handleMonthChangeT = (mois) => {
    const trimestre = getTrimestreFromMonth(mois);
    form.setFieldsValue({ trimestre });
  };
  const resetMonth = () => setSelectedMonth(undefined);
  const resetYear = () => setSelectedYear(undefined);*/
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '16px', textAlign: 'center', color: '#4a90e2' }}>Liste des Unités Operationnels</h2>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Input
            placeholder="Rechercher par Centre"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: '300px', marginRight: '16px' }}
          />
         
        </div>
        <div>
          <Button type="primary" onClick={handleAdd}  style={{ backgroundColor: '#93c4c5', borderColor: '#93c4c5', color: 'black' }}>Ajouter Centre</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FilePdfOutlined />} onClick={exportToPDF}>Exporter PDF</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FileExcelOutlined />} onClick={exportToExcel}>Exporter Excel</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredDepartement}
        rowKey="id_departement"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={selectedRecord ? 'Modifier departement' : 'Ajouter Departement'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Annuler</Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit}>Enregistrer</Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nom_departement"
            label="nom du centre"
            rules={[{ required: true, message: 'Veuillez saisir le nom du centre!' }]}
          >
            <Input type="text" />
           
          </Form.Item>
          <Form.Item
            name="localisation"
            label="Localisation"
            rules={[{ required: true, message: 'Veuillez entrer la localisation' }]}
          >
            <Input type="text" />
            </Form.Item>
            <Form.Item
            name="adresse"
            label="Adrésse"
            rules={[{ required: true, message: 'Veuillez entrer la localisation' }]}
          >
            <Input type="text" />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ImpotList;
