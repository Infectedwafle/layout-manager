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
function MaterialArea(x, y, length, width, type, color, full) {
	this.x = x;
	this.y = y;
	this.length = length;
	this.width = width;
	this.parts = [];
	this.color = color;
	this.full = full;
	this.type = type;
}

MaterialArea.prototype.area = function() {
	return (this.lenght * 2) + (this.width * 2);
}