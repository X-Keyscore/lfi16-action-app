import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function Product({ productId, localStoreDataProducts, setShowUpdateProduct }) {

  // Affiche la popup pour modifier le produit
  const handleUpdateProduct = (product) => {
    setShowUpdateProduct(product)
  };

  var product = localStoreDataProducts.find(element => element._id === productId)

  return (
    <div className="managerLists--product" onClick={() => handleUpdateProduct(product)}>
      <div className="preview">
        <div className="title">
          <div className="name">
            {product.name}
          </div>
        </div>
        <div className="description">
          {product.description}
        </div>
        <div className="link">
          <a href={product.coo} target="_blank" rel="noreferrer">{product.coo}</a>
        </div>
      </div>
    </div>
  );
}

export default function Sortable({ productId, localStoreDataProducts, setShowUpdateProduct }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Product productId={productId} localStoreDataProducts={localStoreDataProducts} setShowUpdateProduct={setShowUpdateProduct} />
    </div>
  );
}
