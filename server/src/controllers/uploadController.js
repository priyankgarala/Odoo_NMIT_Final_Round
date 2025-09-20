export const upload_single = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const file = req.file;
      res.status(201).json({
        message: "File uploaded",
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filename: file.filename,
          url: `/uploads/${file.filename}`,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Upload failed" });
    }
  };
  
  export const upload_multiple = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });
      const files = req.files.map((file) => ({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        filename: file.filename,
        url: `/uploads/${file.filename}`,
      }));
      res.status(201).json({ message: "Files uploaded", files });
    } catch (error) {
      res.status(400).json({ message: error.message || "Upload failed" });
    }
  };
  
  export default { upload_single, upload_multiple };
  
  
  