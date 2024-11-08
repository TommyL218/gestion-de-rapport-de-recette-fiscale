import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Input, Select, Form, Popconfirm } from 'antd';
import { SearchOutlined, FilePdfOutlined, FileExcelOutlined,EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Option } = Select;

const Utilisateur = () => {
  const [utilisateur, setUtilisateur] = useState([]);
  const token = localStorage.getItem('token');
  const [filteredUser, setFilteredUser] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [departement, setDepartement] = useState([]);

  // Fetch previsions
  useEffect(() => {
    if (!token) {
      message.error('Token manquant. Veuillez vous connecter.');
      return;
    }

    axios.get('http://localhost:5000/auth/getAll', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setUtilisateur(response.data);
        setFilteredUser(response.data);
      })
      .catch(error => {
        message.error('Erreur lors de la récupération des utilisateurs.');
        console.error(error);
      });
  }, [token]);
  
  useEffect(() => {
    let filtered = utilisateur;
    if (searchText) {
      filtered = filtered.filter(user =>
        user.username && user.username.toLowerCase().includes(searchText.toLowerCase())
      );
     
    }
    setFilteredUser(filtered);
   }, [searchText, utilisateur]);

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
   
    {
      title: "nom d'utilisateur",
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mot De Passe',
      dataIndex: 'password',
      key: 'password',
    },
    {
      title: "role",
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Centre',
      dataIndex: 'nom_departement',
      key: 'nom_departement',
    },
   
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette utilisateur ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" danger size="small" style={{ marginLeft: 8 }}>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    }
  ];
    // Fetch departement
    useEffect(() => {
      axios.get('http://localhost:5000/departement/getAll', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setDepartement(response.data);
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des departements', error);
          message.error('Erreur lors de la récupération des departements.');
        });
    }, [token]);



 

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      password: record.password,
      role: record.role,
      centre: record.nom_departement,
      
     
    });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/auth/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        message.success('Utilisateur supprimée avec succès');
        setUtilisateur(utilisateur.filter(user => user.id !== id));
      })
      .catch(err => {
        console.error(err);
        message.error('Erreur lors de la suppression de l\'utilisateur');
      });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

   // Vérifie si une recette avec les mêmes critères existe déjà
   const isDuplicate = (values) => {
    return utilisateur.some(user =>
      user.email === values.email &&
      (!selectedRecord || user.id !== selectedRecord.id)  // Exclut l'enregistrement en cours de modification
    );
  };
 
  

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {

        if (isDuplicate(values)) {
          message.error('Un utilisateur  avec cette email existe déjà.');
          return;
        }
        const url = selectedRecord
          ? `http://localhost:5000/auth/update/${selectedRecord.id}`
          : 'http://localhost:5000/auth/register';

        const method = selectedRecord ? 'put' : 'post';
        axios({
          method,
          url,
          data: values,
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            message.success(`Utilisateur ${selectedRecord ? 'modifiée' : 'ajoutée'} avec succès`);
            setIsModalVisible(false);
            form.resetFields();
            setSelectedRecord(null);
            axios.get('http://localhost:5000/auth/getAll', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(response => setUtilisateur(response.data))
              .catch(err => {
                console.error(err);
                message.error('Erreur lors de la récupération des utilisateurs après soumission.');
              });
          })
          .catch(err => {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
              message.error(`Erreur : ${err.response.data.message}`);
            } else {
              message.error(`Erreur lors de l'${selectedRecord ? 'édition' : 'ajout'} de l'utilisateur`);
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
      head: [['id', 'nom d\'utilisateur','Email','mot de passe','rôle','Centre']],
      body: filteredUser.map(user => [
        user.id,
        user.username,
         user.email,
        user.password,
        user.role,
        user.nom_departement,
       
       
      ]),
    });
    doc.save('typed\'Utilisateurs.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredUser.map(user => ({
      'id': user.id,
      'nom d\'utilisateur': user.username,
      'Email': user.email,
      'mot de passe': user.password,
      'rôle': user.role,
      'Centre': user.nom_departement,
      
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Utilisateurs.xlsx');
  };

  const handleAdd = () => {
    setIsModalVisible(true);
    setSelectedRecord(null);
    form.resetFields();
  };
 
  return (
    <div styjle={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '16px', textAlign: 'center', color: '#4a90e2' }}>Liste des Utilisateurs</h2>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Input
            placeholder="Rechercher par nom "
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: '200px', marginRight: '16px' }}
          />
         
        </div>
        <div>
          <Button type="primary" onClick={handleAdd}  style={{ backgroundColor: '#93c4c5', borderColor: '#93c4c5', color: 'black' }}>Ajouter utilisateur</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FilePdfOutlined />} onClick={exportToPDF} >Exporter PDF</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FileExcelOutlined />} onClick={exportToExcel}>Exporter Excel</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredUser}
        rowKey="id_typeImpot"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={selectedRecord ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Annuler</Button>,
          <Button key="submit" type="primary" onClick={handleFormSubmit}>Enregistrer</Button>,
        ]}  
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="nom d'utilsateur"
            rules={[{ required: true, message: 'Veuillez saisir le nom d\'Utilisateur' }]}
          >
            <Input type="text" />
           
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Veuillez entrer l\'email' }]}
          >
            <Input type="email" />
            </Form.Item>
            <Form.Item name="password" label="Mot de passe" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Entrer votre mot de passe"
              suffix={
                showPassword ? (
                  <EyeInvisibleOutlined onClick={() => setShowPassword(false)} />
                ) : (
                  <EyeOutlined onClick={() => setShowPassword(true)} />
                )
              }
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Veuillez selectionner le rôle' }]}
          >
             <Select>
              <Option value="administrateur">Administrateur</Option>
              <Option value="utilisateur">Utilisateur</Option>
             
            </Select>
            </Form.Item>
            <Form.Item
            name="centre"
            label="Centre"
            rules={[{ required: true, message: 'Veuillez saisir le centre!' }]}
          >
            <Select
              placeholder="Sélectionner un type d'impôt"
            >
              {departement.map(depar => (
                <Option key={depar.nom_departement} value={depar.nom_departement}>{depar.nom_departement}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Utilisateur;
