/*

	Re-link image files to database records
		Currently gneerates sql batch file; more work to come
*/

var ExifReader = require('../../js/ExifReader.js').ExifReader;
var jDataView = require('../../js/jdataview.js');
var path = require('path');
var fs = require('fs');

// Search for first record that has a given key
//   Note: duplicates common
function objectFindByKey(array, key) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key]) {
            return i;
        }
    }
    return null;
}

// Make sure user has given us an argument; no other error checking
if (process.argv.length < 3) {
	console.log('Usage: node ' + path.basename(__filename) + ' <filename>');
	return;
}

// Set up variables
var directory = process.argv[2];
var lookup = [],
	match = {},
  aid, coord;

// This is the file that will allow us to "assign" images to asset records
//   Read in file contents as an array of strings
//   aid = assetID, cart=Cartesian location
var syncro = fs.readFileSync('aid-cart.txt').toString().split("\n");

// Split each line into an element of the object array lookup
for(i in syncro) {
    // Vertical bar separates aid from cartCoord
    var pieces = syncro[i].split('|')

		// Don't blow up if we hit an empty line
		if (typeof(pieces[1]) != 'string')
		  break;

    // Remove leading/trailing spaces
		aid = pieces[0].trim()
	  coord = pieces[1].trim()

    // Assign asset ID to coordinate key
		match[coord] = aid
		// console.log(JSON.stringify(match))
    // Add record to arrayl and clear record var
    lookup.push(match)
		match = {}
	}
// console.log(JSON.stringify(lookup))

// Get list of image files
var files = fs.readdirSync(directory);

// Generate a line of SQL for each file
//   Each marker can have muliple images
files.forEach(function (path) {
  // Filename without directory prefix
	var justPath = path;
	path = directory + path;
	// console.log('Processing: ' + path);

  // Process each image file
	fs.readFile(path, function (err, data) {
		if (err) {
			console.log('Error reading file.');
			return;
		}

		try {
			var exif = new ExifReader();

			// Parse the Exif tags.
			exif.loadView(new jDataView(data));

			// Output fields of interest
      //  in this case ONLY our Sub-location
			var tags = exif.getAllTags();
			// console.log(justPath);
			var index, subLocation;

      // Process all tags for this image
			for (name in tags) {
			  // console.log(name + '*');tags[name].description

        // We only want one field
			  var pattern = /Sub-location/;
        // On match, extract info and generate a line of SQL
				if (pattern.test(name)) {
					subLocation = tags[name].description;
					// console.log('Finding for ' + subLocation + ' in ' + justPath)
					index = objectFindByKey(lookup, subLocation)
					// console.log('Got aid of ' + lookup[index][subLocation] + ' for sublocation ' + subLocation)
					if (index) {
						// "Allocate" this aid and remove it from lookup table
						// console.log("Fetching location from " + index)
						aid = lookup[index][subLocation]
						// console.log('Got ' + aid)
						lookup.splice(index, 1);

  					console.log("update asset set imagename = '" + justPath +
  					  "' where aid = '" + aid + "';");
  				  // console.log('Value of sublocation = ' + subLocation);
  			    console.log('\r')
          }
    else {
      // Generate error message
      console.log('-- Error bad tag: ' + justPath + ' ' + subLocation)
      console.log()
    }
	}
}
}
		catch (error) {
			console.log(error);
		}
	});
});
