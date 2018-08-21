import Part from './models/part.js';
import PartArea from './models/part-area.js';
import MaterialArea from './models/material-area.js';
//import Options from './models/options.js';

let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");
let currentIteration = 0;
let materialId = 0;

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

let sortMaterials = function(parts) {
	return parts.sort((a, b) => {
		let areaA = a.length * a.width;
		let areaB = b.length * b.width;

		if(a.x < b.x) {
			return -1;
		}

		if(a.x > b.x) {
			return 1;
		}

		if(a.x === b.x) {
			return areaA < areaB
		}

		return 0;
	});
}

let start = function() {
	let parts = [
		new Part(1, 21.625, 5, null, 0, 0, 0, 0),
		// new Part(2, 5, 3, 25, 0, 0, 0, 0),
		// new Part(3, 2, 1, 35, 0, 0, 0, 0),
		// new Part(4, 5, 15, 2, 0, 0, 0, 0),
		// new Part(5, 15, 3.27, 2, 0, 0, 0, 0),
		// new Part(6, 12, 1, 1, 0, 0, 0, 0),
		// new Part(7, 1, 2, null, 0, 0, 0, 0)
	];

	let options = {
		partSpacingTop: 0, // Global spacing option for parts can be overriden on each part
		partSpacingBottom: 0, // Global spacing option for parts can be overriden on each part
		partSpacingLeft: 0, // Global spacing option for parts can be overriden on each part
		partSpacingRight: 0, // Global spacing option for parts can be overriden on each part
		materialTrimTop: .375, // Global trim option for main material can be overriden on each material if needed
		materialTrimBottom: 0, // Global trim option for main material can be overriden on each material if needed
		materialTrimLeft: 0, // Global trim option for main material can be overriden on each material if needed
		materialTrimRight: 0, // Global trim option for main material can be overriden on each material if needed
		partDirectionOnMaterial: "H" // If part must be cut on material a certain orientation can be overriden on each part if needed
	};

	let material = new MaterialArea(
		materialId++, 0, 0, 56, 28, "material", "red", false, {
		top: options.materialTrimTop,
		bottom: options.materialTrimBottom,
		left: options.materialTrimLeft,
		right: options.materialTrimRight,
		color: "orange"
	});

	parts = sortParts(parts);

	calculateMaterialLayout(parts, material, options);

	parts.forEach((part) => {
		if(part.remainingQuantity) {
			//console.log(part);
		}
	});
}

let calculateMaterialLayout = function(parts, material, options) {

	let materialAreas = calculatePartLayout(parts, material, options);

	// materialAreas = materialAreas.filter((materialArea) => {
	// 	return materialArea.partAreas.length > 0;
	// });

	console.log("Final: ", materialAreas)
	draw(materialAreas);
}

