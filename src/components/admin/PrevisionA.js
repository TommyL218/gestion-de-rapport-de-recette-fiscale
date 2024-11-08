import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Input, Select, Form, Popconfirm } from 'antd';
import { SearchOutlined, FilePdfOutlined, FileExcelOutlined, CloseOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Option } = Select;

const PrevisionA = () => {
  const [previsions, setPrevisions] = useState([]);
  const [filteredPrevisions, setFilteredPrevisions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCentre, setSelectedCentre] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');
  const [typesImpots, setTypesImpots] = useState([]);
  const [departement, setDepartement] = useState([]);

  // Fetch previsions
  useEffect(() => {
    console.log('useEffect');
    if (!token) {
      message.error('Token manquant. Veuillez vous connecter.');
      return;
    }

    axios.get('http://localhost:5000/prevision/getAllA', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setPrevisions(response.data);
        setFilteredPrevisions(response.data);
      })
      .catch(error => {
        message.error('Erreur lors de la récupération des prévisions.');
        console.error(error);
      });
  }, [token]);
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

  // Fetch types d'impôts
  useEffect(() => {
    axios.get('http://localhost:5000/impot/getAllB', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setTypesImpots(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des types d\'impôts', error);
        message.error('Erreur lors de la récupération des types d\'impôts.');
      });
  }, [token]);


  // Filtrage par recherche, mois et année
  useEffect(() => {
    let filtered = previsions;
    if (searchText) {
      filtered = filtered.filter(prevision =>
        prevision.nom_typeImpot.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (selectedMonth) {
      filtered = filtered.filter(prevision => prevision.mois_prevision === selectedMonth);
    }
    if (selectedYear) {
      filtered = filtered.filter(prevision => prevision.annee_prevision === parseInt(selectedYear, 10));
    }
    if (selectedCentre) {
      filtered = filtered.filter(recette => recette.nom_departement === selectedCentre);
    }
    setFilteredPrevisions(filtered);
  }, [searchText, selectedMonth, selectedYear,selectedCentre, previsions]);


  const columns = [
    {
      title: "Centre",
      dataIndex: 'nom_departement', // Assurez-vous que cette clé correspond aux données de recette
      key: 'nom_departement',
    },
    {
      title: "Types d'Impôts",
      dataIndex: 'nom_typeImpot',
      key: 'typeImpotsP',
    },
    {
      title: 'Montant Prévision',
      dataIndex: 'montant_prevision',
      key: 'montant_prevision',
      render: (text) => `${text} Ar`,
    },
    {
      title: 'Mois',
      dataIndex: 'mois_prevision',
      key: 'mois_prevision',
    },
    {
      title: 'Année',
      dataIndex: 'annee_prevision',
      key: 'annee_prevision',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette prévision ?"
            onConfirm={() => handleDelete(record.id_prevision)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" danger size="small" style={{ marginLeft: 8 }}>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    }
  ];

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      typeImpotsP: record.typeImpotsP,
      montant_prevision: record.montant_prevision,
      mois_prevision: record.mois_prevision,
      annee_prevision: record.annee_prevision,
    });
  };

  const handleDelete = (id_prevision) => {
    axios.delete(`http://localhost:5000/prevision/deleteA/${id_prevision}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        message.success('Prévision supprimée avec succès');
        setPrevisions(previsions.filter(prevision => prevision.id_prevision !== id_prevision));
      })
      .catch(err => {
        console.error(err);
        message.error('Erreur lors de la suppression de la prévision');
      });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };
  const handleTypeImpotChange = (value) => {
    const typeImpot = typesImpots.find(type => type.nom_typeImpot === value);
    form.setFieldsValue({
      categorie_impot: typeImpot ? typeImpot.categorie_typeImpot : ''
    });
  };

   // Vérifie si une recette avec les mêmes critères existe déjà
   const isDuplicate = (values) => {
    return previsions.some(prevision =>
      prevision.nom_typeImpot === values.nom_typeImpot &&
      prevision.mois_prevision === values.mois_prevision &&
      prevision.annee_prevision === values.annee_prevision &&
      prevision.categorie_typeImpot === values.categorie_typeImpot &&
      (!selectedRecord || prevision.id_prevision !== selectedRecord.id_prevision)  // Exclut l'enregistrement en cours de modification
    );
  };
  
  

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {

        if (isDuplicate(values)) {
          message.error('Une prevision avec ces critères existe déjà.');
          return;
        }
        const url = selectedRecord
          ? `http://localhost:5000/prevision/updateA/${selectedRecord.id_prevision}`
          : 'http://localhost:5000/prevision/createA';

        const method = selectedRecord ? 'put' : 'post';
        axios({
          method,
          url,
          data: values,
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            message.success(`Prévision ${selectedRecord ? 'modifiée' : 'ajoutée'} avec succès`);
            setIsModalVisible(false);
            form.resetFields();
            setSelectedRecord(null);
            axios.get('http://localhost:5000/prevision/getAllA', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(response => setPrevisions(response.data))
              .catch(err => {
                console.error(err);
                message.error('Erreur lors de la récupération des prévisions après soumission.');
              });
          })
          .catch(err => {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
              message.error(`Erreur : ${err.response.data.message}`);
            } else {
              message.error(`Erreur lors de l'${selectedRecord ? 'édition' : 'ajout'} de la prévision`);
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
      head: [['Centre', 'Types d\'Impôts', 'Montant Prévision', 'Mois', 'Année']],
      body: filteredPrevisions.map(prevision => [
        prevision.nom_departement,
        prevision.nom_typeImpot,
        `${prevision.montant_prevision} Ar`,
        prevision.mois_prevision,
        prevision.annee_prevision,
      ]),
    });
    doc.save('previsions.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredPrevisions.map(prevision => ({
      'Centre': prevision.nom_departement,
      'Types d\'Impôts': prevision.nom_typeImpot,
      'Montant Prévision': `${prevision.montant_prevision} Ar`,
      'Mois': prevision.mois_prevision,
      'Année': prevision.annee_prevision,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prévisions');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'previsions.xlsx');
  };

  const handleAdd = () => {
    setIsModalVisible(true);
    setSelectedRecord(null);
    form.resetFields();
  };
    // Fonction pour déterminer le trimestre en fonction du mois
    const getTrimestreFromMonth = (mois) => {
      switch (mois) {
        case 'janvier':
        case 'février':
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
        case 'décembre':
          return 4;
        default:
          return null;
      }
    };

  // Fonction déclenchée lors de la sélection du mois
  const handleMonthChangeT = (mois) => {
    const trimestre = getTrimestreFromMonth(mois);
    form.setFieldsValue({ trimestre });
  };
  const resetMonth = () => setSelectedMonth(undefined);
  const resetYear = () => setSelectedYear(undefined);


  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ marginBottom: '16px', textAlign: 'center', color: '#4a90e2' }}>Liste des Prévisions</h1>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Input
            placeholder="Rechercher par type d'impôt"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: '250px', marginRight: '16px' }}
          />
          <Select
            placeholder="Sélectionner un mois"
            onChange={handleMonthChange}
            style={{ width: '200px', marginRight: '16px' }}
            suffixIcon={selectedMonth && (
              <CloseOutlined 
                onClick={(e) => {
                  e.stopPropagation();  // Empêche la fermeture du menu déroulant
                  resetMonth();
                }} 
                style={{ fontSize: 12, cursor: 'pointer' }} 
              />
            )}
          >
            {/* Vous pouvez générer les mois dynamiquement si nécessaire */}
            <Option value="janvier">Janvier</Option>
            <Option value="février">Février</Option>
            <Option value="mars">Mars</Option>
            <Option value="avril">Avril</Option>
            <Option value="mai">Mai</Option>
            <Option value="juin">Juin</Option>
            <Option value="juillet">Juillet</Option>
            <Option value="août">Août</Option>
            <Option value="septembre">Septembre</Option>
            <Option value="octobre">Octobre</Option>
            <Option value="novembre">Novembre</Option>
            <Option value="décembre">Décembre</Option>
          </Select>
          <Select
            placeholder="Sélectionner une année"
            onChange={handleYearChange}
            style={{ width: '200px',  marginRight: 16 }}
            suffixIcon={selectedYear ? <CloseOutlined onClick={resetYear} style={{ fontSize: 12 }} /> : null}
          >
            {/* Générer des années dynamiquement ou ajouter des années spécifiques */}
            <Option value="2024">2024</Option>
            <Option value="2023">2023</Option>
            <Option value="2022">2022</Option>
            {/* Ajouter plus d'années si nécessaire */}
          </Select>
          <Select
           placeholder="Filtrer par centre"
          onChange={value => setSelectedCentre(value)}
          style={{ width: 200 }}
          suffixIcon={selectedCentre ? <CloseOutlined onClick={() => setSelectedCentre('')} style={{ fontSize: 12 }} /> : null}
        >
          {/* Remplacez ces options par les valeurs réelles de vos centres */}
            {departement.map(depar => (
                  <Option key={depar.nom_departement} value={depar.nom_departement}>{depar.nom_departement}</Option>
                                      ))}
                {/* Ajoutez d'autres centres si nécessaire */}
        </Select> 
        </div>
        <div>
          <Button type="primary" onClick={handleAdd}  style={{ backgroundColor: '#93c4c5', borderColor: '#93c4c5', color: 'black' }}>Ajouter Prévision</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FilePdfOutlined />} onClick={exportToPDF}>Exporter PDF</Button>
          <Button style={{ marginLeft: '8px' }} icon={<FileExcelOutlined />} onClick={exportToExcel}>Exporter Excel</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredPrevisions}
        rowKey="id_prevision"
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
            name="nom_departement"
            label="Centre"
            rules={[{ required: true, message: 'Veuillez saisir le centre!' }]}
          >
            <Select
              onChange={handleTypeImpotChange}
              placeholder="Sélectionner un type d'impôt"
            >
              {departement.map(depar => (
                <Option key={depar.nom_departement} value={depar.nom_departement}>{depar.nom_departement}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="nom_typeImpot"
            label="Type d'Impôt"
            rules={[{ required: true, message: 'Veuillez saisir le type d\'impôt!' }]}
          >
            <Select
              onChange={handleTypeImpotChange}
              placeholder="Sélectionner un type d'impôt"
            >
              {typesImpots.map(type => (
                <Option key={type.nom_typeImpot} value={type.nom_typeImpot}>{type.nom_typeImpot}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="montant_prevision"
            label="Montant Prévision"
            rules={[{ required: true, message: 'Veuillez entrer le montant de la prévision' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="mois_prevision"
            label="Mois"
            rules={[{ required: true, message: 'Veuillez sélectionner le mois' }]}
          >
            <Select
            onChange={handleMonthChangeT}
            >
              <Option value="janvier">Janvier</Option>
              <Option value="fevrier">Février</Option>
              <Option value="mars">Mars</Option>
              <Option value="avril">Avril</Option>
              <Option value="mai">Mai</Option>
              <Option value="juin">Juin</Option>
              <Option value="juillet">Juillet</Option>
              <Option value="août">Août</Option>
              <Option value="septembre">Septembre</Option>
              <Option value="octobre">Octobre</Option>
              <Option value="novembre">Novembre</Option>
              <Option value="decembre">Décembre</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="trimestre"
            label="Trimèstre"
            rules={[{ required: true, message: 'Veuillez sélectionner le mois' }]}
          >
            <Select>
              <Option value="1">1ere trimèstre</Option>
              <Option value="2">2eme trimèstre</Option>
              <Option value="3">3eme trimèstre</Option>
              <Option value="4">4eme trimèstre</Option>
            </Select>
          </Form.Item>



          <Form.Item
            name="annee_prevision"
            label="Année"
            rules={[{ required: true, message: 'Veuillez entrer l\'année' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PrevisionA;
