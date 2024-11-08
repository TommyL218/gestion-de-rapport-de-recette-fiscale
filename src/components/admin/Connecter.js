import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dgi from '../admin/images/dgi.png';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Form, Input, Button, Checkbox, Select, Typography, message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

// URL de l'API backend
const API_URL = 'http://localhost:5000';

// Composant pour la connexion
function Login({ onToggle }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Récupérer le rôle de l'utilisateur
        const userRole = response.data.role; // Assurez-vous que votre API renvoie le rôle
        // Rediriger en fonction du rôle
        switch (userRole) {
          case 'administrateur':
            navigate('/admin'); // Remplacez par votre route admin
            break;
          default:
            navigate('/accueil'); // Redirection par défaut
            break;
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Email ou mot de passe incorrect. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-blue-100 to-teal-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div>
          <img src={dgi} alt="Logo" className=""  style={{width: "100px", height: "100px"}}/>
          </div>
        </div>
        <Title level={2} className="text-gray-800 text-center mb-6">Bienvenue</Title>
        <Text className="text-center text-gray-500 mb-8">Veuillez vous connecter</Text>
        <Form layout="vertical" onFinish={handleLogin} className="space-y-6">
          <Form.Item label="Email" required >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(e.target.value, 'email')}
              placeholder="Entrer votre email"
            />
          </Form.Item>
          <Form.Item label="Mot de passe" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange(e.target.value, 'password')}
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
          <Form.Item>
            <Checkbox>Se souvenir de moi?</Checkbox>
            <a href="co" className="float-right">Mot de passe oublié?</a>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full"  style={{ backgroundColor: '#93c4c5', borderColor: '#93c4c5', color: 'black', float: 'right' }}>
              Se connecter
            </Button>
          </Form.Item>
        </Form>
        <Text className="mt-6 text-gray-600 text-center">
          Vous n'avez pas de compte?{' '}
          <Button type="link" onClick={onToggle}>
            S'inscrire
          </Button>
        </Text>
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
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_URL}/departement/getAllA`);
        setDepartments(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des départements:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      alert("L'utilisateur a été créé avec succès.");
    } catch (error) {
      message.error(error.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-blue-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={dgi} alt="Logo" className="h-20 w-20 rounded-full border-4 border-white shadow-lg" />
        </div>
        <Title level={2} className="text-gray-800 text-center mb-6">Créer un compte</Title>
        <Text className="text-center text-gray-500 mb-8">Enregistrez-vous pour commencer</Text>
        <Form layout="vertical" onFinish={handleRegister} className="space-y-6">
          <Form.Item label="Nom" required>
            <Input
              value={formData.username}
              onChange={(e) => handleChange(e.target.value, 'username')}
              placeholder="Entrer votre nom"
            />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(e.target.value, 'email')}
              placeholder="Entrer votre email"
            />
          </Form.Item>
          <Form.Item label="Mot de passe" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange(e.target.value, 'password')}
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
          <Form.Item label="Sélectionner un Centre" required>
            <Select
              value={formData.centre}
              onChange={(value) => handleChange(value, 'centre')}
              placeholder="Sélectionner un département"
            >
              {departments.map(departement => (
                <Option key={departement.nom_departement} value={departement.nom_departement}>
                  {departement.nom_departement}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Rôle" required>
            <Input
              value={formData.role}
              onChange={(e) => handleChange(e.target.value, 'role')}
              placeholder="Entrer votre rôle"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              S'inscrire
            </Button>
          </Form.Item>
        </Form>
        <Text className="mt-6 text-gray-600 text-center">
          Vous avez déjà un compte?{' '}
          <Button type="link" onClick={onToggle}>
            Se connecter
          </Button>
        </Text>
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
