import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Messages } from 'primereact/messages';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { expenseApiEndpoints } from './../../API';
import axios from './../../Axios';

let messages;

const expenseCategoryValidationSchema = yup.object().shape({
  category_name: yup.string().required('Nombre de Categoria Requerido').max(100, 'Nombre de Cateogoria debe tener como maximo 100 caracteres')
});

const EditExpenseCategory = (props) => {

  useEffect(() => {
    requestExpenseCategory();
  }, []);

  const { register, handleSubmit, errors, setError, setValue } = useForm({
    validationSchema: expenseCategoryValidationSchema
  });
  const [submitting, setSubmitting] = useState(false);

  const requestExpenseCategory = async () => {
    await axios.get(expenseApiEndpoints.expenseCategory + '/' + props.match.params.category_id, {})
      .then(response => {
        // console.log('success', response.data);
        setValue('category_name', response.data.category_name);
      })
      .catch(error => {
        console.log('error', error.response);

        if (error.response.status === 401) {
          messages.show({
            severity: 'error',
            detail: 'Algo salio mal. Intenta nuevamente.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }

      })
  };

  const submitUpdateExpenseCategory = async (data) => {
    await axios.put(expenseApiEndpoints.expenseCategory + '/' + props.match.params.category_id, JSON.stringify(data))
      .then(response => {
        console.log('success', response.data.request);

        if (response.status === 200) {
          setSubmitting(false);

          messages.show({
            severity: 'success',
            detail: 'Tu Categoria de gasto fue actualizada exitosamente.',
            sticky: false,
            closable: false,
            life: 5000
          });
        }

      })
      .catch(error => {
        console.log('error', error);

        setSubmitting(false);

        messages.clear();

        if (error.response.status === 422) {
          let errors = Object.entries(error.response.data).map(([key, value]) => {
            return { name: key, message: value[0] }
          });
          setError(errors);
        }
        else if (error.response.status === 401) {
          messages.show({
            severity: 'error',
            detail: 'Algo salio mal. Intenta nuevamente.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }

      })
  };

  return (
    <div>
      <Helmet title="Editar Gastos" />

      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <div className="p-fluid">
            <Messages ref={(el) => messages = el} />
          </div>
        </div>
      </div>

      <div className="p-grid">

        <div className="p-col-12">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Editar Categoria de Gasto</div>
              {/* <div className="p-card-subtitle">Edit selected expense category information below.</div> */}
            </div>
            <br />
            <form onSubmit={handleSubmit(submitUpdateExpenseCategory)}>
              <div className="p-fluid">
                <label>Nombre Categoria</label>
                <div className="p-fluid">
                  <input type="text" ref={register} placeholder="Nombre Categoria" name="category_name" className="p-inputtext p-component p-filled" />
                  <p className="text-error">{errors.category_name?.message}</p>
                </div>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Guardar Cambios" icon="pi pi-save" className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>

  )
}

export default React.memo(EditExpenseCategory);
