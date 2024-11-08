import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Users = () => {
  const [searchedText, setSearhedText] = useState("");
  const [recettes, setRecettes] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // Ajouter l'état de la modale
  const [isEditing, setIsEditing] = useState(false);
  const [Editing, setEditing] = useState(null);

  //MODIFIER L'UTILISATEUR

  const [form] = Form.useForm();
  const [visi, setVisible] = useState(false);
  const [data, setData] = useState();

  const onEditing = (record) => {
    setIsEditing(true);
    setEditing({ ...record });
  };
  const resetEditing = (e) => {
    setIsEditing(false);
    setEditing(null);
  };

  // Fonction pour obtenir les données à modifier
  const getData = async (url) => {
    // Code pour effectuer la requête HTTP
    // ...

    // Attendre le résultat de la requête HTTP
    const response = await fetch(url);
    const data = await response.json();

    // Renvoyer les données
    return data;
  };

  // LISTER UTILISATEUR
  useEffect(() => {
    // Fetch users from the backend when the component mounts
    axios
      .get("http://localhost:5000/recette/getAll", {
        headers: {
          Authorization: `Bearer ${token}`, // Ajoute le token dans l'en-tête
        },
      })
      .then((response) => {
        setRecettes(response.data);
      })
      .catch((error) => {
        // Gestion des erreurs d'API
        if (error.response && error.response.status === 401) {
          setError("Accès non autorisé. Veuillez vérifier votre token.");
        } else {
          setError("Erreur lors de la récupération des recettes.");
        }
        console.error("Erreur lors de la récupération des recettes", error);
      });
  }, [token]); // Dépendance sur le token
  // Empty dependency array ensures the effect runs once after the initial render

  const columns = [
    {
      title: "typeImpot",
      dataIndex: "typeImpot",
      key: "typeImpot",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return (
          String(record.typeImpot)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.montant).toLowerCase().includes(value.toLowerCase()) ||
          String(record.mois).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "typeImpot",
      dataIndex: "typeImpot",
      key: "typeImpot",
    },
    {
      title: "montant",
      dataIndex: "montant",
      key: "montant",
    },
    {
      title: "mois",
      dataIndex: "mois",
      key: "mois",
    },
    {
      title: "",
      key: "actions",
      render: (record) => (
        <div>
          <td>
            {" "}
            <Button
              type="primary"
              size="small"
              onClick={() => onEditing(record)}
              icon={<EditOutlined />}
            >
              Modifier
            </Button>
          </td>
          <td>
            {" "}
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              size="small"
              onClick={() => handleDeleteConfirm(record.id_recette)}
              danger
              style={{ marginLeft: 12 }}
            >
              Supprimer
            </Button>
          </td>
        </div>
      ),
    },
  ];

  // SUPPRIMER UTILISATEUR

  const handleDelete = (id_recette) => {
    // Delete the user from the database
    axios
      .delete(`http://localhost:3001/users/${id_recette}`)
      .then((response) => {
        console.log("User deleted successfully");
      })
      .catch((error) => console.error("Error deleting user:", error));

    // Remove the user from the state
    setRecettes([
      ...recettes.filter((recettes) => recettes.id_recette !== id_recette),
    ]);
  };

  const handleDeleteConfirm = (id_recette) => {
    const record = recettes.find(
      (recette) => recette.id_recette === id_recette
    );

    // Afficher la modale de confirmation
    Modal.confirm({
      title: `Êtes-vous sûr de vouloir supprimer ce reccete ?`,
      content: (
        <div>
          la recette <strong>{record.nom}</strong> sera définitivement supprimé.
        </div>
      ),
      onOk: () => {
        // Supprimer l'utilisateur
        handleDelete(id_util);

        // Retirer l'utilisateur de l'état
        setRecettes([
          ...recettes.filter((recette) => recette.id_recette !== id_recett),
        ]);
      },
      onCancel: () => console.log("Suppression annulée"),
    });
  };
  // AJOUT UTILISATEUR

  const handleAddClick = () => {
    // Basculer la visibilité de la modale
    setIsAddModalVisible(!isAddModalVisible);
  };
  const handleAddFormSubmit = (e) => {
    e.preventDefault();

    // Vérifie que le formulaire est valide
    if (!validateForm(e.target)) {
      return;
    }

    // Ajoute l'utilisateur
    axios
      .post("http://localhost:5001/recette/create", {
        headers: {
          Authorization: `Bearer ${token}`,
        }, // Ajoute le token dans l'en-
        typeImpot: e.target.nom.value,
        montant: e.target.prenom.value,
        mois: e.target.email.value,
      })
      .then((response) => {
        // Création réussie
        alert("L'utilisateur a été créé avec succès.");
        // Ferme la modale
        setIsAddModalVisible(false);

        // Met à jour la liste des utilisateurs
        setUsers([...users, response.data]);
      })
      .catch((error) =>
        console.error("Erreur lors de la création de l'utilisateur :", error)
      );
  };

  const validateForm = (form) => {
    // Validate the name
    if (form.nom.value === "") {
      alert("Le nom est obligatoire.");
      return false;
    }
    // Validate the name
    if (form.prenom.value === "") {
      alert("Le prenom est obligatoire.");
      return false;
    }
    // Validate the email
    if (
      !form.email.value.match(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
      )
    ) {
      alert("L'adresse e-mail n'est pas valide.");
      return false;
    }

    // Validate the role
    if (form.role.value === "") {
      alert("Le rôle est obligatoire.");
      return false;
    }

    return true;
  };

  const handleAddModalOk = () => {
    // Vérifie que le formulaire est valide
    if (!validateForm(document.getElementById("add-user-form"))) {
      return;
    }

    // Ajoute l'utilisateur
    axios
      .post("http://localhost:3001/users", {
        nom: document.getElementById("add-user-form").nom.value,
        prenom: document.getElementById("add-user-form").prenom.value,
        email: document.getElementById("add-user-form").email.value,
        motDePasse: document.getElementById("add-user-form").motDePasse.value,
        role: document.getElementById("add-user-form").role.value,
      })
      .then((response) => {
        // Création réussie
        alert("L'utilisateur a été créé avec succès.");
        // Ferme la modale
        setIsAddModalVisible(false);
        // Met à jour la liste des utilisateurs
        setUsers([...users, response.data]);
      })
      .catch((error) =>
        console.error("Erreur lors de la création de l'utilisateur :", error)
      );
  };

  const handleAddModalCancel = () => {
    // Fermer la modale
    setIsAddModalVisible(false);
  };

  return (
    <div className="container">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div id="recherche" className="col-md-5">
              <Input.Search
                placeholder="recherche..."
                style={{}}
                onSearch={(value) => {
                  setSearhedText(value);
                }}
                onChange={(e) => {
                  setSearhedText(e.target.value);
                }}
              />
            </div>

            <Button
              onClick={handleAddClick}
              icon={<PlusCircleOutlined />}
              style={{ background: "#00FFBC" }}
            >
              Ajouter
            </Button>

            <div className="row">
              <h2>Gestion Des Utilisateurs</h2>
              <Table
                columns={columns}
                dataSource={users}
                style={{ overflowX: "scroll" }}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Ajouter un utilisateur"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
        okText="Ajouter"
      >
        <form id="add-user-form">
          <label class="form-label">Nom:</label>
          <input type="text" name="nom" />
          <label>Prenom</label>
          <input type="text" name="prenom" />
          <label>Email:</label>
          <input type="text" name="email" />
          <label>mot de passe:</label>
          <input type="email" name="motDePasse" />
          <label>Rôle:</label>
          <select name="role">
            <option value="administrateur">Adminstrateur</option>
            <option value="utilsateur">Utilisateur</option>
            <option value="enseignant">Enseignant</option>
            <option value="etudiant">Etudiant</option>
            <option value="technicien">Technicien</option>
          </select>
        </form>
      </Modal>

      {/*}<Modal title="Modifier" visible={visi} onOk={handleSubmit} onCancel={() => setVisible(false)} >
  <Form form={form}>
    {data ? (
      <>
            <Form.Item label="Nom" name="nom" initialValue={data.nom} >
          <Input />
            </Form.Item>
            <Form.Item label="Prénom" name="prenom" initialValue={data.prenom} >
        <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" initialValue={data.email} >
        <Input />
            </Form.Item>
            <Form.Item label="Rôle" name="role" initialValue={data.role} >
                 <select name="role">
                    <option value="administrateur">Adminstrateur</option>
                    <option value="utilsateur">Utilisateur</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="etudiant">Etudiant</option>
                    <option value="technicien">Technicien</option>
       
                </select>
            </Form.Item>
      </>
                      ) : (
                      <div>Chargement des données...</div>
                      )}
  </Form>
                      </Modal>{*/}
      <Modal
        title="Modifier"
        okText="modifier"
        visible={isEditing}
        onOk={() => {
          setUsers((pre) => {
            return pre.map((user) => {
              if (user.id_util === Editing.id_util) {
                return Editing;
              } else {
                return user;
              }
            });
          });
          resetEditing();
        }}
        onCancel={() => resetEditing()}
      >
        <label>nom:</label>
        <Input
          value={Editing?.nom}
          onChange={(e) => {
            setEditing((pre) => {
              return { ...pre, nom: e.target.value };
            });
          }}
        />
        <label>Prenom:</label>
        <Input
          value={Editing?.prenom}
          onChange={(e) => {
            setEditing((pre) => {
              return { ...pre, prenom: e.target.value };
            });
          }}
        />
        <label>Email:</label>
        <Input
          value={Editing?.email}
          onChange={(e) => {
            setEditing((pre) => {
              return { ...pre, email: e.target.value };
            });
          }}
        />
        <label>motDePasse:</label>
        <Input
          value={Editing?.motDePasse}
          onChange={(e) => {
            setEditing((pre) => {
              return { ...pre, motDePasse: e.target.value };
            });
          }}
        />
        <label>Role:</label>
        <Input
          value={Editing?.role}
          onChange={(e) => {
            setEditing((pre) => {
              return { ...pre, role: e.target.value };
            });
          }}
        />
      </Modal>
    </div>
  );
};

export default Users;
