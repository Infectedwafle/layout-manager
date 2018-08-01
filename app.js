let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let start = function() {
	let parts = [
		{
			Id: 1,
			Length: 21.35,
			Width: 15,
			Quantity: 5
		},
		{
			Id: 2,
			Length: 22.38,
			Width: 15,
			Quantity: 3
		},
		{
			Id: 3,
			Length: 22.38,
			Width: 21.35,
			Quantity: 10
		},
		{
			Id: 4,
			Length: 22.38,
			Width: 15,
			Quantity: 7
		},
		{
			Id: 5,
			Length: 15,
			Width: 3.27,
			Quantity: 9
		},
		{
			Id: 6,
			Length: 12,
			Width: 1,
			Quantity: 11
		},
		{
			Id: 6,
			Length: .75,
			Width: .25,
			Quantity: 250
		}
	];
	let materialWidth = 35;
	let materialLength = null;
	let totalQuantity = 1;
	const distanceBetweenParts = 0;
	const unusableMaterialLength = 1;
	const unusableMaterialWidth = 1;
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

	calculateLayout(parts, materialLength, materialWidth, unusableMaterialLength, unusableMaterialWidth, totalQuantity);
}

let calculateLayout = function(parts, originalMaterialLength, originalMaterialWidth, unusableMaterialLength, unusableMaterialWidth, totalQuantity) {
	const materialWidth = originalMaterialWidth - unusableMaterialLength; // outside inch is unusable
	const materialLength = (originalMaterialLength || 100000) - unusableMaterialWidth;
	let currentLengthIndex = 0	
	let currentWidthIndex = 0

	// create an out line of the material all other parts will reside inside this part
	// We will split the initial material everytime a void is made in the material to try and use later
	let materialAreas = [{
		x:0, 
		y:0, 
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
		const partLength = parts[i].Length;
		const partWidth = parts[i].Width;
		let remainingPartQuantity = parts[i].Quantity;
		let layoutCalculations = null;

		for(let j = 0; j < materialAreas.length; j++) {
			if(!materialAreas[j].used) {
				// calculate how many parts fit in the given area
				// return hash should contain
				// {
				// 	remainingPartQuantity // This should be updated based on how many were actually taken
				// 	newMaterialAreas 	  // This will be any leftover space from the original are that was unused. Could be more than one.
				// }
				layoutCalculations = calculateMaterialAreaLayout(materialAreas[j], partLength, partWidth, remainingPartQuantity);

				console.log('Tried Material', materialAreas[j].length, materialAreas[j].width);
				if(layoutCalculations.newMaterialAreas.length > 0) {
					materialAreas.splice(j, 1);
					
					if(layoutCalculations) {
						materialAreas = materialAreas.concat(layoutCalculations.newMaterialAreas);

						// sort the material areas to ensure the smallest areas are used first
						materialAreas = materialAreas.sort((a, b) => {
							let areaA = a.length * a.width;
							let areaB = b.length * b.width;

							if(areaA < areaB) {
								return -1;
							}

							if(areaA > areaB) {
								return 1;
							}

							return 0;
						});
					}

					remainingPartQuantity = layoutCalculations.remainingPartQuantity;
					
					if(remainingPartQuantity > 0) {
						j = 0; // start over
					} else {
						break;
					}
				}
			}
		}

		
	}		
	
	images = images.concat(materialAreas);
	images = images.concat(materialAreas.reduce((a, b) => {
		return a.concat(b.parts);
	}, []));

	
	console.log(images);
	draw(images);
}

let calculateMaterialAreaLayout = function(materialArea, partLength, partWidth, partQuantity) {
	console.log('----------------------------------------------------------------------------');
	// store the length and width of the material area
	const materialLength = materialArea.length;
	const materialWidth = materialArea.width;
	let parts = [];

	// calculate the number out across the width of the material using the part width
	const numberOutWidth = Math.floor(materialWidth / partWidth);
	// calculate the number out across the width of the material using the part height
	const numberOutWidthFlipped = Math.floor(materialWidth / partLength);

	// Calculate how many time the number out width can be done in the length direction
	// ex. if you can get 3 out of the width and 2 the length that would be 6 parts total
	const numberOutLengthFullMax = Math.floor(partQuantity / numberOutWidth);
	const numberOutLengthFull = Math.min(numberOutLengthFullMax, Math.floor(materialLength / partLength));

	const numberOutLengthFullFlippedMax = Math.floor(partQuantity / numberOutWidthFlipped);
	const numberOutLengthFullFlipped = Math.min(numberOutLengthFullFlippedMax, Math.floor(materialLength / partWidth));

	const remainingPartQuantity = partQuantity - (numberOutWidth * numberOutLengthFull);
	const remainingPartQuantityFlipped = partQuantity - (numberOutWidthFlipped * numberOutLengthFullFlipped);

	console.log("materialLength: ", materialLength);
	console.log("materialWidth: ", materialWidth);
	console.log("numberOutWidth: ", numberOutWidth);
	console.log("numberOutLengthFull: ", numberOutLengthFull, numberOutLengthFullMax);
	console.log("numberOutWidthFlipped: ", numberOutWidthFlipped);
	console.log("numberOutLengthFullFlipped: ", numberOutLengthFullFlipped, numberOutLengthFullFlippedMax);

	let scrap = 0;

	let numberOutFinal = 0;
	let finalPartLength = 0;
	let finalPartWidth = 0;
	let finalRemainingQuantity = 0;

	let numberOutNormal = numberOutWidth * numberOutLengthFull;
	let numberOutflipped = numberOutWidthFlipped * numberOutLengthFullFlipped;

	if(numberOutNormal > numberOutflipped || (isNaN(numberOutflipped) && !isNaN(numberOutNormal)) || numberOutflipped === 0) {
		numberOutFinal = numberOutWidth * numberOutLengthFull;
		finalPartLength = partLength;
		finalPartWidth = partWidth;
		finalRemainingQuantity = remainingPartQuantity;
	} else if(numberOutflipped > numberOutNormal || (!isNaN(numberOutflipped) && isNaN(numberOutNormal)) || numberOutNormal === 0){
		numberOutFinal = numberOutWidthFlipped * numberOutLengthFullFlipped;
		finalPartLength = partWidth;
		finalPartWidth = partLength;
		finalRemainingQuantity = remainingPartQuantityFlipped;
	} else {
		numberOutFinal = numberOutWidth * numberOutLengthFull;
		finalPartLength = partLength;
		finalPartWidth = partWidth;
		finalRemainingQuantity = remainingPartQuantity;
	}


	console.log("NumberOutFinal: ", numberOutFinal);
	console.log("FinalPartLength: ", finalPartLength);
	console.log("FinalPartWidth: ", finalPartWidth);
	console.log("FinalRemainingQuantity: ", finalRemainingQuantity);
	
	// relative to the material area makes the math easier
	let currentX = materialArea.x;
	let currentY = materialArea.y;
	for(let i = 0; i < numberOutFinal; i++) {
		materialArea.parts.push({
			x: currentX,
			y: currentY,
			length: finalPartLength,
			width: finalPartWidth,
			color: 'black',
			type: 'part'
		});

		// don't update position on last iteration makes calculating new areas easier
		if(i !== numberOutFinal - 1) {
			if((currentY - materialArea.y) + (2 * finalPartWidth) <= materialWidth) {
				currentY += finalPartWidth;
			} else {
				currentY = materialArea.y;
				currentX += finalPartLength
			}
		}
	}


	let materialAreas = [];
	if(numberOutFinal > 0) {		
		materialAreas = calculateNewMaterialAreas(materialArea, currentX + finalPartLength, currentY + finalPartWidth);
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
	console.log("MaterialArea: ", materialArea, newMaterialLength)
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

	console.log(materialAreas);
	return materialAreas;
}

let checkIfPartFitsInMaterialArea = function(materialLength, materialWidth, partLength, partWidth) {
	let partFits = true;
	//partFits = partFits && ((materialLength - partLength) > 0 && (materialLength - partWidth) > 0);
	//partFits = partFits && ((materialWidth - partLength) > 0 && (materialWidth - partWidth) > 0);


	return partFits;
}

let draw = function(images) {
	let scale = 10;
	for(let i = 0; i < images.length; i++) {
		if(images[i].type === 'part') {
			ctx.fillStyle = images[i].color;
			ctx.fillRect(images[i].x * scale, images[i].y * scale, images[i].length * scale, images[i].width * scale);
			ctx.strokeStyle = 'grey';
			ctx.strokeRect(images[i].x * scale, images[i].y * scale, images[i].length * scale, images[i].width * scale);
		} else {
			ctx.strokeStyle = images[i].color;
			ctx.strokeRect(images[i].x * scale, images[i].y * scale, images[i].length * scale, images[i].width * scale);	
		}
	}
}

document.addEventListener('DOMContentLoaded', start(), false);

document.getElementById('layout-manager').onmouseover=function(event) {
    var canvasPos = {
        x: this.offsetLeft,
        y: this.offsetTop
    };
    var coord = {
        x: event.pageX-canvasPos.x,
        y: event.pageY-canvasPos.y
    };

    console.log(coord);
};

function getCursorPosition(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	var x = event.clientX - rect.left;
	var y = event.clientY - rect.top;
	console.log("x: " + x + " y: " + y);
}