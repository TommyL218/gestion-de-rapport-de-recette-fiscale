import { useState } from "react";
import axios from 'axios';
import dgi from '../images/dgi.png';
import { useNavigate } from 'react-router-dom';

function SignUp() {


const validateForm = (form) => {
    // Validate the name
    if (form.nom.value === '') {
      alert('Le nom est obligatoire.');
      return false;
    }
   
    // Validate the email
    if (!form.email.value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      alert('L\'adresse e-mail n\'est pas valide.');
      return false;
    }
     // Validate the name
     if (form.password.value === '') {
      alert('Le mot de passe est obligatoire.');
      return false;
    }
  
    // Validate the role
    if (form.role.value === '') {
      alert('Le rôle est obligatoire.');
      return false;
    }
  
    return true;
  };







  const handleAddModalOk = () => {
    // Vérifie que le formulaire est valide
   if (!validateForm(document.getElementById('add-user-form'))) {
      return;
    }
  
    // Ajoute l'utilisateur
    axios.post('http://localhost:5000/auth/register', {
      username: document.getElementById('add-user-form').nom.value,
      email: document.getElementById('add-user-form').email.value,
      password: document.getElementById('add-user-form').password.value,
      role: document.getElementById('add-user-form').role.value,
    })
      .then(response => {
        // Création réussie
      
        alert('L\'utilisateur a été créé avec succès.')
        
      })
      .catch(error => console.error('Erreur lors de la création de l\'utilisateur :', error));
  };
  
  





  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-blue-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        {/* Logo centré en haut */}
        <div className="flex justify-center mb-6">
        <img
            src={dgi}
            alt="Logo"
            className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
          />
        </div>

        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">
          Créer un compte
        </h2>
        <p className="text-center text-gray-500 mb-8">
          enregistrez vous pour commencer
        </p>

        <form className="space-y-6" id="add-user-form">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              id="name"
              name="nom"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Entrer votre nom"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
            name="email"
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
            name="password"
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              role
            </label>
            <input
            name="role"
              id="confirmPassword"
              type="texte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-200 text-black font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              onClick={handleAddModalOk}
            >
              enregistrer
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Vous avez deja un compte?{" "}
          <button className="text-purple-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
export default SignUp;