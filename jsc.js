Jsc = function(input, output, vars, error) {
	this._inputStream  = input;
	this._outputStream = output;
	this._errorStream  = error;
	this._varStream    = vars;
	this._pos = 0;
	this._look = '';
	this.vars = {};
	this.tokens = [];
}

var cKeyWords = [	'auto', 'break', 'case', 'char',
					'const', 'continue', 'default', 'do',
					'double', 'else', 'enum', 'extern', 
					'float', 'for', 'goto', 'if',
					'int', 'long', 'register', 'return'
					'short', 'signed', 'sizeof', 'static',
					'struct', 'switch', 'typedef', 'union',
					'unsigned', 'void', 'volatile', 'while'];

Jsc.prototype.main = function() {
	var tokens = this.lex();
	console.log(this.tokens);
	this._outputStream.value = printTokens(this.tokens);
}

Jsc.prototype.getChar = function() {
	this._look = this._inputStream.value.slice(this._pos, this._pos+1);
	this._pos++;
	return this._look;
};

Jsc.prototype.addToken = function (type, value) {
	this.tokens.push({
		type: type,
		value: value
	});
};

Jsc.prototype.skipWhiteSpace = function () {
	while (isWhiteSpace(this._look)) {
		this.getChar();
	}
};

Jsc.prototype.lex = function () {
	this.getChar();
	do {
		this.skipWhiteSpace();

		if (isOperator(this._look)) {
			this.addToken('Operator', this._look);
			this.getChar();
		} else if (isDigit(this._look)) {
			var num = this._look;
			while (isDigit(this.getChar())) {
				num += this._look;
				
			}
			if (this._look === ".") {
				do num += this._look; while (isDigit(this.getChar()));
			}
			num = parseFloat(num);
			if (!isFinite(num)) throw "Number is too large for 64-bit double";
			this.addToken('Number', num);
		} else if (isIdentifier(this._look)) {
			var idn = this._look;
			while (isIdentifier(this.getChar())) {
				idn += this._look;
			}
			var kw = false;
			for (var key in cKeyWords) {
				let x = cKeyWords[key];
				if (idn == x) {
					this.addToken('Key Word', idn);
					kw = true;
					break;
				}
			}
			if (!kw) {
				this.addToken('Identifier', idn);
			}
		} else {
			throw 'Unrecognised token.';
		}
		
	} while (this._look != '');
	this.addToken('(end)');
	return this.tokens;
};

var isOperator = function(c) {
	return /[+\-*\/\^%=(),{}\[\];]/.test(c);
};

var isDigit = function(c) {
	return /[0-9]/.test(c);
};

var isWhiteSpace = function(c) {
	let res = [' ', '\t', '\n'].indexOf(c) > -1;
	return res;
};

var isIdentifier = function(c) {
	return typeof 	c === "string" && 
					!isOperator(c) && 
					!isDigit(c) && 
					!isWhiteSpace(c) && 
					c != '';
};


var printTokens = function (tokens) {
	let l = tokens.length;
	str = "Tokens:";
	for (var i=0; i< l; i++) {
		var token = tokens[i];
		str += "\n\ttype: " + token['type'];
		str += ", value: " + token['value'];
	}
	return str;
}
