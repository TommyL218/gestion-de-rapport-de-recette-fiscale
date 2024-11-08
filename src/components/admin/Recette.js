import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Input, Select, Form, Popconfirm } from 'antd';
import { FilePdfOutlined, FileExcelOutlined, CloseOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Option } = Select;

const Recette = () => {
  const [recettes, setRecettes] = useState([]);
  const [filteredRecettes, setFilteredRecettes] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState('');
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('');
  const [typesImpots, setTypesImpots] = useState([]);
  const [departement, setDepartement] = useState([]);
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');
  console.log(error)

  // Fetch recettes
  useEffect(() => {
    if (!token) {
      setError('Token manquant. Veuillez vous connecter.');
      return;
    }

    axios.get('http://localhost:5000/recette/getAllA', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setRecettes(response.data);
        setFilteredRecettes(response.data);
      })
      .catch(error => {
        setError('Erreur lors de la récupération des recettes.');
        console.error(error);
      
        message.error('Erreur lors de la récupération des recettes.');
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
    axios.get('http://localhost:5000/impot/getAll', {
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


  // Filtrage par recherche, mois, année et catégorie
  useEffect(() => {
    let filtered = recettes;
    if (searchText) {
      filtered = filtered.filter(recette =>
        recette.nom_typeImpot.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (selectedMonth) {
      filtered = filtered.filter(recette => recette.mois === selectedMonth);
    }
    if (selectedYear) {
      filtered = filtered.filter(recette => recette.annee === parseInt(selectedYear, 10));
    }
    if (selectedCategory) {
      filtered = filtered.filter(recette => recette.categorie_typeImpot === selectedCategory);
    }
    if (selectedCentre) {
      filtered = filtered.filter(recette => recette.nom_departement === selectedCentre);

    }
    if (selectedTrimestre) {
      filtered = filtered.filter(recette => recette.trimestre_recette === parseInt(selectedTrimestre, 10));
    }
    setFilteredRecettes(filtered);
  }, [searchText, selectedMonth, selectedYear, selectedCategory,selectedCentre, selectedTrimestre, recettes]);

  const columns = [
    {
      title: "Centre",
      dataIndex: 'nom_departement', // Assurez-vous que cette clé correspond aux données de recette
      key: 'nom_departement',
    },
    {
      title: "Types d'Impôts",
      dataIndex: 'nom_typeImpot', // Assurez-vous que cette clé correspond aux données de recette
      key: 'typeImpot',
    },
    {
      title: "Categorie",
      dataIndex: 'categorie_typeImpot', // Assurez-vous que cette clé correspond aux données de recette
      key: 'categorie_typeImpot',
    },
   
    {
      title: 'Montant',
      dataIndex: 'montant',
      key: 'montant',
      render: (text) => `${text} Ar`,
    },
    {
      title: 'Mois',
      dataIndex: 'mois',
      key: 'mois',
    },
    {
      title: 'Trimestre',
      dataIndex: 'trimestre_recette',
      key: 'categorie',
    },
    {
      title: 'Année',
      dataIndex: 'annee',
      key: 'annee',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette recette ?"
            onConfirm={() => handleDelete(record.id_recette)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" danger size="small" style={{ marginLeft: 8 }}>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    }
  ];


     // Fonction pour déterminer le trimestre en fonction du mois
     const getTrimestreFromMonth = (mois) => {
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
  const handleMonthChangeT = (mois) => {
    const trimestre = getTrimestreFromMonth(mois);
    form.setFieldsValue({ trimestre });
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      nom_departement: record.nom_departement,
      nom_typeImpot: record.nom_typeImpot,
      montant: record.montant,
      mois: record.mois,
      trimestre: record.trimestre_recette,
      annee: record.annee,
    });
  };

  const handleDelete = (id_recette) => {
    axios.delete(`http://localhost:5000/recette/deleteA/${id_recette}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        message.success('Recette supprimée avec succès');
        setRecettes(recettes.filter(recette => recette.id_recette !== id_recette));
      })
      .catch(err => {
        console.error(err);
        message.error('Erreur lors de la suppression de la recette');
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

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
  const handleTrimestreChange = (value) => {
    setSelectedTrimestre(value);
  };

  const handleTypeImpotChange = (value) => {
    const typeImpot = typesImpots.find(type => type.nom_typeImpot === value);
    form.setFieldsValue({
      categorie_impot: typeImpot ? typeImpot.categorie_typeImpot : ''
    });
  };
 
  const resetMonth = () => setSelectedMonth(undefined);
  const resetYear = () => setSelectedYear(undefined);
  const resetCategory = () => setSelectedCategory(undefined);
  const resetTrimestre = () => setSelectedTrimestre(undefined);
 

  // Vérifie si une recette avec les mêmes critères existe déjà
  const isDuplicate = (values) => {
    return recettes.some(recette =>
      recette.nom_typeImpot === values.nom_typeImpot &&
      recette.mois === values.mois &&
      recette.annee === values.annee &&
    recette.nom_departement_departement === values.nom_departement &&
      (!selectedRecord || recette.id_recette !== selectedRecord.id_recette)
    );
  };


  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        if (isDuplicate(values)) {
          message.error('Une recette avec ces critères existe déjà.');
          return;
        }

        const url = selectedRecord
          ? `http://localhost:5000/recette/updateA/${selectedRecord.id_recette}`
          : 'http://localhost:5000/recette/createA';

        const method = selectedRecord ? 'put' : 'post';
        axios({
          method,
          url,
          data: values,
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            message.success(`Recette ${selectedRecord ? 'modifiée' : 'ajoutée'} avec succès`);
            setIsModalVisible(false);
            form.resetFields();
            setSelectedRecord(null);
            axios.get('http://localhost:5000/recette/getAllA', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(response => setRecettes(response.data))
              .catch(err => {
                console.error(err);
                message.error('Erreur lors de la récupération des recettes après soumission.');
              });
          })
          .catch(err => {
            console.error(err);
            message.error(`Erreur lors de l'${selectedRecord ? 'édition' : 'ajout'} de la recette`);
          });
      })
      .catch(info => {
        console.log('Validation Failed:', info);
      });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Centre', 'Types d\'Impôts', 'Trimèstre', 'Montant', 'Mois', 'Année']], // Ajout de "Centre" à l'en-tête
      body: filteredRecettes.map(recette => [
        recette.nom_departement, // Ajout de la propriété "centre" en première position
        recette.nom_typeImpot,
        recette.categorie_typeImpot,
        `${recette.montant} Ar`,
        recette.mois,
        recette.trimestre_recette,
        recette.annee,
      ]),
    });
    doc.save('recettes.pdf');
  };
  

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRecettes.map(recette => ({
      'Centre': recette.nom_departement, // Mise en première colonne
      'Types d\'Impôts': recette.nom_typeImpot,
      'Catégorie': recette.categorie_typeImpot,
      'Montant': `${recette.montant} Ar`,
      'Mois': recette.mois,
      'Trimèstre': recette.trimestre_recette,
      'Année': recette.annee,
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recettes');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'recettes.xlsx');
  };
  
  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedRecord(null);
  };
  

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
       <h2 style={{ marginBottom: '16px', textAlign: 'center', color: '#4a90e2' }}>Liste des Recettes</h2>
      <div style={{ marginBottom: 30 }}>
        <Input
          placeholder="Rechercher par type d'impôt"
          value={searchText}
          onChange={handleSearch}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          placeholder="Filtrer par mois"
          onChange={handleMonthChange}
          style={{ width: 150, marginRight: 16 }}
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
          {/* Remplace les options statiques par des valeurs dynamiques */}
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
          {/* Ajoute ici d'autres mois */}
        </Select>
        <Select
          placeholder="Filtrer par année"
          onChange={handleYearChange}
          style={{ width: 150, marginRight: 16 }}
          suffixIcon={selectedYear ? <CloseOutlined onClick={resetYear} style={{ fontSize: 12 }} /> : null}
        >
          {/* Remplace les options statiques par des valeurs dynamiques */}
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
          {/* Ajoute ici d'autres années */}
        </Select>
        <Select
          placeholder="Filtrer par catégorie"
          onChange={handleCategoryChange}
          style={{ width: 150, marginRight: 16 }}
          suffixIcon={selectedCategory ? <CloseOutlined onClick={resetCategory} style={{ fontSize: 12 }} /> : null}
        >
          {/* Remplace les options statiques par des valeurs dynamiques */}
          <Option value="budgetaire">Budgétaire</Option>
          <Option value="hors_Budget">Hors Budget</Option>
          {/* Ajoute ici d'autres catégories */}
        </Select>

        <Select
           placeholder="Filtrer par centre"
          onChange={value => setSelectedCentre(value)}
          style={{ width: 150, marginRight: 16 }}
          suffixIcon={selectedCentre ? <CloseOutlined onClick={() => setSelectedCentre('')} style={{ fontSize: 12 }} /> : null}
        >
          {/* Remplacez ces options par les valeurs réelles de vos centres */}
            {departement.map(depar => (
                  <Option key={depar.nom_departement} value={depar.nom_departement}>{depar.nom_departement}</Option>
                                      ))}
                {/* Ajoutez d'autres centres si nécessaire */}
        </Select> 
        <Select
          placeholder="Filtrer par trimèstre"
          onChange={handleTrimestreChange}
          style={{ width: 150, marginRight: 16 }}
          suffixIcon={selectedTrimestre ? <CloseOutlined onClick={resetTrimestre} style={{ fontSize: 12 }} /> : null}
        >
          <Option value="1">1er Trimestre</Option>
        <Option value="2">2e Trimestre</Option>
        <Option value="3">3e Trimestre</Option>
        <Option value="4">4e Trimestre</Option>
          
        
        </Select>

        <Button type="default" icon={<FilePdfOutlined />} onClick={exportToPDF} style={{ marginRight: 16 }}>
          Exporter PDF
        </Button>
        <Button type="default" icon={<FileExcelOutlined />} onClick={exportToExcel}>
          Exporter Excel
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: '#93c4c5', borderColor: '#93c4c5', color: 'black', float: 'right' }}
          onClick={() => setIsModalVisible(true)}
        >
          Ajouter une Recette
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredRecettes}
        rowKey="id_recette"
      />
      <Modal
        title={selectedRecord ? 'Modifier la Recette' : 'Ajouter une Recette'}
        visible={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleModalClose}
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
            name="montant"
            label="Montant"
            rules={[{ required: true, message: 'Veuillez saisir le montant!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="mois"
            label="Mois"
            rules={[{ required: true, message: 'Veuillez saisir le mois!' }]}
          >
              <Select  onChange={handleMonthChangeT}>
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
            name="annee"
            label="Année"
            rules={[{ required: true, message: 'Veuillez saisir l\'année!' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Recette;
