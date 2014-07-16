## Motivation

Integration with busboy is a headache. Most existing solutions, to make things easier, save files to disk. This one keeps them in a buffer instead.

## Use

```javascript

var app = require('express')();

app.use(require('BusboyMiddleware')());

app.get('/', function(req, res) {
	res.writeHead(200, { Connection: 'close' });
	res.end('<html><head></head><body><form method="POST" enctype="multipart/form-data">\
				<input type="text" name="textfield"><br />\
				<input type="file" name="filefield"><br />\
				<input type="submit">\
			</form></body></html>');
	}
});

app.post('/', function(req, res) {
	console.log(req.body.textfield);
	console.log(req.files.filefield.name, req.files.filefield.data, req.files.filefield.mime);
});

```

## Advanced use - provide upload callback

```javascript

var app = require('express')();

app.use(require('BusboyMiddleware')(function(req, file, cb) {
	var customFilename = file.name.replace(/^[a-zA-Z0-9]/g, '') + (new Date().getTime());
	uploadToS3(customFilename, file.data, function(err, ret) {
		if (err) { cb(err); }
		else { cb(null, { name: customFilename }); }
	});
}));

app.get('/', function(req, res) {
	res.writeHead(200, { Connection: 'close' });
	res.end('<html><head></head><body><form method="POST" enctype="multipart/form-data">\
				<input type="text" name="textfield"><br />\
				<input type="file" name="filefield"><br />\
				<input type="submit">\
			</form></body></html>');
	}
});

app.post('/', function(req, res) {
	console.log(req.body.textfield);
	console.log(req.files.filefield.name); // customFilename
});

```

