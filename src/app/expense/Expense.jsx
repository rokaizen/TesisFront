import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import * as yup from 'yup';
import * as dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

import { Messages } from 'primereact/messages';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

import CurrencySidebar from './../common/CurrencySidebar';

import axios from './../../Axios';
import { expenseApiEndpoints } from './../../API';
import { useTracked } from './../../Store';


const StyledSwal = Swal.mixin({
  customClass: {
    container: 'container-class',
    popup: 'popup-class',
    header: 'header-class',
    title: 'p-card-title',
    content: 'content-class',
    closeButton: 'close-button-class',
    image: 'image-class',
    input: 'input-class',
    actions: 'actions-class',
    confirmButton: 'p-button p-button-raised p-button-danger p-button-text-icon-left',
    cancelButton: 'p-button p-button-raised p-button-info p-button-text-icon-left',
    footer: 'footer-class'
  },
  buttonsStyling: false
});

let messages;

const addExpenseValidationSchema = yup.object().shape({
  expense_date: yup.string().required('Ingrese Fecha del Gasto'),
  category: yup.object().required('Ingrese Categoria del Gasto'),
  amount: yup.string().required('Ingrese Monto del Gasto'),
  spent_on: yup.string().required('Gastado en es requerido').max(100, 'Debe tener como maximo 100 caracteres'),
  remarks: yup.string().max(200, 'Comentarios deben tener como maximo 200 caracteres'),
});

