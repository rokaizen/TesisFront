import React, { useState } from 'react'
import classNames from 'classnames';
import { Route, Switch } from 'react-router-dom';

import { ScrollPanel } from 'primereact/scrollpanel';

import AppTopbar from './../dashboard/AppTopbar';
import AppInlineProfile from './../dashboard/AppInlineProfile';
import AppMenu from './../dashboard/AppMenu';
import AppFooter from './../dashboard/AppFooter';

import Dashboard from './../dashboard/Dashboard';
import ExpenseCategory from './../expense/ExpenseCategory';
import Expense from './../expense/Expense';
import EditExpense from './../expense/EditExpense';
import Income from './../income/Income';
import EditIncome from './../income/EditIncome';
import Profile from './../profile/Profile';
import EditProfile from './../profile/EditProfile';
import EditExpenseCategory from './../expense/EditExpenseCategory';
import IncomeCategory from './../income/IncomeCategory';
import EditIncomeCategory from './../income/EditIncomeCategory';
import TransactionCalendar from './../calendar/TransactionCalendar';
import Setting from './../setting/Setting';
import ScrollToTop from './../dashboard/ScrollToTop';
import PageNotFound from './../errors/404';

import { logout } from './../../Axios';
import { PrivateRoute } from './../../Routes';
import { useTracked } from './../../Store';

const isDesktop = () => {
  return window.innerWidth > 1024;
};

const menu = [
  { label: 'Inicio', url: '/dashboard', icon: 'pi pi-fw pi-home', command: () => { } },
  {
    label: 'Gastos', url: '', icon: 'pi pi-fw pi-dollar',
    items: [
      { label: 'Administrar', url: '/expense', icon: 'pi pi-fw pi-plus', command: () => { } },
      { label: 'Categorias', url: '/expense/category', icon: 'pi pi-fw pi-list', command: () => { } },
    ]
  },
  {
    label: 'Ingreso', url: '', icon: 'pi pi-fw pi-money-bill',
    items: [
      { label: 'Administrar', url: '/income', icon: 'pi pi-fw pi-plus', command: () => { } },
      { label: 'Categorias', url: '/income/category', icon: 'pi pi-fw pi-list', command: () => { } },
    ]
  },
  { label: 'Calendario', url: '/calendar', icon: 'pi pi-fw pi-calendar', command: () => { } },
  { label: 'Ajustes', url: '/setting', icon: 'pi pi-fw pi-cog', command: () => { } },
  { label: 'Perfil', url: '/profile', icon: 'pi pi-fw pi-user', command: () => { } },
  { label: 'Salir', url: '', icon: 'pi pi-fw pi-power-off', command: () => logout() },
];

const DashboardLayout = (props) => {

  const [state] = useTracked();

  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  const onToggleMenu = () => {
    if (isDesktop()) {
      if (state.layoutMode === 'overlay') {
        setOverlayMenuActive(!overlayMenuActive);
      }
      else if (state.layoutMode === 'static') {
        setStaticMenuInactive(!staticMenuInactive);
      }
    }
    else {
      setMobileMenuActive(!mobileMenuActive)
    }
  }

  /**
   * If menu item has no child, this function will
   * close the menu on item click. Else it will
   * open the child drawer.
   */
  const onMenuItemClick = (event) => {
    if (!event.item.items) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }
  }

  let logo = state.layoutColorMode === 'dark' ? require('./../../assets/logo-sidebar.png') : require('./../../assets/logo-sidebar.png');
  let wrapperClass = classNames('layout-wrapper', {
    'layout-overlay': state.layoutMode === 'overlay',
    'layout-static': state.layoutMode === 'static',
    'layout-static-sidebar-inactive': staticMenuInactive && state.layoutMode === 'static',
    'layout-overlay-sidebar-active': overlayMenuActive && state.layoutMode === 'overlay',
    'layout-mobile-sidebar-active': mobileMenuActive
  });
  let sidebarClassName = classNames("layout-sidebar", { 'layout-sidebar-dark': state.layoutColorMode === 'dark' });

  return (
    <div className={wrapperClass}>
      <AppTopbar onToggleMenu={onToggleMenu} />

      <div className={sidebarClassName}>
        <ScrollPanel style={{ height: '100%' }}>
          <div className="layout-sidebar-scroll-content">
            <div className="layout-logo">
              <img alt="Logo" src={logo} style={{ height: '80px' }} />
            </div>
            <AppInlineProfile />
            <AppMenu model={menu} onMenuItemClick={onMenuItemClick} />
          </div>
        </ScrollPanel>
      </div>
      <div className="layout-main" style={{ minHeight: '100vh', marginBottom: '-55px' }}>
        <Switch>
          <PrivateRoute exact strict path={'/dashboard'} component={Dashboard} />
          <PrivateRoute exact strict path={'/expense'} component={Expense} />
          <PrivateRoute exact strict path={'/expense/:expense_id/edit'} component={EditExpense} />
          <PrivateRoute exact strict path={'/expense/category'} component={ExpenseCategory} />
          <PrivateRoute exact strict path={'/expense/category/:category_id/edit'} component={EditExpenseCategory} />
          <PrivateRoute exact strict path={'/income'} component={Income} />
          <PrivateRoute exact strict path={'/income/:income_id/edit'} component={EditIncome} />
          <PrivateRoute exact strict path={'/income/category'} component={IncomeCategory} />
          <PrivateRoute exact strict path={'/income/category/:category_id/edit'} component={EditIncomeCategory} />
          <PrivateRoute exact strict path={'/calendar'} component={TransactionCalendar} />
          <PrivateRoute exact strict path={'/setting'} component={Setting} />
          <PrivateRoute exact strict path={'/profile'} component={Profile} />
          <PrivateRoute exact strict path={'/profile/edit'} component={EditProfile} />
          <Route render={props => <PageNotFound {...props} />} />
        </Switch>
        <div style={{ height: '55px' }}>
          {/* For footer adjustment */}
        </div>
        <ScrollToTop />
      </div>
      <AppFooter />
      <div className="layout-mask" />
    </div>
  );
}

export default DashboardLayout;
