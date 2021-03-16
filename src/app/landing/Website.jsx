import React from 'react'
import { Link } from 'react-router-dom';

import LandingLayout from './../layouts/LandingLayout';

const Website = (props) => {
  return (
    <LandingLayout>
      <div className="p-grid p-nogutter p-align-center p-justify-center" style={{ height: '95vh' }}>
        <img src={require('./../../logo.png')} alt="" style={{ height: '20vh' }} />
        <div>
          <h1 className="color-title">Finanzas</h1>
          <h1 className="color-title">Inteligentes</h1>
          <p>
            <Link to="/login">Login</Link><span className="color-title"> | </span><Link to="/register">Registrarse</Link>
          </p>
        </div>
      </div>
    </LandingLayout>
  )
}

export default Website;
