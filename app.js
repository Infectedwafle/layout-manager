let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let start = function() {
	let parts = [
		{
			Id: 1,
			Length: 15,
			Width: 2.125,
			Quantity: 2,
			SpacingLength: null,
			SpacingWidth: null
		},
		{
			Id: 2,
			Length: 22.38,
			Width: 15,
			Quantity: 6,
			SpacingLength: null,
			SpacingWidth: null
		},
		{
			Id: 3,
			Length: 22.38,
			Width: 21.35,
			Quantity: 1,
			SpacingLength: null,
			SpacingWidth: null
		},
		{
			Id: 4,
			Length: 22.38,
			Width: 15,
			Quantity: 7,
			SpacingLength: null,
			SpacingWidth: null
		},
		{
			Id: 5,
			Length: 15,
			Width: 3.27,
			Quantity: 9,
			SpacingLength: null,
			SpacingWidth: null
		},
		{
			Id: 6,
			Length: 12,
			Width: 1,
			Quantity: 11,
			SpacingLength: null,
			SpacingWidth: null
		},
		{
			Id: 7,
			Length: 1,
			Width: 2,
			Quantity: 150,
			SpacingLength: null,
			SpacingWidth: null
		}
	];

	let materialWidth = 56;
	let materialLength = 108;
	const distanceBetweenPartsLength = .375;
	const distanceBetweenPartsWidth = .375;
	const unusableMaterialLength = 1;
	const unusableMaterialWidth = 1;
	const corrugationDirection = "H";
	parts = parts.sort((a, b) => {
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

	calculateLayout(parts, materialLength, materialWidth, unusableMaterialLength, unusableMaterialWidth, distanceBetweenPartsLength, distanceBetweenPartsWidth, corrugationDirection);
}

let calculateLayout = function(parts, originalMaterialLength, originalMaterialWidth, unusableMaterialLength, unusableMaterialWidth, distanceBetweenPartsLength,distanceBetweenPartsWidth, corrugationDirection) {
	const totalTrimLength = 2 * unusableMaterialLength;
	const totalTrimWidth = 2 * unusableMaterialWidth;
	

	const materialWidth = originalMaterialWidth - totalTrimWidth; // remove trim
	const materialLength = (originalMaterialLength || 100000) - totalTrimLength;
	let currentLengthIndex = 0;
	let currentWidthIndex = 0;

	// create an out line of the material all other parts will reside inside this part
	// We will split the initial material everytime a void is made in the material to try and use later
	let materialAreas = [{
		x:0, 
		y:0, 
		length: materialLength + totalTrimLength, 
		width: originalMaterialWidth,
		color: "orange",
		type: "trim",
		used: true,
		parts: []
	}, {
		x:unusableMaterialLength, 
		y:unusableMaterialWidth, 
		length: materialLength, 
		width: materialWidth,
		color: "red",
		type: "material",
		parts: []
	}];
	// array to hold all part locations that come from the layout calculator
	let images = [];
	
	for(let i = 0; i < parts.length; i++) {
		console.log('*************************************************************************', parts[i].Id);
		const totalPartSpacingLength = 2 * (parts[i].SpacingLength === null ? distanceBetweenPartsLength : parts[i].SpacingLength);
		const totalPartSpacingWidth = 2 * (parts[i].SpacingWidth === null ? distanceBetweenPartsWidth : parts[i].SpacingWidth);

		const partLength = parts[i].Length;
		const partWidth = parts[i].Width;
		const partQuantity = parts[i].Quantity;

		const totalPartLenth = partLength + totalPartSpacingLength;
		const totalPartWidth = partWidth + totalPartSpacingWidth
		let remainingPartQuantity = partQuantity || 1;
		let layoutCalculations = null;

		for(let j = 0; j < materialAreas.length; j++) {
			if(!materialAreas[j].used) {
				// calculate how many parts fit in the given area
				// return hash should contain
				// {
				// 	remainingPartQuantity // This should be updated based on how many were actually taken
				// 	newMaterialAreas 	  // This will be any leftover space from the original are that was unused. Could be more than one.
				// }
				layoutCalculations = calculateMaterialAreaLayout(materialAreas[j], totalPartLenth, totalPartWidth, remainingPartQuantity, totalPartSpacingLength, totalPartSpacingWidth, corrugationDirection);

				if(layoutCalculations.newMaterialAreas.length > 0) {
					materialAreas.splice(j, 1);
					
					if(layoutCalculations) {
						materialAreas = materialAreas.concat(layoutCalculations.newMaterialAreas);

						// sort the material areas to ensure the smallest areas are used first
						materialAreas = materialAreas.sort((a, b) => {
							let areaA = a.length * a.width;
							let areaB = b.length * b.width;

							// make sure material trim is always drawn first
							if(a.x < b.x || a.type === 'trim') {
								return -1;
							}

							if(a.x > b.x) {
								return 1;
							}

							return 0;
						});
					}

					if(partQuantity === null) {
						remainingPartQuantity = 1
					} else {
						remainingPartQuantity = layoutCalculations.remainingPartQuantity;
					}
					
					if(remainingPartQuantity > 0) {
						j = 0; // start over
					} else {
						break;
					}
				}
			}
		}
	}

	console.log(materialAreas);
	draw(materialAreas);
}

let calculateMaterialAreaLayout = function(materialArea, partLength, partWidth, partQuantity, distanceBetweenPartsLength, distanceBetweenPartsWidth, corrugationDirection) {
	console.log('----------------------------------------------------------------------------');
	// store the length and width of the material area
	const materialLength = materialArea.length;
	const materialWidth = materialArea.width;
	let parts = [];

	// calculate the number out across the width of the material using the part width
	const numberOutWidthMax = Math.floor(materialWidth / partWidth);
	const numberOutWidth = Math.min(partQuantity, numberOutWidthMax);

	// calculate the number out across the width of the material using the part height
	const numberOutWidthFlippedMax = Math.floor(materialWidth / partLength);
	const numberOutWidthFlipped = Math.min(partQuantity, numberOutWidthFlippedMax);


	// Calculate how many time the number out width can be done in the length direction
	// ex. if you can get 3 out of the width and 2 the length that would be 6 parts total
	const numberOutLengthFullMax = Math.floor(partQuantity / numberOutWidth);
	let numberOutLengthFull = Math.min(numberOutLengthFullMax, Math.floor(materialLength / partLength));

	if(numberOutLengthFull === 0 && numberOutWidth > 0 && partLength <= materialLength) {
		numberOutLengthFull = 1;
	}

	const numberOutLengthFullFlippedMax = Math.floor(partQuantity / numberOutWidthFlipped);
	let numberOutLengthFullFlipped = Math.min(numberOutLengthFullFlippedMax, Math.floor(materialLength / partWidth));

	if(numberOutLengthFullFlipped === 0 && numberOutWidthFlipped > 0 && partWidth <= materialLength) {
		numberOutLengthFullFlipped = 1;
	}

	const remainingPartQuantity = partQuantity - (numberOutWidth * numberOutLengthFull);
	const remainingPartQuantityFlipped = partQuantity - (numberOutWidthFlipped * numberOutLengthFullFlipped);

	// console.log("materialLength: ", materialLength);
	// console.log("materialWidth: ", materialWidth);
	// console.log("partQuantity: ", partQuantity);
	// console.log("numberOutWidth: ", numberOutWidth);
	// console.log("numberOutLengthFull: ", numberOutLengthFull, numberOutLengthFullMax);
	// console.log("numberOutWidthFlipped: ", numberOutWidthFlipped);
	// console.log("numberOutLengthFullFlipped: ", numberOutLengthFullFlipped, numberOutLengthFullFlippedMax);

	let scrap = 0;

	let numberOutFinal = 0;
	let finalPartLength = 0;
	let finalPartWidth = 0;
	let finalRemainingQuantity = 0;
	let finalPartSpacingLength = 0;
	let finalPartSpacingWidth = 0;

	let numberOutNormal = numberOutWidth * numberOutLengthFull;
	let numberOutflipped = numberOutWidthFlipped * numberOutLengthFullFlipped;

	console.log(corrugationDirection);
	if((numberOutNormal > numberOutflipped || (isNaN(numberOutflipped) && !isNaN(numberOutNormal)) || numberOutflipped === 0) && corrugationDirection !== 'V' && partLength <= materialWidth || corrugationDirection === 'H') {
		numberOutFinal = numberOutWidth * numberOutLengthFull;
		finalPartLength = partLength;
		finalPartWidth = partWidth;
		finalRemainingQuantity = remainingPartQuantity;
		finalPartSpacingLength = distanceBetweenPartsLength;
		finalPartSpacingWidth = distanceBetweenPartsWidth;
	} else if((numberOutflipped > numberOutNormal || (!isNaN(numberOutflipped) && isNaN(numberOutNormal)) || numberOutNormal === 0) && corrugationDirection !== 'H' && partLength <= materialWidth || corrugationDirection === 'V'){
		numberOutFinal = numberOutWidthFlipped * numberOutLengthFullFlipped;
		finalPartLength = partWidth;
		finalPartWidth = partLength;
		finalRemainingQuantity = remainingPartQuantityFlipped;
		finalPartSpacingLength = distanceBetweenPartsWidth;
		finalPartSpacingWidth = distanceBetweenPartsLength;
	} else {
		numberOutFinal = numberOutWidth * numberOutLengthFull;
		finalPartLength = partLength;
		finalPartWidth = partWidth;
		finalRemainingQuantity = remainingPartQuantity;
		finalPartSpacingLength = distanceBetweenPartsLength;
		finalPartSpacingWidth = distanceBetweenPartsWidth;
	}


	// console.log("NumberOutFinal: ", numberOutFinal);
	// console.log("FinalPartLength: ", finalPartLength);
	// console.log("FinalPartWidth: ", finalPartWidth);
	// console.log("FinalRemainingQuantity: ", finalRemainingQuantity);
	
	// relative to the material area makes the math easier
	let currentX = materialArea.x;
	let currentY = materialArea.y;
	for(let i = 0; i < numberOutFinal; i++) {
		materialArea.parts.push({
			x: currentX + (finalPartSpacingLength / 2),
			y: currentY + (finalPartSpacingWidth / 2),
			length: finalPartLength - (finalPartSpacingLength),
			width: finalPartWidth - (finalPartSpacingWidth),
			color: 'black',
			type: 'part'
		});

		// don't update position on last iteration makes calculating new areas easier
		if(i !== numberOutFinal - 1) {
			if((currentY - materialArea.y) + (2 * finalPartWidth) <= materialWidth) {
				currentY += finalPartWidth;
			} else {
				currentY = materialArea.y;
				if((currentX - materialArea.x) + (2 * finalPartLength) <= materialLength) {
					currentX += finalPartLength
				}
			}
		}
	}


	let materialAreas = [];
	if(numberOutFinal > 0) {		
		materialAreas = calculateNewMaterialAreas(materialArea, currentX + finalPartLength, currentY + finalPartWidth, finalPartSpacingLength, finalPartSpacingWidth);
	}

	return {
		newMaterialAreas: materialAreas,
		remainingPartQuantity: finalRemainingQuantity
	}
}

/**
 * [calculateNewMaterialAreas description]
 * @param  {[type]} materialArea      [description]
 * @param  {[type]} newMaterialLength new Material length relative to the overall material
 * @param  {[type]} newMaterialWidth  new Material width relative to the overall material
 * @return {[type]}                   [description]
 */
let calculateNewMaterialAreas = function(materialArea, newMaterialLength, newMaterialWidth, finalPartSpacingLength, finalPartSpacingWidth) {
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

/**
 * [checkIfPartFitsInMaterialArea description]
 * @param  {[type]} materialLength [description]
 * @param  {[type]} materialWidth  [description]
 * @param  {[type]} partLength     [description]
 * @param  {[type]} partWidth      [description]
 * @return {[type]}                [description]
 */
let checkIfPartFitsInMaterialArea = function(materialLength, materialWidth, partLength, partWidth) {
	let partFits = true;
	//partFits = partFits && ((materialLength - partLength) > 0 && (materialLength - partWidth) > 0);
	//partFits = partFits && ((materialWidth - partLength) > 0 && (materialWidth - partWidth) > 0);


	return partFits;
}

/**
 * [calculateSplitCalculations description]
 * @param  {[type]} materialLength [description]
 * @param  {[type]} materialWidth  [description]
 * @param  {[type]} partLength     [description]
 * @param  {[type]} partWidth      [description]
 * @param  {[type]}                [description]
 * @return {[type]}                [description]
 */
let calculateSplitCalculations = function(materialLength, materialWidth, partLength, partWidth) {

}

let draw = function(materialAreas) {
	materialAreas = materialAreas.sort((a, b) => {
		if(a.x < b.x) {
			return -1;
		}

		if(a.x > b.x) {
			return 1;
		}

		return 0;
	});

	let scale = 15;
	for(let i = 0; i < materialAreas.length; i++) {
		// draw material areas
		ctx.fillStyle = materialAreas[i].color;
		ctx.fillRect(materialAreas[i].x * scale, materialAreas[i].y * scale, materialAreas[i].length * scale, materialAreas[i].width * scale);	
		ctx.strokeStyle = 'black';
		ctx.strokeRect(materialAreas[i].x * scale, materialAreas[i].y * scale, materialAreas[i].length * scale, materialAreas[i].width * scale);
		
		for(let j = 0; j < materialAreas[i].parts.length; j++) {
			ctx.fillStyle = materialAreas[i].parts[j].color;
			ctx.fillRect(materialAreas[i].parts[j].x * scale, materialAreas[i].parts[j].y * scale, materialAreas[i].parts[j].length * scale, materialAreas[i].parts[j].width * scale);
			ctx.strokeStyle = 'grey';
			ctx.strokeRect(materialAreas[i].parts[j].x * scale, materialAreas[i].parts[j].y * scale, materialAreas[i].parts[j].length * scale, materialAreas[i].parts[j].width * scale);
		}
	}
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