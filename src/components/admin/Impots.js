import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Input, Select, Form, Popconfirm } from 'antd';
import { SearchOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const { Option } = Select;

const ImpotList = () => {
  const [impots, setImpots] = useState([]);
  const token = localStorage.getItem('token');
  const [filteredImpot, setFilteredimpot] = useState([]);
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

    axios.get('http://localhost:5000/impot/getAll', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setImpots(response.data);
        setFilteredimpot(response.data);
      })
      .catch(error => {
        message.error('Erreur lors de la récupération des prévisions.');
        console.error(error);
      });
  }, [token]);
  const columns = [
    {
      title: 'id',
      dataIndex: 'id_typeImpot',
      key: 'id_typeImpot',
    },
   
    {
      title: "Types d'Impôts",
      dataIndex: 'nom_typeImpot',
      key: 'nom_typeImpot',
    },
    {
      title: 'Categorie',
      dataIndex: 'categorie_typeImpot',
      key: 'categorie_typeImpot',
    },
   
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette impot ?"
            onConfirm={() => handleDelete(record.id_typeImpot)}
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
    let filtered = impots;

    if (searchText) {
        filtered = filtered.filter(impot =>
            impot.nom_typeImpot && impot.nom_typeImpot.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    setFilteredimpot(filtered);
}, [searchText, impots]);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      nom_typeImpot: record.nom_typeImpot,
      categorie_typeImpot: record.categorie_typeImpot,
     
    });
  };

  const handleDelete = (id_typeImpot) => {
    axios.delete(`http://localhost:5000/impot/delete/${id_typeImpot}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        message.success('impot supprimée avec succès');
        setImpots(impots.filter(typeImpot => typeImpot.id_typeImpot !== id_typeImpot));
      })
      .catch(err => {
        console.error(err);
        message.error('Erreur lors de la suppression de l\'impot');
      });
  };

 

   // Vérifie si une recette avec les mêmes critères existe déjà
   const isDuplicate = (values) => {
    return impots.some(impot =>
      impot.nom_typeImpot === values.nom_typeImpot &&
      impots.categorie_typeImpot === values.categorie_typeImpot &&
      (!selectedRecord || impot.id_typeImpot !== selectedRecord.id_typeImpot)  // Exclut l'enregistrement en cours de modification
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
          ? `http://localhost:5000/impot/update/${selectedRecord.id_typeImpot}`
          : 'http://localhost:5000/impot/create';

        const method = selectedRecord ? 'put' : 'post';
        axios({
          method,
          url,
          data: values,
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            message.success(`Impot ${selectedRecord ? 'modifiée' : 'ajoutée'} avec succès`);
            setIsModalVisible(false);
            form.resetFields();
            setSelectedRecord(null);
            axios.get('http://localhost:5000/impot/getAll', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(response => setImpots(response.data))
              .catch(err => {
                console.error(err);
                message.error('Erreur lors de la récupération des impots après soumission.');
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
      head: [['nom de l\'impot', 'categorie',]],
      body: filteredImpot.map(impot => [
        impot.nom_typeImpot,
        impot.categorie_typeImpot,
       
      ]),
    });
    doc.save('typed\'impots.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredImpot.map(impot => ({
      'Types d\'Impôts': impot.nom_typeImpot,
      'Categorie': impot.categorie_typeImpot,
      
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prévisions');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Types d\'Impôts.xlsx');
  };

  const handleAdd = () => {
    setIsModalVisible(true);
    setSelectedRecord(null);
    form.resetFields();
  };
  
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '16px', textAlign: 'center', color: '#4a90e2' }}>Liste des Impots</h2>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Input
            placeholder="Rechercher par type d'impôt"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: '300px', marginRight: '16px' }}
          />
         
        </div>
        <div>
          <Button type="primary" onClick={handleAdd}  style={{ backgroundColor: '#93c4c5', borderColor: '#93c4c5', color: 'black' }}>Ajouter impot</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FilePdfOutlined />} onClick={exportToPDF} >Exporter PDF</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FileExcelOutlined />} onClick={exportToExcel}>Exporter Excel</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredImpot}
        rowKey="id_typeImpot"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={selectedRecord ? 'Modifier Prévision' : 'Ajouter Prévision'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Annuler</Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit}>Enregistrer</Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nom_typeImpot"
            label="Type d'Impôt"
            rules={[{ required: true, message: 'Veuillez saisir le type d\'impôt!' }]}
          >
            <Input type="text" />
           
          </Form.Item>
          <Form.Item
            name="categorie_typeImpot"
            label="Catégorie"
            rules={[{ required: true, message: 'Veuillez saisir la catégorie!' }]}
          >
         <Select>
              <Option value="budgetaire">budget general</Option>
              <Option value="hors_Budget">hors_Budget</Option>
              </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ImpotList;
