import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
	verticalListSortingStrategy,
	SortableContext
} from "@dnd-kit/sortable";

import SortableProducts from "./Product";

import { IconCrossAdd, IconCrossDelete, IconCheck } from "../../svg";

import api from "../../api"

export default function Container({ container, localStore, setShowCreateProduct, setShowUpdateProduct }) {
	const { setNodeRef } = useDroppable({ id: container.id });
	const [inputContainerName, setInputContainerName] = useState(container.name);

	async function updateContainerName() {
		if (!inputContainerName) return;

		await api.updateListTitle({ _id: container.id, title: inputContainerName }).then(res => {
			// Maintien de la synchro avec bdd
			if (res.data.status.success) {
				return localStore.setDataLists((prev) => {
					let listIndex = prev.findIndex(list => list._id === container.id)
					if (listIndex === -1) return;

					return [
						...prev.slice(0, listIndex),
						{ ...prev[listIndex], title: inputContainerName },
						...prev.slice(listIndex + 1),
					]
				});
			} else return setInputContainerName(inputContainerName);
		}).catch((err) => {
			console.log(err)
		})
	}

	async function deleteList() {
		if (container.productsId.length !== 0) return;

		await api.deleteList(container.id).then(res => {
			if (res.data.status.success) {

				localStore.setDataLists(prev => [
					...prev.filter(list => list._id !== container.id)
				]);

				// Je supprime la list de "manageLists"
				localStore.setManageLists((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.includes(container.id))))
			}
		}).catch((err) => {
			console.log(err)
		})
	}

	function generateGoogleMapsLink(coordinates) {
		let origin = 'Ma+position';
		
		let destination = coordinates[coordinates.length - 1];
		
		let waypoints = coordinates.slice(0, coordinates.length - 1).join('|');
		
		let googleMapsLink = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
		
		if (waypoints) {
			googleMapsLink += `&waypoints=${waypoints}`;
		}
		
		return googleMapsLink;
	}

	function createLink () {
		var listCoo = [];
		container.productsId.map((productId) => {
			const product = localStore.dataProducts.find(element => element._id === productId);
			listCoo.push(product.coo.replace(/\s/g, ''));
		})

		const link = generateGoogleMapsLink(listCoo);

		return (link);
	}
	createLink();
	return (
		<div>
			<div className="managerLists-table-list-header">
				<div className="managerLists-table-list-header-title">
					<input className="input-text" type="text" value={inputContainerName} onChange={e => setInputContainerName(e.target.value)} />
				</div>
				<div className="managerLists-table-list-header-action">
					<button
						className="btn-icon-default"
						style={{ display: inputContainerName === container.name ? "none" : null }}
						onClick={updateContainerName}
					>
						<IconCheck />
					</button>
					<button className="btn-icon-default" onClick={deleteList}>
						<IconCrossDelete />
					</button>
				</div>
			</div>
			<div className="managerLists-table-list-link">
				<a href={createLink()}>Parcours maps</a>
			</div>
			<SortableContext items={container.productsId} strategy={verticalListSortingStrategy}>
				<div className="managerLists-table-list-sublist" ref={setNodeRef}>
					{
						container.productsId.map((productId) => (
							<SortableProducts
								key={productId}
								productId={productId}
								localStoreDataProducts={localStore.dataProducts}
								setShowUpdateProduct={setShowUpdateProduct}
							/>
						))
					}
					<div className="managerLists-table-list-sublist-addProduct" onClick={() => setShowCreateProduct(container.id)}>
						<button type="button">
							<IconCrossAdd />
						</button>
					</div>
				</div>
			</SortableContext>
		</div>
	);
}
