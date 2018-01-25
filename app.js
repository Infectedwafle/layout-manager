let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let start = function() {
	let parts = [
		{
			Length: 10,
			Width: 5,
			Quantity: 2
		},
		{
			Length: 5,
			Width: 2.5,
			Quantity: 4
		},
		{
			Length: 2.5,
			Width: 2.5,
			Quantity: 8
		}
	];
	let materialWidth = 15;
	let totalQuantity = 1;

	calculateLayout(parts, materialWidth, totalQuantity);
}

let calculateLayout = function(parts, materialWidth, totalQuantity) {
	materialWidth = materialWidth - 1; // outside inch is unusable

	let partImages = [];
	let Inches = 0; // need better name
	for(let i = 0; i < parts.length; i++) {
		let currentLength = 0;
		let quantity = parts[i].Quantity;

		if(quantity > 0) {
			let currentWidth = materialWidth;	
			let usageCalculations = calculatePartLayout(currentLength, currentWidth, parts[i].Length, parts[i].Width, quantity);
		}
	}

	draw();	
}

/**
 * [calculatePartLayout description]
 * @param  {[type]} currentLength [description]
 * @param  {[type]} currentWidth  [description]
 * @param  {[type]} partLength    [description]
 * @param  {[type]} partWidth     [description]
 * @param  {[type]} quantity      [description]
 * @return {[type]}               [description]
 */
let calculatePartLayout = function(currentLength, currentWidth, partLength, partWidth, quantity) {
	let remainingLength = 0;

	let qtyLength1 = Math.floor(currentWidth / partLength); //LW
	let qtyWidth1 = Math.floor(currentWidth / partWidth); //LQ

	// Check how much area is used by laying the parts until a remainder is found
	let remainingLength1 = 0;
	let remainingWidth1 = 0;
	let remainingArea1 = 0;
	let remainingQuantity1 = 0;
	if(qtyLength1 > 0 && qtyWidth1 > 0) {
		let qtyPartsAcrossMaterialWidth = 1;
		if(quantity > qtyLength1) {
			qtyPartsAcrossMaterialWidth = qtyLength1;
		} else {
			qtyPartsAcrossMaterialWidth = quantity
		}

		remainingWidth1 = currentWidth - (partLength * qtyPartsAcrossMaterialWidth);
		
		let qtyPartsAcrossMaterialLength = quantity / qtyPartsAcrossMaterialWidth;
		if(qtyPartsAcrossMaterialLength > qtyWidth1) {
			qtyPartsAcrossMaterialLength = qtyWidth1;
		}

		if(currentLength === 0) {
			remainingLength1 = partWidth * qtyPartsAcrossMaterialLength;
			remainingQuantity1 = quantity * qtyLength1;
			qtyWidth1 = quantity;
		} else {
			remainingLength1 = currentLength;
			remainingQuantity1 = qtyLength1 * qtyWidth1;
		}

		remainingArea1 = remainingLength1 * remainingWidth1;
	} else {
		remainingWidth1 = currentWidth;
		remainingLength1 = currentLength;
		remainingQuantity1 = 0;
		remainingArea1 = 100000;
	}

	// Check how much area is needed for the remainder of the parts and the most efficient way to lay them out
	let qtyLength2 = Math.floor(currentWidth / partWidth); // WW
	let qtyWidth2 = Math.floor(currentWidth / partLength); // WQ

	let remainingLength2 = 0;
	let remainingWidth2 = 0;
	let remainingArea2 = 0;
	let remainingQuantity2 = 0;
	if(qtyLength2 > 0 && qtyWidth2 > 0) {
		let qtyPartsAcrossMaterialWidth = 1;
		if(quantity > qtyLength2) {
			qtyPartsAcrossMaterialWidth = qtyLength2;
		} else {
			qtyPartsAcrossMaterialWidth = quantity
		}

		remainingWidth2 = currentWidth - (partWidth * qtyPartsAcrossMaterialWidth);
		
		let qtyPartsAcrossMaterialLength = quantity / qtyPartsAcrossMaterialWidth;
		let remainingPartsCount = quantity - (qtyPartsAcrossMaterialLength * qtyPartsAcrossMaterialWidth);
		if(qtyPartsAcrossMaterialLength > qtyWidth2) {
			qtyPartsAcrossMaterialLength = qtyWidth2;
		}

		if(currentLength === 0) {
			remainingLength2 = partWidth * qtyPartsAcrossMaterialLength;
			remainingQuantity2 = quantity * qtyLength2;
			qtyWidth2 = quantity;
		} else {
			remainingLength2 = currentLength;
			remainingQuantity2 = qtyLength2 * qtyWidth2;
		}

		remainingArea2 = remainingLength1 * remainingWidth1;
	} else {
		remainingWidth2 = currentWidth;
		remainingLength2 = currentLength;
		remainingQuantity2 = 0;
		remainingArea2 = 100000;
	}

	if(remainingArea1 < remainingArea2) {
		currentLength = remainingLength1;
		currentWidth = remainingWidth1;

	} else {

	}

	console.log(currentLength, currentWidth);
	return {
		currentLength: currentLength,
		currentWidth: currentWidth,
		remainingLength: remainingLength
	}
}


let draw = function() {
	ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
}

document.addEventListener('DOMContentLoaded', start(), false);