import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm, Controller } from 'react-hook-form';
import * as dayjs from 'dayjs';
import * as yup from 'yup';

import { Messages } from 'primereact/messages';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import CurrencySidebar from './../common/CurrencySidebar';

import { expenseApiEndpoints } from './../../API';
import axios from './../../Axios';
import { useTracked } from './../../Store';

let messages;

const editExpenseValidationSchema = yup.object().shape({
  expense_date: yup.string().required('Fecha de Gasto requerida'),
  category: yup.object().required('Categoria de gasto Requerida'),
  monto: yup.number().required('Monto de Gasto Requerido'),
  spent_on: yup.string().required('Gastado en Requerido').max(100, 'Gastado en Debe tener como maximo 200 caracteres'),
  remarks: yup.string().max(200, 'Comentarios deben tener como maximo 200 caracteres'),
});

const EditExpense = (props) => {

  const [state, setState] = useTracked();
  const { register, handleSubmit, errors, setError, setValue, control } = useForm({
    validationSchema: editExpenseValidationSchema
  });
  const [submitting, setSubmitting] = useState(false);
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);

  useEffect(() => {
    requestExpenseCategory();
    requestExpenseInfo();
  }, []);

  const requestExpenseCategory = async () => {
    await axios.get(expenseApiEndpoints.expenseCategory, {})
      .then(response => {
        // console.log(response.data);
        if (response.data.data.length > 0) {
          setExpenseCategories(response.data.data);
        }
        else {

        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const requestExpenseInfo = async () => {
    await axios.get(expenseApiEndpoints.expense + '/' + props.match.params.expense_id, {})
      .then(response => {
        // console.log('success', response.data);
        setValue([
          { id: response.data.id },
          { expense_date: dayjs(response.data.transaction_date).toDate() },
          { category: response.data.category },
          { amount: response.data.amount },
          { spent_on: response.data.spent_on },
          { remarks: response.data.remarks },
          { currency_id: response.data.currency_id },
        ]);
        setState(prev => ({ ...prev, currentCurrency: response.data.currency }));
      })
      .catch(error => {
        console.log('error', error.response);

        if (error.response.status === 401) {
          messages.show({
            severity: 'error',
            detail: 'Algo salio mal. Intente Nuevamente.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }

      })
  };

  const submitUpdateExpense = (data) => {

    data.expense_date = dayjs(data.expense_date).format('YYYY-MM-DD HH:mm:ss');
    data.category_id = data.category.id;
    data.currency_id = state.currentCurrency.id;

    axios.put(expenseApiEndpoints.expense + '/' + props.match.params.expense_id, JSON.stringify(data))
      .then(response => {
        // console.log('success', response.data.request);

        if (response.status === 200) {
          setSubmitting(false);

          messages.show({
            severity: 'success',
            detail: 'Tu informacion de gasto fue actualizada exitosamente.',
            sticky: false,
            closable: false,
            life: 5000
          });
        }

      })
      .catch(error => {
        console.log('error');
        console.log(error.response);

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

      <CurrencySidebar visible={currencyVisible} onHide={(e) => setCurrencyVisible(false)} />

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
              <div className="p-card-title p-grid p-nogutter p-justify-between">Editar Gasto</div>
              {/* <div className="p-card-subtitle">Edit selected expense information below.</div> */}
            </div>
            <br />
            <form onSubmit={handleSubmit(submitUpdateExpense)}>
              <div className="p-fluid">
                <label>Fecha Gasto</label>
                <Controller
                  name="expense_date"
                  onChange={([e]) => {
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Calendar
                      dateFormat="yy-mm-dd"
                      showTime={true}
                      hourFormat="12"
                      showButtonBar={true}
                      touchUI={window.innerWidth < 768}
                    />
                  }
                />
                <p className="text-error">{errors.expense_date?.message}</p>
              </div>
              <div className="p-fluid">
                <label>Categoria Gasto</label>
                <Controller
                  name="category"
                  onChange={([e]) => {
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Dropdown
                      filter={true}
                      filterPlaceholder="Busca Aqui"
                      showClear={true}
                      filterInputAutoFocus={false}
                      options={expenseCategories}
                      style={{ width: '100%' }}
                      placeholder="Categoria Gasto"
                      optionLabel="category_name"
                    />
                  }
                />
                <p className="text-error">{errors.category?.message}</p>
              </div>
              <div className="p-fluid">
                <label>Monto</label>
                <div className="p-inputgroup">
                  <input type="text" ref={register} placeholder="Monto" name="amount" className="p-inputtext p-component p-filled" />
                  <Button
                    label={`${state.currencies.length === 0 ? 'cargando' : state.currentCurrency.currency_code}`}
                    type="button"
                    onClick={(e) => setCurrencyVisible(true)} />
                </div>
                <p className="text-error">{errors.monto?.message}</p>
              </div>
              <div className="p-fluid">
                <label>Gastado En</label>
                <input type="text" ref={register} name="spent_on" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.spent_on?.message}</p>
              </div>
              <div className="p-fluid">
                <label>Anotaciones</label>
                <textarea ref={register} rows={5} placeholder="" name="Anotaciones" className="p-inputtext p-inputtextarea p-component p-inputtextarea-resizable" />
                <p className="text-error">{errors.remarks?.message}</p>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Guardar Cambios" icon="pi pi-save"
                  className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>

  )
}

export default React.memo(EditExpense);
