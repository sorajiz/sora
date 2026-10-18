const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../views/rules.ejs'), 'utf8');

// Generate tos.ejs
let tos = src
  .replace("<%= typeof title !== 'undefined' ? title : 'Server Rules · Pade Community' %>", "<%= typeof title !== 'undefined' ? title : 'Terms of Service · Pade Store' %>")
  .replace('class="nav-tab-link active" data-tab="rules"', 'class="nav-tab-link" data-tab="rules"')
  .replace('class="nav-tab-link" data-tab="tos"', 'class="nav-tab-link active" data-tab="tos"')
  .replace('sidebar-panel-view active" data-tab-sidebar="rules"', 'sidebar-panel-view" data-tab-sidebar="rules"')
  .replace('sidebar-panel-view" data-tab-sidebar="tos"', 'sidebar-panel-view active" data-tab-sidebar="tos"')
  .replace('tab-panel-view active" data-tab-content="rules"', 'tab-panel-view" data-tab-content="rules"')
  .replace('tab-panel-view" data-tab-content="tos"', 'tab-panel-view active" data-tab-content="tos"');

fs.writeFileSync(path.join(__dirname, '../views/tos.ejs'), tos, 'utf8');

// Generate tutorial.ejs
let tut = src
  .replace("<%= typeof title !== 'undefined' ? title : 'Server Rules · Pade Community' %>", "<%= typeof title !== 'undefined' ? title : 'Tutorial & Hướng Dẫn · Pade Store' %>")
  .replace('class="nav-tab-link active" data-tab="rules"', 'class="nav-tab-link" data-tab="rules"')
  .replace('class="nav-tab-link" data-tab="tutorial"', 'class="nav-tab-link active" data-tab="tutorial"')
  .replace('sidebar-panel-view active" data-tab-sidebar="rules"', 'sidebar-panel-view" data-tab-sidebar="rules"')
  .replace('sidebar-panel-view" data-tab-sidebar="tutorial"', 'sidebar-panel-view active" data-tab-sidebar="tutorial"')
  .replace('tab-panel-view active" data-tab-content="rules"', 'tab-panel-view" data-tab-content="rules"')
  .replace('tab-panel-view" data-tab-content="tutorial"', 'tab-panel-view active" data-tab-content="tutorial"');

fs.writeFileSync(path.join(__dirname, '../views/tutorial.ejs'), tut, 'utf8');

console.log('Successfully synced views/tos.ejs and views/tutorial.ejs');

