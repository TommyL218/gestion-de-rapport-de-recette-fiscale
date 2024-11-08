import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Button, message, Image, Modal } from 'antd';
import {MenuFoldOutlined,MenuUnfoldOutlined,LogoutOutlined,UserOutlined,FileTextOutlined, BankOutlined,PieChartOutlined,FundProjectionScreenOutlined,BarChartOutlined,} from '@ant-design/icons';
import ImpotList from './Impots';
import Recette from './Recette';
import ConsolidationA from './consolidationA';
import image from "../admin/images/dgi.png";
import PrevisionA from './PrevisionA';
import Departement from './departement';
import Utilisateur from './Utilisateur';
import ConsolidationDri from './ConsolidationDRI';
import ConsolidationTriA from './ConsolidationTriA';
import ConsolidationAnnuelA from './ConsolidationAnnuelA';
import ConsolidationFormA from './ConDepartementMois';
import ConDepartementTri from './ConDepartementTri';
import ConsolidationByAn from './ConDepartementAn';
import PrevisionByTrimestreA from './PrevisionByTriemstreA';
import PrevisionTotal from './PrevisionTotal';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const LayoutWithSidebarA = () => {
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
        return <Utilisateur />;
      case '2':
        return <ImpotList />;
      case '3':
        return <Departement />;
      case '4':
        return <Recette />;
      case '5-1':
        return <PrevisionA />;
      case '5-2':
        return <PrevisionByTrimestreA />;
      case '5-3':
        return <PrevisionTotal />;
      case '6-1':
        return <ConsolidationA />;
      case '6-2':
        return <ConsolidationDri />;
      case '6-3':
        return <ConsolidationTriA />;
      case '6-4':
        return <ConsolidationAnnuelA />;
      case '7-1':
        return <ConsolidationFormA />;
      case '7-2':
        return <ConDepartementTri />;
      case '7-3':
        return <ConsolidationByAn />;
      default:
        return <ImpotList />;
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
            borderBottom: '1px solid #444',
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
            <Menu.Item key="1" icon={<UserOutlined />}> {/* Utilisateur */}
              Utilisateur
            </Menu.Item>
            <Menu.Item key="2" icon={<FileTextOutlined />}> {/* Impôts */}
              Impots
            </Menu.Item>
            <Menu.Item key="3" icon={<BankOutlined />}> {/* Unités opérationnelles */}
              Unités Opérationnels
            </Menu.Item>
            <Menu.Item key="4" icon={<PieChartOutlined />}> {/* Recette */}
              Recette
            </Menu.Item>
            <Menu.SubMenu key="5" icon={<FundProjectionScreenOutlined />} title="Prévision"> {/* Prévision */}
              <Menu.Item key="5-1">Prévision Globale</Menu.Item>
              <Menu.Item key="5-2">Prévision Trimestre par centre</Menu.Item>
              <Menu.Item key="5-3">Prévision Total Trimestriel</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="6" icon={<BarChartOutlined />} title="Consolidation DRI"> {/* Consolidation DRI */}
              <Menu.Item key="6-1">Consolidation</Menu.Item>
              <Menu.Item key="6-2">Consolidation Mensuelle</Menu.Item>
              <Menu.Item key="6-3">Consolidation Trimestrielle</Menu.Item>
              <Menu.Item key="6-4">Consolidation Annuèlle</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="7" icon={<BarChartOutlined />} title="Consolidation Centre"> {/* Consolidation Centre */}
              <Menu.Item key="7-1">Consolidation Mensuelle</Menu.Item>
              <Menu.Item key="7-2">Consolidation Trimestrielle</Menu.Item>
              <Menu.Item key="7-3">Consolidation Annuèlle</Menu.Item>
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

export default LayoutWithSidebarA;
