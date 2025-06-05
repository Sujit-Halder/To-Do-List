const fs = require('fs');
const path = require('path');

exports.ensureFileExists = (filePath, initialData) => {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(initialData, null, 2));
  }
};
