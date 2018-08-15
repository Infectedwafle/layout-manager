import Part from './models/part.js';
import PartArea from './models/part-area.js';
import MaterialArea from './models/material-area.js';
//import Options from './models/options.js';

let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let sortParts = function(parts) {
	return parts.sort((a, b) => {
		let areaA = a.Length * a.Width;
		let areaB = b.Length * b.Width;

		if(areaA > areaB) {
			return -1;
		}

		if(areaA < areaB) {
			return 1;
		}

		return 0;
	});
} 

let start = function() {
	let parts = [
		new Part(1, 15, 2.125, 2),
		new Part(2, 22.38, 15, 6),
		new Part(3, 22.38, 21.35, 1),
		new Part(4, 22.38, 15, 7),
		new Part(5, 15, 3.27, 9),
		new Part(6, 12, 1, 11),
		new Part(7, 1, 2, 150)
	];

	let options = {
		partSpacingTop: null, // Global spacing option for parts can be overriden on each part
		partSpacingBottom: null, // Global spacing option for parts can be overriden on each part
		partSpacingLeft: null, // Global spacing option for parts can be overriden on each part
		partSpacingRight: null, // Global spacing option for parts can be overriden on each part
		materialTrimTop: 1, // Global trim option for main material can be overriden on each material if needed
		materialTrimBottom: 1, // Global trim option for main material can be overriden on each material if needed
		materialTrimLeft: 1, // Global trim option for main material can be overriden on each material if needed
		materialTrimRight: 1, // Global trim option for main material can be overriden on each material if needed
		partDirectionOnMaterial: "H" // If part must be cut on material a certain orientation can be overriden on each part if needed
	};

	let material = new MaterialArea(0, 0, 56, 32, "material", "red", false, {
		top: options.materialTrimTop,
		bottom: options.materialTrimBottom,
		left: options.materialTrimLeft,
		right: options.materialTrimRight,
		color: "orange"
	});

	parts = sortParts(parts);

	calculateMaterialLayout(parts, material, options);
}

let calculateMaterialLayout = function(parts, material, options) {

	material.materialAreas = calculatePartLayout(parts, material, options);
	draw(material);
}

let calculatePartLayout = function(parts, material, options) {
	let newMaterialAreas = [];
	let part = parts.find((part) => {
		return part.remainingQuantity > 0;
	})

	let layouts = calculateMaterialAreaPartsLayout(material, part, options);

	layouts.forEach((layout) => {
		newMaterialAreas = newMaterialAreas.concat(calculateMaterialAreaPartsLayout(material, part, options));
	});

	return newMaterialAreas;
}

let calculateMaterialAreaPartsLayout = function(materialArea, part, options) {
	let horizontalLayout = null;
	let verticalLayout = null;
	let omniLayout = null;

	if(options.partDirectionOnMaterial === 'H') {
		horizontalLayout = calculateHorizontalLayout();
	} else if(options.partDirectionOnMaterial === 'V') {
		verticalLayout = calculateVerticalLayout();
	} else if(options.partDirectionOnMaterial === 'E') {
		horizontalLayout = calculateHorizontalLayout();
		verticalLayout = calculateVerticalLayout();

		// do comparison to determine which way has the best fit
	} else {
		// fit parts in both ways to make them fit as tight as possible
		omniLayout = calculateOmniLayout();
	}

	const finalLayout = horizontalLayout || verticalLayout || omniLayout;


	let materialAreas = [];
	if(numberOutFinal > 0) {		
		materialAreas = calculateNewMaterialAreas(materialArea, currentX + finalPartLength, currentY + finalPartWidth, finalPartSpacingLength, finalPartSpacingWidth);
	}

	return [];
}

