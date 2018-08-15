/**
 * Creates a part area object for one instance of a part laid out on a material area.
 *
 * @class      PartArea (name)
 * @param      {<type>}  id      The identifier
 * @param      {<type>}  x       { x coordinate of the part area }
 * @param      {<type>}  y       { y coordinate of the part area }
 * @param      {<type>}  length  The length
 * @param      {<type>}  width   The width
 * @param      {<type>}  type    The type
 * @param      {<type>}  color   The color
 * @param      {<type>}  full    A flag stating if the are is full or not
 */
function PartArea(id, x, y, length, width, type, color, full, trimSettings) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.length = length;
	this.width = width;
	this.color = color;
	this.full = full;
	this.type = type;

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
}

/**
 * Calculates the area of the part area
 *
 * @return     {Number}  { area of part }
 */
PartArea.prototype.area = function() {
	return this.length + this.width;
}

/**
 * Calculates the perimeter of the part area
 *
 * @return     {Number}  { perimeter of part }
 */
PartArea.prototype.perimeter = function() {
	return (this.lenght * 2) + (this.width * 2);
}

PartArea.prototype.draw = function(ctx, scale) {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x * scale, this.y * scale, this.length * scale, this.width * scale);
	ctx.strokeStyle = 'grey';
	ctx.strokeRect(this.x * scale, this.y * scale, this.length * scale, this.width * scale);
}

export default PartArea;