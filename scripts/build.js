const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const projectRoot = path.join(__dirname, '..');
const viewsDir = path.join(projectRoot, 'views');
const pagesDir = path.join(viewsDir, 'pages');

const pages = [
  {
    name: 'index',
    title: 'Sora | Hello Everyone',
    description: 'Sora - Nơi để mình giới thiệu về bản thân và khám phá các AI (Vibe AI), phát triển Bot Discord và Website.',
    activePage: 'home'
  },
  {
    name: 'intro',
    title: 'Sora | About',
    description: 'Engineering resilient systems with kinetic fluidity and zero-bloat architecture.',
    activePage: 'intro'
  },
  {
    name: 'skills',
    title: 'Sora | Technical Arsenal',
    description: 'Core toolchain, runtime competencies, and engineering stack.',
    activePage: 'skills'
  },
  {
    name: 'contact',
    title: 'Sora | Get In Touch',
    description: 'Direct contact channels for bot development and digital collaborations.',
    activePage: 'contact'
  }
];

const sharedData = {
  author: 'Sora',
  githubUrl: 'https://github.com/sorajiz',
  githubUsername: 'sorajiz',
  discord: '@mezy310',
  email: 'wheijgwa@gmail.com',
  location: 'Vietnam • Available Worldwide'
};

async function build() {
  console.log('⚡ Compiling EJS templates...');

  for (const page of pages) {
    const templatePath = path.join(pagesDir, `${page.name}.ejs`);
    const outputPath = path.join(projectRoot, `${page.name}.html`);

    const data = {
      ...sharedData,
      ...page
    };

    const rendered = await ejs.renderFile(templatePath, data, {
      root: viewsDir
    });

    fs.writeFileSync(outputPath, rendered, 'utf8');
    console.log(`  ✓ Built ${page.name}.html`);
  }

  console.log('✨ EJS compilation finished successfully!');
}

build().catch((err) => {
  console.error('Error compiling EJS:', err);
  process.exit(1);
});
