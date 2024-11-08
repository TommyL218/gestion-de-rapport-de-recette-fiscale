import React from 'react';
import { Outlet } from 'react-router-dom';
import LayoutWithSidebar from './antd';


const Layout = () => {

  return (
    <div className='layout'>
        <LayoutWithSidebar/>
        <Outlet/>
   </div>
  );
};

export default Layout;
