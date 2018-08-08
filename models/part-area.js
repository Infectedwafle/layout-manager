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
function PartArea(id, x, y, length, width, type, color, full) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.length = length;
	this.width = width;
	this.color = color;
	this.full = full;
	this.type = type;
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