const Expense = (props) => {

  const [state] = useTracked();
  const { register, handleSubmit, setValue, errors, setError, reset, control } = useForm({
    validationSchema: addExpenseValidationSchema
  });
  const [datatable, setDatatable] = useState({
    sortField: 'id',
    sortOrder: -1,
    rowsPerPage: 5,
    currentPage: 1
  });
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [expenseSummary, setExpenseSummary] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expense, setExpense] = useState({ expenses: {}, fetching: true });

  useEffect(() => {
    requestExpenseSummary();
    requestExpenseCategory();
  }, []);

  useEffect(() => {
    requestExpense();
  }, [datatable]);

  const requestExpenseCategory = async () => {
    await axios.get(expenseApiEndpoints.expenseCategory + '?sort_col=category_name&sort_order=asc', {})
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

  const requestExpense = async () => {
    setExpense({ ...expense, fetching: true });
    await axios.get(expenseApiEndpoints.expense + '?page=' + datatable.currentPage + '&sort_col=' + datatable.sortField + '&per_page=' + datatable.rowsPerPage + '&sort_order=' + (datatable.sortOrder > 0 ? 'asc' : 'desc'), {})
      .then(response => {
        // console.log('success', response.data);
        if (response.data.data) {
          setExpense({
            ...expense,
            expenses: response.data,
            fetching: false
          });
        }
        else {
          setExpense({
            ...expense,
            fetching: false
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const requestExpenseSummary = async () => {
    await axios.get(expenseApiEndpoints.summary, {})
      .then(response => {
        // console.log(response.data);
        setExpenseSummary(response.data.data);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const deleteExpense = (data) => {
    // console.log(data);
    StyledSwal.fire({
      title: 'Estas Seguro?',
      text: `Confirma para borrar gasto ${data.spent_on}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<span class="pi pi-trash p-button-icon-left"></span><span class="p-button-text">Borrar</span>',
      cancelButtonText: '<span class="pi pi-ban p-button-icon-left"></span><span class="p-button-text">No</span>',
      // confirmButtonColor: '#f76452',
      // cancelButtonColor: '#3085d6',
      focusConfirm: false,
      focusCancel: true
    })
      .then((result) => {
        if (result.value) {
          axios.delete(expenseApiEndpoints.expense + '/' + data.id, {})
            .then(response => {
              // console.log(response.data);
              if (response.status === 200) {

                requestExpense();
                requestExpenseSummary();

                messages.show({
                  severity: 'success',
                  detail: 'Tu Gasto ' + data.spent_on + ' fue borrado exitosamente.',
                  sticky: false,
                  closable: false,
                  life: 5000
                });
              }

            })
            .catch(error => {
              console.log('error', error.response);

              if (error.response.status === 401) {
                messages.clear();
                messages.show({
                  severity: 'error',
                  detail: 'Algo salio mal. Intenta nuevamente.',
                  sticky: true,
                  closable: true,
                  life: 5000
                });
              }

            });
        }
      });
  };

  const submitExpense = (data) => {

    data.category_id = data.category.id;
    data.currency_id = state.currentCurrency.id;
    data.expense_date = dayjs(data.expense_date).format('YYYY-MM-DD HH:mm:ss');

    axios.post(expenseApiEndpoints.expense, JSON.stringify(data))
      .then(response => {
        // console.log('success');
        if (response.status === 201) {
          reset();
          setSubmitting(false);
          setValue('expense_date', dayjs(response.data.request.expense_date).toDate());
          requestExpense();
          requestExpenseSummary();

          messages.show({
            severity: 'success',
            detail: 'Tu gasto ' + response.data.request.spent_on + ' fue agregado.',
            sticky: false,
            closable: false,
            life: 5000
          });
        }
      })
      .catch(error => {
        console.log('error', error.response);

        if (error.response.status === 401) {
          messages.clear();
          messages.show({
            severity: 'error',
            detail: 'Algo salio mal. Intenta nuevamente.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }
        else if (error.response.status === 422) {
          let errors = Object.entries(error.response.data).map(([key, value]) => {
            return { name: key, message: value[0] }
          });
          setError(errors);
        }

        setSubmitting(false)
      })
  };

  const renderExpenseSummary = (data) => {
    if (data && data.length > 0) {
      return data.map((item, index) => {
        return <div key={index}>
          <div className="color-link text-center">{item.total.toLocaleString()} <span className="color-title">{item.currency_code + '.'}</span></div>
          <hr />
        </div>
      })
    }
    else {
      return <div>
        <div className="text-center">No se encontro informacion de gastos.</div>
        <hr />
      </div>
    }
  };

  return (
    <div>
      <Helmet title="Gastos" />

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
          <div className="p-fluid">

            <div className="p-grid">
              <div className="p-col-6">
                <div className="p-panel p-component">
                  <div className="p-panel-titlebar"><span className="color-title text-bold">Gastos Este Mes</span>
                  </div>
                  <div className="p-panel-content-wrapper p-panel-content-wrapper-expanded" id="pr_id_1_content"
                    aria-labelledby="pr_id_1_label" aria-hidden="false">
                    <div className="p-panel-content">
                      {renderExpenseSummary(expenseSummary.expense_month)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-col-6">
                <div className="p-panel p-component">
                  <div className="p-panel-titlebar"><span className="color-title text-bold">Gastos de Hoy </span></div>
                  <div className="p-panel-content-wrapper p-panel-content-wrapper-expanded" id="pr_id_1_content"
                    aria-labelledby="pr_id_1_label" aria-hidden="false">
                    <div className="p-panel-content">
                      {renderExpenseSummary(expenseSummary.expense_today)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="p-grid">

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Agregar Gasto</div>
              <div className="p-card-subtitle">Ingresa la información de tu gasto.</div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitExpense)}>
              <div className="p-fluid">
                <Controller
                  name="expense_date"
                  defaultValue={new Date()}
                  onChange={([e]) => {
                    // console.log(e);
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Calendar
                      dateFormat="yy-mm-dd"
                      showTime={true}
                      hourFormat="12"
                      showButtonBar={true}
                      maxDate={new Date()}
                      touchUI={window.innerWidth < 768}
                    />
                  }
                />
                <p className="text-error">{errors.expense_date?.message}</p>
              </div>
              <div className="p-fluid">
                <Controller
                  name="category"
                  onChange={([e]) => {
                    return e.value
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
                <input type="text" ref={register} placeholder="Gastado en" name="spent_on" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.spent_on?.message}</p>
              </div>
              <div className="p-fluid">
                <div className="p-inputgroup">
                  <input type="number" step="0.00" ref={register} keyfilter="money" placeholder="Monto" name="amount" className="p-inputtext p-component p-filled" />
                  <Button
                    label={`${state.currencies.length === 0 ? 'cargando' : state.currentCurrency.currency_code}`}
                    type="button"
                    onClick={(e) => setCurrencyVisible(true)} />
                </div>
                <p className="text-error">{errors.amount?.message}</p>
              </div>
              <div className="p-fluid">
                <textarea ref={register} rows={5} placeholder="Comentarios" name="remarks" className="p-inputtext p-inputtextarea p-component p-inputtextarea-resizable" />
                <p className="text-error">{errors.remarks?.message}</p>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Agregar gasto" icon="pi pi-plus"
                  className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div className='p-grid'>
              <div className='p-col-6'>
                <div className="p-card-title p-grid p-nogutter p-justify-between">Vista de Gastos</div>
                {/* <div className="p-card-subtitle">Here are few expenses you've added.</div> */}
              </div>
              <div className="p-col-6" align="right">
                {expense.fetching ? <ProgressSpinner style={{ height: '25px', width: '25px' }} strokeWidth={'4'} /> : ''}
              </div>
            </div>
            <br />
            <DataTable value={expense.expenses.data}
              sortField={datatable.sortField}
              sortOrder={datatable.sortOrder}
              responsive={true}
              paginator={true}
              rows={datatable.rowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              totalRecords={expense.expenses.total}
              lazy={true}
              first={expense.expenses.from - 1}
              onPage={(e) => {
                // console.log(e);
                setDatatable({
                  ...datatable,
                  currentPage: (e.page + 1),
                  rowsPerPage: e.rows,
                });
                setExpense({
                  ...expense,
                  fetching: false
                });
              }}
              onSort={e => {
                // console.log(e);
                setDatatable({
                  ...datatable,
                  sortField: e.sortField,
                  sortOrder: e.sortOrder,
                });
                setExpense({
                  ...expense,
                  fetching: false
                });
              }}
              className="text-center"
            >
              <Column field="id" header="ID" sortable={true} />
              <Column field="spent_on" header="Gastado en" sortable={true} />
              <Column field="category_name" header="Categoria" sortable={true} />
              <Column field="amount" header="Monto" sortable={true}
                body={(rowData, column) => {
                  return rowData.amount.toLocaleString() + ' ' + rowData.currency_name
                }}
              />
              <Column field="transaction_date" header="Fecha" sortable={true}
                body={(rowData, column) => {
                  return dayjs(rowData.transaction_date).format('YYYY-MM-DD hh:mm a')
                }}
              />
              <Column
                body={(rowData, column) => {
                  // console.log(rowData);
                  return (
                    <div>
                      <Link to={`/expense/${rowData.id}/edit`}>
                        <Button label="Editar" value={rowData.id}
                          icon="pi pi-pencil"
                          className="p-button-raised p-button-rounded p-button-info" />
                      </Link>
                      <Button label="Borrar"
                        onClick={() => deleteExpense(rowData)}
                        icon="pi pi-trash"
                        className="p-button-raised p-button-rounded p-button-danger" />
                    </div>
                  )
                }}
                header="Accion"
                style={{ textAlign: 'center', width: '8em' }}
              />
            </DataTable>
          </Card>
        </div>

      </div>
    </div>

  )
}

export default Expense;
