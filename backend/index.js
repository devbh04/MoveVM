import 'dotenv/config';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import fs from 'fs/promises';
import fs from "fs";
import { exec, spawn } from "child_process";
import path from "path";

import util from "util";
import YAML from "yaml";
import { connectDB, Project } from "./db.js";
const execPromise = util.promisify(exec);

const app = express();
// Use environment variable or default to local path for development
// Note: Directory can be named "aptos" or "movement" - Movement CLI will create .movement config directory inside
const MOVEMENT_DIR = process.env.MOVEMENT_DIR || path.join(process.cwd(), "app", "aptos");
const MOVE_FILE = path.join(MOVEMENT_DIR, "sources", "project.move");

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

async function updateMoveTomlAddress(newAddress) {
  const moveTomlPath = path.join(MOVEMENT_DIR, "Move.toml");
  if (!fs.existsSync(moveTomlPath)) {
    throw new Error("Move.toml does not exist.");
  }
  let content = await fs.promises.readFile(moveTomlPath, "utf8");
  // Ensure address starts with 0x
  const addressWith0x = newAddress.startsWith("0x")
    ? newAddress
    : `0x${newAddress}`;
  
  // Update the first non-std address key in [addresses] section
  // This handles cases like "SimpleCounter", "validator", etc.
  let found = false;
  let updated = content.replace(
    /(\[addresses\][\s\S]*?)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*("[^"]*")/g,
    (match, addressesSection, keyName, value) => {
      // Skip if it's the std address or if we already updated one
      if (keyName === "std" || found) {
        return match;
      }
      // Update the first non-std address
      found = true;
      return `${addressesSection}${keyName} = "${addressWith0x}"`;
    }
  );
  
  await fs.promises.writeFile(moveTomlPath, updated, "utf8");
}

