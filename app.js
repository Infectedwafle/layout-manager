let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let start = function() {
	let parts = [
		{
			Id: 1,
			Length: 10,
			Width: 5,
			Quantity: 2
		},
		{
			Id: 2,
			Length: 5,
			Width: 2.5,
			Quantity: 4
		},
		{
			Id: 3,
			Length: 2.5,
			Width: 2.5,
			Quantity: 8
		}
	];
	let materialWidth = 15;
	let materialLength = null;
	let totalQuantity = 1;

	calculateLayout(parts, materialLength, materialWidth, totalQuantity);
}

let calculateLayout = function(parts, materialLength, materialWidth, totalQuantity) {
	materialWidth = materialWidth - 1; // outside inch is unusable
	materialLength = (materialLength || 100000) - 1;
	let materialIndexWidth = 0;
	let materialIndexLength = 0;
	let currentLength = materialLength;
	let currentWidth = materialWidth;

	let partImages = [ {x:0, y:0, length: materialLength || 100000, width: materialWidth  }];
	for(let i = 0; i < parts.length; i++) {
		let currentWidth = materialWidth;	
		let usageCalculations = newLayoutMethod(materialLength, materialWidth, parts[i].Length, parts[i].Width, parts[i].Quantity, currentLength, currentWidth, parts[i].Id);
		//console.log(usageCalculations);
		partImages = partImages.concat(usageCalculations.partImages);
		materialIndexWidth = usageCalculations.materialIndexWidth;
		materialIndexLength = usageCalculations.materialIndexLength;
	}

	console.log(partImages);
	draw(partImages);	
}

