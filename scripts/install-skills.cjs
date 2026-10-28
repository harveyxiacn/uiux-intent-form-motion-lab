#!/usr/bin/env node
'use strict';

/**
 * Install the skills in this repository into an agent skills directory.
 *
 * Defaults to the repo's own .claude/skills so the local and upstream skills are
 * available only inside this project. Use --global to install for every project.
 *
 *   node scripts/install-skills.cjs --list
 *   node scripts/install-skills.cjs                       # all -> ./.claude/skills
 *   node scripts/install-skills.cjs --set upstream        # only the six upstream skills
 *   node scripts/install-skills.cjs --global              # all -> ~/.claude/skills
 *   node scripts/install-skills.cjs --target codex --global
 *   node scripts/install-skills.cjs --only finesse-ui,impeccable --force
 *   node scripts/install-skills.cjs --link                # symlink/junction instead of copy
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const UPSTREAM_DIR = path.join(SKILLS_DIR, 'upstream');

const HELP = `Install skills from this repository.

Usage:
  node scripts/install-skills.cjs [options]

Options:
  --set <all|local|upstream>  Which skills to install (default: all)
  --only <name,name>          Install only these skill folder names
  --scope <project|global>    Install into the repo or the user home (default: project)
  --global                    Shorthand for --scope global
  --target <claude|codex>     Agent layout to install for (default: claude)
  --dest <dir>                Explicit destination skills directory
  --link                      Create symlinks/junctions instead of copying
  --force                     Replace an existing skill directory
  --dry-run                   Print actions without writing
  --list                      List discovered skills and exit
  --help                      Show this message

Destinations:
  claude + project  <repo>/.claude/skills
  claude + global   ~/.claude/skills
  codex  + project  <repo>/.codex/skills
  codex  + global   ~/.codex/skills
`;

function parseArgs(argv) {
  const opts = {
    set: 'all',
    only: null,
    scope: 'project',
    target: 'claude',
    dest: null,
    link: false,
    force: false,
    dryRun: false,
    list: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) throw new Error(`${arg} needs a value`);
      i += 1;
      return next;
    };

    switch (arg) {
      case '--set': opts.set = value(); break;
      case '--only': opts.only = value().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--scope': opts.scope = value(); break;
      case '--global': opts.scope = 'global'; break;
      case '--target': opts.target = value(); break;
      case '--dest': opts.dest = value(); break;
      case '--link': opts.link = true; break;
      case '--force': opts.force = true; break;
      case '--dry-run': opts.dryRun = true; break;
      case '--list': opts.list = true; break;
      case '--help': case '-h': opts.help = true; break;
      default: throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!['all', 'local', 'upstream'].includes(opts.set)) throw new Error(`--set must be all, local or upstream`);
  if (!['project', 'global'].includes(opts.scope)) throw new Error(`--scope must be project or global`);
  if (!['claude', 'codex'].includes(opts.target)) throw new Error(`--target must be claude or codex`);

  return opts;
}

function readFrontmatterName(skillMd) {
  const text = fs.readFileSync(skillMd, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const nameLine = match[1].match(/^name:\s*(.+)$/m);
  if (!nameLine) return null;
  return nameLine[1].trim().replace(/^['"]|['"]$/g, '');
}

function discover(group) {
  const base = group === 'upstream' ? UPSTREAM_DIR : SKILLS_DIR;
  if (!fs.existsSync(base)) return [];

  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !(group === 'local' && entry.name === 'upstream'))
    .filter((entry) => fs.existsSync(path.join(base, entry.name, 'SKILL.md')))
    .map((entry) => {
      const dir = path.join(base, entry.name);
      const declared = readFrontmatterName(path.join(dir, 'SKILL.md'));
      return {
        folder: entry.name,
        name: declared || entry.name,
        group,
        dir,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function resolveDest(opts) {
  if (opts.dest) return path.resolve(opts.dest);
  const agentDir = opts.target === 'claude' ? '.claude' : '.codex';
  if (opts.scope === 'global') return path.join(os.homedir(), agentDir, 'skills');
  return path.join(ROOT, agentDir, 'skills');
}

function removeExisting(target) {
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) {
    fs.unlinkSync(target);
  } else {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function installOne(skill, destRoot, opts) {
  const target = path.join(destRoot, skill.name);
  const rel = path.relative(ROOT, skill.dir);

  if (fs.existsSync(target)) {
    if (!opts.force) {
      return { ...skill, target, status: 'skipped (exists; use --force)' };
    }
    if (!opts.dryRun) removeExisting(target);
  }

  if (opts.dryRun) {
    const action = opts.link ? 'would link' : 'would copy';
    return { ...skill, target, status: `${action} ${rel}` };
  }

  fs.mkdirSync(destRoot, { recursive: true });
  if (opts.link) {
    fs.symlinkSync(skill.dir, target, process.platform === 'win32' ? 'junction' : 'dir');
    return { ...skill, target, status: 'linked' };
  }

  fs.cpSync(skill.dir, target, { recursive: true, verbatimSymlinks: true });
  return { ...skill, target, status: 'copied' };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`error: ${error.message}\n`);
    process.stdout.write(HELP);
    process.exitCode = 2;
    return;
  }

  if (opts.help) {
    process.stdout.write(HELP);
    return;
  }

  const groups = opts.set === 'all' ? ['local', 'upstream'] : [opts.set];
  let skills = groups.flatMap((group) => discover(group));

  if (opts.only) {
    const wanted = new Set(opts.only);
    skills = skills.filter((skill) => wanted.has(skill.name) || wanted.has(skill.folder));
    const found = new Set(skills.map((skill) => skill.name));
    const missing = opts.only.filter((name) => !found.has(name));
    if (missing.length) {
      console.error(`error: unknown skill(s): ${missing.join(', ')}`);
      process.exitCode = 2;
      return;
    }
  }

  if (!skills.length) {
    console.error('error: no skills found');
    process.exitCode = 2;
    return;
  }

  if (opts.list) {
    for (const skill of skills) {
      console.log(`${skill.name.padEnd(26)} ${skill.group.padEnd(9)} ${path.relative(ROOT, skill.dir)}`);
    }
    console.log(`\n${skills.length} skill(s)`);
    return;
  }

  const destRoot = resolveDest(opts);
  console.log(`Installing ${skills.length} skill(s) to ${destRoot}`);
  console.log(`Mode: ${opts.link ? 'link' : 'copy'}${opts.dryRun ? ' (dry run)' : ''}\n`);

  const results = skills.map((skill) => installOne(skill, destRoot, opts));

  const width = Math.max(...results.map((result) => result.name.length));
  for (const result of results) {
    console.log(`  ${result.name.padEnd(width)}  ${result.status}`);
  }

  const copied = results.filter((result) => ['copied', 'linked'].includes(result.status)).length;
  const wouldChange = results.filter((result) => result.status.startsWith('would ')).length;
  const skipped = results.length - copied - wouldChange;
  const dryNote = opts.dryRun ? `, ${wouldChange} would change` : '';
  console.log(`\nDone: ${copied} installed${dryNote}, ${skipped} skipped.`);
  console.log('Restart or reload the agent to pick up new skills.');
}

main();