//write a function to update move toml project name and address name based on the move code given by the user
async function updateMoveTomlProjectNameAndAddress(moveCode) {
  const moveTomlPath = path.join(MOVEMENT_DIR, "Move.toml");
  if (!fs.existsSync(moveTomlPath)) {
    throw new Error("Move.toml does not exist.");
  }
  let content = await fs.promises.readFile(moveTomlPath, "utf8");

  // Extract the module declaration, e.g., "module SendMessage::sendMessage"
  const moduleMatch = moveCode.match(
    /module\s+([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)/
  );
  if (!moduleMatch) {
    throw new Error("Move code does not contain a valid module declaration.");
  }
  const addressName = moduleMatch[1]; // e.g., SendMessage
  const moduleName = moduleMatch[2]; // e.g., sendMessage

  // Update [package] name = "sendMessage"
  content = content.replace(
    /(\[package\][\s\S]*?name\s*=\s*")[^"]*(")/,
    `$1${moduleName}$2`
  );

  // change only the key name after [addresses], not the value (preserve the existing value)
  content = content.replace(
    /(\[addresses\][\s\r\n]*)([a-zA-Z0-9_]+)(\s*=\s*"[^"]*")/,
    `$1${addressName}$3`
  );

  await fs.promises.writeFile(moveTomlPath, content, "utf8");
}

// ============================================
// PROJECT MANAGEMENT ENDPOINTS
// ============================================

// Get all projects
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ lastModified: -1 })
      .select('-__v');
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single project
app.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new project
app.post("/projects", async (req, res) => {
  try {
    const { name } = req.body;
    const project = new Project({ 
      name,
      files: [{
        name: 'project.move',
        content: '',
        path: 'sources',
        type: 'source',
        readOnly: false,
        lastModified: new Date()
      }]
    });
    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project
app.put("/projects/:id", async (req, res) => {
  try {
    const { name, networkType, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, networkType, status, lastModified: new Date() },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project
app.delete("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FILE MANAGEMENT ENDPOINTS
// ============================================

// Get all files for a project
app.get("/projects/:id/files", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    res.json({ success: true, files: project.files || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add or update a file
app.post("/projects/:id/files", async (req, res) => {
  try {
    const { name, content, path: filePath, type } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    // Only save source and config files to DB (not build files)
    const fileType = type || 'source';
    const isWritable = fileType === 'source' || fileType === 'config';
    
    if (isWritable) {
      // Write to filesystem for source files only (NOT Move.toml)
      if (fileType === 'source') {
        // Remove 'sources' or 'sources/' prefix if present
        const cleanPath = filePath ? filePath.replace(/^sources\/?/, '') : '';
        const fullPath = cleanPath 
          ? path.join(MOVEMENT_DIR, 'sources', cleanPath, name)
          : path.join(MOVEMENT_DIR, 'sources', name);
        
        // SAFETY CHECK: Don't overwrite existing file with empty content
        // Only write empty content if file doesn't exist yet (new file creation)
        const fileExists = fs.existsSync(fullPath);
        if (fileExists && !content) {
          console.warn(`⚠️  Prevented overwriting ${name} with empty content`);
          // Don't write to filesystem, but still update DB
        } else {
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
          }
          
          await fs.promises.writeFile(fullPath, content, 'utf8');
        }
      }
      // Move.toml is read-only - we fetch it from backend but don't write to it
      
      // Update DB
      const existingFileIndex = project.files.findIndex(f => f.name === name && f.path === filePath);
      
      if (existingFileIndex >= 0) {
        // Update existing file
        project.files[existingFileIndex].content = content;
        project.files[existingFileIndex].lastModified = new Date();
      } else {
        // Add new file
        project.files.push({
          name,
          content,
          path: filePath || '',
          type: fileType,
          readOnly: false,
          lastModified: new Date()
        });
      }
      
      await project.save();
    }
    
    res.json({ success: true, files: project.files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a file
app.delete("/projects/:id/files/:fileName", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    const fileName = req.params.fileName;
    const fileToDelete = project.files.find(f => f.name === fileName);
    
    if (fileToDelete && !fileToDelete.readOnly) {
      // Delete from filesystem if it's a source file
      if (fileToDelete.type === 'source') {
        // Remove 'sources' or 'sources/' prefix if present
        const cleanPath = fileToDelete.path ? fileToDelete.path.replace(/^sources\/?/, '') : '';
        const fullPath = cleanPath
          ? path.join(MOVEMENT_DIR, 'sources', cleanPath, fileName)
          : path.join(MOVEMENT_DIR, 'sources', fileName);
        
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
      }
      
      // Delete from DB
      project.files = project.files.filter(f => f.name !== fileName);
      await project.save();
    }
    
    res.json({ success: true, files: project.files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync files from backend filesystem
app.get("/projects/:id/sync-files", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    const syncedFiles = [];
    
    // Read source files
    const sourcesDir = path.join(MOVEMENT_DIR, "sources");
    if (fs.existsSync(sourcesDir)) {
      const sourceFiles = fs.readdirSync(sourcesDir);
      for (const file of sourceFiles) {
        if (file.endsWith('.move')) {
          const filePath = path.join(sourcesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          syncedFiles.push({
            name: file,
            content,
            path: 'sources',
            type: 'source',
            readOnly: false
          });
        }
      }
    }
    
    // Read Move.toml (read-only - for display only, not editable)
    const moveTomlPath = path.join(MOVEMENT_DIR, "Move.toml");
    if (fs.existsSync(moveTomlPath)) {
      const content = fs.readFileSync(moveTomlPath, 'utf8');
      syncedFiles.push({
        name: 'Move.toml',
        content,
        path: '',
        type: 'config',
        readOnly: true  // Make Move.toml read-only
      });
    }
    
    // Read build files (read-only)
    const buildDir = path.join(MOVEMENT_DIR, "build");
    if (fs.existsSync(buildDir)) {
      const walkDir = (dir, basePath = 'build') => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          const relativePath = path.join(basePath, file);
          
          if (stat.isDirectory()) {
            walkDir(filePath, relativePath);
          } else if (file.endsWith('.move') || file.endsWith('.mv') || file.endsWith('.yaml')) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              syncedFiles.push({
                name: file,
                content,
                path: relativePath.replace(`${file}`, '').replace(/\\/g, '/'),
                type: 'build',
                readOnly: true
              });
            } catch (e) {
              // Skip binary files
            }
          }
        }
      };
      walkDir(buildDir);
    }
    
    // Update project with synced files
    project.files = syncedFiles;
    await project.save();
    
    res.json({ success: true, files: syncedFiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DEPLOYMENT ENDPOINTS
// ============================================

// Add and init route to initialize movement and get the address in response

app.post("/init", async (req, res) => {
  try {
    const { privateKey, networkType = "testnet", projectId, moveCode } = req.body; // Get privateKey and networkType from request body
    // Store in a variable for later use
    let userPrivateKey = privateKey || "";

    // 1. Check if movement CLI is installed and in PATH
    try {
      await execPromise("movement --version");
    } catch (cliErr) {
      return res.status(500).json({
        success: false,
        step: "movement_cli_missing",
        error: "Movement CLI is not installed or not in PATH.",
        details: cliErr.message,
      });
    }
    // 2. Check if directory exists (can be app/aptos or app/movement)
    if (!fs.existsSync(MOVEMENT_DIR)) {
      return res.status(500).json({
        success: false,
        step: "movement_dir_missing",
        error: `Directory does not exist at ${MOVEMENT_DIR}. Please ensure the directory exists.`,
      });
    }

    // 2.5. Check if already initialized - if config exists, return existing address
    const existingConfigPath = path.join(MOVEMENT_DIR, ".movement", "config.yaml");
    if (fs.existsSync(existingConfigPath)) {
      try {
        const configContent = fs.readFileSync(existingConfigPath, "utf8");
        const config = YAML.parse(configContent);
        const address =
          config.profiles &&
          config.profiles.default &&
          config.profiles.default.account;
        
        if (address) {
          // Extract module name from moveCode if provided
          let moduleName = null;
          if (moveCode) {
            const moduleMatch = moveCode.match(/module\s+[a-zA-Z_][a-zA-Z0-9_]*::([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (moduleMatch) {
              moduleName = moduleMatch[1];
            }
          }
          
          // Save to database even when using existing config
          if (projectId) {
            try {
              const historyEntry = {
                type: 'init',
                status: 'success',
                timestamp: new Date(),
                data: {
                  address,
                  moduleName,
                  packageName: moduleName,
                  faucetUrl: `https://faucet.movementnetwork.xyz/?address=${address}`,
                  log: "Using existing configuration.",
                }
              };

              await Project.findByIdAndUpdate(projectId, {
                $push: { deploymentHistory: historyEntry },
                initData: {
                  address,
                  moduleName,
                  packageName: moduleName,
                  faucetUrl: `https://faucet.movementnetwork.xyz/?address=${address}`,
                  log: "Using existing configuration.",
                  timestamp: new Date()
                },
                status: 'initialized',
                networkType
              });
            } catch (e) {
              console.error("Failed to save init data to project:", e);
            }
          }
          
          return res.status(200).json({
            success: true,
            message: "Movement CLI already initialized.",
            address: address,
            moduleName: moduleName,
            packageName: moduleName,
            log: "Using existing configuration.",
          });
        }
      } catch (e) {
        // If config exists but is invalid, continue with re-initialization
        console.log("Existing config invalid, re-initializing:", e.message);
      }
    }

    // 3. Initialize Movement CLI with custom network configuration
    // Movement uses custom network configuration for testnet
    // Use spawn for better control and to avoid hanging
    const args = [
      "init",
      "--network", "custom",
      "--rest-url", "https://testnet.movementnetwork.xyz/v1",
      "--faucet-url", "https://faucet.testnet.movementnetwork.xyz/",
      "--assume-yes"
    ];

    let stdout = "";
    let stderr = "";
    let initProcess;

    // Create a promise wrapper for the spawn process
    const initPromise = new Promise((resolve, reject) => {
      console.log("Starting movement init with args:", args);
      console.log("Working directory:", MOVEMENT_DIR);
      
      initProcess = spawn("movement", args, {
        cwd: MOVEMENT_DIR,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false
      });

      // Set timeout (60 seconds - increased for network operations)
      const timeout = setTimeout(() => {
        console.error("Initialization timeout - killing process");
        initProcess.kill('SIGTERM');
        setTimeout(() => {
          if (!initProcess.killed) {
            initProcess.kill('SIGKILL');
          }
        }, 5000);
        reject(new Error("Initialization timeout after 60 seconds. Check network connection and Movement CLI installation."));
      }, 60000);

      // Handle private key input if provided
      if (userPrivateKey && userPrivateKey.trim()) {
        console.log("Using provided private key");
        initProcess.stdin.write(userPrivateKey.trim() + "\n");
      } else {
        console.log("No private key provided, using default");
        // Send newline to proceed with default/generated key
        initProcess.stdin.write("\n");
      }
      initProcess.stdin.end();

      initProcess.stdout.on("data", (data) => {
        const output = data.toString();
        stdout += output;
        console.log("STDOUT:", output);
      });

      initProcess.stderr.on("data", (data) => {
        const output = data.toString();
        stderr += output;
        console.error("STDERR:", output);
      });

      initProcess.on("close", (code) => {
        clearTimeout(timeout);
        console.log(`Process closed with code: ${code}`);
        console.log("Final stdout:", stdout);
        console.log("Final stderr:", stderr);
        
        // Movement CLI might exit with non-zero code but still create config
        // Check if config was created
        const configPath = path.join(MOVEMENT_DIR, ".movement", "config.yaml");
        if (fs.existsSync(configPath)) {
          resolve({ stdout, stderr });
        } else if (code === 0 || code === null) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Process exited with code ${code}. Output: ${stderr || stdout}`));
        }
      });

      initProcess.on("error", (err) => {
        clearTimeout(timeout);
        console.error("Spawn error:", err);
        reject(err);
      });
    });

    try {
      await initPromise;

      // Parse the config.yaml to get the address
      try {
        const configPath = path.join(MOVEMENT_DIR, ".movement", "config.yaml");
        
        // Wait a bit for file to be written (sometimes there's a small delay)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!fs.existsSync(configPath)) {
          return res.status(500).json({
            success: false,
            step: "config_missing",
            error: "Movement config.yaml file does not exist.",
            log: stdout + (stderr ? "\n" + stderr : ""),
          });
        }

        const configContent = fs.readFileSync(configPath, "utf8");
        const config = YAML.parse(configContent);
        const address =
          config.profiles &&
          config.profiles.default &&
          config.profiles.default.account;

        try {
          if (address) {
            await updateMoveTomlAddress(address);
          }
        } catch (e) {
          console.error("Failed to update Move.toml:", e);
          // Don't fail the whole request if Move.toml update fails
        }

        // Save init data to project if projectId provided
        if (projectId) {
          try {
            const moduleName = moveCode ? (moveCode.match(/module\s+[a-zA-Z_][a-zA-Z0-9_]*::([a-zA-Z_][a-zA-Z0-9_]*)/) || [])[1] : null;
            const packageName = moduleName;
            
            const historyEntry = {
              type: 'init',
              status: 'success',
              timestamp: new Date(),
              data: {
                address,
                moduleName,
                packageName,
                faucetUrl: address ? `https://faucet.movementnetwork.xyz/?address=${address}` : undefined,
                log: stdout + (stderr ? "\n" + stderr : ""),
              }
            };

            await Project.findByIdAndUpdate(projectId, {
              $push: { deploymentHistory: historyEntry },
              initData: {
                address,
                moduleName,
                packageName,
                faucetUrl: `https://faucet.movementnetwork.xyz/?address=${address}`,
                log: stdout + (stderr ? "\n" + stderr : ""),
                timestamp: new Date()
              },
              status: 'initialized',
              networkType
            });
      } catch (e) {
        console.error("Failed to save init data to project:", e);
      }
    } else {
      // Save error history if projectId provided but init failed
      if (projectId) {
        try {
          const historyEntry = {
            type: 'init',
            status: 'error',
            timestamp: new Date(),
            data: {
              error: "Initialization failed",
              log: stdout + (stderr ? "\n" + stderr : ""),
            }
          };
          await Project.findByIdAndUpdate(projectId, {
            $push: { deploymentHistory: historyEntry }
          });
        } catch (e) {
          console.error("Failed to save error history:", e);
        }
      }
    }

        return res.status(200).json({
          success: true,
          message: "Movement CLI initialized successfully.",
          address: address || null,
          moduleName: moveCode ? (moveCode.match(/module\s+[a-zA-Z_][a-zA-Z0-9_]*::([a-zA-Z_][a-zA-Z0-9_]*)/) || [])[1] : null,
          packageName: moveCode ? (moveCode.match(/module\s+[a-zA-Z_][a-zA-Z0-9_]*::([a-zA-Z_][a-zA-Z0-9_]*)/) || [])[1] : null,
          log: stdout + (stderr ? "\n" + stderr : ""),
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          step: "unexpected_exception",
          error: "Internal server error: " + e.message,
          log: stdout + (stderr ? "\n" + stderr : ""),
        });
      }
    } catch (err) {
      // Save error history if projectId provided
      if (projectId) {
        try {
          const historyEntry = {
            type: 'init',
            status: 'error',
            timestamp: new Date(),
            data: {
              error: "Failed to initialize Movement CLI: " + err.message,
              log: stdout + (stderr ? "\n" + stderr : ""),
            }
          };
          await Project.findByIdAndUpdate(projectId, {
            $push: { deploymentHistory: historyEntry }
          });
        } catch (e) {
          console.error("Failed to save error history:", e);
        }
      }

      return res.status(500).json({
        success: false,
        step: "movement_init_failed",
        error: "Failed to initialize Movement CLI: " + err.message,
        details: stderr || stdout,
        log: stdout + (stderr ? "\n" + stderr : ""),
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      step: "unexpected_exception",
      error: "Internal server error: " + e.message,
    });
  }
});

// add an endpoint to remove the .movement folder
app.get("/remove-movement", async (req, res) => {
  const dirsToRemove = [
    path.join(MOVEMENT_DIR, ".movement"),
    path.join(path.dirname(MOVEMENT_DIR), ".movement"),
    path.join(MOVEMENT_DIR, ".move"),
    path.join(MOVEMENT_DIR, "build"),
  ];
  let removed = [];
  let errors = [];

  let pending = dirsToRemove.length;
  dirsToRemove.forEach((movementDir) => {
    if (!fs.existsSync(movementDir)) {
      pending--;
      if (pending === 0) {
        if (removed.length > 0) {
          return res.status(200).json({
            success: true,
            message: `Removed: ${removed.join(
              ", "
            )}. Some directories did not exist.`,
            log: `Removed: ${removed.join(", ")}. Some directories did not exist.`,
          });
        } else {
          return res.status(404).json({
            success: false,
            step: "movement_dir_missing",
            error: "None of the target directories exist.",
          });
        }
      }
      return;
    }
    fs.rmdir(movementDir, { recursive: true }, (err) => {
      pending--;
      if (err) {
        errors.push({ dir: movementDir, error: err.message });
      } else {
        removed.push(movementDir);
      }
      if (pending === 0) {
        if (errors.length > 0) {
          return res.status(500).json({
            success: false,
            step: "remove_movement_failed",
            error: "Failed to remove one or more directories.",
            details: errors,
            removed,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: `Removed: ${removed.join(", ")}`,
            log: `Removed: ${removed.join(", ")}`,
          });
        }
      }
    });
  });
});

app.post("/compile", async (req, res) => {
  const { moveCode, projectId } = req.body;

  if (!moveCode) {
    return res.status(400).json({ error: "No Move code provided." });
  }

  //call function to update Move.toml project name and addressname
  try {
    await updateMoveTomlProjectNameAndAddress(moveCode);
  } catch (e) {
    // Save error to history
    if (projectId) {
      try {
        const historyEntry = {
          type: 'compile',
          status: 'error',
          timestamp: new Date(),
          data: {
            error: "Failed to update Move.toml: " + e.message,
            log: e.message
          }
        };
        await Project.findByIdAndUpdate(projectId, {
          $push: { deploymentHistory: historyEntry }
        });
      } catch (err) {
        console.error("Failed to save error history:", err);
      }
    }
    return res.status(500).json({
      success: false,
      step: "move_toml_update_failed",
      error: "Failed to update Move.toml: " + e.message,
    });
  }

  try {
    // 1. Check if movement CLI is installed and in PATH
    try {
      await execPromise("movement --version");
    } catch (cliErr) {
      // Save error to history
      if (projectId) {
        try {
          const historyEntry = {
            type: 'compile',
            status: 'error',
            timestamp: new Date(),
            data: {
              error: "Movement CLI is not installed or not in PATH.",
              log: cliErr.message
            }
          };
          await Project.findByIdAndUpdate(projectId, {
            $push: { deploymentHistory: historyEntry }
          });
        } catch (err) {
          console.error("Failed to save error history:", err);
        }
      }
      return res.status(500).json({
        success: false,
        step: "movement_cli_missing",
        error: "Movement CLI is not installed or not in PATH.",
        details: cliErr.message,
      });
    }

    // 2. Check if movement directory exists
    if (!fs.existsSync(MOVEMENT_DIR)) {
      return res.status(500).json({
        success: false,
        step: "movement_dir_missing",
        error: `Movement directory does not exist at ${MOVEMENT_DIR}.`,
      });
    }

    // 3. Check if move.toml and sources/ exist
    const moveToml = path.join(MOVEMENT_DIR, "Move.toml");
    const sourcesDir = path.join(MOVEMENT_DIR, "sources");
    if (!fs.existsSync(moveToml) || !fs.existsSync(sourcesDir)) {
      return res.status(500).json({
        success: false,
        step: "Move_package_invalid",
        error: `Move.toml or sources/ directory is missing in ${MOVEMENT_DIR}.`,
      });
    }

    // 4. Check permissions for writing to sources/
    try {
      await fs.promises.access(sourcesDir, fs.constants.W_OK);
    } catch (permErr) {
      return res.status(500).json({
        success: false,
        step: "permission_error",
        error: `No write permission to ${sourcesDir}.`,
        details: permErr.message,
      });
    }

    // Save user code
    await fs.promises.writeFile(MOVE_FILE, moveCode);

    // Compile Move code using Movement CLI
    exec(
      `movement move compile --package-dir ${MOVEMENT_DIR}`,
      async (err, stdout, stderr) => {
        const success = !err;
        const compileData = {
          success,
          log: stdout + (stderr ? "\n" + stderr : ""),
          error: err ? err.message : null,
          timestamp: new Date()
        };

        // Save compile data to project if projectId provided
        if (projectId) {
          try {
            const historyEntry = {
              type: 'compile',
              status: success ? 'success' : 'error',
              timestamp: new Date(),
              data: {
                log: compileData.log,
                error: compileData.error,
              }
            };

            await Project.findByIdAndUpdate(projectId, {
              $push: { deploymentHistory: historyEntry },
              compileData,
              status: success ? 'compiled' : 'initialized'
            });
          } catch (e) {
            console.error("Failed to save compile data to project:", e);
          }
        }

        if (err) {
          return res.status(200).json({
            success: false,
            step: "exec_error",
            error: err.message,
            log: stdout + (stderr ? "\n" + stderr : ""),
          });
        }
        // Compilation succeeded, but there may be messages in stderr (like progress info)
        res.status(200).json({
          success: true,
          output: stdout,
          log: stdout + (stderr ? "\n" + stderr : ""),
        });
      }
    );
  } catch (e) {
    res.status(500).json({
      success: false,
      step: "unexpected_exception",
      error: "Internal server error: " + e.message,
    });
  }
});

app.post("/deploy", async (req, res) => {
  const { moveCode, projectId } = req.body;

  if (!moveCode) {
    return res.status(400).json({ error: "No Move code provided." });
  }

  //call function to update Move.toml project name and addressname
  try {
    await updateMoveTomlProjectNameAndAddress(moveCode);
  } catch (e) {
    // Save error to history
    if (projectId) {
      try {
        const historyEntry = {
          type: 'deploy',
          status: 'error',
          timestamp: new Date(),
          data: {
            error: "Failed to update Move.toml: " + e.message,
            log: e.message
          }
        };
        await Project.findByIdAndUpdate(projectId, {
          $push: { deploymentHistory: historyEntry }
        });
      } catch (err) {
        console.error("Failed to save error history:", err);
      }
    }
    return res.status(500).json({
      success: false,
      step: "move_toml_update_failed",
      error: "Failed to update Move.toml: " + e.message,
    });
  }

  try {
    // 1. Check if movement CLI is installed and in PATH
    try {
      await execPromise("movement --version");
    } catch (cliErr) {
      // Save error to history
      if (projectId) {
        try {
          const historyEntry = {
            type: 'deploy',
            status: 'error',
            timestamp: new Date(),
            data: {
              error: "Movement CLI is not installed or not in PATH.",
              log: cliErr.message
            }
          };
          await Project.findByIdAndUpdate(projectId, {
            $push: { deploymentHistory: historyEntry }
          });
        } catch (err) {
          console.error("Failed to save error history:", err);
        }
      }
      return res.status(500).json({
        success: false,
        step: "movement_cli_missing",
        error: "Movement CLI is not installed or not in PATH.",
        details: cliErr.message,
      });
    }

    // 2. Check if movement directory exists
    if (!fs.existsSync(MOVEMENT_DIR)) {
      return res.status(500).json({
        success: false,
        step: "movement_dir_missing",
        error: `Movement directory does not exist at ${MOVEMENT_DIR}.`,
      });
    }

    // 3. Check if move.toml and sources/ exist
    const moveToml = path.join(MOVEMENT_DIR, "Move.toml");
    const sourcesDir = path.join(MOVEMENT_DIR, "sources");
    if (!fs.existsSync(moveToml) || !fs.existsSync(sourcesDir)) {
      return res.status(500).json({
        success: false,
        step: "Move_package_invalid",
        error: `Move.toml or sources/ directory is missing in ${MOVEMENT_DIR}.`,
      });
    }

    // 4. Check permissions for writing to sources/
    try {
      await fs.promises.access(sourcesDir, fs.constants.W_OK);
    } catch (permErr) {
      return res.status(500).json({
        success: false,
        step: "permission_error",
        error: `No write permission to ${sourcesDir}.`,
        details: permErr.message,
      });
    }

    // Save user code
    await fs.promises.writeFile(MOVE_FILE, moveCode);

    console.log("Deploy working directory:", process.cwd());
    console.log("Deploy MOVEMENT_DIR:", MOVEMENT_DIR);

    // Deploy Move code using Movement CLI
    // Run from MOVEMENT_DIR so movement CLI finds the .movement config folder
    exec(
      `movement move publish --assume-yes --package-dir .`,
      { cwd: MOVEMENT_DIR },
      async (err, stdout, stderr) => {
        if (err) {
          console.error("Deploy command error:", err);
          console.error("Deploy stdout:", stdout);
          console.error("Deploy stderr:", stderr);

          // Save error history if projectId provided
          if (projectId) {
            try {
              const historyEntry = {
                type: 'deploy',
                status: 'error',
                timestamp: new Date(),
                data: {
                  error: err.message,
                  log: stdout + (stderr ? "\n" + stderr : ""),
                }
              };
              await Project.findByIdAndUpdate(projectId, {
                $push: { deploymentHistory: historyEntry }
              });
            } catch (e) {
              console.error("Failed to save error history:", e);
            }
          }

          return res.status(200).json({
            success: false,
            step: "exec_error",
            error: err.message,
            log: stdout + (stderr ? "\n" + stderr : ""),
          });
        }
        
        // Parse the deployment response to extract transaction hash and sender
        let transactionHash = null;
        let senderAddress = null;
        let moduleName = null;
        
        try {
          // Try to parse JSON response from stdout
          const jsonMatch = stdout.match(/\{[\s\S]*"Result"[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            if (result.Result && result.Result.transaction_hash) {
              transactionHash = result.Result.transaction_hash;
              senderAddress = result.Result.sender;
            }
          }
          
          // Extract module name from Move.toml
          const moveTomlPath = path.join(MOVEMENT_DIR, "Move.toml");
          if (fs.existsSync(moveTomlPath)) {
            const moveTomlContent = await fs.promises.readFile(moveTomlPath, "utf8");
            const packageMatch = moveTomlContent.match(/name\s*=\s*"([^"]+)"/);
            if (packageMatch) {
              moduleName = packageMatch[1];
            }
          }
          
          // Get sender address from config if not in response
          if (!senderAddress) {
            const configPath = path.join(MOVEMENT_DIR, ".movement", "config.yaml");
            if (fs.existsSync(configPath)) {
              const configContent = fs.readFileSync(configPath, "utf8");
              const config = YAML.parse(configContent);
              senderAddress = config.profiles?.default?.account;
            }
          }
        } catch (parseErr) {
          console.error("Error parsing deployment response:", parseErr);
        }
        
        // Build explorer URLs
        const accountExplorerUrl = senderAddress 
          ? `https://explorer.movementnetwork.xyz/account/${senderAddress}?network=bardock+testnet`
          : null;
        const transactionExplorerUrl = transactionHash
          ? `https://explorer.movementnetwork.xyz/txn/${transactionHash}?network=bardock+testnet`
          : null;
        
        // Save deploy data to project if projectId provided
        if (projectId) {
          try {
            const historyEntry = {
              type: 'deploy',
              status: 'success',
              timestamp: new Date(),
              data: {
                transactionHash,
                address: senderAddress,
                moduleName: moduleName,
                explorerUrls: {
                  account: accountExplorerUrl,
                  transaction: transactionExplorerUrl
                },
                log: stdout + (stderr ? "\n" + stderr : ""),
              }
            };

            await Project.findByIdAndUpdate(projectId, {
              $push: { deploymentHistory: historyEntry },
              deployData: {
                success: true,
                transactionHash,
                address: senderAddress,
                log: stdout + (stderr ? "\n" + stderr : ""),
                explorerUrl: accountExplorerUrl,
                timestamp: new Date()
              },
              status: 'deployed'
            });
          } catch (e) {
            console.error("Failed to save deploy data to project:", e);
          }
        }

        res.status(200).json({
          success: true,
          output: stdout,
          log: stdout + (stderr ? "\n" + stderr : ""),
          transactionHash: transactionHash,
          senderAddress: senderAddress,
          moduleName: moduleName,
          explorerUrls: {
            account: accountExplorerUrl,
            transaction: transactionExplorerUrl
          }
        });
      }
    );
  } catch (e) {
    console.error("Unexpected exception in /deploy:", e);

    res.status(500).json({
      success: false,
      step: "unexpected_exception",
      error: "Internal server error: " + e.message,
    });
  }
});

// add a route to parse the move code and generate some import template codes and give template integration function after parsing the project.move file and fetching the address, contract name and the function names step by step
// make an array and store the complete strings in the indexes so that i can render them directly by accessing the array as it will return it and render it
app.get("/integration-functions", async (req, res) => {
  try {
    const integrationFunctions = [];
    integrationFunctions[0] = ` import {Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk"
 import {useWallet, InputSubmitTransactionData, InputTransactionData} from "@aptos-labs/wallet-adapter-react"

 const {account, signAndSubmitTransaction} = useWallet();
 // Movement Network configuration (using Aptos SDK compatible with Movement)
 const config = new AptosConfig({ 
   network: Network.CUSTOM,
   fullnode: "https://testnet.movementnetwork.xyz/v1",
   faucet: "https://faucet.testnet.movementnetwork.xyz/",
   indexer: "https://hasura.testnet.movementnetwork.xyz/v1/graphql"
 });
 const aptos = new Aptos(config);`;

    const configPath = path.join(MOVEMENT_DIR, ".movement", "config.yaml");
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({
        success: false,
        step: "config_missing",
        error: "Movement config.yaml file does not exist.",
      });
    }
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = YAML.parse(configContent);
    const address =
      config.profiles &&
      config.profiles.default &&
      config.profiles.default.account;
    if (!address) {
      return res.status(500).json({
        success: false,
        step: "address_not_found",
        error: "Account address not found in config.yaml.",
      });
    }
    const addressWith0x = address.startsWith("0x") ? address : `0x${address}`;
    integrationFunctions[1] = `const MODULE_ADDRESS = "${addressWith0x}"; // replace with your address`;

    if (!fs.existsSync(MOVE_FILE)) {
      return res.status(500).json({
        success: false,
        step: "move_file_missing",
        error: "Move file does not exist.",
      });
    }
    const moveCode = await fs.promises.readFile(MOVE_FILE, "utf8");

    const moduleMatch = moveCode.match(
      /module\s+([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)/
    );
    if (!moduleMatch) {
      return res.status(500).json({
        success: false,
        step: "module_not_found",
        error: "Move code does not contain a valid module declaration.",
      });
    }
    const smartcontractname = moduleMatch[2];

    // Updated logic for extracting function names and parameters
    const functionNames = [];
    const functionparam = [];
    const functionparamval = [];
    // Regex to match public entry fun function_name(params...)
    const functionRegex =
      /public\s+entry\s+fun\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
    let match;
    while ((match = functionRegex.exec(moveCode)) !== null) {
      const fnName = match[1];
      const params = match[2]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      functionNames.push(fnName);

      // Remove the signer param (account: &signer)
      const nonSignerParams = params.filter((p) => !/:\s*&signer\b/.test(p));
      if (nonSignerParams.length > 0) {
        functionparamval.push(1);
        // Extract the param name (before ':')
        const paramName = nonSignerParams[0].split(":")[0].trim();
        functionparam.push(paramName);
      } else {
        functionparamval.push(0);
        functionparam.push("");
      }
    }
    if (functionNames.length === 0) {
      return res.status(500).json({
        success: false,
        step: "no_functions_found",
        error: "No functions found in the Move code.",
      });
    }

    // Generate integration functions
    functionNames.forEach((fn, idx) => {
      const param = functionparam[idx];
      integrationFunctions.push(
        [
          `# Integration function: ${fn}`,
          `const transaction: InputTransactionData = {`,
          `  data: {`,
          `    function: \`${addressWith0x}::${smartcontractname}::${fn}\`,`,
          `    functionArguments: [${param ? param : ""}]`,
          `  }`,
          `};`,
          `const response = await signAndSubmitTransaction(transaction);`,
          `await aptos.waitForTransaction({transactionHash: response.hash});`,
        ].join("\n")
      );
    });

    res.status(200).json({
      success: true,
      integrationFunctions,
      functionNames,
      functionparam,
      functionparamval,
    });
  } catch (e) {
    console.error("Error in /integration-functions:", e);
    res.status(500).json({
      success: false,
      step: "unexpected_exception",
      error: "Internal server error: " + e.message,
    });
  }
});

// Get deployment history for a project
app.get("/projects/:id/history", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    res.json({ 
      success: true, 
      history: project.deploymentHistory || [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Movement Network backend is running at http://localhost:3000");
});
