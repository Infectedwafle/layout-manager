import Part from './models/part.js';
import PartArea from './models/part-area.js';
import MaterialArea from './models/material-area.js';
//import Options from './models/options.js';

let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let sortParts = function(parts) {
	return parts.sort((a, b) => {
		let areaA = a.length * a.width;
		let areaB = b.length * b.width;

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
		new Part(1, 6, 9, 6, 0, 0, 0, 0),
		new Part(2, 5, 3, 6, 0, 0, 0, 0),
		// new Part(3, 22.38, 21.35, 1, 0, 0, 0, 0),
		// new Part(4, 22.38, 15, 7, 0, 0, 0, 0),
		// new Part(5, 15, 3.27, 9, 0, 0, 0, 0),
		// new Part(6, 12, 1, 11, 0, 0, 0, 0),
		// new Part(7, 1, 2, 150, 0, 0, 0, 0)
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

	let material = new MaterialArea(0, 0, 56, 28, "material", "red", false, {
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

	let materialAreas = calculatePartLayout(parts, material, options);
	console.log("Final: ", materialAreas)
	draw(materialAreas);
}

let calculatePartLayout = function(parts, material, options) {
	let materialAreas = [material];
	let part = parts[0];

	while(part !== undefined && part.remainingQuantity > 0) {
		if(part) {
			materialAreas.forEach((materialArea, index) => {
				console.log(index);
				if(!materialArea.full) {
					materialAreas = materialAreas.concat(calculateMaterialAreaPartsLayout(materialArea, part, options));
				}
			});
		}
		
		if(part.remainingQuantity === 0) {
			part = parts.find((part) => {
				return part.remainingQuantity > 0;
			});			
		}
	}

	return materialAreas;
}

let calculateMaterialAreaPartsLayout = function(material, part, options) {
	let horizontalLayout = null;
	let verticalLayout = null;
	let omniLayout = null;

	if(options.partDirectionOnMaterial === 'H') {
		horizontalLayout = calculateHorizontalLayout(material, part, options);
	} else if(options.partDirectionOnMaterial === 'V') {
		verticalLayout = calculateVerticalLayout(material, part, options);
	} else if(options.partDirectionOnMaterial === 'E') {
		horizontalLayout = calculateHorizontalLayout(material, part, options);
		verticalLayout = calculateVerticalLayout(material, part, options);

		// do comparison to determine which way has the best fit
	} else {
		// fit parts in both ways to make them fit as tight as possible
		omniLayout = calculateOmniLayout(material, part, options);
	}

	const finalLayout = horizontalLayout || verticalLayout || omniLayout;
	console.log(finalLayout);
	//console.log("Final Layout: ", finalLayout, material);
	let materialAreas = addPartsToMaterialArea(material, finalLayout.partLength, finalLayout.partWidth, part, finalLayout.numberOut);
	part.remainingQuantity = finalLayout.remainingQuantity;
	return materialAreas;
}

let calculateHorizontalLayout = function(material, part, options) {
	// calculate the number out across the width of the material using the part width
	const numberOutWidthMax = Math.floor((material.width - material.topTrim - material.bottomTrim) / part.width);
	const numberOutWidth = Math.min(part.remainingQuantity, numberOutWidthMax);

	const numberOutLengthFullMax = Math.floor(part.remainingQuantity / numberOutWidth);
	let numberOutLengthFull = Math.min(numberOutLengthFullMax, Math.floor((material.length - material.leftTrim - material.rightTrim) / part.length));

	console.log("HCalculations", numberOutLengthFull, numberOutWidth, part.length, material.length)
	if(numberOutLengthFull === 0 && numberOutWidth > 0 && part.length <= material.length) {
		numberOutLengthFull = 1;
	}

	const remainingPartQuantity = Math.max(part.remainingQuantity - (numberOutWidth * numberOutLengthFull), 0);

	return {
		remainingQuantity: remainingPartQuantity,
		numberOut: numberOutWidth * numberOutLengthFull,
		partLength: part.length,
		partWidth: part.width
	};
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

let addPartsToMaterialArea = function(material, partLength, partWidth, part, numberOut) {
	let currentX = material.x + material.leftTrim;
	let currentY = material.y + material.topTrim;


	for(let i = 0; i < numberOut; i++) {
		currentX = currentX + part.spacingLeft;
		currentY = currentY + part.spacingTop;

		material.partAreas.push(new PartArea(part.id, currentX, currentY, partLength, partWidth, 'part', 'black', {
			top: part.spacingTop,
			bottom: part.spacingBottom,
			left: part.spacingLeft,
			right: part.spacingRight
		}));

		let nextXPosition = currentX +  (2 * partLength);
		let nextYPosition = currentY +  (2 * partWidth);

		console.log("X: ", currentX, nextXPosition);
		console.log("Y: ", currentY, nextYPosition);
		// don't update position on last iteration makes calculating new areas easier
		if(i !== numberOut - 1) {
			if(nextYPosition <= material.width - material.bottomTrim + material.y) {
				currentY += partWidth;
			} else {
				currentY = material.y + material.topTrim;
				if(nextXPosition <= material.length - material.rightTrim + material.x) {
					currentX += partLength
				}
			}
		}
	}


	let materialAreas = [];
	if(numberOut > 0) {
		let finalMaterialAreaLength = currentX + partLength;
		let finalMaterialAreaWidth = currentY + partWidth
		materialAreas = calculateNewMaterialAreas(material, finalMaterialAreaLength, finalMaterialAreaWidth);
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
	let materialAreas = [];

	console.log("ORIGNAL AREA: ", materialArea, newMaterialLength, newMaterialWidth)

	// puts the newly placed parts into their own material area
	let materialArea1 = new MaterialArea(
		materialArea.x + materialArea.leftTrim, 
		materialArea.y + materialArea.topTrim, 
		newMaterialLength - materialArea.leftTrim, 
		newMaterialWidth - materialArea.topTrim,
		'material',
		"red",
		true
	);
	materialArea.partAreas.forEach((partArea) => {
        materialArea1.partAreas.push(new PartArea(partArea.id, partArea.x, partArea.y, partArea.length, partArea.width, partArea.type, partArea.color, partArea.trimSettings));
    });

    materialArea.partAreas = [];

	materialArea.full = true;

	materialAreas.push(materialArea1);

	// create a material area for the remaining scrap
	//console.log((materialArea.width - materialArea.bottomTrim) - newMaterialWidth > 0);
	if((materialArea.width - materialArea.bottomTrim) - newMaterialWidth > 0) {
		console.log("X: ", materialArea.x + materialArea.leftTrim);
		console.log("Y: ", newMaterialWidth + materialArea.topTrim);
		console.log("LENGTH: ", newMaterialLength - materialArea.x);
		console.log("WIDTH: ", materialArea.width, (newMaterialWidth + materialArea.y + materialArea.bottomTrim + materialArea.topTrim));
		materialAreas.push(new MaterialArea(
			materialArea.x + materialArea.leftTrim,
			newMaterialWidth,
			newMaterialLength - materialArea.x - materialArea.leftTrim,
			materialArea.width - (newMaterialWidth - materialArea.y + materialArea.bottomTrim),
			'material',
			"red",
			false
		));
	}

	// // create a material area for the main material area
	// if(newMaterialLength < materialArea.length) {
	// 	materialAreas.push(new MaterialArea(
	// 		newMaterialLength,
	// 		materialArea.y + materialArea.topTrim,
	// 		materialArea.length - (newMaterialLength - materialArea.x - materialArea.rightTrim - materialArea.leftTrim),
	// 		materialArea.width - (materialArea.bottomTrim + materialArea.topTrim),
	// 		'material',
	// 		"red",
	// 		false
	// 	));
	// }

	return materialAreas;
}

let draw = function(materialAreas) {
	let scale = 15;
	materialAreas.forEach((materialArea) => {
		materialArea.draw(ctx, scale);
	});
}

document.addEventListener('DOMContentLoaded', start(), false);

document.getElementById('layout-manager').onclick=function(event) {
    var canvasPos = {
        x: this.offsetLeft,
        y: this.offsetTop
    };
    var coord = {
        x: (event.pageX-canvasPos.x) / 15,
        y: (event.pageY-canvasPos.y) / 15
    };

    console.log(coord);
};

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