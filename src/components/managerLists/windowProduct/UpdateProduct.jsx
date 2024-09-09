import React, { useState } from "react";
import { createPortal } from 'react-dom';

import { IconDelete } from "../../../svg";

import api from "../../../api"

export default function UpdateProduct({ localStore, product, onClose }) {
  const [inputField, setInputField] = useState({
    name: product.name,
    coo: product.coo,
    description: product.description
  })


  function handleChangeInput(e) {
    const value = e.target.value;

    setInputField({
      ...inputField,
      [e.target.name]: value
    });
  }

  function handleDeleteProduct() {

    api.deleteProduct(product._id).then(res => {
      if (res.data.status.success) {
        const updateList = res.data.data

        // Je supprime le produit de "dataLists"
        localStore.setDataLists(prevLists => {

          // Je récupérer l'index de la liste parent du produit à supprimer
          const index = prevLists.findIndex(list => list._id === updateList._id)

          // Je supprime le produit de sa liste à l'aide de l'index
          prevLists[index].products = prevLists[index].products.filter(prevProduct => prevProduct !== product._id)
        
          return prevLists
        })

        // Je supprime le produit de "dataProducts"
        localStore.setDataProducts(prevProducts => {
          return prevProducts.filter(prevProduct => prevProduct._id !== product._id)
        })

        // Je supprime l'id du produit de "manageLists"
        localStore.setManageLists(prevLists => {
          prevLists[updateList._id] = prevLists[updateList._id].filter(prevList => prevList !== product._id)

          return prevLists
        })

      }
      onClose()
    }).catch((err) => {
      console.error(err);
    });
  }

  async function submit(e) {
    var payload = {
      productId: product._id,
      productField: inputField
    }

    api.updateProduct(payload).then(res => {
      if (res.data.status.success) {

        // Je je mets à jour le produit dans "dataProducts"
        localStore.setDataProducts(prevProducts => {
          const index = prevProducts.findIndex(abj => abj._id === res.data.data._id);

          prevProducts[index] = res.data.data

          return prevProducts
        })

      }
      onClose()
    }).catch((err) => {
      console.error(err);
    });
  }

  return (
    createPortal(
      <div className="window">
        <div className="window-backdrop" onClick={onClose}></div>
        <form className="window-container">
          <div className="windowToolHeader">
            <div className="windowToolHeader-title">
              Modifier la position
            </div>
          </div>
          <div className="windowToolBody scroller">
            <div className="windowToolBody-content">
              <div className="windowToolBody-content-block">
                <div className="title">Nom</div>
                <input className="input-large-text" type="text"
                  name="name" value={inputField.name} onChange={handleChangeInput}
                />
              </div>
              <div className="windowToolBody-content-block">
                <div className="title">Coordonnée</div>
                <input className="input-large-text" type="text"
                  name="url" value={inputField.coo} onChange={handleChangeInput}
                />
              </div>
              <div className="windowToolBody-content-block">
                <div className="title">Description</div>
                <textarea className="textarea-large"
                  name="description" value={inputField.description} onChange={handleChangeInput}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="windowToolFooter">
            <div className="windowToolFooter-contentLeft">
              <button className="btn-icon-red" type="button" onClick={handleDeleteProduct}>
                <IconDelete />
              </button>
            </div>
            <div className="windowToolFooter-contentRight">
              <button className="btn-text-default" type="button" onClick={submit}>Sauvegarder</button>
              <button className="btn-text-simple" type="button" onClick={onClose}>
                <div className="content">Annuler</div>
              </button>
            </div>
          </div>
        </form>
      </div>
      , document.body
    )
  );
}
