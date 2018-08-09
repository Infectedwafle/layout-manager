/**
 * Creates a part object
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
function Part(id, length, width, quantity) {
	this.id = id;
	this.length = length;
	this.width = width;
	this.quantity = quantity;
	this.spacingTop = null;
	this.spacingBottom = null;
	this.spacingLeft = null;
	this.spacingRight = null;
	this.remainingQuantity = quantity;
}

/**
 * Calculates the area of the part area
 *
 * @return     {Number}  { area of part }
 */
Part.prototype.area = function() {
	return this.length + this.width;
}

/**
 * Calculates the perimeter of the part area
 *
 * @return     {Number}  { perimeter of part }
 */
Part.prototype.perimeter = function() {
	return (this.lenght * 2) + (this.width * 2);
}

export default Part;