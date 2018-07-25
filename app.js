let canvas = document.getElementById('layout-manager');
let ctx = canvas.getContext("2d");

let start = function() {
	let parts = [
		{
			Id: 1,
			Length: 10,
			Width: 5,
			Quantity: 3
		},
		// {
		// 	Id: 2,
		// 	Length: 5,
		// 	Width: 2.5,
		// 	Quantity: 6
		// },
		// {
		// 	Id: 3,
		// 	Length: 2.5,
		// 	Width: 2.5,
		// 	Quantity: 6
		// }
	];
	let materialWidth = 15;
	let materialLength = null;
	let totalQuantity = 1;
	const distanceBetweenParts = 0;
	const unusableMaterialLength = 1;
	const unusableMaterialWidth = 1;

	calculateLayout(parts, materialLength, materialWidth, unusableMaterialLength, unusableMaterialWidth, totalQuantity);
}

let calculateLayout = function(parts, materialLength, materialWidth, unusableMaterialLength, unusableMaterialWidth, totalQuantity) {
	materialWidth = materialWidth - unusableMaterialLength; // outside inch is unusable
	materialLength = (materialLength || 100000) - unusableMaterialWidth;
	let currentLength = materialLength;
	let currentWidth = materialWidth;
	let currentLengthIndex = 0	
	let currentWidthIndex = 0

	// create an out line of the material all other parts will reside inside this part
	// We will split the initial material everytime a void is made in the material to try and use later
	let materialAreas = [{x:0, y:0, length: materialLength || 100000, width: materialWidth }];
	// array to hold all part locations that come from the layout calculator
	let partImages = [];
	
	for(let i = 0; i < parts.length; i++) {
		const partLength = parts[i].Length;
		const partWidth = parts[i].Width;
		let remainingPartQuantity = parts[i].Quantity;

		for(let j = 0; j < materialAreas.length; j++) {
			const currentMaterialLength = materialAreas[j].length;
			const currentMaterialWidth = materialAreas[j].width;

			// calculate how many parts fit in the given area
			// return hash should contain
			// {
			// 	remainingPartQuantity // This should be updated based on how many were actually taken
			// 	newMaterialAreas // This will be any leftover space from the original are that was used. Could be more than one.
			// }
			let usageCalculations = calculatePartLayout(currentMaterialLength, currentMaterialWidth, partLength, partWidth, remainingPartQuantity);
			






			partImages = partImages.concat(usageCalculations.partImages);
			partImages = partImages.concat(materialAreas);



			console.log(partImages);
			draw(partImages);
		}
	}		
}

let calculatePartLayout = function(materialLength, materialWidth, partLength, partWidth, partQuantity) {
	const numberOutWidth = Math.floor(materialWidth / partWidth);
	const numberOutWidthFlipped = Math.floor(materialWidth / partLength);

	// Calculate how many time the number out width can be done in the length direction
	// ex. if you can get 3 out of the width and 2 the length that would be 6 parts total
	const numberOutLengthFull = Math.floor(partQuantity / numberOutWidth);
	const numberOutLengthFullFlipped = Math.floor(partQuantity / numberOutWidthFlipped);

	const remainingPartQuantity = partQuantity - (numberOutWidth * numberOutLengthFull);
	const remainingPartQuantityFlipped = partQuantity - (numberOutWidthFlipped * numberOutLengthFullFlipped);


	console.log(remainingPartQuantity, remainingPartQuantityFlipped);

	return {
		partImages: [{x: 0, y: 0}]
	};
}

let draw = function(partImages) {
	let scale = 10;
	for(let i = 0; i < partImages.length; i++) {
		ctx.strokeRect(partImages[i].x * scale, partImages[i].y * scale, partImages[i].length * scale, partImages[i].width * scale);	
	}
}

document.addEventListener('DOMContentLoaded', start(), false);

