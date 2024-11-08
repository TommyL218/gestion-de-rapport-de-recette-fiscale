import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dgi from '../images/dgi.png';
import { useNavigate } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

// URL de l'API backend
const API_URL = 'http://localhost:5000';

// Composant réutilisable pour les champs de saisie
const InputField = ({ id, name, type, value, placeholder, onChange, showPassword, onToggleShowPassword }) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {placeholder}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      placeholder={placeholder}
      required
    />
    {name === 'password' && (
      <button
        type="button"
        onClick={onToggleShowPassword}
        className="absolute inset-y-0 right-2 flex items-center justify-center"
      >
        {showPassword ? <AiFillEyeInvisible size={24} /> : <AiFillEye size={24} />}
      </button>
    )}
  </div>
);

// Composant bouton avec indicateur de chargement
const SubmitButton = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-2 px-4 bg-green-200 text-black font-semibold rounded-lg shadow-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
  >
    {loading ? 'Chargement...' : text}
  </button>
);

// Composant pour la connexion
function Login({ onToggle }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/accueil');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-blue-100 to-teal-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <img src={dgi} alt="Logo" className="h-40 w-40 rounded-full border-4 border-white shadow-lg" />
        </div>
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">Bienvenue</h2>
        <p className="text-center text-gray-500 mb-8">Veuillez vous connecter</p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <InputField
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrer votre email"
          />
          <InputField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrer votre mot de passe"
            showPassword={showPassword}
            onToggleShowPassword={toggleShowPassword}
          />
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center">
              <input type="checkbox" className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi?</span>
            </label>
            <a href="co" className="text-sm text-purple-600 hover:underline">Mot de passe oublié?</a>
          </div>
          <SubmitButton loading={loading} text="Se connecter" />
        </form>
        <p className="mt-6 text-sm text-gray-600 text-center">
          Vous n'avez pas de compte?{' '}
          <button onClick={onToggle} className="text-purple-600 hover:underline">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}

// Composant pour l'inscription
function SignUp({ onToggle }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    centre: '',
    role: '',
  });
  const [departments, setDepartments] = useState([]); // État pour les départements
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Fonction pour récupérer les départements depuis l'API
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_URL}/departement/getAll`);
        setDepartments(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des départements:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      alert("L'utilisateur a été créé avec succès.");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-blue-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <img src={dgi} alt="Logo" className="h-20 w-20 rounded-full border-4 border-white shadow-lg" />
        </div>
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">Créer un compte</h2>
        <p className="text-center text-gray-500 mb-8">Enregistrez-vous pour commencer</p>
        <form className="space-y-6" onSubmit={handleRegister}>
          <InputField
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Entrer votre nom"
          />
          <InputField
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrer votre email"
          />
          <InputField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrer votre mot de passe"
            showPassword={showPassword}
            onToggleShowPassword={toggleShowPassword}
          />
          <div className="relative">
            <label htmlFor="centre" className="block text-sm font-medium text-gray-700">
              Sélectionner un département
            </label>
            <select
              id="centre"
              name="centre"
              value={formData.centre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="" disabled>Sélectionner un département</option>
              {departments.map(departement => (
                <option key={departement.nom_departement_departement} value={departement.nom_departement}>
                  {departement.nom_departement}
                </option>
              ))}
            </select>
          </div>
          <InputField
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
            placeholder="Entrer votre rôle"
          />
          <SubmitButton loading={loading} text="S'inscrire" />
        </form>
        <p className="mt-6 text-sm text-gray-600 text-center">
          Vous avez déjà un compte?{' '}
          <button onClick={onToggle} className="text-purple-600 hover:underline">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}

// Composant Auth pour gérer la connexion et l'inscription
function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  return isLogin ? <Login onToggle={toggleAuth} /> : <SignUp onToggle={toggleAuth} />;
}

export default Auth;
