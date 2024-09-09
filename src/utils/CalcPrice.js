export default function CalcPrice(objItem, arrProd) {

    // arrItem = [0] id item [1] data item
    var arrItem = Object.entries(objItem), totalHT = 0;

    for (let i = 0; i < arrItem.length; i++) {
        var getProd = arrProd.find(prod => prod._id === arrItem[i][1]._id)
        totalHT =+ getProd.PVHT
    }

    return totalHT
}