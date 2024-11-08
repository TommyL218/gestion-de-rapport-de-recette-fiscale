import React, { useState } from 'react';
import axios from 'axios';

const RecetteForm = () => {
  const [typeImpot, setTypeImpot] = useState('');
  const [montant, setMontant] = useState('');
  const [mois, setMois] = useState('');
  const [departementId, setDepartementId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/recettes/create', {
      typeImpot,
      montant,
      mois,
      departementId
    }).then(response => {
      alert('Recette ajoutée avec succès');
    }).catch(error => {
      console.error('Il y a eu une erreur !', error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={typeImpot} onChange={(e) => setTypeImpot(e.target.value)} placeholder="Type d'impôt" />
      <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="Montant" />
      <input type="date" value={mois} onChange={(e) => setMois(e.target.value)} placeholder="Mois" />
      <input type="number" value={departementId} onChange={(e) => setDepartementId(e.target.value)} placeholder="ID Département" />
      <button type="submit">Ajouter Recette</button>
    </form>
  );
};

export default RecetteForm;
