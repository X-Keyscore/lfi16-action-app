//https://codesandbox.io/s/github/soooji/react-multiple-containers-dnd-example/tree/main/
import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import List from "./List";
import { Product } from "./Product";
import CreateProduct from "./windowProduct/CreateProduct";
import UpdateProduct from "./windowProduct/UpdateProduct";

import "./Lists.css";

import api from "../../api"

export default function App({ localStore }) {
  const { manageLists, setManageLists } = localStore;
  const [activeId, setActiveId] = useState();

  const [showCreateProduct, setShowCreateProduct] = useState(null);
  const [showUpdateProduct, setShowUpdateProduct] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  async function createList() {
    let title = "Circuit"
    // Créeation d'une nouvelle list
    api.createList({ title }).then(res => {
      if (res.data.status.success) {
        // Pour maintenir de la synchronisation avec la base de données j'ajoute la nouvelle list à "dataLists"
        localStore.setDataLists(prev => [...prev, res.data.data]);

        // J'ajoute la nouvelle list à "manageLists"
        setManageLists((prev) => {
          return {
            ...prev,
            [res.data.data._id]: [...res.data.data.products]
          }
        })
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="lists">
         
            {manageLists && (
              // [0] = id de la list | [1] = list des "id"
              Object.entries(manageLists).map((list) => (
                <List
                  key={list[0]}
                  container={{
                    id: list[0],
                    name: localStore.dataLists.find(l => l._id === list[0]).title,
                    productsId: list[1]
                  }}
                  localStore={localStore}
                  setShowCreateProduct={setShowCreateProduct}
                  setShowUpdateProduct={setShowUpdateProduct}
                />
              ))
            )}
            <DragOverlay>{activeId ? <Product productId={activeId} localStoreDataProducts={localStore.dataProducts} /> : null}</DragOverlay>
            <div className="lists-add">
              <button type="button" onClick={createList}>Nouveau circuit</button>
            </div>
        </div>
      </DndContext>
      {showCreateProduct && (
        <CreateProduct localStore={localStore} parentListId={showCreateProduct} onClose={() => setShowCreateProduct(null)} />
      )}
      {showUpdateProduct && (
        <UpdateProduct localStore={localStore} product={showUpdateProduct} onClose={() => setShowUpdateProduct(null)} />
      )}
    </>
  );

  function findContainer(id) {
    if (id in manageLists) {
      return id;
    }

    return Object.keys(manageLists).find((key) => manageLists[key].includes(id));
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const { id } = active;
    const { id: overId } = over;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setManageLists((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id)
      const overIndex = overItems.indexOf(overId)

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const insertAfterLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          active.rect.current.translated &&
          active.rect.current.translated.offsetLeft >
          over.rect.offsetLeft + over.rect.width;

        const modifier = insertAfterLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          manageLists[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const { id } = active;
    if (!over) return;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = manageLists[activeContainer].indexOf(id);
    const overIndex = manageLists[overContainer].indexOf(overId);

    if (activeIndex !== overIndex) {
      setManageLists((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    async function moveInBase(productId, newListId, position) {
      await api.listProductsMove({ _id: productId, newListId: newListId, newProductPosition: position }).catch((err) => {
        console.log(err)
      })
    }

    moveInBase(id, overContainer, overIndex)

    setActiveId(null);
  }
}
