import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Setup Multer for secure memory upload buffering
const upload = multer({
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB
  }
});

app.use(express.json());

// API Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'KernelLab Algorithmic Precision Vision Server',
    engine: 'Python OpenCV (DoG + CLAHE + Structure Tensor)',
    version: '1.0.0'
  });
});

// POST /api/filters/pencil-sketch
app.post('/api/filters/pencil-sketch', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  // Parse parameters with original algorithm defaults
  const lineStrength = parseFloat(req.body.line_strength || '0.9');
  const hatchStrength = parseFloat(req.body.hatch_strength || '0.85');
  const toneStrength = parseFloat(req.body.tone_strength || '0.65');
  const grainStrength = parseFloat(req.body.grain_strength || '0.16');
  const paperTone = parseFloat(req.body.paper_tone || '0.08');
  const maxDim = parseInt(req.body.max_dim || '1800', 10);
  const seed = parseInt(req.body.seed || '42', 10);

  // Secure temporary workspace
  const sessionId = Math.random().toString(36).substring(2, 12);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `kernellab_${sessionId}_`));
  const ext = path.extname(file.originalname) || '.png';
  const inputPath = path.join(tempDir, `input${ext}`);
  const outputPath = path.join(tempDir, 'output.png');

  try {
    // Write uploaded buffer to disk for OpenCV processing
    fs.writeFileSync(inputPath, file.buffer);

    const cliPath = path.resolve(__dirname, 'backend', 'process_cli.py');

    // Detect virtual environment python or system python
    const pythonBinary = fs.existsSync('/app/venv/bin/python3')
      ? '/app/venv/bin/python3'
      : fs.existsSync(path.resolve(__dirname, 'venv', 'bin', 'python3'))
      ? path.resolve(__dirname, 'venv', 'bin', 'python3')
      : 'python3';

    // Execute Python script directly
    const pyProcess = spawn(pythonBinary, [
      cliPath,
      '--input', inputPath,
      '--output', outputPath,
      '--max-dim', maxDim.toString(),
      '--line-strength', lineStrength.toString(),
      '--hatch-strength', hatchStrength.toString(),
      '--tone-strength', toneStrength.toString(),
      '--grain-strength', grainStrength.toString(),
      '--paper-tone', paperTone.toString(),
      '--seed', seed.toString()
    ]);

    let stderr = '';
    let stdout = '';

    pyProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pyProcess.on('close', (code) => {
      try {
        if (code === 0 && fs.existsSync(outputPath)) {
          const processedBuffer = fs.readFileSync(outputPath);
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('X-KernelLab-Engine', 'Python-OpenCV-CLAHE-DoG');
          res.setHeader('Content-Disposition', 'inline; filename="pencil_sketch.png"');
          res.send(processedBuffer);
        } else {
          console.error('Python execution error:', stderr);
          res.status(500).json({
            error: 'Python Pencil Sketch execution failed',
            details: stderr || stdout || 'Unknown error during Python OpenCV processing',
            hint: 'Verify Python dependencies (opencv-python-headless, numpy, scipy)'
          });
        }
      } finally {
        // Guaranteed cleanup of temp files
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
        } catch (cleanupErr) {
          console.warn('Temp cleanup warning:', cleanupErr);
        }
      }
    });

    pyProcess.on('error', (err) => {
      console.error('Failed to spawn Python process:', err);
      // Clean up
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
      } catch (e) {}

      res.status(503).json({
        error: 'Python runtime unavailable on host',
        details: err.message
      });
    });

  } catch (err: any) {
    console.error('Server error handling upload:', err);
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    } catch (e) {}

    res.status(500).json({ error: 'Internal server processing error', details: err.message });
  }
});

// Mounting Vite in development or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KernelLab Full-Stack server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
