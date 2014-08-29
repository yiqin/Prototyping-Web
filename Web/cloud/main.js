require('cloud/app.js');

var resizeImageKey = require('cloud/resize-image-key');
var ImageMetadata = Parse.Object.extend("ImageMetadata");

var NORMAL_WIDTH = 612;
var SMALL_WIDTH = 110;

// Resize image into various sizes before saving
Parse.Cloud.beforeSave("Image", function(req, res) {
  var original = req.object.get('sizeOriginal');

  Parse.Promise.as().then(function() {
    // Create an image metadata object on creation
    if (req.object.isNew()) {
      var im = new ImageMetadata;
      im.set("views", 0);
      return im.save();    
    }
  }).then(function(im) {
    // Set the metadata object relationship
    if (im) {
      req.object.set("imageMetadata", im);
    }
    
    if (!original) {
      return Parse.Promise.error("No original sized image file set.");
    }

    if (!req.object.dirty("sizeOriginal")) {
      // The original isn't being modified.
      return Parse.Promise.as();
    }

    // Don't set blank titles
    if (req.object.get("title").length === 0) {
      req.object.unset("title");
    }

    // Resize to a normal "show" page image size  
    return resizeImageKey({
      object: req.object,
      fromKey: "sizeOriginal",
      toKey: "sizeNormal",
      width: NORMAL_WIDTH
    })
  }).then(function() {
    // Resize to a smaller size for thumbnails
    return resizeImageKey({
      object: req.object,
      fromKey: "sizeOriginal",
      toKey: "sizeSmall",
      width: SMALL_WIDTH,
      crop: true
    });
  }).then(function(result) {
    res.success();
  }, function(error) {
    res.error(error);
  });
});

// Does all the work to update metadata about an image upon a view
Parse.Cloud.define("viewImage", function(request, response) {
  // Use the master key to prevent clients from tampering with view count
  Parse.Cloud.useMasterKey();
  var object = new ImageMetadata;
  object.id = request.params.metadataId;
  
  object.increment("views");
  object.save().then(function() {
    response.success();
  }, function(error) {
    response.error(error);
  });
});
