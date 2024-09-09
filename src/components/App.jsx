import React, { useState, useEffect } from 'react'

import ManagerLists from './managerLists/Lists'

import api from "../api"

import "./App.css";
import "./window.css";

function App() {
  const [dataLists, setDataLists] = useState(null);
  const [dataProducts, setDataProducts] = useState(null);
  const [manageLists, setManageLists] = useState(null);

  useEffect(() => {
    if (dataLists !== null) return

    api.getList().then(res => {
      if (res.data.status.success) {

        setDataLists(res.data.data);

      }
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  // Création d'une version Object de dataLists
  useEffect(() => {
    if (dataLists === null) return

    let objectLists;
    dataLists.forEach(list => {
      objectLists = {
        ...objectLists,
        [list._id]: list.products
      }
    })

    setManageLists(objectLists)
  }, [dataLists]);

  useEffect(() => {
    if (dataProducts !== null) return

    api.getProduct().then(res => {
      if (res.data.status.success) {
        setDataProducts(res.data.data);
      }
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  const localStore = {
    dataLists,
    setDataLists,
    manageLists,
    setManageLists,
    dataProducts,
    setDataProducts
  }

  if (dataLists === null || manageLists === null || dataProducts === null) {
    return (
      <div style={{ color: "white", fontSize: "40px", textAlign: "center" }}>
        En attente de la base de données...
      </div>
    )
  }

  return (
	<ManagerLists localStore={localStore} />
  )
}

export default App;