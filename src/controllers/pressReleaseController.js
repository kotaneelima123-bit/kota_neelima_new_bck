
const PressRelease = require('../models/pressReleaseModel');
const mongoose = require('mongoose');
const { uploadToS3 } = require('../utility/awsS3');

// ===============================
// CREATE PRESS RELEASE
// ===============================
exports.createPressRelease = async (req, res) => {
  try {
    const { title, description, url } = req.body;

    if (!title || !description || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and URL are required'
      });
    }

    let pdf = null;

    // PDF is optional
    if (req.file) {
      pdf = await uploadToS3(req.file);
    }

    const newPressRelease = new PressRelease({
      title,
      description,
      url,
      pdf
    });

    await newPressRelease.save();

    res.status(201).json({
      success: true,
      message: 'Press Release created successfully',
      pressRelease: newPressRelease
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// ===============================
// GET ALL PRESS RELEASES
// ===============================
exports.getAllPressReleases = async (req, res) => {
  try {
    const list = await PressRelease.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      total: list.length,
      pressReleases: list
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// ===============================
// GET PRESS RELEASE BY ID
// ===============================
exports.getPressReleaseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const pressRelease = await PressRelease.findById(id);

    if (!pressRelease) {
      return res.status(404).json({
        success: false,
        message: 'Press Release not found'
      });
    }

    res.json({
      success: true,
      pressRelease
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// ===============================
// UPDATE PRESS RELEASE
// ===============================
exports.updatePressRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const pressRelease = await PressRelease.findById(id);

    if (!pressRelease) {
      return res.status(404).json({
        success: false,
        message: 'Press Release not found'
      });
    }

    // Update text fields only if provided
    if (title !== undefined) {
      pressRelease.title = title;
    }

    if (description !== undefined) {
      pressRelease.description = description;
    }

    if (url !== undefined) {
      pressRelease.url = url;
    }

    // If new PDF is uploaded, replace the old PDF URL
    if (req.file) {
      const pdfUrl = await uploadToS3(req.file);
      pressRelease.pdf = pdfUrl;
    }

    await pressRelease.save();

    res.json({
      success: true,
      message: 'Press Release updated successfully',
      pressRelease
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// ===============================
// DELETE PRESS RELEASE
// ===============================
exports.deletePressRelease = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const deleted = await PressRelease.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Press Release not found'
      });
    }

    res.json({
      success: true,
      message: 'Press Release deleted successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




// const PressRelease = require('../models/pressReleaseModel');
// const mongoose = require('mongoose');

// // CREATE
// exports.createPressRelease = async (req, res) => {
//   try {
//     const { title, description, url } = req.body;

//     if (!title || !description || !url) {
//       return res.status(400).json({ success: false, message: 'Title, description, and URL are required' });
//     }

//     const newPressRelease = new PressRelease({ title, description, url });
//     await newPressRelease.save();

//     res.status(201).json({ success: true, message: 'Press Release created successfully', pressRelease: newPressRelease });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // GET ALL
// exports.getAllPressReleases = async (req, res) => {
//   try {
//     const list = await PressRelease.find().sort({ createdAt: -1 });
//     res.json({ success: true, total: list.length, pressReleases: list });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // GET BY ID
// exports.getPressReleaseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid ID' });
//     }

//     const pressRelease = await PressRelease.findById(id);
//     if (!pressRelease) {
//       return res.status(404).json({ success: false, message: 'Press Release not found' });
//     }

//     res.json({ success: true, pressRelease });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // UPDATE
// exports.updatePressRelease = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, url } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid ID' });
//     }

//     const updated = await PressRelease.findByIdAndUpdate(
//       id,
//       { title, description, url },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ success: false, message: 'Press Release not found' });
//     }

//     res.json({ success: true, message: 'Press Release updated successfully', pressRelease: updated });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // DELETE
// exports.deletePressRelease = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid ID' });
//     }

//     const deleted = await PressRelease.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ success: false, message: 'Press Release not found' });
//     }

//     res.json({ success: true, message: 'Press Release deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