let calculatePartLayout = function(materialWidth, currentLength, currentWidth, partLength, partWidth, quantity, materialIndexLength, materialIndexWidth, partId) {
	let remainingLength = 0;	
	let partImages = [];

	let qtyLength1 = Math.floor(currentWidth / partLength); //LW
	let qtyWidth1 = Math.floor(currentLength / partWidth); //LQ

	// Check how much area is used by laying the parts until a remainder is found
	let remainingLength1 = 0;
	let remainingWidth1 = 0;
	let remainingArea1 = 0;
	let remainingQuantity1 = 0;
	let qtyPartsAcrossMaterialWidth1 = 1;
	let qtyPartsAcrossMaterialLength1 = 0;
	if(qtyLength1 > 0 && qtyWidth1 > 0) {
		if(quantity > qtyLength1) {
			qtyPartsAcrossMaterialWidth1 = qtyLength1;
		} else {
			qtyPartsAcrossMaterialWidth1 = quantity
		}

		remainingWidth1 = currentWidth - (partLength * qtyPartsAcrossMaterialWidth1);
		
		qtyPartsAcrossMaterialLength1 = quantity / qtyPartsAcrossMaterialWidth1;
		if(qtyPartsAcrossMaterialLength1 > qtyWidth1) {
			qtyPartsAcrossMaterialLength1 = qtyWidth1;
		}

		if(currentLength === 100000) {
			remainingLength1 = partWidth * qtyPartsAcrossMaterialLength1;
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
	let qtyLength2 = Math.floor(currentWidth / partWidth); // WW // backwards
	let qtyWidth2 = Math.floor(currentLength / partLength); // WQ

	let remainingLength2 = 0;
	let remainingWidth2 = 0;
	let remainingArea2 = 0;
	let remainingQuantity2 = 0;
	let qtyPartsAcrossMaterialWidth2 = 1;
	let qtyPartsAcrossMaterialLength2 = 0;
	let useLength2;
	if(qtyLength2 > 0 && qtyWidth2 > 0) {
		if(quantity > qtyLength2) {
			useLength2 = true;
			qtyPartsAcrossMaterialWidth2 = qtyLength2;
		} else {
			useLength2 = false;
			qtyPartsAcrossMaterialWidth2 = quantity
		}

		remainingWidth2 = currentWidth - (partWidth * qtyPartsAcrossMaterialWidth2);
		
		qtyPartsAcrossMaterialLength2 = quantity / qtyPartsAcrossMaterialWidth2;
		let remainingPartsCount = quantity - (qtyPartsAcrossMaterialLength2 * qtyPartsAcrossMaterialWidth2);
		if(remainingPartsCount > 0) {
			console.log("Damn");
		}

		if(qtyPartsAcrossMaterialLength2 > qtyWidth2) {
			qtyPartsAcrossMaterialLength2 = qtyWidth2;
		}

		if(currentLength === 100000) {
			remainingLength2 = partWidth * qtyPartsAcrossMaterialLength2;
			remainingQuantity2 = quantity * qtyLength2;
			qtyWidth2 = quantity;
		} else {
			remainingLength2 = currentLength;
			remainingQuantity2 = qtyLength2 * qtyWidth2;
		}

		remainingArea2 = remainingLength2 * remainingWidth2;
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
		currentLength = remainingLength2;
		currentWidth = remainingWidth2;

		//console.log("4: ", partId, remainingLength2, remainingWidth2, materialIndexWidth, materialIndexLength, qtyPartsAcrossMaterialLength2, qtyPartsAcrossMaterialWidth2);
		for(let i = 0; i < qtyPartsAcrossMaterialLength2; i++) {
			console.log("I: ", i);
			for(let j = 0; j < qtyPartsAcrossMaterialWidth2; j++) {
				console.log("J: ", j);
				partImages.push({
					x: materialIndexLength,
					y: materialIndexWidth,
					length: useLength2 ? partWidth : partLength,
					width: useLength2 ? partLength : partWidth
				});

				if(useLength2) {
					materialIndexWidth += partLength;
				} else {
					materialIndexWidth += partWidth;
				}
			}
			
			console.log("5-1: ", partId, materialIndexWidth, materialWidth, materialIndexLength);
			if((materialIndexWidth > materialWidth)) {
				materialIndexLength += partLength;
				materialIndexWidth = materialIndexWidth - ((useLength2 ? partLength : partWidth) * (useLength2 ? qtyPartsAcrossMaterialLength2 : qtyPartsAcrossMaterialWidth2));
				console.log("5-2: ", partId, materialIndexWidth, materialWidth, materialIndexLength);
			}
		}

	}

	return {
		currentLength: currentLength,
		currentWidth: currentWidth,
		remainingLength: remainingLength,
		materialIndexWidth: materialIndexWidth,
		materialIndexLength: materialIndexLength,
		partImages: partImages
	}
}


let draw = function(partImages) {
	let scale = 10;
	for(let i = 0; i < partImages.length; i++) {
		ctx.strokeRect(partImages[i].x * scale, partImages[i].y * scale, partImages[i].length * scale, partImages[i].width * scale);	
	}
}

let newLayoutMethod = function(materialLength, materialWidth, partLength, partWidth, partQuantity, currentMaterialLength, currentMaterialWidth, partId) {
	console.log("Starting Params", materialWidth, materialLength, partLength, partWidth, partQuantity, currentMaterialLength, currentMaterialWidth, partId);
	let partImages = [];
	let qtyAcrossWidthUsingPartWidth = materialWidth / partWidth;
	let qtyAcrossWidthUsingPartLength = materialWidth / partLength;

	let usingLengthArea = 0;
	let usingWidthArea = 0;
	let partsAlongLength = 0;
	let partsAlongWidth = 0;
	let useWidth = true;
	if(qtyAcrossWidthUsingPartLength >= 1) {
		// calculate area needed by parts in this direction
		partsAlongLength = partQuantity / qtyAcrossWidthUsingPartLength;
		usingLengthArea = qtyAcrossWidthUsingPartLength * partsAlongLength;
	}

	if(qtyAcrossWidthUsingPartWidth >= 1) {
		// calculate area needed by parts in this direction
		partsAlongWidth = partQuantity / qtyAcrossWidthUsingPartWidth;
		usingWidthArea = qtyAcrossWidthUsingPartWidth * partsAlongWidth;
	} 

	if(qtyAcrossWidthUsingPartLength < 1 && qtyAcrossWidthUsingPartWidth < 1) {
		console.log("Something is wrong. Part does not fit on material");
	}

	console.log(usingLengthArea, usingWidthArea)
	if(usingWidthArea < usingLengthArea) {
		useWidth = true;
	} else if(usingLengthArea < usingWidthArea) {
		useWidth = false;
	} else {
		//use part width across material width by default if used area is the same
		useWidth = true;
	}

	if(useWidth) {
		let currentIndexLength = 0;
		let currentIndexWidth = 0;
		for(let i = 0; i < partsAlongLength; i++) {
			for(let j = 0; j < qtyAcrossWidthUsingPartWidth; j++) {
				partImages.push({
					x: currentIndexLength,
					y: currentIndexWidth,
					length: partLength,
					width: partWidth,
				});

				currentIndexWidth += partWidth;
			}
			currentIndexLength += partLength;
		}
	} else {
		// let currentIndexLength = 0;
		// let currentIndexWidth = 0;
		// for(let i = 0; i < partsAlongLength; i++) {
		// 	for(let j = 0; j < qtyAcrossWidthUsingPartWidth; j++) {
		// 		partImages.push({
		// 			x: currentIndexLength,
		// 			y: currentIndexWidth,
		// 			length: partLength,
		// 			width: partWidth,
		// 		});
		// 	}
		// }
	}

	return {
		partImages: partImages
	};
}

document.addEventListener('DOMContentLoaded', start(), false);

