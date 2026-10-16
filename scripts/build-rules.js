const fs = require('fs');
const path = require('path');

function resolveOwnerEmail() {
  if (process.env.OWNER_EMAIL) return process.env.OWNER_EMAIL;
  if (process.env.NEXT_PUBLIC_OWNER_EMAIL) return process.env.NEXT_PUBLIC_OWNER_EMAIL;

  // Try reading from apps/web/.env.local or apps/web/.env.example
  const envPaths = [
    path.join(__dirname, '../apps/web/.env.local'),
    path.join(__dirname, '../apps/web/.env'),
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../apps/web/.env.example'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^(?:NEXT_PUBLIC_)?OWNER_EMAIL=(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  return 'sanjay@winterarc.local';
}

function buildRules() {
  const templatePath = path.join(__dirname, '../firestore.rules.template');
  const outputPath = path.join(__dirname, '../firestore.rules');

  if (!fs.existsSync(templatePath)) {
    console.error(`[Rules Build Error] Template not found at: ${templatePath}`);
    process.exit(1);
  }

  const ownerEmail = resolveOwnerEmail();
  console.log(`[Rules Build] Injecting literal OWNER_EMAIL: ${ownerEmail}`);

  const template = fs.readFileSync(templatePath, 'utf8');
  const output = template.replace(/__OWNER_EMAIL__/g, ownerEmail);

  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`[Rules Build] Successfully generated firestore.rules`);
}

buildRules();
