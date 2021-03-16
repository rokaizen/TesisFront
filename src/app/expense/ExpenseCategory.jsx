import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import * as yup from 'yup';
import { Link } from "react-router-dom";
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

import { Messages } from 'primereact/messages';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Column } from 'primereact/column';

import { expenseApiEndpoints } from './../../API';
import axios from './../../Axios';

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

const expenseCategoryValidationSchema = yup.object().shape({
  category_name: yup.string().required('Nombre de categoria es requerido').max(100, 'Nombre de categoria debe tener un maximo de 100 caracteres'),
});

const ExpenseCategory = (props) => {

  const { register, handleSubmit, reset, errors, setError } = useForm({
    validationSchema: expenseCategoryValidationSchema
  });
  const [datatable, setDatatable] = useState({
    sortField: 'id',
    sortOrder: -1,
    rowsPerPage: 5,
    currentPage: 1
  });
  const [expenseCategories, setExpenseCategories] = useState({
    categories: {},
    fetching: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    requestExpenseCategories();
  }, [datatable]);

  const requestExpenseCategories = async (rows = 5, page = 1) => {
    setExpenseCategories({
      ...expenseCategories,
      fetching: true
    });
    await axios.get(expenseApiEndpoints.expenseCategory + '?page=' + page + '&per_page=' + rows + '&sort_col=' + datatable.sortField + '&sort_order=' + (datatable.sortOrder === 1 ? 'asc' : 'desc'), {})
      .then(response => {
        // console.log(response.data);
        if (response.data.data) {
          setExpenseCategories({
            ...expenseCategories,
            categories: response.data,
            fetching: false
          });
        }
        else {

        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const deleteExpenseCategory = (data) => {
    // console.log(data);
    StyledSwal.fire({
      title: 'Estas seguro?',
      text: `Confirmas eliminar la categoria ${data.category_name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<span class="pi pi-trash p-button-icon-left"></span><span class="p-button-text">Borrar</span>',
      cancelButtonText: '<span class="pi pi-ban p-button-icon-left"></span><span class="p-button-text">No</span>',
      // confirmButtonColor: '#f76452',
      // cancelButtonColor: '#3085d6',
      focusConfirm: false,
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        axios.delete(expenseApiEndpoints.expenseCategory + '/' + data.id, {})
          .then(response => {
            // console.log(response.data);
            if (response.status === 200) {

              requestExpenseCategories();

              messages.show({
                severity: 'success',
                detail: 'Tu categoria de gasto ' + data.category_name + ' ha sido borrada exitosamente.',
                sticky: false,
                closable: false,
                life: 5000
              });
            }

          })
          .catch(error => {
            // console.log('error');
            // console.log(error.response);
            if (error.response.status === 409) {
              messages.clear();
              messages.show({
                severity: 'error',
                detail: 'Categoria de gasto ' + data.category_name + ' en uso.',
                sticky: true,
                closable: true,
                life: 5000
              });
            }

            if (error.response.status === 401) {
              messages.clear();
              messages.show({
                severity: 'error',
                detail: 'Algo salio mal. Intente nuevamente.',
                sticky: true,
                closable: true,
                life: 5000
              });
            }

          });
      }
    });
  };

  const submitExpenseCategory = (data) => {
    axios.post(expenseApiEndpoints.expenseCategory, JSON.stringify(data))
      .then(response => {
        // console.log('success', response.data);

        if (response.status === 201) {

          reset();
          setSubmitting(false);
          requestExpenseCategories();

          messages.show({
            severity: 'success',
            detail: 'Nueva categoria de gasto' + response.data.request.category_name + ' agregada.',
            sticky: false,
            closable: false,
            life: 5000
          });
        }

      })
      .catch(error => {
        console.log('error');
        console.log(error.response);

        if (error.response.status === 401) {
          messages.clear();
          messages.show({
            severity: 'error',
            detail: 'Algo salio mal. Intente nuevamente.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }

        if (error.response.status === 422) {
          let errors = Object.entries(error.response.data).map(([key, value]) => {
            return { name: key, message: value[0] }
          });
          setError(errors);
        }

        setSubmitting(false)
      })
  };

  return (
    <div>
      <Helmet title="Categoria Gastos" />

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
              <div className="p-card-title p-grid p-nogutter p-justify-between">Agregar categoria de gasto</div>
              {/* <div className="p-card-subtitle">Enter expense category name below.</div> */}
            </div>
            <br />
            <form onSubmit={handleSubmit(submitExpenseCategory)}>
              <div className="p-fluid">
                <input type="text" ref={register} placeholder="Nombre Categoria" name="category_name" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.category_name?.message}</p>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Agregar categoria" icon="pi pi-plus"
                  className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div className='p-grid'>
              <div className='p-col-6'>
                <div className="p-card-title p-grid p-nogutter p-justify-between">Categoria de gastos</div>
                {/* <div className="p-card-subtitle">Here are list of expense categories.</div> */}
              </div>
              <div className="p-col-6" align="right">
                {expenseCategories.fetching ? <ProgressSpinner style={{ height: '25px', width: '25px' }} strokeWidth={'4'} /> : ''}
              </div>
            </div>
            <br />
            <DataTable value={expenseCategories.categories.data}
              sortField={datatable.sortField}
              sortOrder={datatable.sortOrder}
              responsive={true}
              paginator={true}
              rows={datatable.rowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              totalRecords={expenseCategories.categories.total}
              lazy={true}
              first={expenseCategories.categories.from - 1}
              onPage={(e) => {
                console.log(e);
                setDatatable({
                  ...datatable,
                  rowsPerPage: e.rows
                })
                requestExpenseCategories(e.rows, (e.page + 1))
              }}
              onSort={e => {
                // console.log(e);
                setDatatable({
                  ...datatable,
                  sortField: e.sortField,
                  sortOrder: e.sortOrder,
                })
              }}
              className="text-center"
            >
              <Column field="id" header="ID" sortable={true} />
              <Column field="category_name" header="Nombre Categoria" sortable={true} />
              <Column
                body={(rowData, column) => {
                  // console.log(rowData);
                  return (
                    <div>
                      <Link to={`/expense/category/${rowData.id}/edit`}><Button label="Editar"
                        value={rowData.id}
                        icon="pi pi-pencil"
                        className="p-button-raised p-button-rounded p-button-info" /></Link>
                      <Button label="Borrar"
                        onClick={() => deleteExpenseCategory(rowData)}
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

export default React.memo(ExpenseCategory);
