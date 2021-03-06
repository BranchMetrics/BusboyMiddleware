var Busboy = require('busboy');

module.exports = function BusboyMiddleware(uploadCallback) {
	return function(req, res, next) {
		if (!req.headers['content-type'].match(/multipart\/form-data/)) { return next(); }
		var waiting = 1, done = function() {
			if ((--waiting) == 0) {
				next();
			}
		};

		req.body = {};
		req.files = {};

		var busboy = new Busboy({ headers: req.headers });
		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			var bufs = [];
			file.on('data', function(d) { bufs.push(d); });
			file.on('end', function() {
				var data = {
					field: fieldname,
					name: filename,
					data: Buffer.concat(bufs),
					mime: mimetype
				};

				if (uploadCallback) {
					waiting++;
					uploadCallback(req, res, data, function(err, res) {
						// Not sure if this'll work...
						if (err) {
							return next(err);
							waiting = -1;
						}
						req.files[fieldname] = res;
						done();
					});
				}
				else {
					req.files[fieldname] = data;
				}
			});
		});

		busboy.on('field', function(k, v) { req.body[k] = JSON.parse(v); });
		busboy.on('finish', done);
		req.pipe(busboy);
	};
};
