import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import { CSVLink, CSVDownload } from "react-csv";

import { fetchAllUser } from '../services/UserServices';
import ModalAddNew from './ModalAddNew';
import ModalEditUser from './ModalEditUser';
import ModalConfirm from './ModalConfirm';
import './TableUsers.scss';

const TableUsers = (props) => {

    const [listUsers, setListUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [dataUserEdit, setDataUserEdit] = useState({});
    const [dataUserDelete, setDataUserDelete] = useState({});
    const [sortBy, setSortBy] = useState('asc');
    const [sortField, setSortField] = useState('id');
    const [dataExport, setDataExport] = useState([]);

    const [isShowModalAddNew, setIsShowModalAddNew] = useState(false);
    const [isShowModalEdit, setIsShowModalEdit] = useState(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);

    const handleClose = () => {
        setIsShowModalAddNew(false);
        setIsShowModalDelete(false);
        setIsShowModalEdit(false);
    }

    const handleUpdateTable = (user) => {
        setListUsers([user,...listUsers]);
    }

    const handleEditUserFromModal = (user) => {
        let cloneListUsers = _.cloneDeep(listUsers);
        let index = listUsers.findIndex(item => item.id === user.id);
        cloneListUsers[index].first_name = user.first_name;
        setListUsers(cloneListUsers);
    }

    const handleEditUser = (user) => {
        setDataUserEdit(user);
        setIsShowModalEdit(true);
    }

    const handleDeleteUser = (user) => {
        setIsShowModalDelete(true);
        setDataUserDelete(user);
    }

    const handleDeleteUserFromModal = (user) => {
        let cloneListUsers = _.cloneDeep(listUsers);
        cloneListUsers = cloneListUsers.filter(item => item.id !== user.id)
        setListUsers(cloneListUsers);
    }

    const handleSort = (sortBy, sortField) => {
        setSortBy(sortBy);
        setSortField(sortField);

        let cloneListUsers = _.cloneDeep(listUsers);
        cloneListUsers = _.orderBy(cloneListUsers, [sortField], [sortBy]);
        setListUsers(cloneListUsers);
    }

    useEffect(() => {
        //Call API
        getUsers(1);
    }, []);

    const getUsers = async (page) => {
        let res = await fetchAllUser(page); 

        if(res && res.data) {
            setTotalUsers(res.total);
            setListUsers(res.data);
            setTotalPages(res.total_pages);
        }
    }

    const handlePageClick = (event) => {
        getUsers(+event.selected + 1);
    }

    const getUsersExport = (event, done) => {
        let result = [];
        if (listUsers && listUsers.length > 0) {
            result.push(["Id", "Email", "First Name", "Last Name"]);
            listUsers.map((item, index) => {
                let arr = []
                arr[0] = item.id;
                arr[1] = item.email;
                arr[2] = item.first_name;
                arr[3] = item.last_name;
                result.push(arr);
            })

            setDataExport(result);
            done();
        }
    }

    return (
    <>
        <div className='my-3 add-new'>
              <span><b>List Users:</b></span>
              <div className='group-btn'>
                <label htmlFor='test' className='btn btn-warning'>
                    <i className="fa-solid fa-file-import"></i> Import
                </label>
                <input id='test' type='file' hidden/>

                <CSVLink 
                    filename={"users.csv"}
                    className="btn btn-primary"
                    data={dataExport}
                    asyncOnClick={true}
                    onClick={getUsersExport}
                > <i className="fa-solid fa-file-arrow-down"></i> Export</CSVLink>
                <button className='btn btn-success' 
                    onClick={() => setIsShowModalAddNew(true)}>
                    <i className="fa-solid fa-circle-plus"></i>
                    Add new
                </button>
              </div>
        </div>
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>
            <div className='sort-header'>
                <span>ID</span>
                <span>
                    <i className="fa-solid fa-arrow-down"
                        onClick={() => handleSort('desc', 'id')}
                    ></i>
                    <i className="fa-solid fa-arrow-up"
                        onClick={() => handleSort('asc', 'id')}
                    ></i>
                </span>
            </div>
          </th>
          <th className='sort-header'>Email</th>
          <th>
            <div className='sort-header'>
                <span>First Name</span>
                <span>
                    <i className="fa-solid fa-arrow-down"
                        onClick={() => handleSort('desc', 'first_name')}
                    ></i>
                    <i className="fa-solid fa-arrow-up"
                        onClick={() => handleSort('asc', 'first_name')}
                    ></i>
                </span>
            </div>
          </th>
          <th>Last Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {listUsers && listUsers.length > 0 &&
            listUsers.map((item, index) => {
                return (
                    <tr key={`users-${index}`}>
                        <td>{item.id}</td>
                        <td>{item.email}</td>
                        <td>{item.first_name}</td>
                        <td>{item.last_name}</td>
                        <td>
                            <button className='btn btn-warning mx-3' 
                                onClick={() => handleEditUser(item)}>
                                    Edit
                            </button>
                            <button 
                                onClick={() => handleDeleteUser(item)}
                                className='btn btn-danger'>
                                    Delete
                            </button>
                        </td>
                    </tr>
                )
            })
        }
      </tbody>
    </Table>
    <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={totalPages}
        previousLabel="< previous"

        pageClassName='page-item'
        pageLinkClassName='page-link'
        previousClassName='page-item'
        previousLinkClassName='page-link'
        nextClassName='page-item'
        nextLinkClassName='page-link'
        breakClassName='page-item'
        breakLinkClassName='page-link'
        containerClassName='pagination'
        activeClassName='active'
    />
    <ModalAddNew 
        show={isShowModalAddNew}
        handleClose={handleClose}
        handleUpdateTable={handleUpdateTable}
    />
    <ModalEditUser 
        show={isShowModalEdit}
        dataUserEdit={dataUserEdit}
        handleClose={handleClose}
        handleEditUserFromModal={handleEditUserFromModal}
    />
    <ModalConfirm 
        show={isShowModalDelete}
        handleClose={handleClose}
        dataUserDelete={dataUserDelete}
        handleDeleteUserFromModal={handleDeleteUserFromModal}
    />
    </>)
} 

export default TableUsers;
