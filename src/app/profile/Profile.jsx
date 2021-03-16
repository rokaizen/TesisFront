import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from "react-router-dom";
import { useForm } from 'react-hook-form';
import * as yup from "yup";

import { Messages } from 'primereact/messages';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { userApiEndpoints } from './../../API';
import axios from './../../Axios';
import { useTracked } from './../../Store';

let messages;

const passwordValidationSchema = yup.object().shape({
  old_password: yup.string().required('Campo requerido').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  new_password: yup.string().required('Campo requerido').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirm_password: yup.string().required('Campo requerido').oneOf([yup.ref('new_password')], 'Las credenciales no son iguales')
});

const Profile = (props) => {

  const [state] = useTracked();
  const { register, handleSubmit, errors, reset } = useForm({
    validationSchema: passwordValidationSchema
  });
  const [submitting, setSubmitting] = useState(false);

  const submitChangePassword = (data) => {
    setSubmitting(true);
    axios.put(userApiEndpoints.password, JSON.stringify(data))
      .then(response => {
        // console.log('success');
        // console.log(response.data);

        if (response.status === 200) {

          reset();
          setSubmitting(false);

          messages.show({
            severity: 'success',
            detail: 'Your password updated successfully.',
            sticky: false,
            closable: false,
            life: 5000
          });
        }

      })
      .catch(error => {
        console.log('error');
        console.log(error.response);

        reset();
        setSubmitting(false);

        messages.clear();

        if (error.response.status === 401) {
          messages.show({
            severity: 'error',
            detail: 'Something went wrong. Try again.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }

        if (error.response.status === 422) {
          if (error.response.data.data === 'password_mismatch') {
            messages.show({
              severity: 'error',
              detail: 'Contraseñas no son las mismas.',
              sticky: true,
              closable: true,
              life: 5000
            });
          }
          else if (error.response.data.data === 'old_password') {
            messages.show({
              severity: 'error',
              detail: 'Tu nueva contraseña es la misma a la previa.',
              sticky: true,
              closable: true,
              life: 5000
            });
          }
        }

      })
  };

  return (
    <div>
      <Helmet title="Perfil" />

      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <div className="p-fluid">
            <Messages ref={(el) => messages = el} />
          </div>
        </div>
      </div>

      <div className="p-grid">

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Informacion del Perfil</div>
              {/* <div className="p-card-subtitle">Detail of your current account information.</div> */}
            </div>
            <div className="p-grid p-nogutter p-justify-between">
              <h3 className="color-title p-col-6">
                Nombre:
                </h3>
              <h3 className="color-highlight p-col-6">
                {state.user.name}
              </h3>
            </div>
            <div className="p-grid p-nogutter p-justify-between">
              <h3 className="color-title p-col-6">
                Email:
                </h3>
              <h3 className="color-highlight p-col-6">
                {state.user.email}
              </h3>
            </div>

            {/* <div className="p-card-footer p-fluid">
              <Link to={'/profile/edit'}>
                <Button label="Editar" className="" icon="pi pi-pencil" />
              </Link>
            </div> */}
          </Card>
        </div>

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Contraseña</div>
              <div className="p-card-subtitle">Gestiona tu contraseña actual aquí.</div>
            </div>
            <br />

            <form onSubmit={handleSubmit(submitChangePassword)}>
              <div className="p-fluid">
                <input type='password' name='old_password' ref={register} autoComplete="off" placeholder="Contraseña Actual" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.old_password?.message}</p>
              </div>
              <div className="p-fluid">
                <input type='password' name='new_password' ref={register} autoComplete="off" placeholder="Nueva Contraseña" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.new_password?.message}</p>
              </div>
              <div className="p-fluid">
                <input type='password' name='confirm_password' ref={register} autoComplete="off" placeholder="Confirmar Contraseña" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.confirm_password?.message}</p>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Cambiar Contraseña" icon="pi pi-key"
                  className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>

  )
}

export default Profile;
