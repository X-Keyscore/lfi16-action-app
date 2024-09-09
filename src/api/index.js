import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const createList = (payload) => api.post(`/list/create`, payload)

const getList = () => api.get(`/list/get`)

const updateListTitle = (payload) => api.put(`/list/title/update`, payload)

const listProductsMove = (payload) => api.put(`/list/products/move`, payload)

const deleteList = (_id) => api.delete(`/list/delete/id/${_id}`)


const createProduct = (payload) => api.post(`/product/create`, payload)

const getProduct = () => api.get(`/product/get`)

const updateProduct = (payload) => api.put(`/product/update`, payload)

const deleteProduct = (_id) => api.delete(`/product/delete/id/${_id}`)

const route = {
    createList,
    getList,
    updateListTitle,
    listProductsMove,
    deleteList,

    createProduct,
    getProduct,
    updateProduct,
    deleteProduct
};

export default route;
