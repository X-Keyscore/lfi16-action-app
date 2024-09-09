import React, { useState } from "react";
import { createPortal } from 'react-dom';

import api from "../../../api"

export default function CreateProduct({ localStore, parentListId, onClose }) {
  const [inputField, setInputField] = useState({
    name: '',
    coo: '',
    description: ''
  })

  function handleChange(e) {
    const value = e.target.value;

    setInputField({
      ...inputField,
      [e.target.name]: value
    });

  }

  function submit(e) {
    var payload = {
      parentListId: parentListId,
      productField: inputField
    }
    api.createProduct(payload).then(res => {
      if (res.data.status.success) {

        // J'ajoute le nouveau produit à "dataLists"
        localStore.setDataLists((prev) => {

          // Je récupérer l'index de la liste parent du nouveau produit
          const index = prev.findIndex(list => list._id === parentListId)

          // J'ajoute l'id du produit dans sa liste
          prev[index].products = [...prev[index].products, res.data.data._id]

          return prev
        })

        // J'ajoute le nouveau produit à "dataProducts" à partir de la réponse de l'api
        localStore.setDataProducts(prev => [...prev, res.data.data]);

        // J'ajoute le nouveau produit à "manageLists"
        localStore.setManageLists((prev) => {
          return {
            ...prev,
            [parentListId]: [...prev[parentListId], res.data.data._id]
          }
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
              Créer une position
            </div>
          </div>
          <div className="windowToolBody scroller">
            <div className="windowToolBody-content">
              <div className="windowToolBody-content-block">
                <div className="title">Nom</div>
                <input className="input-large-text" type="text"
                  name="name" value={inputField.name} onChange={handleChange}
                />
              </div>
              <div className="windowToolBody-content-block">
                <div className="title">Coordonnée</div>
                <input className="input-large-text" type="text"
                  name="coo" value={inputField.coo} onChange={handleChange}
                />
              </div>
              <div className="windowToolBody-content-block">
                <div className="title">Description</div>
                <textarea className="textarea-large"
                  name="description" value={inputField.description} onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="windowToolFooter">
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
