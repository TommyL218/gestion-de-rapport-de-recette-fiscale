import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Button, message, Image, Modal } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, MoneyCollectOutlined, LineChartOutlined, ClusterOutlined } from '@ant-design/icons';
import RecetteList from './RecetteList';
import Prevision from './Prevision';
import PrevisionByTrimestre from './PrevisionByTrimestre'; // Assurez-vous d'importer le composant nécessaire
import ConsolidationForm from './Consolidation';
import ConsolidationByTrimestre from './ConsolidationByTrimestre'; // Assurez-vous d'importer le nouveau composant
import image from "../images/dgi.png";
import ConsolidationByAnnee from "./ConsolidationAnnuel"

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const LayoutWithSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('1'); // État pour gérer l'élément de menu sélectionné

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirmation de déconnexion',
      content: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        localStorage.removeItem('token'); // Suppression du token local
        message.success('Déconnexion réussie');
        window.location.href = '/'; // Modifier le chemin de redirection si nécessaire
      },
    });
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key); // Met à jour l'état de l'élément sélectionné
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case '1':
        return <RecetteList />;
      case '2-1':
        return <Prevision />;
      case '2-2':
        return <PrevisionByTrimestre />;
      case '3-1':
        return <ConsolidationForm />;
      case '3-2':
        return <ConsolidationByTrimestre />;
        case '3-3':
          return <ConsolidationByAnnee/>; // Ajoutez le composant correspondant
      default:
        return <RecetteList />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#93c4c5', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
          Consolidation des recettes fiscales
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggle}
            style={{
              color: '#fff',
              fontSize: '16px',
              marginLeft: '16px',
            }}
          />
        </div>
      </Header>
      <Layout>
        <Sider
          width={250}
          collapsible
          collapsed={collapsed}
          onCollapse={toggle}
          style={{ background: '#001529', color: '#fff' }}
        >
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            background: '#001529',
            color: '#fff',
            height: '64px',
            borderBottom: '1px solid #444'
          }}>
            <Avatar
              src={<Image src={image} width={64} />} // Remplacez par l'URL de votre logo
              size={80}
              style={{ marginRight: 16 }}
            />
            {!collapsed && <Title level={4} style={{ color: '#93c4c5', margin: 0 }}>DGI</Title>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenu]} // Met à jour l'élément sélectionné
            style={{ marginTop: '16px' }}
            onClick={handleMenuClick} // Ajoutez le gestionnaire de clics
          >
            <Menu.Item key="1" icon={<MoneyCollectOutlined />} >
              Recette
            </Menu.Item>
            <Menu.SubMenu key="2" icon={<LineChartOutlined />} title="Prévision">
              <Menu.Item key="2-1">Prévision Globale</Menu.Item>
              <Menu.Item key="2-2">Prévision par Trimestre</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="3" icon={<ClusterOutlined />} title="Consolidation">
              <Menu.Item key="3-1">Consolidation par mois</Menu.Item>
              <Menu.Item key="3-2">Consolidation par trimestre</Menu.Item> {/* Nouveau sous-menu */}
              <Menu.Item key="3-3">Consolidation Annuelle</Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Déconnexion
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px', minHeight: '100vh' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {renderContent()} {/* Affiche le composant correspondant à l'élément de menu sélectionné */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutWithSidebar;