let calculateHorizontalLayout = function(material, part, options) {
	// calculate the number out across the width of the material using the part width
	const numberOutWidthMax = Math.floor(materialWidth / partWidth);
	const numberOutWidth = Math.min(partQuantity, numberOutWidthMax);

	const numberOutLengthFullMax = Math.floor(partQuantity / numberOutWidth);
	let numberOutLengthFull = Math.min(numberOutLengthFullMax, Math.floor(materialLength / partLength));

	if(numberOutLengthFull === 0 && numberOutWidth > 0 && partLength <= materialLength) {
		numberOutLengthFull = 1;
	}

	const remainingPartQuantity = partQuantity - (numberOutWidth * numberOutLengthFull);
	const remainingPartQuantityFlipped = partQuantity - (numberOutWidthFlipped * numberOutLengthFullFlipped);
}

let calculateVerticalLayout = function(material, part, options) {
	// calculate the number out across the width of the material using the part height
	const numberOutWidthFlippedMax = Math.floor(materialWidth / partLength);
	const numberOutWidthFlipped = Math.min(partQuantity, numberOutWidthFlippedMax);

	const numberOutLengthFullFlippedMax = Math.floor(partQuantity / numberOutWidthFlipped);
	let numberOutLengthFullFlipped = Math.min(numberOutLengthFullFlippedMax, Math.floor(materialLength / partWidth));

	if(numberOutLengthFullFlipped === 0 && numberOutWidthFlipped > 0 && partWidth <= materialLength) {
		numberOutLengthFullFlipped = 1;
	}

	const remainingPartQuantity = partQuantity - (numberOutWidth * numberOutLengthFull);
	const remainingPartQuantityFlipped = partQuantity - (numberOutWidthFlipped * numberOutLengthFullFlipped);
}

let calculateOmniLayout = function(material, part, options) {

}

let addPartsToMaterialArea = function(materialArea, partLength, partWidth, part, numberOut) {
	let currentX = materialArea.x + materialArea.leftTrim;
	let currentY = materialArea.y + materialArea.topTrim;

	for(let i = 0; i < numberOut; i++) {
		let x = currentX + part.spacingLeft;
		let y = currentY + part.spacingTop;

		materialArea.parts.push(new PartArea(x, y, partLength, partWidth, 'black', 'part', {
			top: part.spacingTop,
			bottom: part.spacingBottom,
			left: part.spacingLeft,
			right: part.spacingRight
		}));

		let nextYPosition = (y - materialArea.y) +  (2 * partWidth);
		let nextXPosition = (x - materialArea.x) +  (2 * partLength);
		// don't update position on last iteration makes calculating new areas easier
		if(i !== numberOut - 1) {
			if(nextYPosition <= materialWidth) {
				currentY += partWidth;
			} else {
				y = materialArea.y + materialArea.topTrim;
				if(nextXPosition <= materialLength) {
					currentX += partLength
				}
			}
		}
	}

	let materialAreas = [];
	if(numberOutFinal > 0) {
		let finalMaterialAreaLength = currentX + partLength + materialArea.rightTrim;
		let finalMaterialAreaWidth = currentY + partWidth + materialArea.bottomTrim;
		materialAreas = calculateNewMaterialAreas(materialArea, finalMaterialAreaLength, finalMaterialAreaWidth);
	}

	return materialAreas;
}


/**
 * [calculateNewMaterialAreas description]
 * @param  {[type]} materialArea      [description]
 * @param  {[type]} newMaterialLength new Material length relative to the overall material
 * @param  {[type]} newMaterialWidth  new Material width relative to the overall material
 * @return {[type]}                   [description]
 */
