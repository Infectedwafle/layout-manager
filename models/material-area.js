/**
 * Creates a material area object representing used/free space on a material.
 *
 * @class      MaterialArea (name)
 * @param      {<type>}  x       { parameter_description }
 * @param      {<type>}  y       { parameter_description }
 * @param      {<type>}  length  The length
 * @param      {<type>}  width   The width
 * @param      {<type>}  type    The type
 * @param      {<type>}  color   The color
 * @param      {<type>}  full    The full
 */
function MaterialArea(x, y, length, width, type, color, full, trimSettings) {
	this.x = x;
	this.y = y;
	this.length = length;
	this.width = width;
	this.type = type;
	this.color = color;
	this.full = full;
	this.trimSettings = trimSettings;

	if(trimSettings) {
		this.trimColor = trimSettings.color;
		this.topTrim = trimSettings.top;
		this.bottomTrim = trimSettings.bottom;
		this.leftTrim = trimSettings.left;
		this.rightTrim = trimSettings.right;
	} else {
		this.trimColor = null;
		this.topTrim = 0;
		this.bottomTrim = 0;
		this.leftTrim = 0;
		this.rightTrim = 0;
	}
	
	this.partAreas = [];
	this.materialAreas = [];
}

/**
 * Calculates the area of the material area
 * 
 * @return {[type]} [description]
 */
MaterialArea.prototype.area = function() {
	return this.length * this.width;
}

/**
 * Calcultes the perimeter of the material area
 * 
 * @return {[type]} [description]
 */
MaterialArea.prototype.perimeter = function() {
	return (this.length * 2) + (this.width * 2);
}

/**
 * draws the material area on canvas
 * @param  {[type]} ctx   [description]
 * @param  {[type]} scale [description]
 * @return {[type]}       [description]
 */
MaterialArea.prototype.draw = function(ctx, scale) {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x * scale, this.y * scale, this.length * scale, this.width * scale);	
	ctx.strokeStyle = 'black';
	ctx.strokeRect(this.x * scale, this.y * scale, this.length * scale, this.width * scale);

	if(this.topTrim) {
		ctx.fillStyle = this.trimColor;
		//ctx.fillRect(this.x * scale, this.y * scale, this.length * scale, this.topTrim * scale);
	}

	if(this.bottomTrim) {
		ctx.fillStyle = this.trimColor;
		//ctx.fillRect(this.x * scale, ((this.y + this.width) - this.bottomTrim) * scale, this.length * scale, this.bottomTrim * scale);
	}

	if(this.leftTrim) {
		ctx.fillStyle = this.trimColor;
		//ctx.fillRect(this.x * scale, this.y * scale, this.leftTrim * scale, this.width * scale);
	}

	if(this.rightTrim) {
		ctx.fillStyle = this.trimColor;
		//ctx.fillRect(((this.x + this.length) - this.rightTrim) * scale, this.y * scale, this.rightTrim * scale, this.width * scale);
	}

	if(this.partAreas.length > 0) {
		for(let i = 0; i < this.partAreas.length; i++) {
			this.partAreas[i].draw(ctx, scale);
		}
	}

}

export default MaterialArea;