let calculatePartLayout = function(parts, material, options) {
	let materialAreas = [material];
	let part = parts[0];

	for(let i = 0; i < parts.length; i++) {
		let part = parts[i];
		if(part.quantity === null) {
			part.remainingQuantity = Number.MAX_VALUE;
		}
		if(i < currentIteration) {
			for(let j = 0; j < materialAreas.length; j++) {
				let materialArea = materialAreas[j];
				
				if(!materialArea.full) {
					let materialCalculations = calculateMaterialAreaPartsLayout(materialArea, part, options);
					//console.log("New Material Areas: ", materialCalculations)
					if(materialCalculations.newMaterialAreas.length > 0) {
						materialAreas.splice(j, 1);
						materialAreas = materialAreas.concat(materialCalculations.newMaterialAreas);
						materialAreas = sortMaterials(materialAreas);
						part.remainingQuantity = materialCalculations.remainingQuantity;
						
						if(part.remainingQuantity > 0) {
							j = 0;
						} else {
							break;
						}
					}
				}			    
			}
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

	let materialPartLayoutCalculations = addPartsToMaterialArea(material, finalLayout.partLength, finalLayout.partWidth, part, finalLayout.numberOut, options);
	material.partAreas = materialPartLayoutCalculations.partAreas;
	let materialAreas = [];
	if(finalLayout.numberOut > 0) {
		material.cleanUp = true;
		materialAreas = calculateNewMaterialAreas(material, materialPartLayoutCalculations.finalMaterialAreaLength, materialPartLayoutCalculations.finalMaterialAreaWidth);
	}
	
	return {
		newMaterialAreas: materialAreas,
		remainingQuantity: finalLayout.remainingQuantity
	};
}

let calculateHorizontalLayout = function(material, part, options) {
	if(part.id === 1) {	
		console.log("Calculating Horizontal Layout *************************************************************************")
		console.log("Material X: ", material.x);
		console.log("Material Y: ", material.y);
		console.log("Material Length: ", material.length);
		console.log("Material Width: ", material.width);
		console.log("Material Top Trim: ", material.topTrim);
		console.log("Material Bottom Trim: ", material.bottomTrim);
		
		console.log("Part Length: ", part.length);
		console.log("Part Width: ", part.width);
		console.log("Part Remaining Quantity: ", part.remainingQuantity);
	}

	// trim and part spacing are taken out to adjust for additional space needed in the material area
	let materialWidth = material.width - material.topTrim - material.bottomTrim;
	let materialLength = material.length - material.leftTrim - material.rightTrim;

	// part spacing is added to the part for the bottom right part of the material
	let partLength = part.length + options.partSpacingLeft + options.partSpacingRight;
	let partWidth = part.width + options.partSpacingTop + options.partSpacingBottom;

	// calculate the number out across the width of the material using the part width
	const numberOutWidthMax = Math.floor(materialWidth / partWidth);
	const numberOutWidth = Math.min(part.remainingQuantity, numberOutWidthMax);
	
	if(part.id === 1) {
		console.log("Number Out Width Max: ", numberOutWidthMax);
		console.log("Number Out Width: ", numberOutWidth);
	}

	const numberOutLengthFullMax = numberOutWidth > 0 ? Math.floor(part.remainingQuantity / numberOutWidth) : 0;
	let numberOutLengthFull = Math.min(numberOutLengthFullMax, Math.floor(materialLength / partLength));

	if(part.id === 1) {
		console.log("Number Out Length Full Max: ", numberOutLengthFullMax);
		console.log("Number Out Length Full: ", numberOutLengthFull);
	}

	if(numberOutLengthFull === 0 && numberOutWidth > 0 && partLength <= materialLength) {
		numberOutLengthFull = 1;
	}

	if(part.id === 1) {
		console.log("Number Out Final", numberOutWidth * numberOutLengthFull);
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

let addPartsToMaterialArea = function(material, partLength, partWidth, part, numberOut, options) {
	let partAreas = [];
	let partSpacingLeft = (part.spacingLeft || options.partSpacingLeft);
	let partSpacingRight = (part.spacingRight || options.partSpacingRight);
	let partSpacingTop = (part.spacingTop || options.partSpacingTop);
	let partSpacingBottom = (part.spacingBottom || options.partSpacingBottom);

	let currentX = material.x + material.leftTrim + partSpacingLeft;
	let currentY = material.y + material.topTrim + partSpacingTop;



	for(let i = 0; i < numberOut; i++) {
		partAreas.push(new PartArea(part.id, currentX, currentY, partLength, partWidth, 'part', 'black', {
			top: part.spacingTop,
			bottom: part.spacingBottom,
			left: part.spacingLeft,
			right: part.spacingRight
		}));


		let nextXPosition = currentX +  (2 * partLength) + partSpacingLeft;
		let nextYPosition = currentY +  (2 * partWidth) + partSpacingTop;

		// don't update position on last iteration makes calculating new areas easier
		if(i !== numberOut - 1) {
			if(nextYPosition <= material.width - material.bottomTrim + material.y) {
				currentY += (partWidth + partSpacingTop + partSpacingBottom);
			} else {
				currentY = material.y + material.topTrim + partSpacingTop;
				if(nextXPosition <= material.length - material.rightTrim + material.x) {
					currentX += (partLength + partSpacingLeft + partSpacingRight);
				}
			}
		}
	}

	return {
		partAreas: partAreas,
		finalMaterialAreaLength: currentX + partLength + partSpacingRight,
		finalMaterialAreaWidth: currentY + partWidth + partSpacingBottom
	}
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

	// puts the newly placed parts into their own material area
	let materialArea1 = new MaterialArea(
		materialId++,
		materialArea.x, 
		materialArea.y, 
		newMaterialLength - materialArea.x, 
		newMaterialWidth - materialArea.y,
		'material',
		"red",
		true,
		{
			top: materialArea.topTrim,
			left: materialArea.leftTrim,
			bottom: 0,
			right: 0,
			color: materialArea.trimColor
		}
	);
	materialArea.partAreas.forEach((partArea) => {
        materialArea1.partAreas.push(new PartArea(partArea.id, partArea.x, partArea.y, partArea.length, partArea.width, partArea.type, partArea.color, partArea.trimSettings));
    });

    materialArea.partAreas = [];

	materialArea.full = true;

	materialAreas.push(materialArea1);

	// create a material area for the remaining scrap
	if((materialArea.width) - (newMaterialWidth - materialArea.y) > 0) {
		materialAreas.push(new MaterialArea(
			materialId++,
			materialArea.x,
			newMaterialWidth,
			newMaterialLength - materialArea.x,
			materialArea.width - ((newMaterialWidth - materialArea.y)),
			'material',
			"red",
			false,
			{
				top: 0,
				left: materialArea.leftTrim,
				bottom: materialArea.bottomTrim,
				right: 0,
				color: materialArea.trimColor
			}
		));
	}

	// create a material area for the main material area
	if((newMaterialLength - materialArea.x) <= materialArea.length) {
		materialAreas.push(new MaterialArea(
			materialId++,
			newMaterialLength,
			materialArea.y,
			materialArea.length - ((newMaterialLength - materialArea.x)),
			materialArea.width,
			'material',
			"red",
			false,
			{
				top: materialArea.topTrim,
				left: 0,
				bottom: materialArea.bottomTrim,
				right: materialArea.rightTrim,
				color: materialArea.trimColor
			}
		));
	}

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

document.getElementById('IteratorButton').onclick=function(event) {
	currentIteration++;
	start();
};

document.getElementById('ResetButton').onclick=function(event) {
	currentIteration = 0;
};