let calculateNewMaterialAreas = function(materialArea, newMaterialLength, newMaterialWidth) {
	// console.log("NewMaterialLength: ", newMaterialLength);
	// console.log("NewMaterialWidth", newMaterialWidth);
	// console.log("MaterialArea: ", materialArea);
	let materialAreas = [];

	// puts the newly placed parts into their own material area
	materialAreas.push({
		x: materialArea.x,
		y: materialArea.y,
		length: newMaterialLength - materialArea.x,
		width: newMaterialWidth - materialArea.y,
		color: "red",
		parts: materialArea.parts,
		used: true,
		type: 'material'
	});

	// create a material area for the remaining scrap
	if(materialArea.width - (newMaterialWidth - materialArea.y) > 0) {
		materialAreas.push({
			x: materialArea.x,
			y: newMaterialWidth,
			length: newMaterialLength - materialArea.x,
			width: materialArea.width - (newMaterialWidth - materialArea.y),
			color: "red",
			parts: [],
			used: false,
			type: 'material'
		});
	}

	// create a material area for the main material area
	if((newMaterialLength - materialArea.x) < materialArea.length) {
		materialAreas.push({
			x: newMaterialLength,
			y: materialArea.y,
			length: materialArea.length - (newMaterialLength - materialArea.x),
			width: materialArea.width,
			color: "red",
			parts: [],
			used: false,
			type: 'material'
		});
	}

	return materialAreas;
}

let draw = function(material) {
	let scale = 15;
	material.draw(ctx, scale);
}

document.addEventListener('DOMContentLoaded', start(), false);

// const materialWidth = originalMaterialWidth - totalTrimWidth; // remove trim
	// const materialLength = (originalMaterialLength || 100000) - totalTrimLength;

	// for(let i = 0; i < parts.length; i++) {
	// 	console.log('*************************************************************************', parts[i].Id);
	// 	const totalPartSpacingLength = 2 * (parts[i].SpacingLength === null ? distanceBetweenPartsLength : parts[i].SpacingLength);
	// 	const totalPartSpacingWidth = 2 * (parts[i].SpacingWidth === null ? distanceBetweenPartsWidth : parts[i].SpacingWidth);

	// 	const partLength = parts[i].Length;
	// 	const partWidth = parts[i].Width;
	// 	const partQuantity = parts[i].Quantity;

	// 	const totalPartLenth = partLength + totalPartSpacingLength;
	// 	const totalPartWidth = partWidth + totalPartSpacingWidth
	// 	let remainingPartQuantity = partQuantity || 1;
	// 	let layoutCalculations = null;

	// 	for(let j = 0; j < materialAreas.length; j++) {
	// 		if(!materialAreas[j].used) {
	// 			// calculate how many parts fit in the given area
	// 			// return hash should contain
	// 			// {
	// 			// 	remainingPartQuantity // This should be updated based on how many were actually taken
	// 			// 	newMaterialAreas 	  // This will be any leftover space from the original are that was unused. Could be more than one.
	// 			// }
	// 			layoutCalculations = calculateMaterialAreaLayout(materialAreas[j], totalPartLenth, totalPartWidth, remainingPartQuantity, totalPartSpacingLength, totalPartSpacingWidth, corrugationDirection);

	// 			if(layoutCalculations.newMaterialAreas.length > 0) {
	// 				materialAreas.splice(j, 1);
					
	// 				if(layoutCalculations) {
	// 					materialAreas = materialAreas.concat(layoutCalculations.newMaterialAreas);

	// 					// sort the material areas to ensure the smallest areas are used first
	// 					materialAreas = materialAreas.sort((a, b) => {
	// 						let areaA = a.length * a.width;
	// 						let areaB = b.length * b.width;

	// 						// make sure material trim is always drawn first
	// 						if(a.x < b.x || a.type === 'trim') {
	// 							return -1;
	// 						}

	// 						if(a.x > b.x) {
	// 							return 1;
	// 						}

	// 						return 0;
	// 					});
	// 				}

	// 				if(partQuantity === null) {
	// 					remainingPartQuantity = 1
	// 				} else {
	// 					remainingPartQuantity = layoutCalculations.remainingPartQuantity;
	// 				}
					
	// 				if(remainingPartQuantity > 0) {
	// 					j = 0; // start over
	// 				} else {
	// 					break;
	// 				}
	// 			}
	// 		}
	// 	}
	// }
//}